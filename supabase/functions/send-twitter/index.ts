import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ─── AES-256-GCM decrypt (same as other edge functions) ───────────────────────
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

// ─── OAuth 1.0a signing ────────────────────────────────────────────────────────
function pct(s: string): string {
  return encodeURIComponent(s)
    .replace(/!/g, "%21").replace(/'/g, "%27")
    .replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
}

async function buildOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
): Promise<string> {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // Signature base string (OAuth params only — JSON body not included)
  const paramString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${pct(k)}=${pct(v)}`)
    .join("&");

  const baseString = `${method}&${pct(url)}&${pct(paramString)}`;
  const signingKey = `${pct(consumerSecret)}&${pct(accessTokenSecret)}`;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const sigBytes = await crypto.subtle.sign("HMAC", keyMaterial, new TextEncoder().encode(baseString));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));

  const headerParams = { ...oauthParams, oauth_signature: signature };
  const headerString = Object.entries(headerParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${pct(k)}="${pct(v)}"`)
    .join(", ");

  return `OAuth ${headerString}`;
}

// ─── Parse social_x content into tweet-sized chunks ───────────────────────────
function parseTweets(text: string): string[] {
  // Try numbered list: "1. ...\n\n2. ...\n\n3. ..."
  const numbered = text.match(/^\d+\.\s+(.+?)(?=\n\n\d+\.|$)/gms);
  if (numbered && numbered.length > 1) {
    return numbered
      .map(t => t.replace(/^\d+\.\s+/, "").trim())
      .filter(t => t.length > 0)
      .slice(0, 3);
  }
  // Fallback: split on double newline
  const parts = text.split(/\n\n+/).filter(t => t.trim().length > 0).slice(0, 3);
  // Truncate each to 280 chars
  return parts.map(t => t.trim().slice(0, 280));
}

// ─── Post a single tweet ───────────────────────────────────────────────────────
async function postTweet(
  text: string,
  oauthHeader: string,
  replyToId?: string
): Promise<string> {
  const body: Record<string, any> = { text };
  if (replyToId) body.reply = { in_reply_to_tweet_id: replyToId };

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail ?? data?.errors?.[0]?.message ?? `Twitter API error ${res.status}`);
  }
  return data.data.id as string;
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

    const { data: isAdmin }  = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    const { data: isSuperAdmin } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "super_admin" });
    const { data: isComms }  = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "communications_officer" });
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
      .select("id, title, social_x, status")
      .eq("id", content_id)
      .single();

    if (contentErr || !content) {
      return new Response(JSON.stringify({ error: "Content not found" }), { status: 404, headers: corsHeaders });
    }
    if (content.status !== "approved" && content.status !== "published") {
      return new Response(JSON.stringify({ error: "Content must be approved or published before sending" }), { status: 400, headers: corsHeaders });
    }
    if (!content.social_x?.trim()) {
      return new Response(JSON.stringify({ error: "No X/Twitter content — run AI processing first" }), { status: 400, headers: corsHeaders });
    }

    // Fetch X API credentials from vault
    const [apiKey, apiSecret, accessToken, accessTokenSecret] = await Promise.all([
      getSecret(serviceClient, "X_API_KEY", encKey),
      getSecret(serviceClient, "X_API_SECRET", encKey),
      getSecret(serviceClient, "X_ACCESS_TOKEN", encKey),
      getSecret(serviceClient, "X_ACCESS_SECRET", encKey),
    ]);

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      return new Response(JSON.stringify({ error: "X API credentials not fully configured in Secrets Vault" }), { status: 400, headers: corsHeaders });
    }

    // Parse into thread tweets
    const tweets = parseTweets(content.social_x);
    if (!tweets.length) {
      return new Response(JSON.stringify({ error: "Could not parse any tweets from social_x content" }), { status: 400, headers: corsHeaders });
    }

    // Build OAuth header once (nonce/timestamp shared; each request generates fresh header)
    const tweetIds: string[] = [];
    let replyToId: string | undefined;

    for (const text of tweets) {
      const oauthHeader = await buildOAuthHeader(
        "POST",
        "https://api.twitter.com/2/tweets",
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret
      );
      const id = await postTweet(text, oauthHeader, replyToId);
      tweetIds.push(id);
      replyToId = id;
    }

    // Log to distribution_log
    await serviceClient.from("distribution_log").insert({
      content_id,
      platform: "twitter",
      language: "en",
      status: "sent",
      recipients: 1,
      external_id: tweetIds[0],
      sent_by: caller.id,
    });

    return new Response(
      JSON.stringify({ success: true, tweet_ids: tweetIds, count: tweetIds.length }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("send-twitter error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
