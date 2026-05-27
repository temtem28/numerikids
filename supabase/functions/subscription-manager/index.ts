// Edge Function: subscription-manager
// Actions: create-checkout | create-portal | cancel | reactivate | get-usage
// Secrets: STRIPE_SECRET_KEY (ou STRIPE_API_KEY), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import Stripe from "https://esm.sh/stripe@14?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? Deno.env.get("STRIPE_API_KEY");
const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2024-11-20" })
  : null;

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateCheckoutBody {
  action: "create-checkout";
  planId: string;
  userId: string;
  email: string;
  billingCycle: "monthly" | "yearly";
  successUrl: string;
  cancelUrl: string;
}

interface CreatePortalBody {
  action: "create-portal";
  userId: string;
  successUrl?: string;
}

interface CancelBody {
  action: "cancel";
  userId: string;
}

interface ReactivateBody {
  action: "reactivate";
  userId: string;
}

interface GetUsageBody {
  action: "get-usage";
  userId: string;
}

type Body =
  | CreateCheckoutBody
  | CreatePortalBody
  | CancelBody
  | ReactivateBody
  | GetUsageBody;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Body;

    if (!stripe) {
      return new Response(
        JSON.stringify({
          error: "Stripe non configuré",
          testMode: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (body.action) {
      case "create-checkout": {
        const { planId, userId, email, billingCycle, successUrl, cancelUrl } =
          body as CreateCheckoutBody;
        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("stripe_price_id_monthly, stripe_price_id_yearly, name, trial_days")
          .eq("id", planId)
          .single();

        if (!plan) {
          return new Response(
            JSON.stringify({ error: "Plan introuvable" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const priceId =
          billingCycle === "yearly"
            ? plan.stripe_price_id_yearly
            : plan.stripe_price_id_monthly;
        if (!priceId) {
          return new Response(
            JSON.stringify({ error: "Prix Stripe non configuré pour ce plan" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const trialDays = Math.min(Number(plan.trial_days) || 0, 15);
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          customer_email: email,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          subscription_data: {
            trial_period_days: trialDays || undefined,
            metadata: { user_id: userId, plan_id: planId },
          },
          metadata: { user_id: userId, plan_id: planId },
          allow_promotion_codes: true,
        });

        return new Response(
          JSON.stringify({ url: session.url }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create-portal": {
        const { userId, successUrl } = body as CreatePortalBody;
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("stripe_customer_id")
          .eq("user_id", userId)
          .in("status", ["active", "trialing", "past_due"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!sub?.stripe_customer_id) {
          return new Response(
            JSON.stringify({ error: "Aucun abonnement actif pour ce compte" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const session = await stripe.billingPortal.sessions.create({
          customer: sub.stripe_customer_id,
          return_url: successUrl ?? `${req.url.replace(/\/[^/]*$/, "")}/billing`,
        });

        return new Response(
          JSON.stringify({ url: session.url }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        const { userId } = body as CancelBody;
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("stripe_subscription_id")
          .eq("user_id", userId)
          .in("status", ["active", "trialing"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!sub?.stripe_subscription_id) {
          return new Response(
            JSON.stringify({ error: "Aucun abonnement actif à annuler" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: true,
        });

        return new Response(
          JSON.stringify({ ok: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reactivate": {
        const { userId } = body as ReactivateBody;
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("stripe_subscription_id")
          .eq("user_id", userId)
          .eq("cancel_at_period_end", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!sub?.stripe_subscription_id) {
          return new Response(
            JSON.stringify({ error: "Aucun abonnement à réactiver" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: false,
        });

        return new Response(
          JSON.stringify({ ok: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get-usage": {
        const { userId } = body as GetUsageBody;
        const { count: childrenCount } = await supabase
          .from("children")
          .select("id", { count: "exact", head: true })
          .eq("parent_id", userId);
        const { data: usage } = await supabase
          .from("usage_tracking")
          .select("ai_requests_today, storage_used_mb")
          .eq("user_id", userId)
          .order("period_start", { ascending: false })
          .limit(1)
          .single();

        return new Response(
          JSON.stringify({
            childrenCount: childrenCount ?? 0,
            aiRequestsToday: usage?.ai_requests_today ?? 0,
            storageUsedMb: usage?.storage_used_mb ?? 0,
            usage: usage ?? {},
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Action inconnue" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
