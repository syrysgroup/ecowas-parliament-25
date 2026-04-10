import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMTP_HOST = "smtppro.zoho.eu";
const SMTP_PORT = 465;
const LOGO_URL = "https://xahuyraommtfopnxrjvz.supabase.co/storage/v1/object/public/branding/logos/sing.png";

function flatAddresses(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return (val as string[]).map(s => s.trim()).filter(Boolean);
  return String(val).split(",").map(s => s.trim()).filter(Boolean);
}

// ── Build HTML signature block (uses a public URL — no base64 embedding) ──────
function buildSignatureHtml(sig: Record<string, any> | null): string {
  if (!sig) return "";
  return `
<div style="font-family:Arial,sans-serif;font-size:13px;color:#222;margin-top:20px;padding-top:12px;border-top:2px solid #006633">
  <strong style="font-size:14px;color:#111">${sig.title ? sig.title + " " : ""}${sig.full_name ?? ""}</strong><br>
  <span style="color:#006633;font-weight:600">ECOWAS Parliament Initiatives</span><br>
  ${sig.department ? `${sig.department}<br>` : ""}
  ${sig.mobile ? `Mobile Number: <strong>${sig.mobile}</strong><br>` : ""}
  ${sig.email ? `Email: <a href="mailto:${sig.email}" style="color:#006633;text-decoration:none">${sig.email}</a><br>` : ""}
  ${sig.website ? `Website: <a href="https://${sig.website.replace(/^https?:\/\//, "")}" style="color:#006633;text-decoration:none">${sig.website.replace(/^https?:\/\//, "")}</a><br>` : ""}
  ${sig.tagline ? `<br><em style="color:#006633">${sig.tagline}</em>` : ""}
  <br><img src="${LOGO_URL}" alt="ECOWAS Parliament Initiatives" style="height:70px;display:block;margin-top:8px" />
</div>`.trim();
}

// ── Compose full email body wrapped in proper HTML ────────────────────────────
function composeEmailBody(opts: {
  bodyHtml: string;
  signatureHtml: string;
  quotedHtml?: string;
  quotedFrom?: string;
  quotedDate?: string;
}): string {
  const bodyParts: string[] = [];

  bodyParts.push(opts.bodyHtml || "<br>");

  if (opts.signatureHtml) {
    bodyParts.push(opts.signatureHtml);
  }

  if (opts.quotedHtml) {
    bodyParts.push(`
<br>
<div style="border-left:3px solid #ccc;padding-left:12px;margin-top:16px;color:#555;font-family:Arial,sans-serif;font-size:13px">
  <div style="color:#888;font-size:12px;margin-bottom:8px">
    On ${opts.quotedDate ?? "a previous date"}, ${opts.quotedFrom ?? "someone"} wrote:
  </div>
  <div>${opts.quotedHtml}</div>
</div>`);
  }

  // Always wrap in full HTML document so external email clients can parse/reply correctly
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#222;margin:0;padding:16px">
${bodyParts.join("\n")}
</body>
</html>`;
}

// ── Quoted-printable encoder ──────────────────────────────────────────────────
function encodeQP(input: string): string {
  let result = "";
  let lineLen = 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const code = input.charCodeAt(i);

    // CRLF — pass through as-is, reset line counter
    if (ch === "\r" && input[i + 1] === "\n") {
      result += "\r\n"; lineLen = 0; i++; continue;
    }
    if (ch === "\n") {
      result += "\r\n"; lineLen = 0; continue;
    }

    let encoded: string;
    // Printable ASCII (excluding =) and safe whitespace can be literal
    if (code >= 33 && code <= 126 && ch !== "=") {
      encoded = ch;
    } else if ((ch === " " || ch === "\t") && i + 1 < input.length && input[i + 1] !== "\n" && input[i + 1] !== "\r") {
      // Space/tab safe to keep UNLESS at end of line (must encode those)
      encoded = ch;
    } else {
      encoded = `=${code.toString(16).toUpperCase().padStart(2, "0")}`;
    }

    // Soft line break if adding this would exceed 75 chars
    if (lineLen + encoded.length > 75) {
      result += "=\r\n";
      lineLen = 0;
    }
    result += encoded;
    lineLen += encoded.length;
  }
  return result;
}

// ── Build full MIME message ───────────────────────────────────────────────────
function buildMimeMessage(opts: {
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  htmlBody: string;
  replyTo?: string;
  inReplyToMsgId?: string;
  attachments?: Array<{ name: string; base64: string; contentType: string }>;
  msgId: string;
  date: string;
}): string {
  const boundary = `----=_Part_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  const lines: string[] = [];

  // RFC2822 headers
  lines.push(`From: ${opts.from}`);
  lines.push(`To: ${opts.to.join(", ")}`);
  if (opts.cc.length > 0) lines.push(`Cc: ${opts.cc.join(", ")}`);
  // Always set Reply-To to the sender so recipients can reply correctly
  lines.push(`Reply-To: ${opts.replyTo ?? opts.from}`);
  if (opts.inReplyToMsgId) lines.push(`In-Reply-To: ${opts.inReplyToMsgId}`);
  lines.push(`Subject: ${opts.subject}`);
  lines.push(`Date: ${opts.date}`);
  lines.push(`Message-ID: ${opts.msgId}`);
  lines.push(`MIME-Version: 1.0`);

  const hasAttachments = opts.attachments && opts.attachments.length > 0;

  if (hasAttachments) {
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push(``);

    // HTML body part
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: text/html; charset=UTF-8`);
    lines.push(`Content-Transfer-Encoding: quoted-printable`);
    lines.push(``);
    lines.push(encodeQP(opts.htmlBody));
    lines.push(``); // blank line before next boundary

    // Attachment parts
    for (const att of opts.attachments!) {
      lines.push(`--${boundary}`);
      lines.push(`Content-Type: ${att.contentType}; name="${att.name}"`);
      lines.push(`Content-Transfer-Encoding: base64`);
      lines.push(`Content-Disposition: attachment; filename="${att.name}"`);
      lines.push(``);
      const b64 = att.base64.replace(/\s/g, "");
      for (let i = 0; i < b64.length; i += 76) {
        lines.push(b64.slice(i, i + 76));
      }
      lines.push(``);
    }

    lines.push(`--${boundary}--`);
  } else {
    lines.push(`Content-Type: text/html; charset=UTF-8`);
    lines.push(`Content-Transfer-Encoding: quoted-printable`);
    lines.push(``);
    lines.push(encodeQP(opts.htmlBody));
  }

  return lines.join("\r\n");
}

