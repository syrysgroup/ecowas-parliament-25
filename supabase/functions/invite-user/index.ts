import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await anonClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Check super_admin role
    const { data: roleCheck } = await anonClient.rpc("has_role", {
      _user_id: userId,
      _role: "super_admin",
    });

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden — super_admin required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, role, redirectUrl, metadata } = parsed.data;

    // Use service role client to invite user
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check for an existing invitation record for this email.
    const { data: existingInv } = await serviceClient
      .from("invitations")
      .select("id, accepted_at")
      .eq("email", email)
      .maybeSingle();

    if (existingInv) {
      if (!existingInv.accepted_at) {
        // Pending invitation exists — check whether a profile still exists for this email.
        // Profiles are CASCADE-deleted with auth users, so a missing profile means the
        // user was deleted without the invitation being cleaned up (stale record).
        const { data: profile } = await serviceClient
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        const authUserExists = !!profile;
        if (authUserExists) {
          // Active user still has a pending invite — tell caller to use resend
          return new Response(
            JSON.stringify({ error: "This email has already been invited. Use resend to re-send the link." }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Auth user no longer exists — stale pending invitation, replace it
      }
      // Stale invitation (user deleted) — remove before re-inviting
      await serviceClient.from("invitations").delete().eq("id", existingInv.id);
    }

    // Insert fresh invitation record
    const { error: invErr } = await serviceClient.from("invitations").insert({
      email,
      role,
      invited_by: userId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ...(metadata ? { metadata } : {}),
    });

    if (invErr) {
      throw invErr;
    }

    // Send auth invite email and capture the action link
    const siteUrl = redirectUrl
      ?? req.headers.get("origin")
      ?? Deno.env.get("SITE_URL")
      ?? "https://ecowasparliamentinitiatives.org";
    const redirectTo = redirectUrl ?? `${siteUrl}/set-password`;
    const { data: inviteData, error: authErr } = await serviceClient.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { role },
    });

    if (authErr) {
      console.error("Auth invite error:", authErr);
      // Invitation record exists, user can still sign up manually
    }

    const actionLink = (inviteData as any)?.properties?.action_link ?? null;

    return new Response(
      JSON.stringify({ success: true, message: `Invitation sent to ${email} with role ${role}`, actionLink }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("invite-user error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
