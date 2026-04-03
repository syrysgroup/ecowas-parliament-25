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
    if (!userId || !emailAddress) {
      return new Response(JSON.stringify({ error: "userId and emailAddress required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const origin = req.headers.get("origin") || "https://ecowasparliamentinitiatives.org";

    // Generate password reset link (expires in 24h by default)
    const { data: linkData, error: linkErr } = await serviceClient.auth.admin.generateLink({
      type: "recovery",
      email: emailAddress,
      options: { redirectTo: `${origin}/set-password` },
    });
    if (linkErr) throw new Error(`Failed to generate invite link: ${linkErr.message}`);

    const inviteLink = linkData?.properties?.action_link;
    if (!inviteLink) throw new Error("No invite link generated");

    // Send via Zoho SMTP using service email
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
      // Get service account ID
      const serviceAccountRes = await fetch(
        `https://mail.zoho.eu/api/accounts`,
        { headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` } }
      );
      const serviceAccountData = await serviceAccountRes.json();
      const serviceAccountId = serviceAccountData?.data?.[0]?.accountId;

      if (serviceAccountId) {
        const emailBody = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#008244;padding:24px;text-align:center">
              <h1 style="color:white;margin:0;font-size:22px">EP25 CRM</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">ECOWAS Parliament 25th Anniversary</p>
            </div>
            <div style="padding:32px">
              <h2 style="color:#111;margin-top:0">Your account is ready</h2>
              <p style="color:#555">Your EP25 CRM account has been set up with this email address. Click the button below to set your password and access the platform.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${inviteLink}" style="background:#008244;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;display:inline-block">
                  Set My Password
                </a>
              </div>
              <p style="color:#888;font-size:13px">This link expires in 24 hours. If you did not expect this email, please ignore it.</p>
            </div>
          </div>
        `;

        await fetch(`https://mail.zoho.eu/api/accounts/${serviceAccountId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Zoho-oauthtoken ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAddress: `noreply@ecowasparliamentinitiatives.org`,
            toAddress: emailAddress,
            subject: "Your EP25 CRM account is ready — set your password",
            content: emailBody,
            mailFormat: "html",
          }),
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-invite error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
