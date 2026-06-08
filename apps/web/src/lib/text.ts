/**
 * Normalize user-visible copy.
 * Strips em/en dashes (per design preference) and tidies whitespace.
 * Replacement rule: ` — ` and ` – ` → `, `. Bare `—`/`–` → `, `.
 */
export function cleanText(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

/** Recursively clean every string in a JSON-like value. */
export function cleanDeep<T>(value: T): T {
  if (typeof value === "string") return cleanText(value) as unknown as T;
  if (Array.isArray(value)) return value.map(cleanDeep) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = cleanDeep(v);
    }
    return out as T;
  }
  return value;
}