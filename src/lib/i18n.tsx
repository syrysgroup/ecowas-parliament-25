import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { en } from "./translations/en";
import { fr } from "./translations/fr";
import { pt } from "./translations/pt";

export type Locale = "en" | "fr" | "pt";

const translations: Record<Locale, Record<string, string>> = { en, fr, pt };

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

function detectBrowserLocale(): Locale {
  const lang = (navigator.language || "").toLowerCase();
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("pt")) return "pt";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem("preferredLanguage");
    if (stored === "en" || stored === "fr" || stored === "pt") return stored;
    return detectBrowserLocale();
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const changeLocale = useCallback((l: Locale) => {
    setLocale(l);
    localStorage.setItem("preferredLanguage", l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let str = translations[locale]?.[key] ?? translations.en[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return str;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

// Locale-aware formatters
const localeMap: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", pt: "pt-PT" };

export function formatDate(date: Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(localeMap[locale], options ?? { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function formatNumber(num: number, locale: Locale): string {
  return new Intl.NumberFormat(localeMap[locale]).format(num);
}
