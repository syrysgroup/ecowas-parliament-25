// supabase/functions/zoho_api/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Get secrets
  const client_id = Deno.env.get("ZOHO_CLIENT_ID");
  const client_secret = Deno.env.get("ZOHO_CLIENT_SECRET");
  const refresh_token = Deno.env.get("ZOHO_REFRESH_TOKEN");

  if (!client_id || !client_secret || !refresh_token) {
    return new Response(
      JSON.stringify({ error: "Missing Zoho secrets. Check ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Refresh access token
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", client_id);
  params.append("client_secret", client_secret);
  params.append("refresh_token", refresh_token);

  const tokenRes = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
    method: "POST",
    body: params,
  });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "Failed to get access token", zoho_response: tokenData }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Fetch Zoho accounts
  const accountsRes = await fetch("https://mail.zoho.eu/api/accounts", {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  const accountsData = await accountsRes.json();

  return new Response(JSON.stringify({ access_token_received: true, accounts: accountsData }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
