import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { form_slug, payload } = await req.json();
    if (!form_slug || typeof payload !== "object") {
      return new Response(JSON.stringify({ error: "form_slug and payload required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch form + fields
    const { data: form } = await service
      .from("form_definitions")
      .select("id, slug, title, notify_email, autoresponder_subject, autoresponder_body, status")
      .eq("slug", form_slug)
      .maybeSingle();
    if (!form || form.status !== "active") {
      return new Response(JSON.stringify({ error: "Form not available" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: fields } = await service
      .from("form_fields")
      .select("key, label, type, required")
      .eq("form_id", form.id);

    // Validate required + filter payload to known keys
    const cleanPayload: Record<string, unknown> = {};
    for (const f of fields ?? []) {
      const v = payload[f.key];
      if (f.required && (v === undefined || v === null || v === "")) {
        return new Response(JSON.stringify({ error: `${f.label} is required` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (v !== undefined) cleanPayload[f.key] = v;
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    const { data: sub, error } = await service
      .from("form_submissions")
      .insert({ form_id: form.id, payload: cleanPayload, ip, user_agent: ua, status: "new" })
      .select("id")
      .single();
    if (error) throw error;

    // Best-effort notification (does not block success)
    if (form.notify_email) {
      try {
        await service.functions.invoke("send-email", {
          body: {
            to: form.notify_email,
            subject: `New submission: ${form.title}`,
            html: `<p>New submission received via form <b>${form.slug}</b>.</p><pre>${escapeHtml(JSON.stringify(cleanPayload, null, 2))}</pre>`,
          },
        });
      } catch (_) { /* swallow */ }
    }

    return new Response(JSON.stringify({ ok: true, id: sub.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}