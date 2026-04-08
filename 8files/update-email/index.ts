import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

async function getZohoToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiresAt) return _cachedToken;
  const res = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
      client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
      refresh_token: Deno.env.get("ZOHO_REFRESH_TOKEN")!,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho token refresh failed: ${data.error ?? "no access_token"}`);
  _cachedToken = data.access_token as string;
  _tokenExpiresAt = Date.now() + ((data.expires_in ?? 3600) - 120) * 1000;
  return _cachedToken;
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
    if (action === "move" && !folder_id) {
      return new Response(JSON.stringify({ error: "folder_id is required for move action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: emailRow } = await serviceClient
      .from("emails")
      .select("id, zoho_message_id, account_id, folder, is_read, is_starred")
      .eq("id", email_id)
      .single();

    if (!emailRow) {
      return new Response(JSON.stringify({ error: "Email not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, zoho_account_id, user_id")
      .eq("id", emailRow.account_id)
      .single();

    if (!acct || acct.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const zohoMessageId = emailRow.zoho_message_id;
    const zohoAccountId = acct.zoho_account_id;
    const orgId = Deno.env.get("ZOHO_ORG_ID")!;
    const needsZoho = !!zohoMessageId && !!zohoAccountId;
    let token: string | null = null;
    if (needsZoho) token = await getZohoToken();

    // ── Helper: PUT to Zoho org-level message endpoint ──────────────────────
    async function zohoUpdate(payload: Record<string, string>) {
      if (!needsZoho || !token) return;
      const res = await fetch(
        `https://mail.zoho.eu/api/organization/${orgId}/accounts/${zohoAccountId}/messages/${zohoMessageId}`,
        {
          method: "PUT",
          headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const body = await res.text();
        console.error(`Zoho message update failed (${res.status}): ${body}`);
        // Non-fatal — DB state is still updated below
      }
    }

    // ── Helper: get trash folder ID from org endpoint ───────────────────────
    async function getTrashFolderId(): Promise<string> {
      const res = await fetch(
        `https://mail.zoho.eu/api/organization/${orgId}/accounts/${zohoAccountId}/folders`,
        { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
      );
      const data = await res.json();
      const folders: any[] = data?.data ?? [];
      const trash = folders.find((f: any) => (f.folderName ?? "").toLowerCase() === "trash");
      if (!trash) throw new Error("Trash folder not found in Zoho");
      return String(trash.folderId);
    }

    // ── Dispatch ─────────────────────────────────────────────────────────────
    switch (action) {
      case "mark_read": {
        await zohoUpdate({ mode: "markAsRead" });
        await serviceClient.from("emails").update({ is_read: true }).eq("id", email_id);
        break;
      }
      case "mark_unread": {
        await zohoUpdate({ mode: "markAsUnread" });
        await serviceClient.from("emails").update({ is_read: false }).eq("id", email_id);
        break;
      }
      case "star": {
        await zohoUpdate({ isflagged: "true" });
        await serviceClient.from("emails").update({ is_starred: true }).eq("id", email_id);
        break;
      }
      case "unstar": {
        await zohoUpdate({ isflagged: "false" });
        await serviceClient.from("emails").update({ is_starred: false }).eq("id", email_id);
        break;
      }
      case "move": {
        await zohoUpdate({ mode: "move", folderId: folder_id! });
        await serviceClient.from("emails").update({ folder: folder_name ?? folder_id }).eq("id", email_id);
        break;
      }
      case "trash": {
        if (needsZoho && token) {
          const trashFolderId = await getTrashFolderId();
          await zohoUpdate({ mode: "move", folderId: trashFolderId });
        }
        await serviceClient.from("emails").update({ folder: "trash" }).eq("id", email_id);
        break;
      }
      case "delete": {
        if (needsZoho && token) {
          const res = await fetch(
            `https://mail.zoho.eu/api/organization/${orgId}/accounts/${zohoAccountId}/messages/${zohoMessageId}`,
            { method: "DELETE", headers: { Authorization: `Zoho-oauthtoken ${token}` } }
          );
          if (!res.ok) {
            const body = await res.text();
            console.error(`Zoho delete failed (${res.status}): ${body}`);
            // Non-fatal — delete from DB regardless
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
