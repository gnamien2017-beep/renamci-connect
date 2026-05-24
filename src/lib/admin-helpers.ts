import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "./supabase-helpers";

export type ProfileStatus = "pending" | "approved" | "rejected";

export async function fetchProfilesByStatus(status: ProfileStatus): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown) as Profile[];
}

export async function setProfileStatus(profileId: string, status: ProfileStatus) {
  const { error } = await supabase.from("profiles").update({ status } as any).eq("id", profileId);
  if (error) throw error;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (error) return false;
  return !!data;
}

export async function fetchUnreadAdminNotifications() {
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .is("read_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markAllNotificationsRead() {
  await supabase.from("admin_notifications").update({ read_at: new Date().toISOString() } as any).is("read_at", null);
}

// Announcements
export type Announcement = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export async function fetchAnnouncements(onlyPublished = true): Promise<Announcement[]> {
  let query = supabase.from("announcements").select("*").order("created_at", { ascending: false });
  if (onlyPublished) query = query.eq("published", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown) as Announcement[];
}

export async function fetchAnnouncement(id: string): Promise<Announcement | null> {
  const { data, error } = await supabase.from("announcements").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown) as Announcement | null;
}

export async function createAnnouncement(input: { title: string; content: string; image_url?: string | null; published?: boolean }) {
  const { error } = await supabase.from("announcements").insert(input as any);
  if (error) throw error;
}

export async function updateAnnouncement(id: string, input: Partial<Announcement>) {
  const { error } = await supabase.from("announcements").update(input as any).eq("id", id);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
