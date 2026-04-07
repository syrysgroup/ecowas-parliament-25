import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getZohoToken(): Promise<string> {
  const clientId = Deno.env.get("ZOHO_CLIENT_ID");
  const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");
  const refreshToken = Deno.env.get("ZOHO_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Zoho OAuth credentials not configured.");
  }
  const res = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho token refresh failed: ${data.error ?? "no access_token"}`);
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
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { email_id } = await req.json().catch(() => ({})) as { email_id?: string };
    if (!email_id) {
      return new Response(JSON.stringify({ error: "email_id is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: emailRow } = await serviceClient
      .from("emails")
      .select("zoho_message_id, account_id")
      .eq("id", email_id)
      .single();

    if (!emailRow) {
      return new Response(JSON.stringify({ error: "Email not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("zoho_account_id, user_id")
      .eq("id", emailRow.account_id)
      .single();

    if (!acct || acct.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // No Zoho message ID (local draft) — no attachments
    if (!emailRow.zoho_message_id || !acct.zoho_account_id) {
      return new Response(JSON.stringify({ attachments: [] }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getZohoToken();
    const res = await fetch(
      `https://mail.zoho.eu/api/accounts/${acct.zoho_account_id}/messages/${emailRow.zoho_message_id}/attachments`,
      { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Zoho attachments fetch failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    const raw: any[] = data?.data ?? [];

    const attachments = raw.map((a: any) => ({
      attachmentId: String(a.attachmentId ?? a.attachmentName ?? ""),
      fileName: a.attachmentName ?? a.fileName ?? "attachment",
      fileSize: Number(a.size ?? a.fileSize ?? 0),
      contentType: a.contentType ?? a.type ?? "application/octet-stream",
    }));

    return new Response(JSON.stringify({ attachments }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("get-attachments error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
