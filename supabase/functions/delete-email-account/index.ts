import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { userId, emailAddress } = await req.json();
    if (!userId) return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get zoho_account_id
    const { data: acct } = await serviceClient.from("email_accounts").select("zoho_account_id").eq("user_id", userId).single();

    if (acct?.zoho_account_id) {
      // Get Zoho access token
      const tokenRes = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
          client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
          refresh_token: Deno.env.get("ZOHO_REFRESH_TOKEN")!,
        }),
      });
      const tokenData = await tokenRes.json();

      if (tokenData.access_token) {
        // Deactivate mailbox
        await fetch(`https://mail.zoho.eu/api/organization/${Deno.env.get("ZOHO_ORG_ID")}/accounts/${acct.zoho_account_id}`, {
          method: "DELETE",
          headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` },
        });
      }
    }

    // Mark inactive in DB
    await serviceClient.from("email_accounts").update({ is_active: false }).eq("user_id", userId);
    await serviceClient.from("profiles").update({ has_email_account: false }).eq("id", userId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("delete-email-account error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
