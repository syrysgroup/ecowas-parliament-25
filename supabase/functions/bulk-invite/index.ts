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

    const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Verify caller is super_admin or admin
    const { data: roles } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const userRoles = (roles ?? []).map((r: any) => r.role);
    if (!userRoles.includes("super_admin") && !userRoles.includes("admin")) {
      return new Response(JSON.stringify({ error: "Only admins can bulk invite" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { emails, role } = await req.json();
    if (!Array.isArray(emails) || emails.length === 0) {
      return new Response(JSON.stringify({ error: "emails array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRole = role || "admin";
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const email of emails) {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed || !trimmed.includes("@")) {
        results.push({ email: trimmed, success: false, error: "Invalid email" });
        continue;
      }

      try {
        // Check if invitation already exists
        const { data: existing } = await serviceClient
          .from("invitations")
          .select("id")
          .eq("email", trimmed)
          .is("accepted_at", null)
          .maybeSingle();

        if (existing) {
          results.push({ email: trimmed, success: false, error: "Already invited" });
          continue;
        }

        // Create invitation record
        const { error: insertErr } = await serviceClient
          .from("invitations")
          .insert({ email: trimmed, role: validRole, invited_by: user.id });

        if (insertErr) {
          results.push({ email: trimmed, success: false, error: insertErr.message });
          continue;
        }

        // Send invite email via Supabase Auth
        const { error: inviteErr } = await serviceClient.auth.admin.inviteUserByEmail(trimmed);
        if (inviteErr) {
          results.push({ email: trimmed, success: false, error: inviteErr.message });
        } else {
          results.push({ email: trimmed, success: true });
        }
      } catch (e: any) {
        results.push({ email: trimmed, success: false, error: e.message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("bulk-invite error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
