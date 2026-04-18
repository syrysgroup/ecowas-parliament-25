import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const DEFAULT_ORG = "ECOWAS Parliament Initiatives";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── 1. Verify caller is a logged-in user (no role gate) ───────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // ── 2. Parse body — role defaults to "staff" ──────────────────────────────
    const body = await req.json();
    const email: string        = (body.email ?? "").trim();
    const password: string     = (body.password ?? "").trim();
    const role: string         = (body.role ?? "staff").trim();
    const full_name: string    = (body.full_name ?? "").trim();
    const force_password_change: boolean = body.force_password_change ?? true;

    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), { status: 400, headers: corsHeaders });
    }
    if (!password || password.length < 8) {
      return new Response(JSON.stringify({ error: "password must be at least 8 characters" }), { status: 400, headers: corsHeaders });
    }

    // ── 3. Service client ─────────────────────────────────────────────────────
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── 4. Create auth user ───────────────────────────────────────────────────
    const { data: { user: newUser }, error: createErr } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        full_name,
        force_password_change,
      },
    });

    if (createErr || !newUser) {
      console.error("createUser error:", createErr);
      return new Response(
        JSON.stringify({ error: createErr?.message ?? "Failed to create user" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ── 5. Insert profile ─────────────────────────────────────────────────────
    const { error: profileErr } = await serviceClient.from("profiles").insert({
      id:           newUser.id,
      email,
      full_name,
      organisation: DEFAULT_ORG,
      country:      "",
    });
    if (profileErr) console.warn("Profile insert warning:", profileErr.message);

    // ── 6. Insert role ────────────────────────────────────────────────────────
    const { error: roleErr } = await serviceClient
      .from("user_roles")
      .upsert({ user_id: newUser.id, role }, { onConflict: "user_id" });
    if (roleErr) console.warn("Role insert warning:", roleErr.message);

    // ── 7. Record in invitations (history only) ───────────────────────────────
    await serviceClient.from("invitations").insert({
      email,
      role,
      invited_by:  caller.id,
      accepted_at: new Date().toISOString(),
    }).then(() => { /* ignore errors */ });

    return new Response(
      JSON.stringify({ success: true, userId: newUser.id }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});