// Edge Function: stripe-webhook
// Traite les événements Stripe (checkout, subscription, invoice).
// Secret: STRIPE_WEBHOOK_SECRET (ou STRIPE_WEBHOOK_SIGNING_SECRET)

import Stripe from "https://esm.sh/stripe@14?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? Deno.env.get("STRIPE_API_KEY");
const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2024-11-20" })
  : null;

const webhookSecret =
  Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const signature = req.headers.get("Stripe-Signature");
  if (!signature || !webhookSecret || !stripe) {
    return new Response("Webhook non configuré", { status: 500 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response((err as Error).message, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id ?? null;
        if (!userId) {
          console.warn("checkout.session.completed: missing user_id in metadata");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          { expand: ["items.data.price"] }
        );
        const priceId = subscription.items?.data?.[0]?.price?.id;
        let resolvedPlanId = planId;
        if (!planId && priceId) {
          const { data: plan } = await supabase
            .from("subscription_plans")
            .select("id")
            .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
            .single();
          resolvedPlanId = plan?.id ?? planId;
        }
        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;

        await supabase.from("user_subscriptions").insert({
          user_id: userId,
          plan_id: resolvedPlanId ?? planId,
          status: subscription.status === "trialing" ? "trialing" : "active",
          stripe_customer_id: stripeCustomerId ?? null,
          stripe_subscription_id: subscription.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (stripeCustomerId) {
          const tier = await getPlanName(resolvedPlanId ?? planId ?? "");
          await supabase
            .from("parent_profiles")
            .update({
              stripe_customer_id: stripeCustomerId,
              subscription_tier: tier ?? "premium",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const planId = sub.metadata?.plan_id;
        const userId = sub.metadata?.user_id;

        const statusMap: Record<string, string> = {
          active: "active",
          trialing: "trialing",
          past_due: "past_due",
          canceled: "cancelled",
          unpaid: "cancelled",
        };
        const status = statusMap[sub.status] ?? "cancelled";

        if (userId && planId) {
          await supabase
            .from("user_subscriptions")
            .update({
              status,
              current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              cancel_at_period_end: sub.cancel_at_period_end ?? false,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", sub.id);
        } else {
          const { data: existing } = await supabase
            .from("user_subscriptions")
            .select("user_id, plan_id")
            .eq("stripe_subscription_id", sub.id)
            .single();
          if (existing) {
            await supabase
              .from("user_subscriptions")
              .update({
                status,
                current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                cancel_at_period_end: sub.cancel_at_period_end ?? false,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", sub.id);
          }
        }

        if (event.type === "customer.subscription.deleted" && userId) {
          await supabase
            .from("parent_profiles")
            .update({
              subscription_tier: "free",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.customer || !invoice.subscription) break;

        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id;
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub?.user_id) {
          await supabase.from("payment_history").insert({
            user_id: sub.user_id,
            amount: (invoice.amount_paid ?? 0) / 100,
            status: "succeeded",
            stripe_invoice_id: invoice.id,
            created_at: new Date().toISOString(),
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id;
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub?.user_id) {
          await supabase.from("payment_history").insert({
            user_id: sub.user_id,
            amount: (invoice.amount_due ?? 0) / 100,
            status: "failed",
            stripe_invoice_id: invoice.id,
            created_at: new Date().toISOString(),
          });
          await supabase.from("failed_payments").upsert(
            {
              user_id: sub.user_id,
              invoice_id: invoice.id,
              amount: (invoice.amount_due ?? 0) / 100,
              status: "pending",
              created_at: new Date().toISOString(),
            },
            { onConflict: "invoice_id" }
          );
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new Response("Internal error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

async function getPlanName(planId: string): Promise<string | null> {
  const { data } = await supabase
    .from("subscription_plans")
    .select("name")
    .eq("id", planId)
    .single();
  return data?.name ?? null;
}
