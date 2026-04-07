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

    const { to, cc, subject, bodyHtml, zoho_draft_message_id } = await req.json().catch(() => ({})) as {
      to?: string; cc?: string; subject?: string; bodyHtml?: string; zoho_draft_message_id?: string;
    };

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, email_address, zoho_account_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!acct?.zoho_account_id) {
      return new Response(JSON.stringify({ error: "No active email account with resolved Zoho ID. Run a sync first." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getZohoToken();
    const zohoAccountId = acct.zoho_account_id;

    // Zoho has no PATCH for drafts — delete the old one first, then create a new one
    if (zoho_draft_message_id) {
      const delRes = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/messages/${zoho_draft_message_id}`, {
        method: "DELETE",
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      // Tolerate 404 (already deleted) but throw on other errors
      if (!delRes.ok && delRes.status !== 404) {
        console.warn(`Could not delete old Zoho draft ${zoho_draft_message_id}: ${delRes.status}`);
      }
    }

    // Create the new draft
    const draftPayload: Record<string, any> = {
      fromAddress: acct.email_address,
      toAddress: to ?? "",
      subject: subject ?? "(No subject)",
      content: bodyHtml ?? "",
      mailFormat: "html",
      isDraft: true,
    };
    if (cc) draftPayload.ccAddress = cc;

    const createRes = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/messages`, {
      method: "POST",
      headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(draftPayload),
    });

    if (!createRes.ok) {
      const body = await createRes.text();
      throw new Error(`Zoho draft create failed (${createRes.status}): ${body}`);
    }

    const createData = await createRes.json();
    const newMessageId = createData?.data?.messageId ? String(createData.data.messageId) : null;

    return new Response(JSON.stringify({ success: true, zoho_draft_message_id: newMessageId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("save-draft error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
