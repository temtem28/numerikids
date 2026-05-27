// Edge Function: dunning-manager
// Gestion des paiements en échec (relances, métriques).
// Actions: process_scheduled_retries | process_failed_payment | process_retry | get_at_risk | get_metrics

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Action =
  | "process_scheduled_retries"
  | "process_failed_payment"
  | "process_retry"
  | "get_at_risk"
  | "get_metrics";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { action?: Action; [k: string]: unknown };
    const action = body.action ?? "get_at_risk";

    switch (action) {
      case "get_at_risk": {
        const { data: list } = await supabase
          .from("failed_payments")
          .select("*, user_subscriptions(user_id)")
          .in("status", ["pending", "recovering"])
          .order("created_at", { ascending: false });
        return json({ at_risk: list ?? [], count: list?.length ?? 0 });
      }

      case "get_metrics": {
        const { data: failed } = await supabase
          .from("failed_payments")
          .select("status, amount");
        const total = failed?.length ?? 0;
        const recovered = failed?.filter((f) => f.status === "recovered").length ?? 0;
        const pending = failed?.filter((f) => f.status === "pending" || f.status === "recovering").length ?? 0;
        const amountAtRisk =
          failed
            ?.filter((f) => f.status === "pending" || f.status === "recovering")
            .reduce((s, f) => s + (Number(f.amount) || 0), 0) ?? 0;
        return json({
          totalFailedPayments: total,
          recovered,
          pending,
          recoveryRate: total > 0 ? Math.round((recovered / total) * 100) : 0,
          amountAtRisk,
        });
      }

      case "process_scheduled_retries": {
        const { data: toRetry } = await supabase
          .from("failed_payments")
          .select("id, retry_count")
          .in("status", ["pending", "recovering"])
          .lte("next_retry_at", new Date().toISOString());
        const processed = toRetry?.length ?? 0;
        for (const row of toRetry ?? []) {
          const r = row as { id: string; retry_count?: number };
          await supabase
            .from("failed_payments")
            .update({
              status: "recovering",
              retry_count: (r.retry_count ?? 0) + 1,
              last_retry_at: new Date().toISOString(),
            })
            .eq("id", r.id);
        }
        return json({ processed, message: "Retries mis à jour" });
      }

      case "process_failed_payment": {
        const { invoiceId, userId, subscriptionId } = body as {
          invoiceId?: string;
          userId?: string;
          subscriptionId?: string;
        };
        if (!invoiceId || !userId) {
          return new Response(
            JSON.stringify({ error: "invoiceId et userId requis" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { error } = await supabase.from("failed_payments").insert({
          invoice_id: invoiceId,
          user_id: userId,
          subscription_id: subscriptionId ?? null,
          status: "pending",
          amount: 0,
          next_retry_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return json({ ok: true });
      }

      case "process_retry": {
        const { failedPaymentId } = body as { failedPaymentId?: string };
        if (!failedPaymentId) {
          return new Response(
            JSON.stringify({ error: "failedPaymentId requis" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        await supabase
          .from("failed_payments")
          .update({
            status: "recovering",
            last_retry_at: new Date().toISOString(),
          })
          .eq("id", failedPaymentId);
        return json({ ok: true });
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

function json(data: object) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
