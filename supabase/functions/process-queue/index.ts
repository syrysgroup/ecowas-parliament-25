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

// Dispatch a single queue item to the appropriate send function
async function dispatchItem(
  serviceClient: ReturnType<typeof createClient>,
  item: { id: string; content_id: string; platform: string; language: string; payload: any },
  encKey: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<{ ok: boolean; error?: string }> {
  const fnUrl = `${supabaseUrl}/functions/v1`;
  const authHeader = `Bearer ${serviceRoleKey}`;

  if (item.platform === "whatsapp") {
    const res = await fetch(`${fnUrl}/send-whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({ content_id: item.content_id, language: item.language }),
    });
    const body = await res.json();
    if (body.success) return { ok: true };
    return { ok: false, error: body.error ?? "send-whatsapp failed" };
  }

  if (item.platform === "telegram") {
    const res = await fetch(`${fnUrl}/send-telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({ content_id: item.content_id, languages: [item.language] }),
    });
    const body = await res.json();
    if (body.success) return { ok: true };
    return { ok: false, error: body.error ?? "send-telegram failed" };
  }

  if (item.platform === "twitter") {
    const res = await fetch(`${fnUrl}/send-twitter`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({ content_id: item.content_id }),
    });
    const body = await res.json();
    if (body.success) return { ok: true };
    return { ok: false, error: body.error ?? "send-twitter failed" };
  }

  if (item.platform === "instagram") {
    const res = await fetch(`${fnUrl}/send-instagram`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({ content_id: item.content_id }),
    });
    const body = await res.json();
    if (body.success) return { ok: true };
    return { ok: false, error: body.error ?? "send-instagram failed" };
  }

  return { ok: false, error: `Unknown platform: ${item.platform}` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // This function is called by pg_cron (service_role) or manually by super_admin
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const encKey = Deno.env.get("SECRETS_ENCRYPTION_KEY");
  if (!encKey) {
    return new Response(JSON.stringify({ error: "SECRETS_ENCRYPTION_KEY not configured" }), { status: 500, headers: corsHeaders });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Fetch pending items scheduled for now or earlier, with retries remaining
    const { data: items, error: fetchErr } = await serviceClient
      .from("message_queue")
      .select("id, content_id, platform, language, payload, retry_count, max_retries")
      .in("status", ["pending", "failed"])
      .lte("scheduled_at", new Date().toISOString())
      .lt("retry_count", serviceClient.rpc ? 99 : 99) // use max_retries filter below
      .order("created_at", { ascending: true })
      .limit(50);

    if (fetchErr) throw fetchErr;
    if (!items?.length) {
      return new Response(JSON.stringify({ processed: 0, message: "No pending items" }), { headers: corsHeaders });
    }

    // Filter items where retry_count < max_retries
    const eligible = items.filter((i: any) => i.retry_count < i.max_retries);

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const item of eligible) {
      // Mark as processing
      await serviceClient
        .from("message_queue")
        .update({ status: "processing" })
        .eq("id", item.id);

      const result = await dispatchItem(serviceClient, item, encKey, supabaseUrl, serviceRoleKey);
      processed++;

      if (result.ok) {
        await serviceClient
          .from("message_queue")
          .update({ status: "sent", processed_at: new Date().toISOString() })
          .eq("id", item.id);
        succeeded++;
      } else {
        const newCount = item.retry_count + 1;
        const isDead = newCount >= item.max_retries;
        await serviceClient
          .from("message_queue")
          .update({
            status: isDead ? "dead" : "failed",
            retry_count: newCount,
            last_error: result.error ?? "unknown error",
            // Exponential backoff: retry after 2^retry minutes
            scheduled_at: isDead
              ? new Date().toISOString()
              : new Date(Date.now() + Math.pow(2, newCount) * 60 * 1000).toISOString(),
          })
          .eq("id", item.id);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ processed, succeeded, failed }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("process-queue error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
