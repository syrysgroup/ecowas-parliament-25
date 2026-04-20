import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

async function importKey(hexKey: string): Promise<CryptoKey> {
  const raw = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function decryptValue(stored: string, hexKey: string): Promise<string> {
  const [ivHex, ctB64] = stored.split(":");
  const key = await importKey(hexKey);
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  const ciphertext = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plain);
}

async function getSecret(serviceClient: ReturnType<typeof createClient>, key: string, encKey: string): Promise<string | null> {
  const { data } = await serviceClient
    .from("integration_secrets")
    .select("encrypted_val")
    .eq("service_key", key)
    .single();
  if (!data?.encrypted_val) return null;
  return decryptValue(data.encrypted_val, encKey);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    const { data: isAdmin } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    const { data: isSuperAdmin } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "super_admin" });
    const { data: isComms } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "communications_officer" });
    if (!isAdmin && !isSuperAdmin && !isComms) {
      return new Response(JSON.stringify({ error: "Forbidden — admin access required" }), { status: 403, headers: corsHeaders });
    }

    const body: { content_id: string; language?: string; template_name?: string } = await req.json();
    if (!body.content_id) {
      return new Response(JSON.stringify({ error: "content_id is required" }), { status: 400, headers: corsHeaders });
    }

    const language = body.language ?? "en";
    const templateName = body.template_name ?? "SESSION_SUMMARY";
    const encKey = Deno.env.get("SECRETS_ENCRYPTION_KEY");
    if (!encKey) {
      return new Response(JSON.stringify({ error: "SECRETS_ENCRYPTION_KEY not configured" }), { status: 500, headers: corsHeaders });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch secrets
    const [accessToken, phoneNumberId] = await Promise.all([
      getSecret(serviceClient, "WHATSAPP_ACCESS_TOKEN", encKey),
      getSecret(serviceClient, "WHATSAPP_PHONE_NUMBER_ID", encKey),
    ]);

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "WHATSAPP_ACCESS_TOKEN not configured in Secrets Vault" }), { status: 400, headers: corsHeaders });
    }
    if (!phoneNumberId) {
      return new Response(JSON.stringify({ error: "WHATSAPP_PHONE_NUMBER_ID not configured in Secrets Vault" }), { status: 400, headers: corsHeaders });
    }

    // Fetch parliament content
    const { data: content, error: contentErr } = await serviceClient
      .from("parliament_content")
      .select("id, title, whatsapp_en, whatsapp_fr, whatsapp_pt, status")
      .eq("id", body.content_id)
      .single();

    if (contentErr || !content) {
      return new Response(JSON.stringify({ error: "Content not found" }), { status: 404, headers: corsHeaders });
    }
    if (content.status !== "approved" && content.status !== "published") {
      return new Response(JSON.stringify({ error: "Content must be approved or published before sending" }), { status: 400, headers: corsHeaders });
    }

    const msgBody: string | null = language === "fr" ? content.whatsapp_fr
      : language === "pt" ? content.whatsapp_pt
      : content.whatsapp_en;

    if (!msgBody) {
      return new Response(JSON.stringify({ error: `No WhatsApp content for language '${language}'. Run AI processing first.` }), { status: 400, headers: corsHeaders });
    }

    // Fetch subscribers filtered by language
    const subscribersQuery = serviceClient
      .from("newsletter_subscribers")
      .select("whatsapp_number")
      .eq("language", language)
      .not("whatsapp_number", "is", null)
      .is("unsubscribed_at", null);
    const { data: subscribers } = await subscribersQuery;

    if (!subscribers?.length) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No WhatsApp subscribers found for this language" }), { headers: corsHeaders });
    }

    // Send via WhatsApp Cloud API
    const waUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of subscribers) {
      if (!sub.whatsapp_number) continue;
      try {
        const res = await fetch(waUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: sub.whatsapp_number.replace(/\D/g, ""),
            type: "template",
            template: {
              name: templateName.toLowerCase(),
              language: { code: language === "fr" ? "fr" : language === "pt" ? "pt_PT" : "en_US" },
              components: [{
                type: "body",
                parameters: [{ type: "text", text: msgBody.slice(0, 1000) }],
              }],
            },
          }),
        });
        if (res.ok) {
          sent++;
        } else {
          const errBody = await res.json().catch(() => ({}));
          errors.push(errBody?.error?.message ?? `HTTP ${res.status}`);
          failed++;
        }
      } catch (e: any) {
        errors.push(e.message);
        failed++;
      }
    }

    // Log to distribution_log
    await serviceClient.from("distribution_log").insert({
      content_id: body.content_id,
      platform: "whatsapp",
      language,
      status: failed === 0 ? "sent" : sent > 0 ? "sent" : "failed",
      recipients: sent,
      error_msg: errors.length ? errors.slice(0, 3).join("; ") : null,
      sent_by: caller.id,
    });

    return new Response(
      JSON.stringify({ success: true, sent, failed, errors: errors.slice(0, 3) }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("send-whatsapp error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
