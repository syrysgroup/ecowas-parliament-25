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

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4096),
      parse_mode: "Markdown",
    }),
  });
  const body = await res.json();
  if (body.ok) return { ok: true, messageId: body.result?.message_id };
  return { ok: false, error: body.description ?? `HTTP ${res.status}` };
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

    const body: { content_id: string; languages?: string[] } = await req.json();
    if (!body.content_id) {
      return new Response(JSON.stringify({ error: "content_id is required" }), { status: 400, headers: corsHeaders });
    }

    const languages = body.languages ?? ["en", "fr", "pt"];
    const encKey = Deno.env.get("SECRETS_ENCRYPTION_KEY");
    if (!encKey) {
      return new Response(JSON.stringify({ error: "SECRETS_ENCRYPTION_KEY not configured" }), { status: 500, headers: corsHeaders });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch bot token + all channel IDs in parallel
    const [botToken, channelEn, channelFr, channelPt] = await Promise.all([
      getSecret(serviceClient, "TELEGRAM_BOT_TOKEN", encKey),
      getSecret(serviceClient, "TELEGRAM_CHANNEL_EN", encKey),
      getSecret(serviceClient, "TELEGRAM_CHANNEL_FR", encKey),
      getSecret(serviceClient, "TELEGRAM_CHANNEL_PT", encKey),
    ]);

    if (!botToken) {
      return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured in Secrets Vault" }), { status: 400, headers: corsHeaders });
    }

    // Fetch parliament content
    const { data: content, error: contentErr } = await serviceClient
      .from("parliament_content")
      .select("id, title, telegram_en, whatsapp_fr, whatsapp_pt, status")
      .eq("id", body.content_id)
      .single();

    if (contentErr || !content) {
      return new Response(JSON.stringify({ error: "Content not found" }), { status: 404, headers: corsHeaders });
    }
    if (content.status !== "approved" && content.status !== "published") {
      return new Response(JSON.stringify({ error: "Content must be approved or published before sending" }), { status: 400, headers: corsHeaders });
    }

    const channelMap: Record<string, string | null> = {
      en: channelEn,
      fr: channelFr,
      pt: channelPt,
    };
    // Use telegram_en for EN, whatsapp_fr/pt as fallback for other languages
    const contentMap: Record<string, string | null> = {
      en: content.telegram_en,
      fr: content.whatsapp_fr,
      pt: content.whatsapp_pt,
    };

    const results: Array<{ language: string; ok: boolean; messageId?: number; error?: string }> = [];

    for (const lang of languages) {
      const channelId = channelMap[lang];
      const msgText = contentMap[lang];

      if (!channelId) {
        results.push({ language: lang, ok: false, error: `TELEGRAM_CHANNEL_${lang.toUpperCase()} not configured` });
        continue;
      }
      if (!msgText) {
        results.push({ language: lang, ok: false, error: `No Telegram content for language '${lang}'. Run AI processing first.` });
        continue;
      }

      const result = await sendTelegramMessage(botToken, channelId, msgText);
      results.push({ language: lang, ...result });

      // Log to distribution_log
      await serviceClient.from("distribution_log").insert({
        content_id: body.content_id,
        platform: "telegram",
        language: lang,
        status: result.ok ? "sent" : "failed",
        recipients: 1,
        error_msg: result.error ?? null,
        external_id: result.messageId ? String(result.messageId) : null,
        sent_by: caller.id,
      });
    }

    const allOk = results.every(r => r.ok);
    return new Response(
      JSON.stringify({ success: allOk, results }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("send-telegram error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
