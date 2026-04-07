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
  if (!data.access_token) throw new Error("Failed to get Zoho token");
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

  if (!match) throw new Error(`No Zoho account found for ${acct.email_address}`);

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

    const { to, cc, subject, bodyHtml, replyToId } = await req.json();
    if (!to || !subject) return new Response(JSON.stringify({ error: "to and subject required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, email_address, zoho_account_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!acct) return new Response(JSON.stringify({ error: "No active email account" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const token = await getZohoToken();
    const zohoAccountId = await resolveZohoAccountId(serviceClient, acct, token);

    // Send via Zoho
    const sendPayload: Record<string, any> = {
      fromAddress: acct.email_address,
      toAddress: to,
      subject,
      content: bodyHtml,
      mailFormat: "html",
    };
    if (cc) sendPayload.ccAddress = cc;

    const sendRes = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendPayload),
    });
    const sendData = await sendRes.json();
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
