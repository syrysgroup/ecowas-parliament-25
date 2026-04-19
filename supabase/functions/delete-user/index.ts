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

    const token = authHeader.slice(7);

    // Use service client to verify the JWT — more reliable than anonClient.getUser()
    // because it avoids an extra outbound network hop and works even when anon key
    // restrictions are tight.
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authErr } = await serviceClient.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is super_admin
    const { data: roleCheck } = await serviceClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Only super admins can delete users" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_ids } = await req.json();
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(JSON.stringify({ error: "user_ids array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent deleting self
    const filtered = user_ids.filter((id: string) => id !== user.id);
    const results: { id: string; success: boolean; email?: string; error?: string }[] = [];

    for (const userId of filtered) {
      try {
        const { data: authUser } = await serviceClient.auth.admin.getUserById(userId);
        const userEmail = authUser?.user?.email ?? "";

        const { data: profile } = await serviceClient
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .maybeSingle();
        const userName = profile?.full_name ?? userEmail;

        const { error: delErr } = await serviceClient.auth.admin.deleteUser(userId);
        if (delErr) {
          results.push({ id: userId, success: false, error: delErr.message });
          continue;
        }

        // Clean up all invitations for that email so re-invite works cleanly
        if (userEmail) {
          await serviceClient.from("invitations").delete().eq("email", userEmail);
        }

        await serviceClient.from("admin_activity_logs").insert({
          actor_user_id: user.id,
          action: "delete_user",
          entity_type: "user",
          entity_id: userId,
          details: { email: userEmail, name: userName },
        });

        results.push({ id: userId, success: true, email: userEmail });
      } catch (e: any) {
        results.push({ id: userId, success: false, error: e.message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("delete-user error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
