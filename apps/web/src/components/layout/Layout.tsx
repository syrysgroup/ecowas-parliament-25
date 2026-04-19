import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import { generateId } from "@/utils/id";
import Footer from "./Footer";
import { SEOHead, GoogleAnalyticsHead } from "@/components/SEOHead";

// Lightweight visitor tracker
function useVisitorTracker() {
  useEffect(() => {
    const sessionId = sessionStorage.getItem("_vid") || generateId();
    sessionStorage.setItem("_vid", sessionId);

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    if (!projectId) return;

    const url = `https://${projectId}.supabase.co/functions/v1/track-visitor`;
    const body = JSON.stringify({
      page: window.location.pathname,
      referrer: document.referrer || null,
      sessionId,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    } else {
      fetch(url, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, []);
}

interface LayoutProps {
  children: ReactNode;
  pagePath?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoOgImage?: string;
  schemaType?: "WebPage" | "Event" | "Organization" | "Article";
  schemaData?: Record<string, unknown>;
}

const Layout = ({ children, pagePath, seoTitle, seoDescription, seoOgImage, schemaType, schemaData }: LayoutProps) => {
  useVisitorTracker();

  return (
    <div className="min-h-screen flex flex-col">
      <GoogleAnalyticsHead />
      <SEOHead
        pagePath={pagePath ?? (typeof window !== "undefined" ? window.location.pathname : undefined)}
        title={seoTitle}
        description={seoDescription}
        ogImage={seoOgImage}
        schemaType={schemaType}
        schemaData={schemaData}
      />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
