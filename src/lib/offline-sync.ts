import { get, set } from "idb-keyval";
import { supabase } from "@/integrations/supabase/client";

const QUEUE_KEY = "pending-registrations";

export type PendingRegistration = {
  id: string;
  payload: Record<string, any>;
  // Photo as data URL (with mime), uploaded on flush.
  photoDataUrl?: string;
  photoName?: string;
  createdAt: number;
  attempts: number;
};

async function readQueue(): Promise<PendingRegistration[]> {
  try {
    return ((await get(QUEUE_KEY)) as PendingRegistration[]) || [];
  } catch {
    return [];
  }
}

async function writeQueue(q: PendingRegistration[]) {
  await set(QUEUE_KEY, q);
}

export async function enqueueRegistration(item: Omit<PendingRegistration, "id" | "createdAt" | "attempts">) {
  const queue = await readQueue();
  queue.push({
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    attempts: 0,
  });
  await writeQueue(queue);
  return queue.length;
}

export async function pendingCount() {
  return (await readQueue()).length;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

let flushing = false;

export async function flushPendingRegistrations(opts?: { onSuccess?: (count: number) => void }) {
  if (flushing) return;
  if (!navigator.onLine) return;
  flushing = true;
  try {
    let queue = await readQueue();
    if (!queue.length) return;

    const remaining: PendingRegistration[] = [];
    let synced = 0;

    for (const item of queue) {
      try {
        let photo_url: string | null = item.payload.photo_url ?? null;

        if (item.photoDataUrl) {
          const blob = await dataUrlToBlob(item.photoDataUrl);
          const ext = (item.photoName?.split(".").pop() || "jpg").toLowerCase();
          const fileName = `${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("avatars")
            .upload(fileName, blob, { contentType: blob.type || "image/jpeg" });
          if (upErr) throw upErr;
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
          photo_url = urlData.publicUrl;
        }

        const { data, error } = await supabase.functions.invoke("register-profile", {
          body: { ...item.payload, photo_url },
        });
        if (error || data?.error) throw new Error(data?.error || error?.message || "sync failed");
        synced++;
      } catch {
        item.attempts += 1;
        // Keep in queue for retry; drop after 10 attempts to avoid infinite growth
        if (item.attempts < 10) remaining.push(item);
      }
    }

    await writeQueue(remaining);
    if (synced > 0) opts?.onSuccess?.(synced);
  } finally {
    flushing = false;
  }
}

let initialized = false;

export function initOfflineSync(opts?: { onSuccess?: (count: number) => void }) {
  if (initialized) return;
  initialized = true;
  // Try once on startup
  if (navigator.onLine) flushPendingRegistrations(opts).catch(() => {});
  // Re-try when coming back online
  window.addEventListener("online", () => flushPendingRegistrations(opts).catch(() => {}));
  // Also retry when tab regains focus
  window.addEventListener("focus", () => {
    if (navigator.onLine) flushPendingRegistrations(opts).catch(() => {});
  });
}
