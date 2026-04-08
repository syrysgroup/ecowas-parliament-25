import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { email_id, attachment_id, file_name } = await req.json().catch(() => ({})) as {
      email_id?: string; attachment_id?: string; file_name?: string;
    };

    if (!email_id || !attachment_id) {
      return new Response(JSON.stringify({ error: "email_id and attachment_id are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: emailRow } = await serviceClient
      .from("emails")
      .select("zoho_message_id, account_id")
      .eq("id", email_id)
      .single();

    if (!emailRow?.zoho_message_id) {
      return new Response(JSON.stringify({ error: "Email not found or has no Zoho message ID" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("zoho_account_id, user_id")
      .eq("id", emailRow.account_id)
      .single();

    if (!acct || acct.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!acct.zoho_account_id) {
      return new Response(JSON.stringify({ error: "Zoho account not resolved — run a sync first" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getZohoToken();
    const orgId = Deno.env.get("ZOHO_ORG_ID")!;

    const attachRes = await fetch(
      `https://mail.zoho.eu/api/organization/${orgId}/accounts/${acct.zoho_account_id}/messages/${emailRow.zoho_message_id}/attachments/${attachment_id}`,
      { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
    );

    if (!attachRes.ok) {
      const body = await attachRes.text();
      throw new Error(`Zoho attachment download failed (${attachRes.status}): ${body}`);
    }

    const contentType = attachRes.headers.get("content-type") ?? "application/octet-stream";

    // Convert binary to base64
    const buffer = await attachRes.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    return new Response(JSON.stringify({ base64, fileName: file_name ?? "attachment", contentType }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("download-attachment error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
