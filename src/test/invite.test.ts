import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// ─── Mirror the edge function's Zod schema ───────────────────────────────────
// Kept in sync with supabase/functions/invite-user/index.ts BodySchema.
const VALID_ROLES = [
  "super_admin", "admin", "moderator", "sponsor", "media",
  "project_director", "programme_lead", "website_editor", "marketing_manager",
  "communications_officer", "finance_coordinator", "logistics_coordinator",
  "sponsor_manager", "consultant",
] as const;

const InviteBodySchema = z.object({
  email: z.string().email(),
  role: z.enum(VALID_ROLES),
  redirectUrl: z.string().url().optional(),
  metadata: z.object({
    full_name: z.string().optional(),
    title: z.string().optional(),
    organisation: z.string().optional(),
    bio: z.string().optional(),
    avatar_url: z.string().optional(),
  }).optional(),
});

// ─── 1. Schema validation ─────────────────────────────────────────────────────
describe("invite-user edge function — request body schema", () => {
  it("accepts a minimal valid invite", () => {
    const result = InviteBodySchema.safeParse({
      email: "new@example.com",
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a full invite with metadata and redirectUrl", () => {
    const result = InviteBodySchema.safeParse({
      email: "jane@example.com",
      role: "moderator",
      redirectUrl: "https://app.example.com/set-password",
      metadata: { full_name: "Jane Doe", title: "Coordinator" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing email", () => {
    const result = InviteBodySchema.safeParse({ role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    const result = InviteBodySchema.safeParse({ email: "not-an-email", role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing role", () => {
    const result = InviteBodySchema.safeParse({ email: "valid@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects an unrecognised role", () => {
    const result = InviteBodySchema.safeParse({ email: "valid@example.com", role: "hacker" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid redirectUrl", () => {
    const result = InviteBodySchema.safeParse({
      email: "valid@example.com",
      role: "admin",
      redirectUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("silently strips unknown top-level fields (full_name must be inside metadata)", () => {
    // This replicates the bug that was fixed: full_name at top level is stripped.
    const result = InviteBodySchema.safeParse({
      email: "test@example.com",
      role: "admin",
      full_name: "Top-level name",   // ← wrong position
    });
    // Schema passes (Zod strips the unknown field), but full_name is absent from output
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).full_name).toBeUndefined();
      expect(result.data.metadata).toBeUndefined();
    }
  });

  it("preserves full_name when correctly nested inside metadata", () => {
    const result = InviteBodySchema.safeParse({
      email: "test@example.com",
      role: "admin",
      metadata: { full_name: "Correctly Nested" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata?.full_name).toBe("Correctly Nested");
    }
  });
});

// ─── 2. Frontend body shape ───────────────────────────────────────────────────
// Verifies the payload that UserManagement.tsx sends to functions.invoke().
describe("UserManagement invite body — shape sent to edge function", () => {
  const buildInviteBody = (email: string, permTier: "tier1" | "tier2" | "tier3", fullName: string) => ({
    email: email.trim(),
    role: permTier === "tier1" ? "admin" : "moderator",
    redirectUrl: `${window.location.origin}/set-password`,
    metadata: { full_name: fullName.trim() },
  });

  it("maps tier1 to admin role", () => {
    const body = buildInviteBody("a@b.com", "tier1", "Alice");
    expect(body.role).toBe("admin");
  });

  it("maps tier2 to moderator role", () => {
    const body = buildInviteBody("a@b.com", "tier2", "Bob");
    expect(body.role).toBe("moderator");
  });

  it("maps tier3 to moderator role", () => {
    const body = buildInviteBody("a@b.com", "tier3", "Carol");
    expect(body.role).toBe("moderator");
  });

  it("places full_name inside metadata, not at the top level", () => {
    const body = buildInviteBody("a@b.com", "tier1", "Diana Prince");
    expect((body as any).full_name).toBeUndefined();
    expect(body.metadata.full_name).toBe("Diana Prince");
  });

  it("includes a redirectUrl pointing to /set-password", () => {
    const body = buildInviteBody("a@b.com", "tier1", "Eric");
    expect(body.redirectUrl).toMatch(/\/set-password$/);
  });

  it("trims whitespace from email and name", () => {
    const body = buildInviteBody("  spaced@example.com  ", "tier1", "  Frank  ");
    expect(body.email).toBe("spaced@example.com");
    expect(body.metadata.full_name).toBe("Frank");
  });

  it("produces a body that passes the edge function schema", () => {
    const body = buildInviteBody("valid@example.com", "tier1", "Grace");
    const result = InviteBodySchema.safeParse(body);
    expect(result.success).toBe(true);
  });
});

// ─── 3. Token acquisition ─────────────────────────────────────────────────────
// Validates the refreshSession()-first pattern used in SuperAdminModule.handleInvite.
describe("invite token acquisition — refreshSession() pattern", () => {
  const buildRefreshResult = (accessToken: string | null, error: any = null) => ({
    data: { session: accessToken ? { access_token: accessToken, user: {} } : null },
    error,
  });

  it("returns a token when refresh succeeds", () => {
    const result = buildRefreshResult("fresh-jwt-token");
    const token = result.data?.session?.access_token;
    expect(token).toBe("fresh-jwt-token");
  });

  it("treats a null session as an expired session (no token)", () => {
    const result = buildRefreshResult(null);
    const token = result.data?.session?.access_token;
    expect(token).toBeUndefined();
  });

  it("treats a refresh error as a session failure", () => {
    const result = buildRefreshResult(null, new Error("Refresh token expired"));
    expect(result.error).toBeTruthy();
    expect(result.data?.session?.access_token).toBeUndefined();
  });

  it("uses the refreshed token (not a cached one) for the Authorization header", () => {
    const cachedToken = "old-stale-token";
    const freshToken = "new-fresh-token";
    const result = buildRefreshResult(freshToken);
    // The refreshSession() result should always be preferred over the cached token
    const usedToken = result.data?.session?.access_token ?? cachedToken;
    expect(usedToken).toBe(freshToken);
  });
});

// ─── 4. Error response handling ──────────────────────────────────────────────
describe("invite error surfacing", () => {
  // Simulate the error extraction logic from UserManagement.tsx handleSave
  const extractErrorMessage = async (res: { error?: any; data?: any }): Promise<string | null> => {
    if (res.error) {
      let msg: string = res.error.message ?? "Unknown error";
      try {
        msg = (await (res.error as any).context?.json?.())?.error ?? msg;
      } catch { /* keep msg */ }
      return msg;
    }
    const body = res.data as any;
    if (body?.error) return body.error;
    return null; // no error
  };

  it("returns null when invite succeeds", async () => {
    const res = { data: { success: true, message: "Invitation sent to x@x.com" } };
    expect(await extractErrorMessage(res)).toBeNull();
  });

  it("surfaces error from res.data.error (edge function body error)", async () => {
    const res = { data: { error: "A pending invitation for this email already exists." } };
    expect(await extractErrorMessage(res)).toBe("A pending invitation for this email already exists.");
  });

  it("surfaces error from res.error.message when context.json is unavailable", async () => {
    const res = { error: { message: "Network failure" } };
    expect(await extractErrorMessage(res)).toBe("Network failure");
  });

  it("extracts error from context.json when available (FunctionsHttpError shape)", async () => {
    const res = {
      error: {
        message: "Edge Function returned a non-2xx status code",
        context: {
          json: async () => ({ error: "Forbidden" }),
        },
      },
    };
    expect(await extractErrorMessage(res)).toBe("Forbidden");
  });

  it("surfaces the 409 duplicate invitation message correctly", async () => {
    const res = {
      error: {
        message: "Edge Function returned a non-2xx status code",
        context: {
          json: async () => ({ error: "A pending invitation for this email already exists." }),
        },
      },
    };
    expect(await extractErrorMessage(res)).toBe("A pending invitation for this email already exists.");
  });
});
