import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// AES-256-GCM decryption (same helper as test-secret)
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

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `Claude API error ${res.status}`);
  }
  const body = await res.json();
  return body.content?.[0]?.text ?? "";
}

function buildPrompt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

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

    // Require admin+
    const { data: isAdmin } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    const { data: isSuperAdmin } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "super_admin" });
    const { data: isComms } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "communications_officer" });
    if (!isAdmin && !isSuperAdmin && !isComms) {
      return new Response(JSON.stringify({ error: "Forbidden — admin access required" }), { status: 403, headers: corsHeaders });
    }

    // Parse body
    const { content_id }: { content_id: string } = await req.json();
    if (!content_id?.trim()) {
      return new Response(JSON.stringify({ error: "content_id is required" }), { status: 400, headers: corsHeaders });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Read parliament content row
    const { data: content, error: fetchErr } = await serviceClient
      .from("parliament_content")
      .select("id, raw_input, title")
      .eq("id", content_id.trim())
      .single();

    if (fetchErr || !content) {
      return new Response(JSON.stringify({ error: "Content not found" }), { status: 404, headers: corsHeaders });
    }
    if (!content.raw_input?.trim()) {
      return new Response(JSON.stringify({ error: "No transcript text found in this content record" }), { status: 400, headers: corsHeaders });
    }

    // Read ANTHROPIC_API_KEY from integration_secrets
    const { data: secretRow, error: secretErr } = await serviceClient
      .from("integration_secrets")
      .select("encrypted_val")
      .eq("service_key", "ANTHROPIC_API_KEY")
      .single();

    if (secretErr || !secretRow) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured — add it in Secrets Vault first" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const encKey = Deno.env.get("SECRETS_ENCRYPTION_KEY");
    if (!encKey) {
      return new Response(JSON.stringify({ error: "Encryption key not configured on server" }), { status: 500, headers: corsHeaders });
    }

    const apiKey = await decryptValue(secretRow.encrypted_val, encKey);

    // Read AI prompt templates from site_settings
    const { data: settingsRow } = await serviceClient
      .from("site_settings")
      .select("value")
      .eq("key", "ai_prompts")
      .single();

    const prompts: Record<string, string> = (settingsRow?.value as Record<string, string>) ?? {};
    const transcript = content.raw_input;

    // Run all 6 prompts (in parallel for speed)
    const [summary_en, summary_fr, summary_pt] = await Promise.all([
      prompts.summary_en ? callClaude(apiKey, buildPrompt(prompts.summary_en, { transcript })) : Promise.resolve(""),
      prompts.summary_fr ? callClaude(apiKey, buildPrompt(prompts.summary_fr, { transcript })) : Promise.resolve(""),
      prompts.summary_pt ? callClaude(apiKey, buildPrompt(prompts.summary_pt, { transcript })) : Promise.resolve(""),
    ]);

    // Use language-matched summaries as input for platform-specific formats
    const [whatsapp_en, whatsapp_fr, whatsapp_pt, telegram_en, social_x, social_ig] = await Promise.all([
      prompts.whatsapp_en ? callClaude(apiKey, buildPrompt(prompts.whatsapp_en, { summary_en })) : Promise.resolve(""),
      prompts.whatsapp_fr ? callClaude(apiKey, buildPrompt(prompts.whatsapp_fr, { summary_fr })) : Promise.resolve(""),
      prompts.whatsapp_pt ? callClaude(apiKey, buildPrompt(prompts.whatsapp_pt, { summary_pt })) : Promise.resolve(""),
      prompts.telegram_en ? callClaude(apiKey, buildPrompt(prompts.telegram_en, { summary_en })) : Promise.resolve(""),
      prompts.social_x    ? callClaude(apiKey, buildPrompt(prompts.social_x,    { summary_en })) : Promise.resolve(""),
      prompts.social_ig   ? callClaude(apiKey, buildPrompt(prompts.social_ig,   { summary_en })) : Promise.resolve(""),
    ]);

    // Update parliament_content with AI-generated outputs
    const { error: updateErr } = await serviceClient
      .from("parliament_content")
      .update({
        summary_en,
        summary_fr,
        summary_pt,
        whatsapp_en,
        whatsapp_fr,
        whatsapp_pt,
        telegram_en,
        social_x,
        social_ig,
        status: "review",
        updated_at: new Date().toISOString(),
      })
      .eq("id", content_id.trim());

    if (updateErr) throw updateErr;

    return new Response(
      JSON.stringify({ success: true, content_id, generated: ["summary_en", "summary_fr", "summary_pt", "whatsapp_en", "whatsapp_fr", "whatsapp_pt", "telegram_en", "social_x", "social_ig"] }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("parliament-ai error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
