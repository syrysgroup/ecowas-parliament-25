import React, { ReactNode, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import CRMTour from "../CRMTour";
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";
import MobileMoreDrawer from "./MobileMoreDrawer";
import MobileFAB from "./MobileFAB";

interface MobileCRMLayoutProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  children: ReactNode;
}

// Modules that use a full-height drag surface — hide FAB to avoid overlap
const FAB_HIDDEN_SECTIONS = new Set(["cms", "tasks", "email-inbox", "comms"]);

export default function MobileCRMLayout({ activeSection, onNavigate, children }: MobileCRMLayoutProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { roles, signOut } = useAuthContext();
  const showFAB = !FAB_HIDDEN_SECTIONS.has(activeSection);

  return (
    <div
      className="flex flex-col bg-crm text-crm-text overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* Animated gradient accent — 3px top edge */}
      <div className="h-[3px] flex-shrink-0 bg-gradient-to-r from-primary via-emerald-400 to-primary/40 animate-gradient-shift" />

      {/* Top bar */}
      <MobileTopBar activeSection={activeSection} onNavigate={onNavigate} />

      {/* Scrollable module content */}
      <main
        className="flex-1 overflow-y-auto overscroll-contain relative"
        style={{
          paddingBottom: "calc(64px + env(safe-area-inset-bottom, 8px))",
          backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          key={activeSection}
          className="animate-fade-in relative z-10 w-full min-h-full"
        >
          {children}
        </div>
      </main>

      {/* FAB — above content, below bottom nav */}
      {showFAB && (
        <MobileFAB activeSection={activeSection} onNavigate={onNavigate} />
      )}

      {/* Bottom navigation */}
      <MobileBottomNav
        activeSection={activeSection}
        onNavigate={onNavigate}
        roles={roles}
        onMoreOpen={() => setMoreOpen(true)}
      />

      {/* More drawer */}
      <MobileMoreDrawer
        open={moreOpen}
        onOpenChange={setMoreOpen}
        activeSection={activeSection}
        onNavigate={onNavigate}
        roles={roles}
        onSignOut={signOut}
      />

      {/* CRM Tour */}
      <CRMTour onNavigate={onNavigate} autoStart />
    </div>
  );
}
