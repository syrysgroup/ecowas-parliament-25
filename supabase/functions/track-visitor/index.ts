import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * ✅ PRIMARY DOMAIN
 */
const PRIMARY_ORIGIN = "https://ecowasparliamentinitiatives.org";

/**
 * ✅ ALL ALLOWED DOMAINS
 */
const allowedOrigins = [
  PRIMARY_ORIGIN,
  "https://www.ecowasparliamentinitiatives.org",
  "https://initiativesparlementecedeao.org",
  "https://www.initiativesparlementecedeao.org",
];

/**
 * ✅ Build dynamic CORS headers per request
 */
function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");

  const allowedOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : PRIMARY_ORIGIN; // fallback to main domain

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  /**
   * ✅ Handle preflight request (CRITICAL)
   */
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    let payload: { page?: unknown; referrer?: unknown; sessionId?: unknown } = {};
    try {
      payload = await req.json();
    } catch (parseError) {
      console.error("track-visitor invalid json:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const page =
      typeof payload.page === "string" && payload.page.trim().length > 0
        ? payload.page.trim()
        : "/";
    const referrer =
      typeof payload.referrer === "string" && payload.referrer.trim().length > 0
        ? payload.referrer.trim()
        : null;
    const sessionId =
      typeof payload.sessionId === "string" && payload.sessionId.trim().length > 0
        ? payload.sessionId.trim()
        : null;

    /**
     * 🌍 IP & GEO DATA
     */
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country") ||
      null;

    const city = req.headers.get("cf-ipcity") || null;

    const ua = req.headers.get("user-agent") || "";

    /**
     * 📱 DEVICE DETECTION
     */
    let device = "desktop";
    if (/mobile|android|iphone/i.test(ua)) device = "mobile";
    else if (/tablet|ipad/i.test(ua)) device = "tablet";

    /**
     * 🌐 BROWSER DETECTION
     */
    let browser = "other";
    if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = "Chrome";
    else if (/firefox/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
    else if (/edge/i.test(ua)) browser = "Edge";

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("track-visitor missing env vars", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(supabaseServiceRoleKey),
      });

      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * 🔌 SUPABASE CLIENT
     */
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    /**
     * 📊 INSERT VISITOR LOG
     */
    const { error } = await supabase.from("site_visitors").insert({
      ip_address: ip,
      country,
      city,
      device,
      browser,
      current_page: page,
      referrer,
      session_id: sessionId,
    });

    if (error) {
      console.error("track-visitor DB insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return new Response(
        JSON.stringify({ error: "Database insert failed", code: error.code ?? null }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * ✅ SUCCESS RESPONSE
     */
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("track-visitor unexpected error:", err);

    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
