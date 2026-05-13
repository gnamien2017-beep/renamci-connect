import { get, set } from "idb-keyval";
import type { Profile } from "./supabase-helpers";

type CachedPayload<T> = { data: T; cachedAt: number };

async function readCache<T>(key: string): Promise<CachedPayload<T> | null> {
  try {
    const v = (await get(key)) as CachedPayload<T> | undefined;
    return v ?? null;
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    await set(key, { data, cachedAt: Date.now() });
  } catch {
    /* quota or unavailable */
  }
}

export async function cacheProfiles(key: string, profiles: Profile[]) {
  await writeCache(key, profiles);
}

export async function getCachedProfiles(key: string): Promise<{ profiles: Profile[]; cachedAt: number } | null> {
  const c = await readCache<Profile[]>(key);
  return c ? { profiles: c.data, cachedAt: c.cachedAt } : null;
}

export async function cacheStats(stats: unknown) {
  await writeCache("stats", stats);
}

export async function getCachedStats<T>(): Promise<{ stats: T; cachedAt: number } | null> {
  const c = await readCache<T>("stats");
  return c ? { stats: c.data, cachedAt: c.cachedAt } : null;
}

export function profilesCacheKey(grade?: string) {
  return `profiles:${grade ?? "all"}`;
}

export function corpsCacheKey(corpsId: string, grade?: string) {
  return `corps:${corpsId}:${grade ?? "all"}`;
}
