import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/contexts/AuthContext";

export interface InviteUserPayload {
  email: string;
  role?: AppRole;          // optional — edge function defaults to "staff"
  redirectUrl?: string;
  metadata?: {
    full_name?: string;
    title?: string;
    organisation?: string;
  };
}

export interface InviteUserResult {
  success: boolean;
}

export async function inviteUser(payload: InviteUserPayload): Promise<InviteUserResult> {
  // Confirm we have an active session before calling.
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session) {
    throw new Error("Session expired. Please reload and log in again.");
  }

  // functions.invoke() automatically attaches Authorization + apikey from
  // the active session — do NOT pass a custom headers block.
  const { data, error } = await supabase.functions.invoke("invite-user", {
    body: {
      email: payload.email.trim(),
      role: payload.role ?? "staff",
      redirectUrl:
        payload.redirectUrl ?? `${window.location.origin}/set-password`,
      ...(payload.metadata ? { metadata: payload.metadata } : {}),
    },
  });

  // Unwrap edge-function-level errors (returned as 4xx with JSON body)
  if (error) {
    // FunctionsHttpError carries the response body in error.context
    const ctx = (error as any)?.context;
    if (ctx?.json) {
      try {
        const json = await ctx.json();
        throw new Error(json?.error ?? error.message ?? "Invite failed");
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== error.message) {
          throw parseErr;
        }
      }
    }
    throw new Error((error as any).message ?? "Invite failed");
  }

  // Unwrap application-level errors (2xx but function returned { error: "..." })
  if (data?.error) {
    throw new Error(data.error);
  }

  return { success: true };
}