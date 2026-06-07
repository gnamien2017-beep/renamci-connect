import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const {
      profileId, password, action, announcementId, title, content, published,
      imageBase64, imageMime, removeImage, rejectionReason,
    } = await req.json();
    if (!profileId || !password) return json({ error: "Authentification requise" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("profiles").select("id, password_hash, status, is_admin").eq("id", profileId).maybeSingle();

    if (!profile || profile.password_hash !== (await hashPassword(password))) {
      return json({ error: "Identifiants invalides" }, 401);
    }
    if (profile.status !== "approved" || !profile.is_admin) {
      return json({ error: "Accès réservé aux administrateurs" }, 403);
    }

    let image_url: string | undefined;
    if (imageBase64 && imageMime) {
      const bytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
      const ext = (imageMime.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const path = `announcements/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, bytes, {
        contentType: imageMime, upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
      image_url = pub.publicUrl;
    }

    if (action === "create") {
      const t = (title ?? "").toString().trim();
      const c = (content ?? "").toString().trim();
      if (!t || !c) return json({ error: "Titre et contenu requis" }, 400);
      const { data, error } = await supabase.from("announcements").insert({
        title: t, content: c, image_url: image_url ?? null,
        published: published !== false, created_by: profileId,
        approval_status: "pending",
      }).select().single();
      if (error) throw error;
      return json({ success: true, announcement: data });
    }

    if (action === "update") {
      if (!announcementId) return json({ error: "announcementId requis" }, 400);
      const { data: current } = await supabase
        .from("announcements").select("created_by, approval_status").eq("id", announcementId).maybeSingle();
      if (!current) return json({ error: "Annonce introuvable" }, 404);
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title !== undefined) patch.title = String(title).trim();
      if (content !== undefined) patch.content = String(content).trim();
      if (published !== undefined) patch.published = Boolean(published);
      if (image_url) patch.image_url = image_url;
      if (removeImage) patch.image_url = null;
      // Editing content resets approval to pending (unless the editor is also re-submitting)
      if (title !== undefined || content !== undefined || image_url || removeImage) {
        patch.approval_status = "pending";
        patch.approved_by = null;
        patch.approved_at = null;
        patch.rejection_reason = null;
      }
      const { data, error } = await supabase.from("announcements").update(patch).eq("id", announcementId).select().single();
      if (error) throw error;
      return json({ success: true, announcement: data });
    }

    if (action === "approve" || action === "reject") {
      if (!announcementId) return json({ error: "announcementId requis" }, 400);
      const { data: current } = await supabase
        .from("announcements").select("created_by, approval_status").eq("id", announcementId).maybeSingle();
      if (!current) return json({ error: "Annonce introuvable" }, 404);
      if (current.created_by === profileId) {
        return json({ error: "Un administrateur ne peut pas valider sa propre annonce. Un autre admin doit l'approuver." }, 403);
      }
      const patch: Record<string, unknown> = {
        approval_status: action === "approve" ? "approved" : "rejected",
        approved_by: profileId,
        approved_at: new Date().toISOString(),
        rejection_reason: action === "reject" ? (rejectionReason ?? null) : null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from("announcements").update(patch).eq("id", announcementId).select().single();
      if (error) throw error;
      return json({ success: true, announcement: data });
    }

    if (action === "delete") {
      if (!announcementId) return json({ error: "announcementId requis" }, 400);
      const { error } = await supabase.from("announcements").delete().eq("id", announcementId);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (err) {
    console.error("manage-announcement error:", err);
    return json({ error: String(err) }, 500);
  }
});
