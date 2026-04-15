export function generateId(): string {
  // Modern browsers (Chrome, Edge, Firefox, Safari)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Safe fallback (works everywhere)
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}