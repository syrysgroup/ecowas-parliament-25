import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
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

    // Require super_admin
    const { data: isAdmin } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "super_admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden — super_admin required" }), { status: 403, headers: corsHeaders });
    }

    // Parse body
    const { service_key }: { service_key: string } = await req.json();
    if (!service_key?.trim()) {
      return new Response(JSON.stringify({ error: "service_key is required" }), { status: 400, headers: corsHeaders });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: delErr } = await serviceClient
      .from("integration_secrets")
      .delete()
      .eq("service_key", service_key.trim());

    if (delErr) throw delErr;

    // Audit log
    await serviceClient.from("admin_activity_logs").insert({
      actor_user_id: caller.id,
      action: "secret_deleted",
      entity_type: "integration_secret",
      details: { service_key: service_key.trim() },
    });

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err: any) {
    console.error("delete-secret error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
