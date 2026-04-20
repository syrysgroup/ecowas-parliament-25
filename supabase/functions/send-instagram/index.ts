import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ─── AES-256-GCM decrypt ──────────────────────────────────────────────────────
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

async function getSecret(
  serviceClient: ReturnType<typeof createClient>,
  key: string,
  encKey: string
): Promise<string | null> {
  const { data } = await serviceClient
    .from("integration_secrets")
    .select("encrypted_val")
    .eq("service_key", key)
    .single();
  if (!data?.encrypted_val) return null;
  return decryptValue(data.encrypted_val, encKey);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
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

    const { data: isAdmin }      = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    const { data: isSuperAdmin } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "super_admin" });
    const { data: isComms }      = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "communications_officer" });
    if (!isAdmin && !isSuperAdmin && !isComms) {
      return new Response(JSON.stringify({ error: "Forbidden — admin access required" }), { status: 403, headers: corsHeaders });
    }

    const { content_id }: { content_id: string } = await req.json();
    if (!content_id) {
      return new Response(JSON.stringify({ error: "content_id is required" }), { status: 400, headers: corsHeaders });
    }

    const encKey = Deno.env.get("SECRETS_ENCRYPTION_KEY");
    if (!encKey) {
      return new Response(JSON.stringify({ error: "SECRETS_ENCRYPTION_KEY not configured" }), { status: 500, headers: corsHeaders });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch parliament content
    const { data: content, error: contentErr } = await serviceClient
      .from("parliament_content")
      .select("id, title, social_ig, status")
      .eq("id", content_id)
      .single();

    if (contentErr || !content) {
      return new Response(JSON.stringify({ error: "Content not found" }), { status: 404, headers: corsHeaders });
    }
    if (content.status !== "approved" && content.status !== "published") {
      return new Response(JSON.stringify({ error: "Content must be approved or published before sending" }), { status: 400, headers: corsHeaders });
    }
    if (!content.social_ig?.trim()) {
      return new Response(JSON.stringify({ error: "No Instagram content — run AI processing first" }), { status: 400, headers: corsHeaders });
    }

    // Fetch credentials
    const [accessToken, pageId] = await Promise.all([
      getSecret(serviceClient, "INSTAGRAM_ACCESS_TOKEN", encKey),
      getSecret(serviceClient, "INSTAGRAM_PAGE_ID", encKey),
    ]);

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "INSTAGRAM_ACCESS_TOKEN not configured in Secrets Vault" }), { status: 400, headers: corsHeaders });
    }
    if (!pageId) {
      return new Response(JSON.stringify({ error: "INSTAGRAM_PAGE_ID not configured in Secrets Vault" }), { status: 400, headers: corsHeaders });
    }

    // Check if a parliament image URL is configured in site_settings
    const { data: imgSetting } = await serviceClient
      .from("site_settings")
      .select("value")
      .eq("key", "parliament_image_url")
      .single();

    const imageUrl: string | null = imgSetting?.value ?? null;

    // Post to Facebook Page (supports text-only + link)
    const graphUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    const postBody: Record<string, string> = {
      message: content.social_ig.slice(0, 63206), // FB page post limit
      access_token: accessToken,
    };
    if (imageUrl) postBody.link = imageUrl;

    const res = await fetch(graphUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postBody),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.error?.message ?? `Facebook API error ${res.status}`;
      await serviceClient.from("distribution_log").insert({
        content_id,
        platform: "instagram",
        language: "en",
        status: "failed",
        error_msg: errMsg,
        sent_by: caller.id,
      });
      return new Response(JSON.stringify({ error: errMsg }), { status: 400, headers: corsHeaders });
    }

    const postId: string = data.id;

    await serviceClient.from("distribution_log").insert({
      content_id,
      platform: "instagram",
      language: "en",
      status: "sent",
      recipients: 1,
      external_id: postId,
      sent_by: caller.id,
    });

    return new Response(
      JSON.stringify({ success: true, post_id: postId }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("send-instagram error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
