import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * notify-upcoming-events
 *
 * Intended to be called on a pg_cron schedule (every hour).
 * Finds calendar events starting between 23 and 25 hours from now,
 * then calls send-notification for each event creator who has
 * notify_event_remind enabled and a notification_email set.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceClient = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
    const windowEnd   = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

    // Fetch events starting within the 23–25 hour window
    const { data: events, error } = await serviceClient
      .from("crm_calendar_events")
      .select("id, title, start_time, created_by")
      .gte("start_time", windowStart)
      .lte("start_time", windowEnd)
      .not("created_by", "is", null);

    if (error) throw error;

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No upcoming events in window" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let skipped = 0;

    for (const event of events) {
      const payload = {
        event_title: event.title,
        event_date: new Date(event.start_time).toLocaleString("en-GB", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
      };

      // Delegate to send-notification (it handles pref checks + email delivery)
      const res = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          user_id: event.created_by,
          type: "upcoming_event",
          payload,
        }),
      });

      const result = await res.json();
      if (result.success) sent++;
      else skipped++;
    }

    return new Response(JSON.stringify({ sent, skipped, total: events.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("notify-upcoming-events error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
