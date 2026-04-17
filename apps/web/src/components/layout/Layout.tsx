import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import { generateId } from "@/utils/id";
import Footer from "./Footer";

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

    // Fire-and-forget beacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    } else {
      fetch(url, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, []);
}

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useVisitorTracker();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
