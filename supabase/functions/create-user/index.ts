import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum([
    "super_admin", "admin", "moderator", "sponsor", "media",
    "project_director", "programme_lead", "website_editor", "marketing_manager",
    "communications_officer", "finance_coordinator", "logistics_coordinator",
    "sponsor_manager", "consultant",
  ]),
  full_name: z.string().optional(),
  force_password_change: z.boolean().default(true),
});

const DEFAULT_ORG = "ECOWAS Parliament Initiative";
const SITE_URL    = "https://www.ecowasparliamentinitiatives.org";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 🔐 AUTH
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
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

    // 🔐 REQUIRE super_admin
    const { data: roleCheck } = await anonClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "super_admin",
    });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    // 📦 PARSE BODY
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400, headers: corsHeaders });
    }

    const { email, password, role, full_name, force_password_change } = parsed.data;

    // 🔐 SERVICE CLIENT
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 👤 CREATE AUTH USER
    const { data: { user: newUser }, error: createErr } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // pre-confirm so no verify email needed
      user_metadata: {
        role,
        full_name: full_name ?? "",
        force_password_change,
      },
    });

    if (createErr || !newUser) {
      console.error("❌ createUser error:", createErr);
      return new Response(
        JSON.stringify({ error: createErr?.message ?? "Failed to create user" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 📋 INSERT PROFILE
    const org = role === "sponsor" ? "" : DEFAULT_ORG;
    const { error: profileErr } = await serviceClient.from("profiles").insert({
      id:           newUser.id,
      email,
      full_name:    full_name ?? "",
      organisation: org,
      country:      "",
    });
    if (profileErr) console.error("⚠️ Profile insert warning:", profileErr);

    // 🎭 INSERT ROLE
    const { error: roleErr } = await serviceClient
      .from("user_roles")
      .insert({ user_id: newUser.id, role });
    if (roleErr) console.error("⚠️ Role insert warning:", roleErr);

    // 📜 RECORD AS ACCEPTED INVITATION (for history)
    await serviceClient.from("invitations").insert({
      email,
      role,
      invited_by:  caller.id,
      accepted_at: new Date().toISOString(),
    }).then(() => {/* ignore errors — history only */});

    return new Response(
      JSON.stringify({ success: true, userId: newUser.id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
