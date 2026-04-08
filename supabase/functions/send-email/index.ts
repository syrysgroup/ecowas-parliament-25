import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getZohoToken(): Promise<string> {
  const clientId = Deno.env.get("ZOHO_CLIENT_ID");
  const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");
  const refreshToken = Deno.env.get("ZOHO_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Zoho OAuth credentials not configured. Check ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN secrets.");
  }

  const res = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    console.error("Zoho token refresh failed:", JSON.stringify(data));
    throw new Error(`Zoho token refresh failed: ${data.error || "no access_token returned"}`);
  }
  return data.access_token as string;
}

async function resolveZohoAccountId(serviceClient: any, acct: any, token: string): Promise<string> {
  if (acct.zoho_account_id) {
    // Validate cached ID
    const orgId = Deno.env.get("ZOHO_ORG_ID")!;
    const probe = await fetch(
      `https://mail.zoho.eu/api/organization/${orgId}/accounts/${acct.zoho_account_id}/folders`,
      { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
    );
    if (probe.ok) return acct.zoho_account_id as string;
    console.warn("send-email: cached zoho_account_id invalid, re-resolving:", acct.zoho_account_id);
    await serviceClient.from("email_accounts")
      .update({ zoho_account_id: null }).eq("id", acct.id);
  }

  const orgId = Deno.env.get("ZOHO_ORG_ID")!;
  const accountsRes = await fetch(`https://mail.zoho.eu/api/organization/${orgId}/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!accountsRes.ok) {
    throw new Error(`Zoho accounts lookup failed (HTTP ${accountsRes.status})`);
  }
  const { data: accounts = [] } = await accountsRes.json();

  const match = accounts.find((a: any) =>
    (a.primaryEmailAddress ?? "").toLowerCase() === acct.email_address.toLowerCase() ||
    (a.mailboxAddress ?? "").toLowerCase() === acct.email_address.toLowerCase()
  );

  if (!match) {
    const visible = accounts.map((a: any) => a.primaryEmailAddress).join(", ");
    throw new Error(
      `No Zoho mailbox for "${acct.email_address}". Visible: [${visible || "none"}]`
    );
  }
  if (!match.accountId) {
    throw new Error(`Zoho returned no accountId for "${acct.email_address}": ${JSON.stringify(match)}`);
  }

  const zohoAccountId = String(match.accountId);
  await serviceClient.from("email_accounts")
    .update({ zoho_account_id: zohoAccountId }).eq("id", acct.id);
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

    const { to, cc, subject, bodyHtml, replyToId, attachments } = await req.json();
    if (!to || !subject) return new Response(JSON.stringify({ error: "to and subject required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: acct, error: acctErr } = await serviceClient
      .from("email_accounts")
      .select("id, email_address, zoho_account_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!acct) {
      console.error("No active email account for user:", user.id, acctErr);
      return new Response(JSON.stringify({ error: "No active email account. Go to Settings → Email Config to connect your email." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let token: string;
    try {
      token = await getZohoToken();
    } catch (err: any) {
      console.error("Zoho token error:", err.message);
      return new Response(JSON.stringify({ error: `Email service authentication failed: ${err.message}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let zohoAccountId: string;
    try {
      zohoAccountId = await resolveZohoAccountId(serviceClient, acct, token);
    } catch (err: any) {
      console.error("Zoho account resolve error:", err.message);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orgId = Deno.env.get("ZOHO_ORG_ID")!;

    // Send via Zoho org-level API
    const sendPayload: Record<string, any> = {
      fromAddress: acct.email_address,
      toAddress: to,
      subject,
      content: bodyHtml,
      mailFormat: "html",
    };
    if (cc) sendPayload.ccAddress = cc;
    if (Array.isArray(attachments) && attachments.length > 0) {
      sendPayload.attachments = attachments.map((a: any) => ({
        name: a.name ?? "attachment",
        content: a.base64 ?? "",
        contentType: a.contentType ?? "application/octet-stream",
      }));
    }

    const sendRes = await fetch(`https://mail.zoho.eu/api/organization/${orgId}/accounts/${zohoAccountId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendPayload),
    });

    const sendData = await sendRes.json();

    if (!sendRes.ok) {
      const zohoError = sendData?.data?.errorCode || sendData?.data?.moreInfo || sendData?.status?.description || JSON.stringify(sendData);
      console.error("Zoho send failed:", sendRes.status, JSON.stringify(sendData));
      return new Response(JSON.stringify({ error: `Zoho rejected the email: ${zohoError}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messageId = sendData?.data?.messageId ?? null;

    // Save to emails table as sent
    const { error: insertErr } = await serviceClient.from("emails").insert({
      account_id: acct.id,
      zoho_message_id: messageId ? String(messageId) : null,
      from_address: acct.email_address,
      to_address: to,
      cc_address: cc || null,
      subject,
      body_html: bodyHtml,
      is_read: true,
      folder: "sent",
      sent_at: new Date().toISOString(),
    });
    if (insertErr) console.error("Failed to save sent email:", insertErr);

    return new Response(JSON.stringify({ success: true, messageId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
