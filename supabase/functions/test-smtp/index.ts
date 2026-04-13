import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import nodemailer from "npm:nodemailer@6.9.13";

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

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify super_admin
    const { data: roleCheck } = await anonClient.rpc("has_role", {
      _user_id: user.id,
      _role: "super_admin",
    });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden — super_admin required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read SMTP config from site_settings
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: settingRow } = await serviceClient
      .from("site_settings")
      .select("value")
      .eq("key", "smtp")
      .maybeSingle();

    const smtp = settingRow?.value as Record<string, any> | null;
    if (!smtp?.host || !smtp?.username) {
      return new Response(
        JSON.stringify({ success: false, error: "SMTP config is incomplete — host and username are required." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create transporter and verify connection (no email sent)
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port ?? 587),
      secure: smtp.ssl_enabled === true && Number(smtp.port ?? 587) === 465,
      auth: {
        user: smtp.username,
        pass: smtp.password ?? smtp.password_hint ?? "",
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10_000,
      greetingTimeout: 5_000,
    });

    await transporter.verify();

    return new Response(
      JSON.stringify({ success: true, message: `Connected to ${smtp.host}:${smtp.port} successfully.` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("test-smtp error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message ?? "Connection failed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
