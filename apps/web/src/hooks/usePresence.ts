import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://xahuyraommtfopnxrjvz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaHV5cmFvbW10Zm9wbnhyanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzcxOTYsImV4cCI6MjA4ODcxMzE5Nn0.bswCT9P_jsg37mGLuduBx8ZeB6Rjv_VBs9EkzNGOVVU";

const HEARTBEAT_INTERVAL = 60_000; // 60 seconds

export function usePresence(userId: string | undefined) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const upsertPresence = async (online: boolean) => {
      try {
        await (supabase as any).from("user_presence").upsert(
          { user_id: userId, is_online: online, last_seen_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      } catch {
        // Silently ignore presence errors — not critical
      }
    };

    // Go online
    upsertPresence(true);

    // Heartbeat
    intervalRef.current = setInterval(() => upsertPresence(true), HEARTBEAT_INTERVAL);

    // Go offline on page unload — use fetch with keepalive so headers can be attached
    const handleUnload = () => {
      // Read the current access token synchronously from localStorage
      let accessToken: string | null = null;
      try {
        const raw = localStorage.getItem(
          `sb-xahuyraommtfopnxrjvz-auth-token`
        );
        if (raw) {
          const parsed = JSON.parse(raw);
          accessToken = parsed?.access_token ?? null;
        }
      } catch {
        // ignore parse errors
      }

      // keepalive: true ensures the request completes even if the page is unloading
      fetch(
        `${SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${userId}`,
        {
          method: "PATCH",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            ...(accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }),
          },
          body: JSON.stringify({
            is_online: false,
            last_seen_at: new Date().toISOString(),
          }),
        }
      ).catch(() => {/* best-effort */});
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleUnload);
      // Set offline on cleanup (component unmount / user logs out)
      upsertPresence(false);
    };
  }, [userId]);
}
