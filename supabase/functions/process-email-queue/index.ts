// Edge Function: process-email-queue
// Traite les emails en attente dans la table email_queue.
// Optionnel: RESEND_API_KEY pour envoi réel via Resend.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data: pending, error: fetchError } = await supabase
      .from("email_queue")
      .select("id, recipient_email, subject, body, template_id, metadata")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error("Failed to fetch email queue:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pending?.length) {
      return new Response(
        JSON.stringify({ processed: 0, message: "Aucun email en attente" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    let failed = 0;

    for (const email of pending) {
      try {
        if (resendApiKey) {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: Deno.env.get("EMAIL_FROM") ?? "CodeQuest Kids <noreply@example.com>",
              to: email.recipient_email,
              subject: email.subject ?? "Notification",
              html: email.body ?? "",
            }),
          });
          if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
          }
        }
        await supabase
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", email.id);
        sent++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("Send failed for", email.id, msg);
        await supabase
          .from("email_queue")
          .update({
            status: "failed",
            error_message: msg,
          })
          .eq("id", email.id);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        processed: pending.length,
        sent,
        failed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
