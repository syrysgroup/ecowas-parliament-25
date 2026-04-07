import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getZohoToken(): Promise<string> {
  const clientId = Deno.env.get("ZOHO_CLIENT_ID");
  const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");
  const refreshToken = Deno.env.get("ZOHO_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Zoho OAuth credentials not configured.");
  }
  const res = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho token refresh failed: ${data.error ?? "no access_token"}`);
  return data.access_token as string;
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

    const { action, email_id, folder_id, folder_name } = await req.json().catch(() => ({})) as {
      action?: string; email_id?: string; folder_id?: string; folder_name?: string;
    };

    const validActions = ["mark_read", "mark_unread", "star", "unstar", "move", "trash", "delete"];
    if (!action || !validActions.includes(action)) {
      return new Response(JSON.stringify({ error: `action must be one of: ${validActions.join(", ")}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!email_id) {
      return new Response(JSON.stringify({ error: "email_id is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (action === "move" && !folder_id) {
      return new Response(JSON.stringify({ error: "folder_id is required for move action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Look up email + verify ownership via email_accounts join
    const { data: emailRow } = await serviceClient
      .from("emails")
      .select("id, zoho_message_id, account_id, folder, is_read, is_starred")
      .eq("id", email_id)
      .single();

    if (!emailRow) {
      return new Response(JSON.stringify({ error: "Email not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, zoho_account_id, user_id")
      .eq("id", emailRow.account_id)
      .single();

    if (!acct || acct.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const zohoMessageId = emailRow.zoho_message_id;
    const zohoAccountId = acct.zoho_account_id;

    // For actions that require Zoho, get a token
    const needsZoho = zohoMessageId && zohoAccountId;
    let token: string | null = null;
    if (needsZoho) {
      token = await getZohoToken();
    }

    // ── Helper: call Zoho updatemessage ──────────────────────────────────────
    async function zohoUpdate(payload: Record<string, string>) {
      if (!needsZoho || !token) return;
      const res = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/updatemessage`, {
        method: "PUT",
        headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: zohoMessageId, ...payload }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Zoho updatemessage failed (${res.status}): ${body}`);
      }
    }

    // ── Helper: find trash folder ID from Zoho ───────────────────────────────
    async function getTrashFolderId(): Promise<string> {
      const res = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/folders`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      const data = await res.json();
      const folders: any[] = data?.data ?? [];
      const trash = folders.find((f: any) => (f.folderName ?? "").toLowerCase() === "trash");
      if (!trash) throw new Error("Trash folder not found in Zoho");
      return String(trash.folderId);
    }

    // ── Dispatch ─────────────────────────────────────────────────────────────
    switch (action) {
      case "mark_read": {
        await zohoUpdate({ isread: "true" });
        await serviceClient.from("emails").update({ is_read: true }).eq("id", email_id);
        break;
      }
      case "mark_unread": {
        await zohoUpdate({ isread: "false" });
        await serviceClient.from("emails").update({ is_read: false }).eq("id", email_id);
        break;
      }
      case "star": {
        await zohoUpdate({ flagid: "1" });
        await serviceClient.from("emails").update({ is_starred: true }).eq("id", email_id);
        break;
      }
      case "unstar": {
        await zohoUpdate({ flagid: "0" });
        await serviceClient.from("emails").update({ is_starred: false }).eq("id", email_id);
        break;
      }
      case "move": {
        await zohoUpdate({ folderId: folder_id! });
        await serviceClient.from("emails").update({ folder: folder_name ?? folder_id }).eq("id", email_id);
        break;
      }
      case "trash": {
        if (needsZoho && token) {
          const trashFolderId = await getTrashFolderId();
          await zohoUpdate({ folderId: trashFolderId });
        }
        await serviceClient.from("emails").update({ folder: "trash" }).eq("id", email_id);
        break;
      }
      case "delete": {
        if (needsZoho && token) {
          const res = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/messages/${zohoMessageId}`, {
            method: "DELETE",
            headers: { Authorization: `Zoho-oauthtoken ${token}` },
          });
          if (!res.ok) {
            const body = await res.text();
            throw new Error(`Zoho delete failed (${res.status}): ${body}`);
          }
        }
        await serviceClient.from("emails").delete().eq("id", email_id);
        break;
      }
    }

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
