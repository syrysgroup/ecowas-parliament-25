import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const BodySchema = z.object({
  target_user_id:       z.string().uuid(),
  new_password:         z.string().min(8),
  force_password_change: z.boolean().default(true),
});

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

    const { target_user_id, new_password, force_password_change } = parsed.data;

    // Safety: prevent resetting own account via this endpoint
    if (target_user_id === caller.id) {
      return new Response(
        JSON.stringify({ error: "Use the normal password change flow to update your own password." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 🔐 SERVICE CLIENT
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🔑 GET CURRENT USER METADATA (to merge, not overwrite)
    const { data: { user: targetUser } } = await serviceClient.auth.admin.getUserById(target_user_id);
    const existingMeta = targetUser?.user_metadata ?? {};

    // 🔄 UPDATE PASSWORD + METADATA
    const { error: updateErr } = await serviceClient.auth.admin.updateUserById(target_user_id, {
      password: new_password,
      user_metadata: {
        ...existingMeta,
        force_password_change,
      },
    });

    if (updateErr) {
      console.error("❌ Password reset error:", updateErr);
      return new Response(
        JSON.stringify({ error: updateErr.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
