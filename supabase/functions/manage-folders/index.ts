import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IMAP_HOST = "imappro.zoho.eu";
const IMAP_PORT = 993;
const SYSTEM_FOLDERS = new Set(["inbox", "sent", "sentmail", "sent mail", "drafts", "draft", "spam", "junk", "trash", "deleted messages", "deleted"]);

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

  async cmd(c: string, limitMB = 1): Promise<string> {
    const tag = `T${++this.t}`;
    await this.conn.write(this.enc.encode(`${tag} ${c}\r\n`));
    const re = new RegExp(`^${tag} (OK|NO|BAD)`, "m");
    let r = "";
    while (r.length < limitMB * 1024 * 1024) {
      const b = new Uint8Array(32768);
      let n: number | null = null;
      try {
        n = await Promise.race([
          this.conn.read(b) as Promise<number | null>,
          new Promise<null>((_, j) => setTimeout(() => j(new Error("timeout")), 15000)),
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

    const { action, folder_name, folder_id } = await req.json().catch(() => ({})) as {
      action?: string; folder_name?: string; folder_id?: string;
    };

    if (!action || !["list", "create", "delete"].includes(action)) {
      return new Response(JSON.stringify({ error: "action must be list, create, or delete" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: acct } = await serviceClient.from("email_accounts")
      .select("email_address, app_password")
      .eq("user_id", user.id).eq("is_active", true).single();

    if (!acct) {
      return new Response(JSON.stringify({ error: "No active email account" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!acct.app_password) {
      return new Response(JSON.stringify({ error: "No app password configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const imap = new Imap();
    await imap.connect(acct.email_address, acct.app_password);

    if (action === "list") {
      const r = await imap.cmd('LIST "" "*"');
      await imap.close();
      const folders: any[] = [];
      const seen = new Set<string>();
      for (const m of r.matchAll(/\* LIST\s*\(([^)]*)\)\s+"[^"]*"\s+"?([^"\r\n]+)"?/g)) {
        if (/\\Noselect/i.test(m[1])) continue;
        const name = m[2].trim().replace(/^"|"$/g, "");
        if (seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());
        folders.push({
          folderId: name,
          folderName: name,
          dbFolder: dbFolderName(name),
          isSystemFolder: SYSTEM_FOLDERS.has(name.toLowerCase()),
        });
      }
      // Always ensure core folders are present
      for (const [raw, db] of [["INBOX", "inbox"], ["Sent", "sent"], ["Drafts", "drafts"], ["Spam", "spam"], ["Trash", "trash"]]) {
        if (!seen.has((raw as string).toLowerCase())) {
          folders.unshift({ folderId: raw, folderName: raw, dbFolder: db, isSystemFolder: true });
        }
      }
      return new Response(JSON.stringify({ folders }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "create") {
      if (!folder_name?.trim()) {
        await imap.close();
        return new Response(JSON.stringify({ error: "folder_name is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (SYSTEM_FOLDERS.has(folder_name.trim().toLowerCase())) {
        await imap.close();
        return new Response(JSON.stringify({ error: "Cannot create a folder with a reserved name" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const r = await imap.cmd(`CREATE "${esc(folder_name.trim())}"`);
      await imap.close();
      if (!isOk(r)) throw new Error("Failed to create folder: " + lastLine(r));
      return new Response(JSON.stringify({ success: true, folderName: folder_name.trim() }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete") {
      if (!folder_id) {
        await imap.close();
        return new Response(JSON.stringify({ error: "folder_id is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (SYSTEM_FOLDERS.has(folder_id.toLowerCase())) {
        await imap.close();
        return new Response(JSON.stringify({ error: "Cannot delete system folders" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const r = await imap.cmd(`DELETE "${esc(folder_id)}"`);
      await imap.close();
      if (!isOk(r)) throw new Error("Failed to delete folder: " + lastLine(r));
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await imap.close();
    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("manage-folders error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});