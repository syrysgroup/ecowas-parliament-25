import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { generateId } from "@/utils/id";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { data: roleCheck } = await anonClient.rpc("has_role", { _user_id: user.id, _role: "super_admin" });
    const { data: adminCheck } = await anonClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!roleCheck && !adminCheck) {
      return new Response(JSON.stringify({ error: "Forbidden — admin required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { userId, emailPrefix, displayName } = await req.json();
    if (!userId || !emailPrefix) {
      return new Response(JSON.stringify({ error: "userId and emailPrefix required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const emailAddress = `${emailPrefix.toLowerCase().trim()}@ecowasparliamentinitiatives.org`;
    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Create Zoho mailbox via Directory API
    const zohoClientId     = Deno.env.get("ZOHO_CLIENT_ID")!;
    const zohoClientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")!;
    const zohoRefreshToken = Deno.env.get("ZOHO_REFRESH_TOKEN")!;

    // 1. Get access token
    const tokenRes = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: zohoClientId,
        client_secret: zohoClientSecret,
        refresh_token: zohoRefreshToken,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error(`Zoho token error: ${JSON.stringify(tokenData)}`);

    // 2. Create mailbox
    const zohoRes = await fetch(`https://mail.zoho.eu/api/organization/${Deno.env.get("ZOHO_ORG_ID")}/accounts`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountName: emailAddress,
        displayName: displayName || emailPrefix,
        password: Math.random().toString(36).slice(2) + generateId().slice(0, 6), // temporary; user sets real password via set-password flow
      }),
    });
    const zohoData = await zohoRes.json();
    const zohoAccountId = zohoData?.data?.accountId ?? null;

    // 3. Insert into email_accounts
    const { error: insertErr } = await serviceClient.from("email_accounts").upsert({
      user_id: userId,
      email_address: emailAddress,
      display_name: displayName || emailPrefix,
      zoho_account_id: zohoAccountId,
      is_active: true,
      created_by: user.id,
    }, { onConflict: "user_id" });

    if (insertErr) throw insertErr;

    // 4. Update profiles.has_email_account
    await serviceClient.from("profiles").update({ has_email_account: true }).eq("id", userId);

    return new Response(JSON.stringify({ success: true, emailAddress }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("create-email-account error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
