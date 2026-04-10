import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IMAP_HOST = "imappro.zoho.eu";
const IMAP_PORT = 993;

// ── IMAP client ───────────────────────────────────────────────────────────────
class Imap {
  private conn!: Deno.TlsConn;
  private enc = new TextEncoder();
  private dec = new TextDecoder("latin1"); // latin1 preserves raw bytes 1:1
  private t = 0;

  async connect(user: string, pass: string) {
    this.conn = await Deno.connectTls({ hostname: IMAP_HOST, port: IMAP_PORT });
    const b = new Uint8Array(4096);
    await this.conn.read(b);
    const r = await this.cmd(`LOGIN "${esc(user)}" "${esc(pass)}"`);
    if (!isOk(r)) throw new Error("IMAP login failed: " + lastLine(r));
  }

  async cmd(c: string, limitMB = 10): Promise<string> {
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
          new Promise<null>((_, j) => setTimeout(() => j(new Error("timeout")), 30000)),
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

// ── Extract raw RFC822 from IMAP FETCH response ────────────────────────────
function extractRfc822(raw: string): string {
  // IMAP FETCH literal: * N FETCH (... BODY[] {size}\r\n<content>\r\n)
  const litMatch = raw.match(/\{\d+\}\r?\n([\s\S]*)/);
  let content = litMatch ? litMatch[1] : raw;
  // Strip tagged response line e.g. "T3 OK UID FETCH completed"
  const tagIdx = content.search(/\r?\nT\d+ (OK|NO|BAD)/);
  if (tagIdx > 0) content = content.substring(0, tagIdx);
  // Strip trailing FETCH closing paren
  content = content.replace(/\r?\n\)\s*$/, "").replace(/\)\s*$/, "");
  return content;
}

// ── Unfold RFC2822 folded header lines ─────────────────────────────────────
function unfold(s: string): string {
  return s.replace(/\r?\n[ \t]+/g, " ");
}

// ── Split a MIME section into headers and body ──────────────────────────────
function splitHeadersBody(text: string): { headers: string; body: string } {
  const crlfIdx = text.indexOf("\r\n\r\n");
  const lfIdx   = text.indexOf("\n\n");
  let idx: number;
  let sepLen: number;

  if (crlfIdx >= 0 && (lfIdx < 0 || crlfIdx <= lfIdx)) {
    idx = crlfIdx; sepLen = 4;
  } else if (lfIdx >= 0) {
    idx = lfIdx; sepLen = 2;
  } else {
    return { headers: text, body: "" };
  }
  return { headers: text.substring(0, idx), body: text.substring(idx + sepLen) };
}

// ── Get value of a single header from a header block ───────────────────────
function getHeader(headers: string, name: string): string {
  const u = unfold(headers);
  const re = new RegExp(`(?:^|\r?\n)${name}\\s*:\\s*([^\r\n]*)`, "i");
  const m = u.match(re);
  return m ? m[1].trim() : "";
}

// ── Get a parameter from a header value (e.g. charset from Content-Type) ───
function getParam(headerVal: string, param: string): string {
  const u = unfold(headerVal);
  const re = new RegExp(`(?:^|;)\\s*${param}\\s*=\\s*(?:"([^"]+)"|([^;\\s]+))`, "i");
  const m = u.match(re);
  return m ? (m[1] ?? m[2] ?? "").trim() : "";
}

// ── Decode quoted-printable ────────────────────────────────────────────────
function decodeQP(input: string): string {
  return input
    .replace(/=\r?\n/g, "")                                          // soft line breaks
    .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

// ── Decode a part body given transfer encoding + charset ───────────────────
function decodePart(body: string, transferEncoding: string, charset: string): string {
  const enc = transferEncoding.toLowerCase().replace(/\s/g, "");
  const cs  = (charset || "utf-8").toLowerCase().replace(/\s/g, "");

  let bytes: Uint8Array;

  if (enc === "base64") {
    try {
      const clean = body.replace(/\s/g, "");
      bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
    } catch { return body; }
  } else if (enc === "quoted-printable") {
    const decoded = decodeQP(body);
    // decoded is a latin1 string — convert to bytes for charset decoding
    bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
  } else {
    // 7bit / 8bit / binary — treat as latin1 bytes
    bytes = Uint8Array.from(body, c => c.charCodeAt(0));
  }

  // Now decode bytes with the right charset
  const charsets = [cs, "utf-8", "iso-8859-1", "windows-1252"];
  for (const tryCs of charsets) {
    try { return new TextDecoder(tryCs).decode(bytes); } catch { /**/ }
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

// ── Recursively parse MIME ─────────────────────────────────────────────────
function parseMime(text: string): { html: string; plain: string } {
  const { headers, body } = splitHeadersBody(text);

  const ctRaw    = getHeader(headers, "Content-Type");
  const ctLow    = ctRaw.toLowerCase();
  const xferEnc  = getHeader(headers, "Content-Transfer-Encoding").trim();
  const charset  = getParam(ctRaw, "charset") || "utf-8";

  let html  = "";
  let plain = "";

  if (ctLow.startsWith("multipart/")) {
    const boundary = getParam(ctRaw, "boundary");
    if (!boundary) return { html: "", plain: "" };

    // Escape boundary for regex use
    const bEsc = boundary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Split on CRLF/LF "--boundary" lines (with or without closing "--")
    const delimRe = new RegExp(`(?:\r?\n)?--${bEsc}(?:--)?(?:\r?\n|$)`);
    const parts = text.split(delimRe);

    for (let i = 1; i < parts.length; i++) {   // index 0 = preamble before first boundary
      const part = parts[i];
      if (!part || part.trim() === "" || part.trim() === "--") continue;
      const nested = parseMime(part);
      if (nested.html  && !html)  html  = nested.html;
      if (nested.plain && !plain) plain = nested.plain;
      // For alternative: as soon as we have html we can stop (html preferred)
      if (ctLow.startsWith("multipart/alternative") && html) break;
    }

  } else if (ctLow.startsWith("text/html")) {
    html = decodePart(body, xferEnc, charset);

  } else if (ctLow.startsWith("text/plain")) {
    plain = decodePart(body, xferEnc, charset);

  } else if (!ctRaw) {
    // No Content-Type — sniff the decoded content
    const decoded = decodePart(body, xferEnc, charset);
    if (/<html|<body|<div|<p>|<br|<table/i.test(decoded)) {
      html = decoded;
    } else {
      plain = decoded;
    }
  }
  // Other parts (images, attachments) are intentionally skipped

  return { html, plain };
}

// ── Wrap plain text in a readable <pre> block ──────────────────────────────
function plainToHtml(text: string): string {
  return `<pre style="white-space:pre-wrap;font-family:sans-serif;font-size:14px;line-height:1.6">${
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }</pre>`;
}

// ── Main handler ───────────────────────────────────────────────────────────
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

    // Non-empty body already cached — return it directly
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

    // Fetch full RFC822 message without marking it as read
    const bodyResp = await imap.cmd(`UID FETCH ${parsed.uid} (BODY.PEEK[])`, 16);
    await imap.close();

    const rfc822   = extractRfc822(bodyResp);
    const { html, plain } = parseMime(rfc822);

    let body_html = "";
    if (html)        body_html = html;
    else if (plain)  body_html = plainToHtml(plain);

    // Cache in DB so next open is instant
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