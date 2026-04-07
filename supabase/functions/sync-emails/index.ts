import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function flatAddr(v: unknown): string {
  if (Array.isArray(v)) return v.map((a: any) => a.address ?? String(a)).join(", ");
  return (v as string) ?? "";
}

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

async function resolveZohoAccountId(serviceClient: any, acct: any, token: string): Promise<string> {
  if (acct.zoho_account_id) return acct.zoho_account_id;

  const orgId = Deno.env.get("ZOHO_ORG_ID")!;
  const accountsRes = await fetch(`https://mail.zoho.eu/api/organization/${orgId}/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  const accountsData = await accountsRes.json();
  const accounts = accountsData?.data ?? [];

  const match = accounts.find((a: any) =>
    a.primaryEmailAddress?.toLowerCase() === acct.email_address.toLowerCase() ||
    (a.mailboxAddress ?? "").toLowerCase() === acct.email_address.toLowerCase()
  );

  if (!match) throw new Error(`No Zoho account found for ${acct.email_address}. Org accounts returned: ${JSON.stringify(accounts.map((a: any) => a.primaryEmailAddress))}`);

  const zohoAccountId = String(match.accountId ?? match.zuid);
  await serviceClient.from("email_accounts").update({ zoho_account_id: zohoAccountId }).eq("id", acct.id);
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

    // Get user's email account
    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, email_address, zoho_account_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!acct) return new Response(JSON.stringify({ newEmailCount: 0, message: "No active email account" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const token = await getZohoToken();
    const zohoAccountId = await resolveZohoAccountId(serviceClient, acct, token);

    // Fetch the actual folder list from Zoho to get folder IDs
    const foldersRes = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/folders`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });
    const foldersData = await foldersRes.json();
    const zohoFolders = Array.isArray(foldersData?.data) ? foldersData.data : [];

    // Guard — if Zoho returns no folders, log and skip gracefully
    if (zohoFolders.length === 0) {
      console.error("No folders returned from Zoho:", JSON.stringify(foldersData));
      return new Response(JSON.stringify({ success: true, newEmailCount: 0, message: "No folders returned from Zoho" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Bug 8: Batch-fetch all known message IDs upfront (one query instead of N+1)
    const { data: existingRows } = await serviceClient
      .from("emails")
      .select("zoho_message_id")
      .eq("account_id", acct.id);
    const seenIds = new Set((existingRows ?? []).map((r: any) => r.zoho_message_id));

    let newEmailCount = 0;
    // Sync all Zoho folders (not just system ones) so custom folders appear in the UI
    const allFolders: { folderName: string; folderId: string }[] = zohoFolders.map((zf: any) => ({
      folderName: (zf.folderName ?? "").toLowerCase(),
      folderId: String(zf.folderId),
    }));

    for (const { folderName, folderId: zohoFolderId } of allFolders) {
      // Skip duplicates that might appear (Zoho can return sub-folders)
      if (!zohoFolderId) continue;
      // Map known system folder names to canonical DB names
      const dbFolder =
        folderName === "inbox" ? "inbox" :
        folderName === "sent" || folderName === "sentmail" || folderName === "sent mail" ? "sent" :
        folderName === "drafts" || folderName === "draft" ? "drafts" :
        folderName === "spam" || folderName === "junk" ? "spam" :
        folderName === "trash" ? "trash" :
        folderName; // custom folders use their Zoho name as-is

      const mailRes = await fetch(
        `https://mail.zoho.eu/api/accounts/${zohoAccountId}/messages/view?folderId=${zohoFolderId}&limit=50&sortorder=desc`,
        { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
      );

      if (!mailRes.ok) continue;
      const mailData = await mailRes.json();
      const messages = mailData?.data ?? [];

      for (const msg of messages) {
        const msgId = String(msg.messageId);

        // Bug 8: check in-memory Set instead of per-message DB query
        if (seenIds.has(msgId)) continue;
        seenIds.add(msgId);

        await serviceClient.from("emails").insert({
          account_id: acct.id,
          zoho_message_id: msgId,
          from_address: msg.fromAddress || "",
          from_name: msg.sender || "",
          // Bug 7: address fields may be arrays of objects
          to_address: flatAddr(msg.toAddress),
          cc_address: flatAddr(msg.ccAddress),
          subject: msg.subject || "(No subject)",
          // Bug 3: message-list endpoint doesn't return body; fetch-email-body handles this on demand
          body_html: "",
          body_text: msg.summary || "",
          // Bug 6: Zoho may return "true"/"false" strings instead of booleans
          is_read: msg.isRead === true || msg.isRead === "true",
          is_starred: msg.isFlagged === true || msg.isFlagged === "true",
          folder: dbFolder,
          has_attachments: msg.hasAttachment === true || msg.hasAttachment === "true",
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
