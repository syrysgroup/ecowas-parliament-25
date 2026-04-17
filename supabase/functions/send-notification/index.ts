import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Zoho token cache ──────────────────────────────────────────────────────────
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

async function getZohoToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiresAt) return _cachedToken;
  const res = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
      client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
      refresh_token: Deno.env.get("ZOHO_REFRESH_TOKEN")!,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho token refresh failed: ${data.error ?? "no access_token"}`);
  _cachedToken = data.access_token as string;
  _tokenExpiresAt = Date.now() + ((data.expires_in ?? 3600) - 120) * 1000;
  return _cachedToken;
}

// ── Notification templates ────────────────────────────────────────────────────
type NotificationType = "new_email" | "new_task" | "upcoming_event" | "invitation_accepted" | "new_message";

interface NotificationPayload {
  sender?: string;
  subject?: string;
  task_title?: string;
  event_title?: string;
  event_date?: string;
  user_name?: string;
}

function buildNotificationHtml(type: NotificationType, payload: NotificationPayload): { subject: string; body: string } {
  const header = `
    <div style="background:#1a3c34;padding:24px 32px;text-align:center">
      <img src="https://xahuyraommtfopnxrjvz.supabase.co/storage/v1/object/public/branding/logos/sing.png" alt="EPI" style="height:50px" />
    </div>`;
  const footer = `
    <div style="padding:16px 32px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee">
      ECOWAS Parliament Initiatives &bull; www.ecowasparliamentinitiatives.org<br/>
      This is an automated notification. Please do not reply to this email.
    </div>`;

  switch (type) {
    case "new_email":
      return {
        subject: `New email from ${payload.sender ?? "someone"} — ${payload.subject ?? "(no subject)"}`,
        body: `${header}
          <div style="padding:32px;font-family:Arial,sans-serif;color:#333">
            <h2 style="margin:0 0 16px;color:#1a3c34">You have a new email</h2>
            <p><strong>From:</strong> ${payload.sender ?? "Unknown"}</p>
            <p><strong>Subject:</strong> ${payload.subject ?? "(no subject)"}</p>
            <p style="margin-top:20px">Log in to your CRM inbox to read and reply.</p>
          </div>${footer}`,
      };
    case "new_task":
      return {
        subject: `New task assigned — ${payload.task_title ?? "Untitled"}`,
        body: `${header}
          <div style="padding:32px;font-family:Arial,sans-serif;color:#333">
            <h2 style="margin:0 0 16px;color:#1a3c34">New Task Assigned</h2>
            <p>A new task has been assigned to you:</p>
            <p style="font-size:16px;font-weight:bold;color:#2e7d5b;margin:12px 0">${payload.task_title ?? "Untitled"}</p>
            <p>Log in to the CRM to view details and get started.</p>
          </div>${footer}`,
      };
    case "upcoming_event":
      return {
        subject: `Reminder: ${payload.event_title ?? "Event"} starts soon`,
        body: `${header}
          <div style="padding:32px;font-family:Arial,sans-serif;color:#333">
            <h2 style="margin:0 0 16px;color:#1a3c34">Upcoming Event Reminder</h2>
            <p style="font-size:16px;font-weight:bold;color:#2e7d5b;margin:12px 0">${payload.event_title ?? "Event"}</p>
            ${payload.event_date ? `<p><strong>Date:</strong> ${payload.event_date}</p>` : ""}
            <p>This event starts in 24 hours. Don't miss it!</p>
          </div>${footer}`,
      };
    case "invitation_accepted":
      return {
        subject: `${payload.user_name ?? "Someone"} has accepted your invitation`,
        body: `${header}
          <div style="padding:32px;font-family:Arial,sans-serif;color:#333">
            <h2 style="margin:0 0 16px;color:#1a3c34">Invitation Accepted</h2>
            <p><strong>${payload.user_name ?? "A user"}</strong> has accepted your invitation and joined the platform.</p>
            <p style="margin-top:16px">You can now collaborate with them in the CRM.</p>
          </div>${footer}`,
      };
    case "new_message":
      return {
        subject: `New message from ${payload.sender ?? "someone"}`,
        body: `${header}
          <div style="padding:32px;font-family:Arial,sans-serif;color:#333">
            <h2 style="margin:0 0 16px;color:#1a3c34">New Message</h2>
            <p><strong>${payload.sender ?? "Someone"}</strong> sent you a new message in the CRM.</p>
            <p style="margin-top:20px">Log in to view and reply.</p>
          </div>${footer}`,
      };
    default:
      return { subject: "Notification", body: `${header}<div style="padding:32px">You have a new notification.</div>${footer}` };
  }
}

// ── Resolve a do-not-reply Zoho accountId ─────────────────────────────────────
async function getDoNotReplyAccountId(token: string): Promise<{ accountId: string; fromAddress: string }> {
  const orgId = Deno.env.get("ZOHO_ORG_ID")!;
  const accountsRes = await fetch(`https://mail.zoho.eu/api/organization/${orgId}/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!accountsRes.ok) throw new Error(`Zoho accounts lookup failed: ${accountsRes.status}`);
  const accountsData = await accountsRes.json();
  const accounts: any[] = Array.isArray(accountsData?.data) ? accountsData.data : [];

  // Prefer do-not-reply, fall back to first account
  const dnr = accounts.find((a: any) =>
    (a.primaryEmailAddress ?? "").toLowerCase().includes("do-not-reply") ||
    (a.primaryEmailAddress ?? "").toLowerCase().includes("donotreply") ||
    (a.primaryEmailAddress ?? "").toLowerCase().includes("noreply")
  );
  const chosen = dnr || accounts[0];
  if (!chosen) throw new Error("No Zoho accounts available for sending notifications");
  return { accountId: String(chosen.accountId), fromAddress: chosen.primaryEmailAddress ?? chosen.mailboxAddress };
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, type, payload } = await req.json() as {
      user_id: string;
      type: NotificationType;
      payload: NotificationPayload;
    };

    if (!user_id || !type) {
      return new Response(JSON.stringify({ error: "user_id and type are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get user's notification_email
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("notification_email, full_name")
      .eq("id", user_id)
      .single();

    if (!profile?.notification_email) {
      return new Response(JSON.stringify({ skipped: true, reason: "No notification_email set" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user notification preferences (default to true if no row exists)
    const prefColumn: Record<NotificationType, string> = {
      new_message:        "notify_new_message",
      new_email:          "notify_new_message",
      new_task:           "notify_task_assign",
      upcoming_event:     "notify_event_remind",
      invitation_accepted: "notify_invite_accept",
    };
    const { data: prefs } = await serviceClient
      .from("user_notification_prefs")
      .select(prefColumn[type])
      .eq("user_id", user_id)
      .single();
    // If row missing or pref is explicitly false, skip
    if (prefs && prefs[prefColumn[type]] === false) {
      return new Response(JSON.stringify({ skipped: true, reason: "Notification type disabled by user" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getZohoToken();
    const { accountId, fromAddress } = await getDoNotReplyAccountId(token);
    const { subject, body } = buildNotificationHtml(type, payload);
    const orgId = Deno.env.get("ZOHO_ORG_ID")!;

    const sendRes = await fetch(
      `https://mail.zoho.eu/api/organization/${orgId}/accounts/${accountId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAddress,
          toAddress: [{ address: profile.notification_email }],
          subject,
          content: body,
          mailFormat: "html",
        }),
      }
    );

    const sendData = await sendRes.json();
    if (!sendRes.ok) {
      console.error("Notification send failed:", sendRes.status, JSON.stringify(sendData));
      return new Response(JSON.stringify({ error: "Failed to send notification" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-notification error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
