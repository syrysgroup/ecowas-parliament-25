import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const BodySchema = z.object({
  email: z.string().email(),
  role: z.enum([
    "super_admin", "admin", "moderator", "sponsor", "media",
    "project_director", "programme_lead", "website_editor", "marketing_manager",
    "communications_officer", "finance_coordinator", "logistics_coordinator",
    "sponsor_manager", "consultant",
  ]),
  redirectUrl: z.string().url().optional(),
  metadata: z.object({
    full_name: z.string().optional(),
    title: z.string().optional(),
    organisation: z.string().optional(),
    bio: z.string().optional(),
    avatar_url: z.string().optional(),
  }).optional(),
});

const SITE_URL = "https://www.ecowasparliamentinitiatives.org";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 🔐 AUTH HEADER
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // 👤 VERIFY CALLER
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = user.id;

    // 🔐 REQUIRE super_admin
    const { data: roleCheck, error: roleError } = await supabaseUser.rpc("has_role", {
      _user_id: userId,
      _role: "super_admin",
    });
    if (roleError || !roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    // 📦 PARSE BODY
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400, headers: corsHeaders });
    }

    const { email, role, redirectUrl, metadata } = parsed.data;

    // 🔐 SERVICE CLIENT
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🗑️ DELETE any existing pending invitation so re-invite works cleanly (no 409)
    await serviceClient
      .from("invitations")
      .delete()
      .eq("email", email)
      .is("accepted_at", null);

    // 📝 INSERT FRESH INVITATION RECORD
    // Required so the DB trigger on_profile_created_assign_invitation_role can
    // assign the correct role and pre-populate the profile when the user accepts.
    const { error: insertErr } = await serviceClient
      .from("invitations")
      .insert({ email, role, invited_by: userId, metadata: metadata ?? null });

    if (insertErr) {
      console.error("❌ Invitation insert error:", insertErr);
      return new Response(JSON.stringify({ error: insertErr.message }), { status: 400, headers: corsHeaders });
    }

    // 🚀 SEND INVITE EMAIL — always redirect to /set-password
    const destination = redirectUrl ?? `${Deno.env.get("SITE_URL") ?? SITE_URL}/set-password`;
    const { error } = await serviceClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: destination,
      data: { role, ...metadata },
    });

    if (error) {
      console.error("❌ Invite error:", error);
      // Roll back so the admin can retry
      await serviceClient.from("invitations").delete().eq("email", email).is("accepted_at", null);
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({ success: true, message: `Invitation sent to ${email}` }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
