import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// AES-256-GCM encryption helpers
async function importKey(hexKey: string): Promise<CryptoKey> {
  const raw = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptValue(plaintext: string, hexKey: string): Promise<string> {
  const key = await importKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `${ivHex}:${ctB64}`;
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
    const { service_key, value }: { service_key: string; value: string } = await req.json();
    if (!service_key?.trim() || !value?.trim()) {
      return new Response(JSON.stringify({ error: "service_key and value are required" }), { status: 400, headers: corsHeaders });
    }

    // Encrypt
    const encKey = Deno.env.get("SECRETS_ENCRYPTION_KEY");
    if (!encKey) {
      return new Response(JSON.stringify({ error: "Encryption key not configured — set SECRETS_ENCRYPTION_KEY in Supabase secrets" }), { status: 500, headers: corsHeaders });
    }

    const encryptedVal = await encryptValue(value, encKey);
    const lastFour = value.slice(-4);

    // Upsert using service_role (bypasses RLS to allow the insert)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: upsertErr } = await serviceClient
      .from("integration_secrets")
      .upsert({
        service_key: service_key.trim(),
        encrypted_val: encryptedVal,
        last_four: lastFour,
        is_set: true,
        updated_at: new Date().toISOString(),
        updated_by: caller.id,
      }, { onConflict: "service_key" });

    if (upsertErr) throw upsertErr;

    // Audit log
    await serviceClient.from("admin_activity_logs").insert({
      actor_user_id: caller.id,
      action: "secret_updated",
      entity_type: "integration_secret",
      details: { service_key: service_key.trim() },
    });

    return new Response(JSON.stringify({ success: true, last_four: lastFour }), { headers: corsHeaders });
  } catch (err: any) {
    console.error("set-secret error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
