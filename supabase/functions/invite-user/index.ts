import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ─────────────────────────────────────────────
    // 1. Validate Authorization header
    // ─────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // 2. Create client as caller (for auth check)
    // ─────────────────────────────────────────────
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user: callerUser },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: invalid user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // 3. Check role (SUPER IMPORTANT)
    // ─────────────────────────────────────────────
    const callerRole = callerUser.app_metadata?.role;

    const allowedRoles = ["super_admin", "admin"]; // standardize this

    if (!allowedRoles.includes(callerRole)) {
      return new Response(
        JSON.stringify({
          error: `Access denied. Your role '${callerRole}' is not allowed.`,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // 4. Parse request body
    // ─────────────────────────────────────────────
    const body = await req.json();
    const { email, role, redirectUrl, metadata } = body;

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: "email and role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // 5. Create ADMIN client (service role)
    // ─────────────────────────────────────────────
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!serviceKey) {
      return new Response(
        JSON.stringify({
          error: "Missing SUPABASE_SERVICE_ROLE_KEY in environment",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceKey
    );

    // ─────────────────────────────────────────────
    // 6. Invite user
    // ─────────────────────────────────────────────
    const { data, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo:
          redirectUrl ??
          `${req.headers.get("origin") || "http://localhost:3000"}/set-password`,
        data: {
          role, // stored in app_metadata
          ...metadata,
        },
      });

    if (inviteError) {
      console.error("Invite error:", inviteError);

      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // 7. Success response
    // ─────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        message: "User invited successfully",
        user: data?.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});