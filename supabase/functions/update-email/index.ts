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

  async cmd(c: string, limitMB = 2): Promise<string> {
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
          new Promise<null>((_, j) => setTimeout(() => j(new Error("timeout")), 20000)),
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

async function findFolder(imap: Imap, name: string): Promise<string> {
  const r = await imap.cmd('LIST "" "*"');
  for (const m of r.matchAll(/\* LIST[^"]*"([^"]+)"/g)) {
    if (m[1].toLowerCase() === name.toLowerCase()) return m[1];
  }
  // Common variations
  const variations: Record<string, string[]> = {
    trash: ["Trash", "Deleted", "Deleted Messages", "TRASH"],
    sent: ["Sent", "Sent Mail", "SENT"],
    drafts: ["Drafts", "Draft", "DRAFTS"],
    spam: ["Spam", "Junk", "SPAM"],
  };
  const lower = name.toLowerCase();
  if (variations[lower]) {
    for (const v of variations[lower]) {
      if (r.toLowerCase().includes(v.toLowerCase())) return v;
    }
  }
  return name;
}

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

    const { action, email_id, folder_id, folder_name } = await req.json().catch(() => ({})) as {
      action?: string; email_id?: string; folder_id?: string; folder_name?: string;
    };

    const validActions = ["mark_read", "mark_unread", "star", "unstar", "move", "trash", "delete"];
    if (!action || !validActions.includes(action)) {
      return new Response(JSON.stringify({ error: `action must be one of: ${validActions.join(", ")}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email_id) {
      return new Response(JSON.stringify({ error: "email_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: emailRow } = await serviceClient.from("emails")
      .select("id, zoho_message_id, account_id, folder")
      .eq("id", email_id).single();

    if (!emailRow) {
      return new Response(JSON.stringify({ error: "Email not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    const parsed = emailRow.zoho_message_id ? parseUid(emailRow.zoho_message_id) : null;
    const canImap = !!(parsed && acct.app_password);

    // DB-only fallback when no IMAP credentials or no UID
    if (!canImap) {
      if (action === "mark_read")   await serviceClient.from("emails").update({ is_read: true }).eq("id", email_id);
      if (action === "mark_unread") await serviceClient.from("emails").update({ is_read: false }).eq("id", email_id);
      if (action === "star")        await serviceClient.from("emails").update({ is_starred: true }).eq("id", email_id);
      if (action === "unstar")      await serviceClient.from("emails").update({ is_starred: false }).eq("id", email_id);
      if (action === "trash")       await serviceClient.from("emails").update({ folder: "trash" }).eq("id", email_id);
      if (action === "delete")      await serviceClient.from("emails").delete().eq("id", email_id);
      if (action === "move")        await serviceClient.from("emails").update({ folder: folder_name ?? folder_id ?? "inbox" }).eq("id", email_id);
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imap = new Imap();
    await imap.connect(acct.email_address, acct.app_password);

    // Select the folder the message currently lives in
    const selResp = await imap.cmd(`SELECT "${esc(parsed!.folder)}"`);
    if (!isOk(selResp)) {
      await imap.close();
      // Folder may not exist — just update DB
      if (action === "delete") await serviceClient.from("emails").delete().eq("id", email_id);
      else if (action === "trash") await serviceClient.from("emails").update({ folder: "trash" }).eq("id", email_id);
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (action) {
      case "mark_read":
        await imap.cmd(`UID STORE ${parsed!.uid} +FLAGS (\\Seen)`);
        await serviceClient.from("emails").update({ is_read: true }).eq("id", email_id);
        break;

      case "mark_unread":
        await imap.cmd(`UID STORE ${parsed!.uid} -FLAGS (\\Seen)`);
        await serviceClient.from("emails").update({ is_read: false }).eq("id", email_id);
        break;

      case "star":
        await imap.cmd(`UID STORE ${parsed!.uid} +FLAGS (\\Flagged)`);
        await serviceClient.from("emails").update({ is_starred: true }).eq("id", email_id);
        break;

      case "unstar":
        await imap.cmd(`UID STORE ${parsed!.uid} -FLAGS (\\Flagged)`);
        await serviceClient.from("emails").update({ is_starred: false }).eq("id", email_id);
        break;

      case "move": {
        const dest = folder_name ?? folder_id ?? "INBOX";
        const copyResp = await imap.cmd(`UID COPY ${parsed!.uid} "${esc(dest)}"`);
        if (isOk(copyResp)) {
          await imap.cmd(`UID STORE ${parsed!.uid} +FLAGS (\\Deleted)`);
          await imap.cmd("EXPUNGE");
        }
        await serviceClient.from("emails").update({
          folder: dest.toLowerCase(),
          zoho_message_id: null,
          body_html: null,
        }).eq("id", email_id);
        break;
      }

      case "trash": {
        const trashFolder = await findFolder(imap, "Trash");
        const copyResp = await imap.cmd(`UID COPY ${parsed!.uid} "${esc(trashFolder)}"`);
        if (isOk(copyResp)) {
          await imap.cmd(`UID STORE ${parsed!.uid} +FLAGS (\\Deleted)`);
          await imap.cmd("EXPUNGE");
          await serviceClient.from("emails").update({
            folder: "trash",
            zoho_message_id: null,
            body_html: null,
          }).eq("id", email_id);
        } else {
          // COPY failed (maybe already in trash) — just mark deleted
          await imap.cmd(`UID STORE ${parsed!.uid} +FLAGS (\\Deleted)`);
          await imap.cmd("EXPUNGE");
          await serviceClient.from("emails").update({ folder: "trash" }).eq("id", email_id);
        }
        break;
      }

      case "delete": {
        // For emails already in trash — permanently delete via EXPUNGE
        // For other folders — mark deleted and expunge
        await imap.cmd(`UID STORE ${parsed!.uid} +FLAGS (\\Deleted)`);
        const expResp = await imap.cmd("EXPUNGE");
        console.log("EXPUNGE response:", expResp.substring(0, 200));
        // Always delete from DB regardless of IMAP result
        await serviceClient.from("emails").delete().eq("id", email_id);
        break;
      }
    }

    await imap.close();
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("update-email error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});