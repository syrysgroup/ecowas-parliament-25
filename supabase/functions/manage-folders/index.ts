import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_FOLDERS = new Set(["inbox", "sent", "sentmail", "drafts", "draft", "spam", "junk", "trash"]);

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

    const { action, folder_name, folder_id } = await req.json().catch(() => ({})) as {
      action?: string; folder_name?: string; folder_id?: string;
    };

    if (!action || !["list", "create", "delete"].includes(action)) {
      return new Response(JSON.stringify({ error: "action must be list, create, or delete" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: acct } = await serviceClient
      .from("email_accounts")
      .select("id, email_address, zoho_account_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!acct) {
      return new Response(JSON.stringify({ error: "No active email account found." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getZohoToken();

    // Resolve account ID — if stored ID is invalid, clear and re-resolve
    let zohoAccountId = acct.zoho_account_id;
    if (!zohoAccountId) {
      const orgId = Deno.env.get("ZOHO_ORG_ID")!;
      const accountsRes = await fetch(`https://mail.zoho.eu/api/organization/${orgId}/accounts`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      const accountsData = await accountsRes.json();
      const match = (accountsData?.data ?? []).find((a: any) =>
        (a.primaryEmailAddress ?? "").toLowerCase() === (acct.email_address ?? "").toLowerCase()
      );
      if (!match) {
        return new Response(JSON.stringify({ error: "Could not resolve Zoho account ID. Check ZOHO_ORG_ID and account email." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      zohoAccountId = String(match.accountId ?? match.zuid);
      await serviceClient.from("email_accounts").update({ zoho_account_id: zohoAccountId }).eq("id", acct.id);
    }

    if (action === "list") {
      const res = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/folders`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      if (!res.ok) throw new Error(`Zoho folders fetch failed (${res.status})`);
      const data = await res.json();
      const folders = (data?.data ?? []).map((f: any) => ({
        folderId: String(f.folderId),
        folderName: f.folderName ?? "",
        unreadCount: Number(f.unreadCount ?? 0),
        messageCount: Number(f.messageCount ?? 0),
        isSystemFolder: SYSTEM_FOLDERS.has((f.folderName ?? "").toLowerCase()),
      }));
      return new Response(JSON.stringify({ folders }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      if (!folder_name?.trim()) {
        return new Response(JSON.stringify({ error: "folder_name is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (SYSTEM_FOLDERS.has(folder_name.trim().toLowerCase())) {
        return new Response(JSON.stringify({ error: "Cannot create a folder with a reserved name" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const res = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/folders`, {
        method: "POST",
        headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: folder_name.trim() }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Zoho create folder failed (${res.status}): ${body}`);
      }
      const data = await res.json();
      return new Response(JSON.stringify({ folder: data?.data ?? {} }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      if (!folder_id) {
        return new Response(JSON.stringify({ error: "folder_id is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Fetch folders to verify it's not a system folder
      const listRes = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/folders`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      const listData = await listRes.json();
      const target = (listData?.data ?? []).find((f: any) => String(f.folderId) === folder_id);
      if (!target) {
        return new Response(JSON.stringify({ error: "Folder not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (SYSTEM_FOLDERS.has((target.folderName ?? "").toLowerCase())) {
        return new Response(JSON.stringify({ error: "Cannot delete system folders" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const res = await fetch(`https://mail.zoho.eu/api/accounts/${zohoAccountId}/folders/${folder_id}`, {
        method: "DELETE",
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Zoho delete folder failed (${res.status}): ${body}`);
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("manage-folders error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
