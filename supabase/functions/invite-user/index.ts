import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const BodySchema = z.object({
  email: z.string().email(),
  role: z.enum([
    "super_admin",
    "admin",
    "moderator",
    "sponsor",
    "media",
    "project_director",
    "programme_lead",
    "website_editor",
    "marketing_manager",
    "communications_officer",
    "finance_coordinator",
    "logistics_coordinator",
    "sponsor_manager",
    "consultant",
  ]),
  redirectUrl: z.string().url().optional(),
  metadata: z
    .object({
      full_name: z.string().optional(),
      title: z.string().optional(),
      organisation: z.string().optional(),
      bio: z.string().optional(),
      avatar_url: z.string().optional(),
    })
    .optional(),
});

const SITE_URL = "https://admin.ecowasparliamentinitiatives.org";

Deno.serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Invite function triggered");

    // ✅ GET AUTH HEADER
    const authHeader = req.headers.get("Authorization");
    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth header" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // ✅ USER CLIENT (VALIDATES JWT)
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    console.log("USER:", user);
    console.log("USER ERROR:", userError);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = user.id;

    // ✅ ROLE CHECK (RPC)
    const { data: roleCheck, error: roleError } = await supabaseUser.rpc(
      "has_role",
      {
        _user_id: userId,
        _role: "super_admin",
      }
    );

    if (roleError || !roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden (not super admin)" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    // ✅ PARSE BODY
    const parsed = BodySchema.safeParse(await req.json());

    if (!parsed.success) {
      return new Response(JSON.stringify(parsed.error.flatten()), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { email, role, redirectUrl, metadata } = parsed.data;

    // ✅ SERVICE ROLE CLIENT (ADMIN ACTIONS)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🧹 Clean old invites
    await serviceClient
      .from("invitations")
      .delete()
      .eq("email", email)
      .eq("role", role);

    // 📝 Insert new invite
    const { error: insertErr } = await serviceClient
      .from("invitations")
      .insert({
        email,
        role,
        invited_by: userId,
        metadata: metadata ?? null,
      });

    if (insertErr) {
      console.error("INSERT ERROR:", insertErr);

      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 🚀 SEND INVITE EMAIL
    const destination =
      redirectUrl ??
      `${Deno.env.get("SITE_URL") ?? SITE_URL}/set-password`;

    const { error: inviteError } =
      await serviceClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: destination,
        data: { role, ...metadata },
      });

    if (inviteError) {
      console.error("INVITE ERROR:", inviteError);

      // rollback
      await serviceClient
        .from("invitations")
        .delete()
        .eq("email", email);

      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    console.error("FATAL ERROR:", err);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});