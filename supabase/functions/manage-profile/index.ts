import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, profile_id, password, updates } = body;

    if (!profile_id || !password) {
      return new Response(JSON.stringify({ error: "ID et mot de passe requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, password_hash")
      .eq("id", profile_id)
      .single();

    if (fetchError || !profile) {
      return new Response(JSON.stringify({ error: "Profil introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inputHash = await hashPassword(password);
    if (inputHash !== profile.password_hash) {
      return new Response(JSON.stringify({ error: "Mot de passe incorrect" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { error } = await supabase.from("profiles").delete().eq("id", profile_id);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, deleted: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      if (!updates || typeof updates !== "object") {
        return new Response(JSON.stringify({ error: "Données de mise à jour manquantes" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      delete updates.id;
      delete updates.password_hash;
      delete updates.created_at;

      if (updates.new_password) {
        if (updates.new_password.length < 6) {
          return new Response(JSON.stringify({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        updates.password_hash = await hashPassword(updates.new_password);
        delete updates.new_password;
      }

      const { data: updated, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile_id)
        .select("id")
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, id: updated.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      return new Response(JSON.stringify({ success: true, verified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Action non reconnue" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Manage profile error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
