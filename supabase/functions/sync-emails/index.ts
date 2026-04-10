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
    await this.readRaw();
    const r = await this.cmd(`LOGIN "${esc(user)}" "${esc(pass)}"`);
    if (!isOk(r)) throw new Error("IMAP login failed — check email and app password. " + lastLine(r));
  }

  async cmd(c: string, limitMB = 4): Promise<string> {
    const tag = `T${++this.t}`;
    await this.conn.write(this.enc.encode(`${tag} ${c}\r\n`));
    return this.readUntilTagged(tag, limitMB * 1024 * 1024);
  }

  private async readRaw(): Promise<string> {
    const b = new Uint8Array(4096);
    const n = await this.conn.read(b);
    return n ? this.dec.decode(b.subarray(0, n)) : "";
  }

  private async readUntilTagged(tag: string, limit: number): Promise<string> {
    const re = new RegExp(`^${tag} (OK|NO|BAD)`, "m");
    let r = "";
    while (r.length < limit) {
      const b = new Uint8Array(65536);
      let n: number | null = null;
      try {
        n = await Promise.race([
          this.conn.read(b) as Promise<number | null>,
          new Promise<null>((_, j) => setTimeout(() => j(new Error("IMAP timeout")), 25000)),
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

function dbFolderName(raw: string): string {
  const n = raw.toLowerCase();
  if (n === "inbox") return "inbox";
  if (["sent", "sentmail", "sent mail"].includes(n)) return "sent";
  if (["drafts", "draft"].includes(n)) return "drafts";
  if (["spam", "junk"].includes(n)) return "spam";
  if (["trash", "deleted messages", "deleted"].includes(n)) return "trash";
  return n;
}

function parseAddr(raw: string): { name: string; addr: string } {
  const m = raw.match(/"?([^"<]*)"?\s*<([^>]+)>/);
  if (m) return { name: m[1].trim(), addr: m[2].trim() };
  const em = raw.match(/[\w.+%-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  return { name: "", addr: em ? em[0] : raw.trim() };
}

function decodeSubject(s: string): string {
  return s.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, cs, enc, txt) => {
    try {
      if (enc.toUpperCase() === "B") {
        return new TextDecoder(cs).decode(Uint8Array.from(atob(txt), c => c.charCodeAt(0)));
      }
      return txt.replace(/_/g, " ").replace(/=([0-9A-Fa-f]{2})/g, (_m: string, h: string) =>
        String.fromCharCode(parseInt(h, 16)));
    } catch { return s; }
  });
}

function parseFetch(raw: string, folder: string) {
  const msgs: any[] = [];
  const blocks = raw.split(/(?=\* \d+ FETCH )/);
  for (const blk of blocks) {
    if (!blk.startsWith("*")) continue;
    const uid = (blk.match(/\bUID\s+(\d+)/i) ?? [])[1];
    if (!uid) continue;
    const flags = (blk.match(/FLAGS\s*\(([^)]*)\)/i) ?? [])[1] ?? "";
    const idate = (blk.match(/INTERNALDATE\s+"([^"]+)"/i) ?? [])[1] ?? "";
    const litNl = blk.lastIndexOf("{");
    const nlAfterLit = blk.indexOf("\n", litNl);
    const hdr = nlAfterLit >= 0 ? blk.substring(nlAfterLit + 1) : "";
    const hFrom = (hdr.match(/^From:\s*(.+)/im) ?? [])[1] ?? "";
    const hTo   = (hdr.match(/^To:\s*(.+)/im) ?? [])[1] ?? "";
    const hCc   = (hdr.match(/^Cc:\s*(.+)/im) ?? [])[1] ?? "";
    const hSubj = (hdr.match(/^Subject:\s*(.+)/im) ?? [])[1] ?? "(No subject)";
    const { name, addr } = parseAddr(hFrom.trim());
    let dateIso = new Date().toISOString();
    try { if (idate) dateIso = new Date(idate).toISOString(); } catch { /**/ }
    msgs.push({
      uid: `${folder}:${uid}`,
      flags,
      date: dateIso,
      fromAddr: addr,
      fromName: name,
      to: hTo.trim(),
      cc: hCc.trim(),
      subject: decodeSubject(hSubj.trim()),
    });
  }
  return msgs;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let body: any = {};
    try { body = await req.clone().json(); } catch { /**/ }
    let effectiveUserId = user.id;
    if (body?.target_user_id && body.target_user_id !== user.id) {
      const { data: role } = await serviceClient.from("user_roles").select("id")
        .eq("user_id", user.id).in("role", ["super_admin", "admin"]).maybeSingle();
      if (!role) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      effectiveUserId = body.target_user_id;
    }

    const { data: acct } = await serviceClient.from("email_accounts")
      .select("id, email_address, app_password")
      .eq("user_id", effectiveUserId).eq("is_active", true).single();

    if (!acct) {
      return new Response(JSON.stringify({ newEmailCount: 0, message: "No active email account" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!acct.app_password) {
      return new Response(JSON.stringify({ newEmailCount: 0, message: "No app password set. Ask your admin to update the Email Accounts panel." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: existing } = await serviceClient.from("emails").select("zoho_message_id").eq("account_id", acct.id);
    const seen = new Set((existing ?? []).map((r: any) => r.zoho_message_id));

    const imap = new Imap();
    await imap.connect(acct.email_address, acct.app_password);

    const listResp = await imap.cmd('LIST "" "*"');
    const folderNames: string[] = [];
    for (const m of listResp.matchAll(/\* LIST\s*\(([^)]*)\)\s+"[^"]*"\s+"?([^"\r\n]+)"?/g)) {
      if (/\\Noselect/i.test(m[1])) continue;
      const name = m[2].trim().replace(/^"|"$/g, "");
      folderNames.push(name);
    }
    for (const f of ["INBOX", "Sent", "Drafts", "Spam", "Trash"]) {
      if (!folderNames.some(n => n.toLowerCase() === f.toLowerCase())) folderNames.push(f);
    }

    let newEmailCount = 0;

    for (const folder of folderNames) {
      const selResp = await imap.cmd(`SELECT "${esc(folder)}"`);
      if (!isOk(selResp)) continue;
      const existsM = selResp.match(/\* (\d+) EXISTS/);
      const total = existsM ? parseInt(existsM[1]) : 0;
      if (total === 0) continue;

      const start = Math.max(1, total - 49);
      const fetchResp = await imap.cmd(
        `FETCH ${start}:${total} (UID FLAGS INTERNALDATE BODY.PEEK[HEADER.FIELDS (FROM TO CC SUBJECT DATE MESSAGE-ID)])`,
        8
      );

      const msgs = parseFetch(fetchResp, folder);
      const folderDb = dbFolderName(folder);

      for (const msg of msgs) {
        if (seen.has(msg.uid)) continue;
        seen.add(msg.uid);
        const { error: insErr } = await serviceClient.from("emails").insert({
          account_id: acct.id,
          zoho_message_id: msg.uid,
          from_address: msg.fromAddr,
          from_name: msg.fromName,
          to_address: msg.to,
          cc_address: msg.cc || null,
          subject: msg.subject || "(No subject)",
          body_html: "",
          body_text: "",
          is_read: /\\Seen/i.test(msg.flags),
          is_starred: /\\Flagged/i.test(msg.flags),
          has_attachments: false,
          folder: folderDb,
          sent_at: msg.date,
        });
        if (!insErr) newEmailCount++;
        else console.error("Insert error:", insErr.message);
      }
    }

    await imap.close();
    await serviceClient.from("email_accounts").update({ last_synced_at: new Date().toISOString() }).eq("id", acct.id);

    return new Response(JSON.stringify({ success: true, newEmailCount }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("sync-emails error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});