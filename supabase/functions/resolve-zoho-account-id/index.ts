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

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get user's email account
    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, email_address, zoho_account_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!acct) {
      return new Response(JSON.stringify({ error: "No active email account" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If already resolved, return it
    if (acct.zoho_account_id) {
      return new Response(JSON.stringify({ zoho_account_id: acct.zoho_account_id }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getZohoToken();
    const orgId = Deno.env.get("ZOHO_ORG_ID")!;

    // Fetch all accounts in the org
    const accountsRes = await fetch(`https://mail.zoho.eu/api/organization/${orgId}/accounts`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });
    const accountsData = await accountsRes.json();
    const accounts = accountsData?.data ?? [];

    // Find the account matching the user's email
    const match = accounts.find((a: any) =>
      a.primaryEmailAddress?.toLowerCase() === acct.email_address.toLowerCase() ||
      (a.mailboxAddress ?? "").toLowerCase() === acct.email_address.toLowerCase()
    );

    if (!match) {
      return new Response(JSON.stringify({ error: `No Zoho account found for ${acct.email_address}` }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const zohoAccountId = String(match.accountId ?? match.zuid);

    // Save to email_accounts
    await serviceClient
      .from("email_accounts")
      .update({ zoho_account_id: zohoAccountId })
      .eq("id", acct.id);

    return new Response(JSON.stringify({ zoho_account_id: zohoAccountId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("resolve-zoho-account-id error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
