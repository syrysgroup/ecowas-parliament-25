import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// AES-256-GCM decryption
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

// API ping functions
async function pingAnthropic(apiKey: string): Promise<{ success: boolean; latency_ms: number; error?: string }> {
  const start = Date.now();
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    const latency_ms = Date.now() - start;
    if (res.ok || res.status === 400) return { success: true, latency_ms };
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) return { success: false, latency_ms, error: "Invalid API key" };
    return { success: false, latency_ms, error: body?.error?.message ?? `HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, latency_ms: Date.now() - start, error: e.message };
  }
}

async function pingTelegram(token: string): Promise<{ success: boolean; latency_ms: number; error?: string }> {
  const start = Date.now();
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const latency_ms = Date.now() - start;
    const body = await res.json();
    if (body.ok) return { success: true, latency_ms };
    return { success: false, latency_ms, error: body.description ?? "Invalid token" };
  } catch (e: any) {
    return { success: false, latency_ms: Date.now() - start, error: e.message };
  }
}

async function pingWhatsApp(token: string): Promise<{ success: boolean; latency_ms: number; error?: string }> {
  const start = Date.now();
  try {
    const res = await fetch("https://graph.facebook.com/v18.0/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const latency_ms = Date.now() - start;
    const body = await res.json();
    if (res.ok && body.id) return { success: true, latency_ms };
    return { success: false, latency_ms, error: body?.error?.message ?? `HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, latency_ms: Date.now() - start, error: e.message };
  }
}

async function pingYouTube(apiKey: string): Promise<{ success: boolean; latency_ms: number; error?: string }> {
  const start = Date.now();
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/i18nLanguages?part=snippet&key=${apiKey}`
    );
    const latency_ms = Date.now() - start;
    if (res.ok) return { success: true, latency_ms };
    const body = await res.json().catch(() => ({}));
    return { success: false, latency_ms, error: body?.error?.message ?? `HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, latency_ms: Date.now() - start, error: e.message };
  }
}

async function pingXAccessToken(token: string): Promise<{ success: boolean; latency_ms: number; error?: string }> {
  const start = Date.now();
  try {
    const res = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const latency_ms = Date.now() - start;
    if (res.ok) return { success: true, latency_ms };
    return { success: false, latency_ms, error: `HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, latency_ms: Date.now() - start, error: e.message };
  }
}

async function pingInstagram(token: string): Promise<{ success: boolean; latency_ms: number; error?: string }> {
  const start = Date.now();
  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${token}`
    );
    const latency_ms = Date.now() - start;
    const body = await res.json();
    if (res.ok && body.id) return { success: true, latency_ms };
    return { success: false, latency_ms, error: body?.error?.message ?? `HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, latency_ms: Date.now() - start, error: e.message };
  }
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

    // Read encrypted value via service_role
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: row, error: fetchErr } = await serviceClient
      .from("integration_secrets")
      .select("encrypted_val")
      .eq("service_key", service_key.trim())
      .single();

    if (fetchErr || !row) {
      return new Response(JSON.stringify({ success: false, error: "Secret not found" }), { headers: corsHeaders });
    }

    // Decrypt
    const encKey = Deno.env.get("SECRETS_ENCRYPTION_KEY");
    if (!encKey) {
      return new Response(JSON.stringify({ error: "Encryption key not configured" }), { status: 500, headers: corsHeaders });
    }

    let plainValue: string;
    try {
      plainValue = await decryptValue(row.encrypted_val, encKey);
    } catch {
      return new Response(JSON.stringify({ success: false, error: "Failed to decrypt secret" }), { headers: corsHeaders });
    }

    // Ping the appropriate API
    let result: { success: boolean; latency_ms: number; error?: string; note?: string };

    switch (service_key.trim()) {
      case "ANTHROPIC_API_KEY":
        result = await pingAnthropic(plainValue);
        break;
      case "OPENAI_API_KEY":
        result = await pingAnthropic(plainValue); // similar structure
        break;
      case "TELEGRAM_BOT_TOKEN":
        result = await pingTelegram(plainValue);
        break;
      case "WHATSAPP_ACCESS_TOKEN":
        result = await pingWhatsApp(plainValue);
        break;
      case "YOUTUBE_API_KEY":
        result = await pingYouTube(plainValue);
        break;
      case "X_ACCESS_TOKEN":
        result = await pingXAccessToken(plainValue);
        break;
      case "INSTAGRAM_ACCESS_TOKEN":
        result = await pingInstagram(plainValue);
        break;
      default:
        result = { success: true, latency_ms: 0, note: "ID/config value — no API ping available" };
    }

    return new Response(JSON.stringify(result), { headers: corsHeaders });
  } catch (err: any) {
    console.error("test-secret error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
