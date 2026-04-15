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

  try {
    const { page, referrer, sessionId } = await req.json();

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

    /**
     * 🔌 SUPABASE CLIENT
     */
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /**
     * 📊 INSERT VISITOR LOG
     */
    const { error } = await supabase.from("site_visitors").insert({
      ip_address: ip,
      country,
      city,
      device,
      browser,
      current_page: page || "/",
      referrer: referrer || null,
      session_id: sessionId || null,
    });

    if (error) {
      console.error("DB insert error:", error);
      return new Response(
        JSON.stringify({ error: "Database insert failed" }),
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
    console.error("track-visitor error:", err);

    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});