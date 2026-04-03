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

    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get user's email account
    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("email_address, zoho_account_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    // Update Supabase password first
    const { error: pwErr } = await serviceClient.auth.admin.updateUserById(user.id, { password: newPassword });
    if (pwErr) throw new Error(`Supabase password update failed: ${pwErr.message}`);

    // Sync to Zoho if user has an email account
    if (acct?.zoho_account_id) {
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
        const zohoRes = await fetch(
          `https://mail.zoho.eu/api/organization/${Deno.env.get("ZOHO_ORG_ID")}/accounts/${acct.zoho_account_id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Zoho-oauthtoken ${tokenData.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: newPassword }),
          }
        );
        if (!zohoRes.ok) {
          // Rollback Supabase password on Zoho failure
          console.error("Zoho password sync failed, rolling back Supabase password");
          return new Response(
            JSON.stringify({ error: "Email account password sync failed. Please contact support." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("sync-password error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