// ── SMTP sender ───────────────────────────────────────────────────────────────
async function smtpSend(
  from: string, password: string,
  to: string[], cc: string[], bcc: string[],
  mimeMessage: string,
): Promise<void> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const conn = await Deno.connectTls({ hostname: SMTP_HOST, port: SMTP_PORT });

  async function read(): Promise<string> {
    const buf = new Uint8Array(65536);
    let r = "";
    for (let i = 0; i < 60; i++) {
      const n = await Promise.race([
        conn.read(buf) as Promise<number | null>,
        new Promise<null>((_, j) => setTimeout(() => j(new Error("SMTP timeout")), 30000)),
      ]);
      if (!n) break;
      r += dec.decode(buf.subarray(0, n));
      const lines = r.trim().split("\r\n").filter(Boolean);
      const last = lines[lines.length - 1] ?? "";
      if (/^\d{3} /.test(last)) break;
    }
    return r;
  }

  async function write(s: string) { await conn.write(enc.encode(s)); }

  try {
    const greeting = await read();
    if (!greeting.startsWith("220")) throw new Error(`SMTP greeting failed: ${greeting.trim()}`);

    await write("EHLO ecowasparliamentinitiatives.org\r\n");
    const ehlo = await read();
    if (!ehlo.includes("250")) throw new Error(`EHLO failed: ${ehlo.trim()}`);

    await write("AUTH LOGIN\r\n");
    await read();
    await write(btoa(from) + "\r\n");
    await read();
    await write(btoa(password) + "\r\n");
    const authResp = await read();
    if (!authResp.startsWith("235")) throw new Error(`SMTP auth failed: ${authResp.trim()}`);

    await write(`MAIL FROM:<${from}>\r\n`);
    const mfResp = await read();
    if (!mfResp.startsWith("250")) throw new Error(`MAIL FROM failed: ${mfResp.trim()}`);

    for (const r of [...to, ...cc, ...bcc]) {
      await write(`RCPT TO:<${r}>\r\n`);
      await read();
    }

    await write("DATA\r\n");
    const dataStart = await read();
    if (!dataStart.startsWith("354")) throw new Error(`DATA failed: ${dataStart.trim()}`);

    // SMTP dot-stuffing: lines starting with "." must be escaped
    const stuffed = mimeMessage
      .split("\r\n")
      .map(line => line.startsWith(".") ? "." + line : line)
      .join("\r\n");

    const msgBytes = enc.encode(stuffed + "\r\n.\r\n");
    const chunkSize = 65536;
    for (let i = 0; i < msgBytes.length; i += chunkSize) {
      await conn.write(msgBytes.subarray(i, i + chunkSize));
    }

    const sendResp = await read();
    if (!sendResp.startsWith("250")) throw new Error(`Server rejected message: ${sendResp.trim()}`);

    await write("QUIT\r\n");
  } finally {
    try { conn.close(); } catch { /**/ }
  }
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

    const {
      to, cc, bcc, subject, bodyHtml,
      replyToId,
      attachments,
      quotedHtml, quotedFrom, quotedDate,
    } = await req.json();

    if (!to || !subject) {
      return new Response(JSON.stringify({ error: "to and subject are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Fetch email account
    const { data: acct } = await serviceClient.from("email_accounts")
      .select("id, email_address, app_password")
      .eq("user_id", user.id).eq("is_active", true).single();

    if (!acct) {
      return new Response(JSON.stringify({ error: "No active email account. Ask your admin to set one up." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!acct.app_password) {
      return new Response(JSON.stringify({ error: "No app password configured." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user signature (server-side always builds the HTML sig — client sends plain body only)
    const { data: sig } = await serviceClient
      .from("email_signatures")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    const signatureHtml = buildSignatureHtml(sig);

    // Resolve reply-to details
    let replyToAddr: string | undefined;
    let inReplyToMsgId: string | undefined;
    let resolvedQuotedHtml = quotedHtml;
    let resolvedQuotedFrom = quotedFrom;
    let resolvedQuotedDate = quotedDate;

    if (replyToId) {
      const { data: orig } = await serviceClient
        .from("emails")
        .select("from_address, from_name, subject, body_html, sent_at, zoho_message_id")
        .eq("id", replyToId).single();

      if (orig) {
        replyToAddr = orig.from_address;
        inReplyToMsgId = orig.zoho_message_id ?? undefined;
        if (!resolvedQuotedHtml && orig.body_html) resolvedQuotedHtml = orig.body_html;
        if (!resolvedQuotedFrom) {
          resolvedQuotedFrom = orig.from_name
            ? `${orig.from_name} &lt;${orig.from_address}&gt;`
            : orig.from_address;
        }
        if (!resolvedQuotedDate && orig.sent_at) {
          resolvedQuotedDate = new Date(orig.sent_at).toLocaleString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          });
        }
      }
    }

    const finalBody = composeEmailBody({
      bodyHtml: bodyHtml ?? "",
      signatureHtml,
      quotedHtml: resolvedQuotedHtml,
      quotedFrom: resolvedQuotedFrom,
      quotedDate: resolvedQuotedDate,
    });

    const toList  = flatAddresses(to);
    const ccList  = flatAddresses(cc);
    const bccList = flatAddresses(bcc);

    const msgId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@ecowasparliamentinitiatives.org>`;
    const date  = new Date().toUTCString();

    const mimeMessage = buildMimeMessage({
      from: acct.email_address,
      to: toList,
      cc: ccList,
      subject,
      htmlBody: finalBody,
      replyTo: replyToAddr ?? acct.email_address,
      inReplyToMsgId,
      attachments: Array.isArray(attachments) && attachments.length > 0 ? attachments : undefined,
      msgId,
      date,
    });

    await smtpSend(acct.email_address, acct.app_password, toList, ccList, bccList, mimeMessage);

    // Save to DB — DB failure must not cause a 500 after successful SMTP send
    try {
      await serviceClient.from("emails").insert({
        account_id: acct.id,
        zoho_message_id: null,
        from_address: acct.email_address,
        from_name: "",
        to_address: toList.join(", "),
        cc_address: ccList.length ? ccList.join(", ") : null,
        subject,
        body_html: finalBody,
        body_text: "",
        is_read: true,
        is_starred: false,
        folder: "sent",
        has_attachments: Array.isArray(attachments) && attachments.length > 0,
        sent_at: new Date().toISOString(),
      });
    } catch (dbErr: any) {
      console.error("send-email: DB insert failed (email was already sent via SMTP):", dbErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});