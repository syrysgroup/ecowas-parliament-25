import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type SettingsRecord = Record<string, any>;

interface GlobalSettingsContextValue {
  settings: SettingsRecord;
  loading: boolean;
  updateSetting: (key: string, value: any) => Promise<void>;
}

const GlobalSettingsContext = createContext<GlobalSettingsContextValue>({
  settings: {},
  loading: true,
  updateSetting: async () => {},
});

export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsRecord>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("global_settings")
      .select("key, value");
    if (!error && data) {
      const mapped: SettingsRecord = {};
      data.forEach((row: { key: string; value: any }) => {
        mapped[row.key] = row.value;
      });
      setSettings(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("global_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "global_settings" },
        () => { fetchSettings(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const updateSetting = useCallback(async (key: string, value: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("global_settings")
      .upsert({ key, value, updated_by: user?.id, updated_at: new Date().toISOString() }, { onConflict: "key" });

    // Log audit action
    await supabase.from("admin_audit_log").insert({
      action: `updated_setting:${key}`,
      performed_by: user?.id,
      details: { key, value },
    });

    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <GlobalSettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export const useGlobalSettings = () => useContext(GlobalSettingsContext);
