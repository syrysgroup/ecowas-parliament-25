export function generateId(): string {
  // Browser + modern runtime support
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback (stable + low collision risk)
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}