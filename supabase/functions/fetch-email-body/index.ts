/// <reference lib="deno.window" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?dts";

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

    const { email_id } = await req.json().catch(() => ({})) as { email_id?: string };
    if (!email_id) {
      return new Response(JSON.stringify({ error: "email_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Look up the email row
    const { data: emailRow, error: emailErr } = await serviceClient
      .from("emails")
      .select("id, zoho_message_id, account_id, body_html")
      .eq("id", email_id)
      .single();

    if (emailErr || !emailRow) {
      return new Response(JSON.stringify({ error: "Email not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If body already fetched, return it directly
    if (emailRow.body_html) {
      return new Response(JSON.stringify({ body_html: emailRow.body_html }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Guard: locally-composed emails have no zoho_message_id
    if (!emailRow.zoho_message_id) {
      return new Response(JSON.stringify({ body_html: emailRow.body_html || "" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the Zoho account ID
    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("zoho_account_id, user_id")
      .eq("id", emailRow.account_id)
      .single();

    if (!acct?.zoho_account_id) {
      return new Response(JSON.stringify({ error: "Zoho account not resolved yet — run a sync first" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the requesting user owns this account
    if (acct.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getZohoToken();

    // Fetch the full message body from Zoho
    const contentRes = await fetch(
      `https://mail.zoho.eu/api/accounts/${acct.zoho_account_id}/messages/${emailRow.zoho_message_id}/content`,
      { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
    );

    if (!contentRes.ok) {
      const errText = await contentRes.text();
      throw new Error(`Zoho content fetch failed (${contentRes.status}): ${errText}`);
    }

    const contentData = await contentRes.json();
    // Zoho returns body in data.content (HTML) or data.body
    const body_html: string = contentData?.data?.content ?? contentData?.data?.body ?? "";

    // Persist so subsequent opens are instant
    if (body_html) {
      await serviceClient
        .from("emails")
        .update({ body_html })
        .eq("id", email_id);
    }

    return new Response(JSON.stringify({ body_html }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("fetch-email-body error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
