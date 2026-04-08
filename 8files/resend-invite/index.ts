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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only super_admin can resend invitations
    const { data: roleCheck } = await anonClient.rpc("has_role", {
      _user_id: user.id,
      _role: "super_admin",
    });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden — super_admin required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invitation_id } = await req.json().catch(() => ({})) as { invitation_id?: string };
    if (!invitation_id) {
      return new Response(JSON.stringify({ error: "invitation_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the invitation
    const { data: invitation, error: fetchErr } = await serviceClient
      .from("invitations")
      .select("id, email, role, accepted_at")
      .eq("id", invitation_id)
      .single();

    if (fetchErr || !invitation) {
      return new Response(JSON.stringify({ error: "Invitation not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invitation.accepted_at) {
      return new Response(JSON.stringify({ error: "This invitation has already been accepted" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Re-send the auth invite email
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://ecowasparliamentinitiatives.org";
    const { error: authErr2 } = await serviceClient.auth.admin.inviteUserByEmail(invitation.email, {
      redirectTo: `${siteUrl}/set-password`,
      data: { role: invitation.role },
    });

    if (authErr2) {
      console.error("Auth resend invite error:", authErr2);
      // Non-fatal — user may already exist in auth, invitation record still updated
    }

    // Update invitation: refresh expiry and record resent_at
    const { error: updateErr } = await serviceClient
      .from("invitations")
      .update({
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        resent_at: new Date().toISOString(),
      })
      .eq("id", invitation_id);

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ success: true, message: `Invitation resent to ${invitation.email}` }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("resend-invite error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
