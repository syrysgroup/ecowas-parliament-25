import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function flatAddr(v: unknown): string {
  if (Array.isArray(v)) return v.map((a: any) => a.address ?? String(a)).join(", ");
  return (v as string) ?? "";
}

// Module-level token cache — reused across warm invocations of the same instance
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

  if (data.error === "Access Denied" || !data.access_token) {
    const isRateLimit = (data.error_description ?? "").toLowerCase().includes("too many");
    throw Object.assign(
      new Error(`Zoho token error: ${JSON.stringify(data)}`),
      { isRateLimit }
    );
  }

  _cachedToken = data.access_token as string;
  _tokenExpiresAt = Date.now() + ((data.expires_in ?? 3600) - 120) * 1000;
  return _cachedToken;
}

async function resolveZohoAccountId(serviceClient: any, acct: any, token: string): Promise<string> {
  if (acct.zoho_account_id) return acct.zoho_account_id;

  const orgId = Deno.env.get("ZOHO_ORG_ID")!;
  const res = await fetch(`https://mail.zoho.eu/api/organization/${orgId}/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  const data = await res.json();
  const accounts: any[] = Array.isArray(data?.data) ? data.data : [];

  console.log("Org accounts:", JSON.stringify(accounts.map((a: any) => ({
    accountId: a.accountId,
    email: a.primaryEmailAddress ?? a.mailboxAddress,
  }))));

  const match = accounts.find((a: any) =>
    (a.primaryEmailAddress ?? "").toLowerCase() === acct.email_address.toLowerCase() ||
    (a.mailboxAddress ?? "").toLowerCase() === acct.email_address.toLowerCase()
  );

  if (!match) {
    const visible = accounts.map((a: any) => a.primaryEmailAddress ?? a.mailboxAddress).join(", ");
    throw new Error(`No Zoho mailbox matches "${acct.email_address}". Org accounts: [${visible || "none"}]`);
  }

  const zohoAccountId = String(match.accountId);
  await serviceClient.from("email_accounts").update({ zoho_account_id: zohoAccountId, last_synced_at: new Date().toISOString() }).eq("id", acct.id);
  return zohoAccountId;
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

    // Determine which user's mailbox to sync (admins can pass target_user_id)
    let body: any = {};
    try { body = await req.clone().json(); } catch { /* no body or not JSON */ }
    const requestedUserId: string = body?.target_user_id ?? user.id;

    let effectiveUserId = user.id;
    if (requestedUserId !== user.id) {
      const { data: roleCheck } = await serviceClient
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .in("role", ["super_admin", "admin"])
        .maybeSingle();
      if (!roleCheck) {
        return new Response(JSON.stringify({ error: "Only admins can sync another user's mailbox" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      effectiveUserId = requestedUserId;
    }

    // Get the target user's email account
    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, email_address, zoho_account_id")
      .eq("user_id", effectiveUserId)
      .eq("is_active", true)
      .single();

    if (!acct) return new Response(JSON.stringify({ newEmailCount: 0, message: "No active email account" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const token = await getZohoToken();
    const zohoAccountId = await resolveZohoAccountId(serviceClient, acct, token);
    const orgId = Deno.env.get("ZOHO_ORG_ID")!;

    // Fetch the actual folder list from Zoho using org-level API
    const foldersRes = await fetch(`https://mail.zoho.eu/api/organization/${orgId}/accounts/${zohoAccountId}/folders`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });
    const foldersData = await foldersRes.json();

    const zohoFolders = Array.isArray(foldersData?.data) ? foldersData.data : [];

    if (zohoFolders.length === 0) {
      console.error("No folders returned from Zoho:", JSON.stringify(foldersData));
      return new Response(JSON.stringify({ success: true, newEmailCount: 0, message: "No folders returned from Zoho" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch-fetch all known message IDs upfront
    const { data: existingRows } = await serviceClient
      .from("emails")
      .select("zoho_message_id")
      .eq("account_id", acct.id);
    const seenIds = new Set((existingRows ?? []).map((r: any) => r.zoho_message_id));

    let newEmailCount = 0;
    const allFolders: { folderName: string; folderId: string }[] = zohoFolders.map((zf: any) => ({
      folderName: (zf.folderName ?? "").toLowerCase(),
      folderId: String(zf.folderId),
    }));

    for (const { folderName, folderId: zohoFolderId } of allFolders) {
      if (!zohoFolderId) continue;
      const dbFolder =
        folderName === "inbox" ? "inbox" :
        folderName === "sent" || folderName === "sentmail" || folderName === "sent mail" ? "sent" :
        folderName === "drafts" || folderName === "draft" ? "drafts" :
        folderName === "spam" || folderName === "junk" ? "spam" :
        folderName === "trash" ? "trash" :
        folderName;

      const mailRes = await fetch(
        `https://mail.zoho.eu/api/organization/${orgId}/accounts/${zohoAccountId}/messages/view?folderId=${zohoFolderId}&limit=50&sortorder=desc`,
        { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
      );

      if (!mailRes.ok) continue;
      const mailData = await mailRes.json();
      const messages = mailData?.data ?? [];

      for (const msg of messages) {
        const msgId = String(msg.messageId);
        if (seenIds.has(msgId)) continue;
        seenIds.add(msgId);

        await serviceClient.from("emails").insert({
          account_id: acct.id,
          zoho_message_id: msgId,
          from_address: msg.fromAddress || "",
          from_name: msg.sender || "",
          to_address: flatAddr(msg.toAddress),
          cc_address: flatAddr(msg.ccAddress),
          subject: msg.subject || "(No subject)",
          body_html: "",
          body_text: msg.summary || "",
          is_read: msg.isRead === true || msg.isRead === "true",
          is_starred: msg.isFlagged === true || msg.isFlagged === "true",
          folder: dbFolder,
          has_attachments: msg.hasAttachment === true || msg.hasAttachment === "true",
          sent_at: msg.sentDateInGMT ? new Date(Number(msg.sentDateInGMT)).toISOString() : new Date().toISOString(),
        });
        newEmailCount++;
      }
    }

    // Update last_synced_at
    await serviceClient.from("email_accounts").update({ last_synced_at: new Date().toISOString() }).eq("id", acct.id);

    return new Response(JSON.stringify({ success: true, newEmailCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("sync-emails error:", err);
    if (err.isRateLimit) {
      return new Response(JSON.stringify({ success: false, newEmailCount: 0, error: "Zoho rate limit — try again in a moment" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
