import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/contexts/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface InviteUserMetadata {
  full_name?: string;
  title?: string;
  organisation?: string;
  bio?: string;
  avatar_url?: string;
}

export interface InviteUserPayload {
  email: string;
  role: AppRole;
  redirectUrl?: string;
  metadata?: InviteUserMetadata;
}

export interface InviteUserResult {
  actionLink?: string;
}

// ── Error extraction ───────────────────────────────────────────────────────────
// Handles three error shapes produced by supabase.functions.invoke():
//   1. res.error.context.json()  — FunctionsHttpError with a JSON body
//   2. res.error.message         — network-level or non-JSON edge function error
//   3. res.data.error            — 2xx response but edge function returned an error field

export async function extractInviteError(
  res: { error?: unknown; data?: unknown }
): Promise<string | null> {
  if (res.error) {
    const err = res.error as {
      message?: string;
      context?: { json?: () => Promise<{ error?: string }> };
    };
    let msg: string = err.message ?? "Unknown error";
    try {
      const json = await err.context?.json?.();
      msg = json?.error ?? msg;
    } catch { /* keep msg */ }
    return msg;
  }
  const body = res.data as { error?: string } | null | undefined;
  if (body?.error) return body.error;
  return null;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function inviteUser(payload: InviteUserPayload): Promise<InviteUserResult> {
  // Verify the session is alive before calling the edge function.
  // Do NOT extract the token manually — the Supabase JS SDK automatically
  // attaches both the `Authorization: Bearer <access_token>` header AND the
  // required `apikey` header when you call functions.invoke().
  // Passing a manual `headers: { Authorization }` block overrides the SDK's
  // default header bundle and strips the `apikey` header, which causes a 401.
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session) {
    throw new Error("Session expired. Please reload and log in again.");
  }

  const res = await supabase.functions.invoke("invite-user", {
    body: {
      email: payload.email,
      role: payload.role,
      redirectUrl: payload.redirectUrl ?? `${window.location.origin}/set-password`,
      ...(payload.metadata ? { metadata: payload.metadata } : {}),
    },
    // ✅ No custom `headers` here — the SDK injects Authorization + apikey
    //    automatically from the active session.
  });

  const errorMsg = await extractInviteError(res);
  if (errorMsg) throw new Error(errorMsg);

  const body = res.data as { actionLink?: string } | null | undefined;
  return { actionLink: body?.actionLink };
}
