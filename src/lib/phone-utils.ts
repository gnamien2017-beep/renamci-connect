// Helpers for phone numbers — robust to historical formats and new E.164 stored values.

/**
 * Convert any stored phone string to E.164 (without spaces).
 * - "+225..."          → kept as is
 * - "00225..."         → "+225..."
 * - "07XXXXXXXX" (10d) → "+2250708..." (CI: trunk 0 is part of the subscriber number)
 * - default            → prefix "+" if missing
 */
export function toE164(raw: string): string {
  const s = (raw || "").replace(/\s+/g, "").replace(/[^\d+]/g, (c) => (c === "+" ? "+" : ""));
  if (!s) return "";
  if (s.startsWith("+")) return s;
  if (s.startsWith("00")) return "+" + s.slice(2);
  // 10 digits starting with 0 → assume Côte d'Ivoire local format, keep the 0
  if (/^0\d{9}$/.test(s)) return "+225" + s;
  // 8 digits old CI format → prefix CI without modification
  if (/^\d{8}$/.test(s)) return "+225" + s;
  return "+" + s;
}

/** Strip the leading "+" for wa.me URLs */
export function toWhatsappNumber(raw: string): string {
  return toE164(raw).replace(/^\+/, "");
}

/** Pretty display for UI (just trims) */
export function displayPhone(raw: string): string {
  return (raw || "").trim();
}
