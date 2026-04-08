import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const HEARTBEAT_INTERVAL = 60_000; // 60 seconds

export function usePresence(userId: string | undefined) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const upsertPresence = async (online: boolean) => {
      await (supabase as any).from("user_presence").upsert(
        { user_id: userId, is_online: online, last_seen_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    };

    // Go online
    upsertPresence(true);

    // Heartbeat
    intervalRef.current = setInterval(() => upsertPresence(true), HEARTBEAT_INTERVAL);

    // Go offline on page unload
    const handleUnload = () => {
      // Use sendBeacon for reliability
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      if (projectId) {
        // Can't use supabase client in beforeunload reliably, use sendBeacon with REST API
        const url = `https://${projectId}.supabase.co/rest/v1/user_presence?user_id=eq.${userId}`;
        const body = JSON.stringify({ is_online: false, last_seen_at: new Date().toISOString() });
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        navigator.sendBeacon(
          url,
          new Blob([body], { type: "application/json" })
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleUnload);
      // Set offline on cleanup
      upsertPresence(false);
    };
  }, [userId]);
}
