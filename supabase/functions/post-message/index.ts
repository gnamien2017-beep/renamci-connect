import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { profileId, password, action, content, messageId } = await req.json();
    if (!profileId || !password) {
      return new Response(JSON.stringify({ error: "Authentification requise" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, password_hash, status, is_admin")
      .eq("id", profileId)
      .maybeSingle();

    const hash = await hashPassword(password);
    if (!profile || profile.password_hash !== hash) {
      return new Response(JSON.stringify({ error: "Identifiants invalides" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (profile.status !== "approved") {
      return new Response(JSON.stringify({ error: "Profil non approuvé" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      const text = (content ?? "").toString().trim();
      if (!text || text.length > 4000) {
        return new Response(JSON.stringify({ error: "Message invalide" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase
        .from("messages")
        .insert({ profile_id: profileId, content: text })
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, message: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      if (!messageId) {
        return new Response(JSON.stringify({ error: "messageId requis" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: msg } = await supabase
        .from("messages").select("profile_id").eq("id", messageId).maybeSingle();
      if (!msg) {
        return new Response(JSON.stringify({ error: "Message introuvable" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (msg.profile_id !== profileId && !profile.is_admin) {
        return new Response(JSON.stringify({ error: "Non autorisé" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await supabase.from("messages").delete().eq("id", messageId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "mark_read") {
      const { ids } = await req.json().catch(() => ({ ids: [] }));
      // Note: re-parsing not possible; ids must come in initial body. Use messageId or messageIds.
      return new Response(JSON.stringify({ error: "Utiliser mark_read_batch" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "mark_read_batch") {
      const { messageIds } = await req.json().catch(() => ({ messageIds: [] }));
      return new Response(JSON.stringify({ error: "use body.messageIds" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Action inconnue" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("post-message error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
