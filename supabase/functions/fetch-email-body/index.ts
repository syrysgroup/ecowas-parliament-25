import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IMAP_HOST = "imappro.zoho.eu";
const IMAP_PORT = 993;

class Imap {
  private conn!: Deno.TlsConn;
  private enc = new TextEncoder();
  private dec = new TextDecoder();
  private t = 0;

  async connect(user: string, pass: string) {
    this.conn = await Deno.connectTls({ hostname: IMAP_HOST, port: IMAP_PORT });
    const b = new Uint8Array(4096); await this.conn.read(b);
    const r = await this.cmd(`LOGIN "${esc(user)}" "${esc(pass)}"`);
    if (!isOk(r)) throw new Error("IMAP login failed: " + lastLine(r));
  }

  async cmd(c: string, limitMB = 8): Promise<string> {
    const tag = `T${++this.t}`;
    await this.conn.write(this.enc.encode(`${tag} ${c}\r\n`));
    const re = new RegExp(`^${tag} (OK|NO|BAD)`, "m");
    let r = "";
    while (r.length < limitMB * 1024 * 1024) {
      const b = new Uint8Array(65536);
      let n: number | null = null;
      try {
        n = await Promise.race([
          this.conn.read(b) as Promise<number | null>,
          new Promise<null>((_, j) => setTimeout(() => j(new Error("timeout")), 25000)),
        ]);
      } catch { break; }
      if (!n) break;
      r += this.dec.decode(b.subarray(0, n));
      if (re.test(r)) break;
    }
    return r;
  }

  async close() {
    try { await this.conn.write(this.enc.encode(`T${++this.t} LOGOUT\r\n`)); } catch { /**/ }
    try { this.conn.close(); } catch { /**/ }
  }
}

function esc(s: string) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }
function isOk(r: string) { return /\bOK\b/i.test(lastLine(r)); }
function lastLine(r: string) { return r.trim().split("\n").pop() ?? ""; }
function parseUid(id: string) {
  const i = id.lastIndexOf(":");
  return i < 0 ? null : { folder: id.substring(0, i), uid: id.substring(i + 1) };
}

// ── Strip IMAP fetch wrapper, return raw RFC822 message ───────────────────────
function extractRfc822(raw: string): string {
  // The IMAP response looks like: * N FETCH (BODY[] {SIZE}\r\nCONTENT\r\n)
  const litMatch = raw.match(/\{\d+\}\r?\n([\s\S]*)/);
  let content = litMatch ? litMatch[1] : raw;
  // Strip trailing tagged response line
  const tagIdx = content.search(/\nT\d+ (OK|NO|BAD)/);
  if (tagIdx > 0) content = content.substring(0, tagIdx);
  // Strip trailing FETCH closing paren
  content = content.replace(/\)\s*$/, "").trim();
  return content;
}

// ── Strip RFC822 top-level headers, return just the body ─────────────────────
function stripRfc822Headers(rfc822: string): { headers: string; body: string } {
  const sep = rfc822.includes("\r\n\r\n") ? "\r\n\r\n" : "\n\n";
  const idx = rfc822.indexOf(sep);
  if (idx < 0) return { headers: "", body: rfc822 };
  return {
    headers: rfc822.substring(0, idx),
    body: rfc822.substring(idx + sep.length),
  };
}

