import { useState, useEffect } from "react";
import { Cookie, X, ShieldCheck } from "lucide-react";

const CONSENT_KEY = "ecowas_cookie_consent";

type ConsentState = "accepted" | "declined" | null;

export function CookieConsent() {
  const [state, setState] = useState<ConsentState>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentState | null;
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
    setState(stored);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setState("accepted");
    setVisible(false);
    // Signal consent to GA if loaded
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
      });
    }
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setState("declined");
    setVisible(false);
  };

  if (!visible || state !== null) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[9999] animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
            <Cookie size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">We use cookies</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              We use analytics cookies to improve your experience and understand how our site is used.
              No personal data is sold or shared.
            </p>
          </div>
          <button
            onClick={decline}
            className="text-zinc-400 hover:text-zinc-600 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={accept}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-semibold transition-colors"
          >
            <ShieldCheck size={12} />
            Accept
          </button>
          <button
            onClick={decline}
            className="flex-1 py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[12px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Decline
          </button>
        </div>

        <a
          href="/privacy"
          className="block text-center text-[10px] text-zinc-400 hover:text-emerald-600 transition-colors mt-2.5"
        >
          Read our Privacy Policy →
        </a>
      </div>
    </div>
  );
}
