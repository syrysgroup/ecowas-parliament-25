import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Find published content from the past 7 days that hasn't had a weekly-digest send
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentContent, error: fetchErr } = await serviceClient
      .from("parliament_content")
      .select("id, title, whatsapp_en, whatsapp_fr, whatsapp_pt, telegram_en")
      .eq("status", "published")
      .gte("published_at", sevenDaysAgo)
      .order("published_at", { ascending: false })
      .limit(10);

    if (fetchErr) throw fetchErr;
    if (!recentContent?.length) {
      return new Response(JSON.stringify({ queued: 0, message: "No published content this week" }), { headers: corsHeaders });
    }

    // Queue WhatsApp + Telegram sends for each piece of content × each language
    const PLATFORMS = [
      { platform: "whatsapp", languages: ["en", "fr", "pt"] },
      { platform: "telegram", languages: ["en", "fr", "pt"] },
    ];

    const queueItems: Array<{
      content_id: string;
      platform: string;
      language: string;
      payload: object;
      scheduled_at: string;
    }> = [];

    // Stagger sends: 30-second intervals to avoid rate limits
    let offset = 0;
    for (const content of recentContent) {
      for (const { platform, languages } of PLATFORMS) {
        for (const lang of languages) {
          // Skip if no content for this language
          const hasContent = platform === "whatsapp"
            ? !!(lang === "en" ? content.whatsapp_en : lang === "fr" ? content.whatsapp_fr : content.whatsapp_pt)
            : !!content.telegram_en;

          if (!hasContent) continue;

          queueItems.push({
            content_id: content.id,
            platform,
            language: lang,
            payload: { template_name: "WEEKLY_DIGEST", title: content.title },
            scheduled_at: new Date(Date.now() + offset * 30 * 1000).toISOString(),
          });
          offset++;
        }
      }
    }

    if (!queueItems.length) {
      return new Response(JSON.stringify({ queued: 0, message: "No sendable content found" }), { headers: corsHeaders });
    }

    const { error: insertErr } = await serviceClient
      .from("message_queue")
      .insert(queueItems);

    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({ queued: queueItems.length, content_items: recentContent.length }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("weekly-digest error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
