import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Loads the saved favicon URL from site_settings and applies it to the document.
 * Falls back to the default /images/logo/logo.png set in index.html.
 */
export function useFavicon() {
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "site_favicon_url")
          .maybeSingle();
        if (data?.value) {
          const url = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          if (url && typeof url === "string" && url.trim()) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement("link");
              link.rel = "icon";
              document.head.appendChild(link);
            }
            link.href = url;
          }
        }
      } catch {
        // silently use default favicon
      }
    })();
  }, []);
}
