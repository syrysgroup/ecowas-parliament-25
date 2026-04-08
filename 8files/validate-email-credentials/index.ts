import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  async function readResponse(conn: Deno.Conn): Promise<string> {
    const buf = new Uint8Array(4096);
    let total = "";
    for (let i = 0; i < 10; i++) {
      const n = await conn.read(buf);
      if (!n) break;
      total += decoder.decode(buf.subarray(0, n));
      if (/A001\s+(OK|NO|BAD)/i.test(total)) break;
      if (total.length > 0 && i === 0 && /^\*\s+OK/i.test(total)) break;
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

    const greeting = await readResponse(conn);
    if (!greeting.includes("* OK") && !greeting.includes("* PREAUTH")) {
      return { valid: false, error: "IMAP server did not respond with OK greeting" };
    }

    const safeEmail = email.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const safePw = password.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await conn.write(encoder.encode(`A001 LOGIN "${safeEmail}" "${safePw}"\r\n`));
    const response = await readResponse(conn);
    try { await conn.write(encoder.encode(`A002 LOGOUT\r\n`)); } catch { /* ignore */ }

    if (/A001\s+OK/i.test(response)) return { valid: true };
    if (/A001\s+NO/i.test(response)) return { valid: false, error: "Invalid email or password" };
    if (/A001\s+BAD/i.test(response)) return { valid: false, error: "IMAP command rejected by server" };
    return { valid: false, error: "Unexpected server response" };
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    if (msg.includes("Connection refused") || msg.includes("ECONNREFUSED")) {
      return { valid: false, error: `Cannot connect to IMAP server (${host}:${port}).` };
    }
    if (/tls|ssl/i.test(msg)) return { valid: false, error: "SSL/TLS connection failed. Check SSL setting." };
    return { valid: false, error: `Connection error: ${msg}` };
  } finally {
    try { conn?.close(); } catch { /* ignore */ }
  }
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
    const imapHost: string = globalConfig.imap_host ?? "imappro.zoho.eu";
    const imapPort: number = Number(globalConfig.imap_port ?? 993);
    const sslEnabled: boolean = globalConfig.ssl_enabled !== false;

    const body = await req.json().catch(() => ({}));
    const { email: bodyEmail, password: bodyPassword, checkStored, validate_stored, target_user_id } = body as {
      email?: string;
      password?: string;
      checkStored?: boolean;
      validate_stored?: boolean;
      target_user_id?: string;
    };

    // ── Mode 1: validate_stored — superadmin validates stored app_password ──
    if (validate_stored) {
      // Verify caller is super_admin
      const { data: roleCheck } = await serviceClient
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (!roleCheck) {
        return new Response(JSON.stringify({ error: "Only super admins can validate stored credentials" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!target_user_id) {
        return new Response(JSON.stringify({ error: "target_user_id is required for validate_stored mode" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Read app_password from email_accounts
      const { data: emailAcct } = await serviceClient
        .from("email_accounts")
        .select("id, email_address, app_password")
        .eq("user_id", target_user_id)
        .eq("is_active", true)
        .single();

      if (!emailAcct?.app_password) {
        return new Response(JSON.stringify({ valid: false, error: "No app password stored for this account. Edit the account and add one first." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await validateImapCredentials(
        imapHost, imapPort, sslEnabled,
        emailAcct.email_address, emailAcct.app_password
      );

      // Update imap_valid and imap_validated_at regardless of result
      await serviceClient
        .from("email_accounts")
        .update({
          imap_valid: result.valid,
          imap_validated_at: new Date().toISOString(),
        })
        .eq("id", emailAcct.id);

      return new Response(JSON.stringify(result), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Mode 2: checkStored — validate from user_email_settings (legacy) ───
    let targetUserId = user.id;
    if (target_user_id && target_user_id !== user.id) {
      const { data: roleCheck } = await serviceClient
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();
      if (!roleCheck) {
        return new Response(JSON.stringify({ error: "Only super admins can set email for other users" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      targetUserId = target_user_id;
    }

    let emailToValidate: string;
    let passwordToValidate: string;

    if (checkStored) {
      const { data: settings } = await serviceClient
        .from("user_email_settings")
        .select("smtp_user, smtp_password")
        .eq("user_id", targetUserId)
        .single();

      if (!settings?.smtp_user || !settings?.smtp_password) {
        return new Response(JSON.stringify({ valid: false, error: "No stored credentials found" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      emailToValidate = settings.smtp_user;
      passwordToValidate = settings.smtp_password;
    } else {
      if (!bodyEmail?.trim() || !bodyPassword?.trim()) {
        return new Response(JSON.stringify({ error: "email and password are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      emailToValidate = bodyEmail.trim();
      passwordToValidate = bodyPassword;
    }

    const result = await validateImapCredentials(imapHost, imapPort, sslEnabled, emailToValidate, passwordToValidate);

    if (result.valid && !checkStored) {
      await serviceClient.from("user_email_settings").upsert({
        user_id: targetUserId,
        smtp_host: globalConfig.host ?? "smtppro.zoho.eu",
        smtp_port: Number(globalConfig.port ?? 465),
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
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (existing) {
        await serviceClient
          .from("email_accounts")
          .update({ email_address: emailToValidate, is_active: true, imap_valid: true, imap_validated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await serviceClient
          .from("email_accounts")
          .insert({ user_id: targetUserId, email_address: emailToValidate, is_active: true, imap_valid: true, imap_validated_at: new Date().toISOString() });
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
