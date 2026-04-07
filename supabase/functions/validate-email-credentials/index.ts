import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Attempts to authenticate with an IMAP server using the provided credentials.
 * Uses the global SMTP/IMAP config stored in site_settings["smtp"].
 *
 * Returns { valid: true } on success or { valid: false, error: string } on failure.
 */
async function validateImapCredentials(
  host: string,
  port: number,
  sslEnabled: boolean,
  email: string,
  password: string,
): Promise<{ valid: boolean; error?: string }> {
  if (!host) return { valid: false, error: "IMAP host not configured. Contact your administrator." };

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Helper to read a full response line from the connection
  async function readResponse(conn: Deno.Conn): Promise<string> {
    const chunks: Uint8Array[] = [];
    const buf = new Uint8Array(4096);
    let total = "";
    // Read until we get a complete tagged response line
    for (let i = 0; i < 10; i++) {
      const n = await conn.read(buf);
      if (!n) break;
      total += decoder.decode(buf.subarray(0, n));
      // Stop once we have a tagged response (A001 OK / A001 NO / A001 BAD)
      if (/A001\s+(OK|NO|BAD)/i.test(total)) break;
      // Or if it's a greeting line starting with *
      if (chunks.length === 0 && /^\*\s+OK/i.test(total)) break;
    }
    return total;
  }

  let conn: Deno.Conn | null = null;
  try {
    if (sslEnabled) {
      conn = await Deno.connectTls({ hostname: host, port });
    } else {
      conn = await Deno.connect({ hostname: host, port });
    }

    // Read server greeting
    const greeting = await readResponse(conn);
    if (!greeting.includes("* OK") && !greeting.includes("* PREAUTH")) {
      return { valid: false, error: "IMAP server did not respond with OK greeting" };
    }

    // Escape special chars in IMAP quoted strings
    const safeEmail = email.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const safePw = password.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    // Send LOGIN command
    await conn.write(encoder.encode(`A001 LOGIN "${safeEmail}" "${safePw}"\r\n`));

    // Read response
    const response = await readResponse(conn);

    // Send LOGOUT regardless of outcome
    try {
      await conn.write(encoder.encode(`A002 LOGOUT\r\n`));
    } catch { /* ignore logout errors */ }

    if (/A001\s+OK/i.test(response)) {
      return { valid: true };
    } else if (/A001\s+NO/i.test(response)) {
      return { valid: false, error: "Invalid email or password" };
    } else if (/A001\s+BAD/i.test(response)) {
      return { valid: false, error: "IMAP command rejected by server" };
    } else {
      return { valid: false, error: "Unexpected server response" };
    }
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    if (msg.includes("Connection refused") || msg.includes("ECONNREFUSED")) {
      return { valid: false, error: `Cannot connect to IMAP server (${host}:${port}). Check server configuration.` };
    }
    if (msg.includes("tls") || msg.includes("ssl") || msg.includes("SSL") || msg.includes("TLS")) {
      return { valid: false, error: "SSL/TLS connection failed. Check SSL setting." };
    }
    return { valid: false, error: `Connection error: ${msg}` };
  } finally {
    try { conn?.close(); } catch { /* ignore */ }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Read global IMAP config from site_settings["smtp"]
    const { data: smtpRow } = await serviceClient
      .from("site_settings")
      .select("value")
      .eq("key", "smtp")
      .single();

    const globalConfig = (smtpRow?.value as Record<string, any>) ?? {};
    const imapHost: string = globalConfig.imap_host ?? "";
    const imapPort: number = Number(globalConfig.imap_port ?? 993);
    const sslEnabled: boolean = globalConfig.ssl_enabled !== false;

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { email: bodyEmail, password: bodyPassword, checkStored } = body as {
      email?: string; password?: string; checkStored?: boolean;
    };

    let emailToValidate: string;
    let passwordToValidate: string;

    if (checkStored) {
      // Mode 2: validate stored credentials (no password sent from client)
      const { data: settings } = await serviceClient
        .from("user_email_settings")
        .select("smtp_user, smtp_password")
        .eq("user_id", user.id)
        .single();

      if (!settings?.smtp_user || !settings?.smtp_password) {
        return new Response(JSON.stringify({ valid: false, error: "No stored credentials found" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      emailToValidate = settings.smtp_user;
      passwordToValidate = settings.smtp_password;
    } else {
      // Mode 1: validate provided credentials and save if valid
      if (!bodyEmail?.trim() || !bodyPassword?.trim()) {
        return new Response(JSON.stringify({ error: "email and password are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      emailToValidate = bodyEmail.trim();
      passwordToValidate = bodyPassword;
    }

    // Validate IMAP credentials
    const result = await validateImapCredentials(imapHost, imapPort, sslEnabled, emailToValidate, passwordToValidate);

    if (result.valid && !checkStored) {
      // Save credentials to user_email_settings
      await serviceClient.from("user_email_settings").upsert({
        user_id: user.id,
        smtp_host: globalConfig.host ?? "",
        smtp_port: Number(globalConfig.port ?? 587),
        smtp_user: emailToValidate,
        smtp_password: passwordToValidate,
        imap_host: imapHost,
        imap_port: imapPort,
        auto_connect: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // Upsert email_accounts
      const { data: existing } = await serviceClient
        .from("email_accounts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await serviceClient
          .from("email_accounts")
          .update({ email_address: emailToValidate, is_active: true })
          .eq("id", existing.id);
      } else {
        await serviceClient
          .from("email_accounts")
          .insert({ user_id: user.id, email_address: emailToValidate, is_active: true });
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("validate-email-credentials error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
