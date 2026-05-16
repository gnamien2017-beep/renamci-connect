import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function genToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { email, origin } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Always return success to avoid email enumeration
    const success = new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, prenoms, nom")
      .ilike("email", email)
      .maybeSingle();

    if (!profile) return success;

    // Generate token + store hash
    const token = genToken();
    const token_hash = await sha256(token);
    const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h

    const { error: insertErr } = await supabase.from("password_reset_tokens").insert({
      profile_id: profile.id,
      token_hash,
      expires_at,
    });
    if (insertErr) {
      console.error("Token insert error:", insertErr);
      return success; // silent
    }

    const baseUrl = (origin || "").replace(/\/+$/, "") || Deno.env.get("SUPABASE_URL")!;
    const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?token=${token}`;

    // Try to send via transactional email infrastructure if configured
    try {
      const { error: mailErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "password-reset",
          recipientEmail: profile.email,
          idempotencyKey: `reset-${profile.id}-${Date.now()}`,
          templateData: { prenoms: profile.prenoms, resetUrl },
        },
      });
      if (mailErr) {
        console.error("Email send failed (transactional infra may not be set up):", mailErr);
      }
    } catch (e) {
      console.error("Transactional email function unavailable:", e);
    }

    return success;
  } catch (err) {
    console.error("request-password-reset error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
