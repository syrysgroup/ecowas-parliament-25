import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Shared token cache ────────────────────────────────────────────────────────
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

// ── Normalise address to Zoho array format ────────────────────────────────────
function normaliseAddresses(val: unknown): { address: string }[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((v: any) => (typeof v === "string" ? { address: v.trim() } : v)).filter((v) => v.address);
  }
  return String(val)
    .split(",")
    .map((a) => ({ address: a.trim() }))
    .filter((a) => a.address);
}

// ── Resolve Zoho accountId via org endpoint ───────────────────────────────────
async function resolveZohoAccountId(serviceClient: any, acct: any, token: string): Promise<string> {
  const orgId = Deno.env.get("ZOHO_ORG_ID")!;

  if (acct.zoho_account_id) {
    const probe = await fetch(
      `https://mail.zoho.eu/api/organization/${orgId}/accounts/${acct.zoho_account_id}/folders`,
      { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
    );
    if (probe.ok) return acct.zoho_account_id as string;
    console.warn("send-email: cached zoho_account_id invalid, re-resolving:", acct.zoho_account_id);
    await serviceClient.from("email_accounts").update({ zoho_account_id: null }).eq("id", acct.id);
  }

  const accountsRes = await fetch(`https://mail.zoho.eu/api/organization/${orgId}/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!accountsRes.ok) throw new Error(`Zoho org accounts lookup failed (HTTP ${accountsRes.status})`);

  const accountsData = await accountsRes.json();
  const accounts: any[] = Array.isArray(accountsData?.data) ? accountsData.data : [];

  const match = accounts.find(
    (a: any) =>
      (a.primaryEmailAddress ?? "").toLowerCase() === acct.email_address.toLowerCase() ||
      (a.mailboxAddress ?? "").toLowerCase() === acct.email_address.toLowerCase()
  );

  if (!match) {
    const visible = accounts.map((a: any) => a.primaryEmailAddress ?? a.mailboxAddress).join(", ");
    throw new Error(`No Zoho mailbox for "${acct.email_address}". Org accounts: [${visible || "none"}]`);
  }

  const zohoAccountId = String(match.accountId);
  await serviceClient.from("email_accounts").update({ zoho_account_id: zohoAccountId }).eq("id", acct.id);
  return zohoAccountId;
}

// ── Build signature HTML ──────────────────────────────────────────────────────
function buildSignatureHtml(sig: Record<string, any> | null): string {
  if (!sig) return "";
  return `
<div style="margin-top:20px;padding-top:16px;border-top:1px solid #ccc;font-family:Georgia,serif;font-size:13px;color:#333">
  <p style="margin:0;font-weight:bold;font-size:14px;color:#1a3c34">${sig.title ? sig.title + " " : ""}${sig.full_name ?? ""}</p>
  <p style="margin:2px 0 0;font-weight:bold;font-size:12px;color:#2e7d5b">ECOWAS Parliament Initiatives</p>
  <div style="margin-top:8px;font-size:12px;line-height:1.8;color:#555">
  ${sig.department ? `<p style="margin:0">${sig.department}</p>` : ""}
  ${sig.mobile ? `<p style="margin:0">Mobile Number: ${sig.mobile}</p>` : ""}
  ${sig.email ? `<p style="margin:0">Email: ${sig.email}</p>` : ""}
  ${sig.website ? `<p style="margin:0">Website: ${sig.website.replace(/^https?:\/\//, "")}</p>` : ""}
  </div>
  ${sig.tagline ? `<p style="margin:10px 0 0;font-style:italic;font-size:11px;color:#888">${sig.tagline}</p>` : ""}
  <div style="margin-top:10px">
    <img src="https://xahuyraommtfopnxrjvz.supabase.co/storage/v1/object/public/branding/logos/sing.png" alt="EPI" style="height:50px" />
  </div>
</div>`.trim();
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, cc, bcc, subject, bodyHtml, replyToId, attachments, clientSignatureIncluded } = await req.json();
    if (!to || !subject) {
      return new Response(JSON.stringify({ error: "to and subject are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, email_address, zoho_account_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!acct) {
      return new Response(JSON.stringify({ error: "No active email account. Ask your admin to set one up." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Append signature server-side only if client hasn't already included it
    let finalBodyHtml = bodyHtml ?? "";
    if (!clientSignatureIncluded) {
      const { data: sig } = await serviceClient
        .from("email_signatures")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      finalBodyHtml = finalBodyHtml + buildSignatureHtml(sig);
    }

    const token = await getZohoToken();
    const zohoAccountId = await resolveZohoAccountId(serviceClient, acct, token);
    const orgId = Deno.env.get("ZOHO_ORG_ID")!;

    const sendPayload: Record<string, any> = {
      fromAddress: acct.email_address,
      toAddress: normaliseAddresses(to),
      subject,
      content: finalBodyHtml,
      mailFormat: "html",
    };
    if (cc) sendPayload.ccAddress = normaliseAddresses(cc);
    if (bcc) sendPayload.bccAddress = normaliseAddresses(bcc);
    if (replyToId) sendPayload.inReplyTo = replyToId;
    if (Array.isArray(attachments) && attachments.length > 0) {
      sendPayload.attachments = attachments.map((a: any) => ({
        name: a.name ?? "attachment",
        content: a.base64 ?? "",
        contentType: a.contentType ?? "application/octet-stream",
      }));
    }

    const sendRes = await fetch(
      `https://mail.zoho.eu/api/organization/${orgId}/accounts/${zohoAccountId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendPayload),
      }
    );

    const sendData = await sendRes.json();

    if (!sendRes.ok) {
      const zohoError =
        sendData?.data?.errorCode ||
        sendData?.data?.moreInfo ||
        sendData?.status?.description ||
        JSON.stringify(sendData);
      console.error("Zoho send failed:", sendRes.status, JSON.stringify(sendData));
      return new Response(JSON.stringify({ error: `Zoho rejected the email: ${zohoError}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messageId = sendData?.data?.messageId ?? null;

    const toFlat = normaliseAddresses(to).map((a) => a.address).join(", ");
    const ccFlat = cc ? normaliseAddresses(cc).map((a) => a.address).join(", ") : null;

    const { error: insertErr } = await serviceClient.from("emails").insert({
      account_id: acct.id,
      zoho_message_id: messageId ? String(messageId) : null,
      from_address: acct.email_address,
      to_address: toFlat,
      cc_address: ccFlat,
      subject,
      body_html: finalBodyHtml,
      is_read: true,
      folder: "sent",
      sent_at: new Date().toISOString(),
    });
    if (insertErr) console.error("Failed to save sent email:", insertErr);

    return new Response(JSON.stringify({ success: true, messageId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
