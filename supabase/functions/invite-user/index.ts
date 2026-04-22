import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Verify caller is a logged-in user (same pattern as send-email) ──────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Parse body — role is optional, defaults to "staff" ─────────────────
    const body = await req.json();
    const email: string = body.email?.trim();
    const role: string  = body.role?.trim() || "staff";
    const redirectUrl: string =
      body.redirectUrl ??
      `${req.headers.get("origin") || "https://admin.ecowasparliamentinitiatives.org"}/set-password`;
    const metadata = body.metadata ?? {};

    if (!email) {
      return new Response(
        JSON.stringify({ error: "email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Use service role key to invite ─────────────────────────────────────
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── 3a. Delete any existing pending invitation so re-inviting never fails ─
    // When the same email is invited twice, inviteUserByEmail returns 400
    // "User already registered" for unconfirmed users. We delete the stale
    // invitation record first so the insert below stays clean.
    await serviceClient
      .from("invitations")
      .delete()
      .eq("email", email)
      .is("accepted_at", null);

    const { data, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: redirectUrl,
        data: {
          role,
          ...metadata,
        },
      }
    );

    if (inviteError) {
      console.error("Invite error:", inviteError);
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Seed user_roles table so the app picks up the role immediately ──────
    if (data?.user?.id) {
      await serviceClient
        .from("user_roles")
        .upsert({ user_id: data.user.id, role }, { onConflict: "user_id" })
        .then(({ error: roleErr }) => {
          if (roleErr) console.warn("user_roles upsert warning:", roleErr.message);
        });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Invitation sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});