// ── Charset-aware content decoder ────────────────────────────────────────────
function decodeContent(body: string, encoding: string, charset = "utf-8"): string {
  const enc = encoding.toLowerCase().replace(/\s/g, "");
  const safeCharset = charset.toLowerCase().replace(/\s/g, "") || "utf-8";

  try {
    if (enc === "base64") {
      const clean = body.replace(/\s/g, "");
      const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
      try { return new TextDecoder(safeCharset).decode(bytes); }
      catch { return new TextDecoder("utf-8").decode(bytes); }
    }

    if (enc === "quoted-printable") {
      const decoded = body
        .replace(/=\r?\n/g, "")
        .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
      try { return new TextDecoder(safeCharset).decode(bytes); }
      catch { try { return new TextDecoder("utf-8").decode(bytes); } catch { return decoded; } }
    }

    if (safeCharset !== "utf-8" && safeCharset !== "us-ascii") {
      try {
        const bytes = Uint8Array.from(body, c => c.charCodeAt(0));
        return new TextDecoder(safeCharset).decode(bytes);
      } catch { /**/ }
    }
  } catch { /**/ }

  return body;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Parse MIME parts recursively ─────────────────────────────────────────────
function parseMime(rfc822: string): { html: string; plain: string } {
  let html = "";
  let plain = "";

  // Strip RFC822 top-level headers first
  const { headers: topHeaders, body: topBody } = stripRfc822Headers(rfc822);
  const fullHeaders = topHeaders.toLowerCase();

  // Get top-level content-type
  const contentTypeMatch = fullHeaders.match(/content-type:\s*([^;\r\n]+)/i);
  const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : "text/plain";

  // Get top-level boundary for multipart
  const boundaryMatch = (topHeaders + "\n" + topBody).match(/boundary="?([^"\r\n;]+)"?/i);

  if (contentType.includes("multipart") && boundaryMatch) {
    const boundary = boundaryMatch[1].trim();
    // Use the full rfc822 for splitting since boundary info may span header/body
    const parts = rfc822.split(new RegExp(`--${escapeRegex(boundary)}(?:--)?`));

    for (const part of parts) {
      if (!part.trim() || part.trim() === "--") continue;

      const sepIdx = part.includes("\r\n\r\n")
        ? part.indexOf("\r\n\r\n")
        : part.indexOf("\n\n");
      if (sepIdx < 0) continue;

      const partHeaders = part.substring(0, sepIdx).toLowerCase();
      const partBody = part.substring(sepIdx + (part.includes("\r\n\r\n") ? 4 : 2));

      // Handle nested multipart (e.g. multipart/alternative inside multipart/mixed)
      if (partHeaders.includes("multipart/")) {
        const nested = parseMime(part);
        if (nested.html && !html) html = nested.html;
        if (nested.plain && !plain) plain = nested.plain;
        continue;
      }

      const encoding = (partHeaders.match(/content-transfer-encoding:\s*(\S+)/) ?? [])[1] ?? "";
      const charsetMatch = partHeaders.match(/charset="?([^";\s\r\n]+)"?/i);
      const charset = charsetMatch ? charsetMatch[1].toLowerCase() : "utf-8";
      const decoded = decodeContent(partBody.trim(), encoding, charset);

      if (partHeaders.includes("text/html") && !html) html = decoded;
      else if (partHeaders.includes("text/plain") && !plain) plain = decoded;
    }
  } else {
    // Not multipart — the body IS the content
    const encoding = (fullHeaders.match(/content-transfer-encoding:\s*(\S+)/) ?? [])[1] ?? "";
    const charsetMatch = fullHeaders.match(/charset="?([^";\s\r\n]+)"?/i);
    const charset = charsetMatch ? charsetMatch[1].toLowerCase() : "utf-8";
    const decoded = decodeContent(topBody.trim(), encoding, charset);

    if (contentType.includes("text/html") || /<html|<div|<p |<br|<table/i.test(decoded)) {
      html = decoded;
    } else {
      plain = decoded;
    }
  }

  return { html, plain };
}

function plainToHtml(text: string): string {
  return `<pre style="white-space:pre-wrap;font-family:sans-serif;font-size:14px;line-height:1.6">${
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }</pre>`;
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email_id } = await req.json().catch(() => ({})) as { email_id?: string };
    if (!email_id) {
      return new Response(JSON.stringify({ error: "email_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: emailRow } = await serviceClient.from("emails")
      .select("id, zoho_message_id, account_id, body_html")
      .eq("id", email_id).single();

    if (!emailRow) {
      return new Response(JSON.stringify({ error: "Email not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already fetched and cached
    if (emailRow.body_html) {
      return new Response(JSON.stringify({ body_html: emailRow.body_html }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Locally composed sent email — no IMAP UID
    if (!emailRow.zoho_message_id) {
      return new Response(JSON.stringify({ body_html: "" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: acct } = await serviceClient.from("email_accounts")
      .select("email_address, app_password, user_id")
      .eq("id", emailRow.account_id).single();

    if (!acct || acct.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!acct.app_password) {
      return new Response(JSON.stringify({ error: "No app password configured" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = parseUid(emailRow.zoho_message_id);
    if (!parsed) {
      return new Response(JSON.stringify({ body_html: "" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imap = new Imap();
    await imap.connect(acct.email_address, acct.app_password);

    const selResp = await imap.cmd(`SELECT "${esc(parsed.folder)}"`);
    if (!isOk(selResp)) {
      await imap.close();
      return new Response(JSON.stringify({ body_html: "" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch full RFC822 message
    const bodyResp = await imap.cmd(`UID FETCH ${parsed.uid} (BODY.PEEK[])`, 16);
    await imap.close();

    const rfc822 = extractRfc822(bodyResp);
    const { html, plain } = parseMime(rfc822);

    let body_html = "";
    if (html) {
      body_html = html;
    } else if (plain) {
      body_html = plainToHtml(plain);
    }

    if (body_html) {
      await serviceClient.from("emails").update({ body_html }).eq("id", email_id);
    }

    return new Response(JSON.stringify({ body_html }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("fetch-email-body error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});