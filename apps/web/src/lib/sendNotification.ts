import { supabase } from "@/integrations/supabase/client";

type NotificationType =
  | "new_email"
  | "new_task"
  | "upcoming_event"
  | "invitation_accepted"
  | "new_message";

/**
 * Fire-and-forget wrapper around the send-notification edge function.
 * Never throws — notification failure must not block the calling action.
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  payload: Record<string, string>
): Promise<void> {
  try {
    await supabase.functions.invoke("send-notification", {
      body: { user_id: userId, type, payload },
    });
  } catch {
    // Intentionally swallowed — notifications are non-critical
  }
}
