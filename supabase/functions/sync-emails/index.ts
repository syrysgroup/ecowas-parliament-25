import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getZohoToken() {
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
  if (!data.access_token) throw new Error(`Zoho token error: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get user's email account
    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, email_address, zoho_account_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!acct) return new Response(JSON.stringify({ newEmailCount: 0, message: "No active email account" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const token = await getZohoToken();
    const orgId = Deno.env.get("ZOHO_ORG_ID")!;

    // Fetch messages from Zoho for each folder
    const folders = ["inbox", "sent", "drafts", "trash"];
    let newEmailCount = 0;

    for (const folder of folders) {
      const mailRes = await fetch(
        `https://mail.zoho.eu/api/accounts/${acct.zoho_account_id}/messages/view?folderId=${folder}&limit=50&sortorder=desc`,
        { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
      );

      if (!mailRes.ok) continue;
      const mailData = await mailRes.json();
      const messages = mailData?.data ?? [];

      for (const msg of messages) {
        // Check if already synced
        const { data: existing } = await serviceClient
          .from("emails")
          .select("id")
          .eq("zoho_message_id", String(msg.messageId))
          .single();

        if (existing) continue;

        await serviceClient.from("emails").insert({
          account_id: acct.id,
          zoho_message_id: String(msg.messageId),
          from_address: msg.fromAddress || "",
          from_name: msg.sender || "",
          to_address: msg.toAddress || "",
          cc_address: msg.ccAddress || "",
          subject: msg.subject || "(No subject)",
          body_html: msg.content || "",
          body_text: msg.summary || "",
          is_read: msg.isRead ?? false,
          is_starred: msg.isFlagged ?? false,
          folder: folder,
          has_attachments: (msg.hasAttachment ?? false),
          sent_at: msg.sentDateInGMT ? new Date(Number(msg.sentDateInGMT)).toISOString() : new Date().toISOString(),
        });
        newEmailCount++;
      }
    }

    return new Response(JSON.stringify({ success: true, newEmailCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("sync-emails error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
