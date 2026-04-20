import { ReactNode, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNotifications } from "../CRMNotifications";
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

// Modules with full-height drag surfaces — hide FAB to avoid overlap
const FAB_HIDDEN_SECTIONS = new Set(["cms", "tasks", "email-inbox", "comms"]);

// Modules that need edge-to-edge width (no horizontal padding)
const EDGE_TO_EDGE_SECTIONS = new Set(["cms", "tasks", "email-inbox", "comms", "calendar"]);

export default function MobileCRMLayout({ activeSection, onNavigate, children }: MobileCRMLayoutProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { roles, signOut } = useAuthContext();

  // Single source of truth for notifications — shared with TopBar bell and bottom nav badge
  const { data: notifData } = useNotifications();
  const readIds = notifData?.readIds ?? new Set<string>();
  const unreadMessages = (notifData?.items ?? []).filter(n => !readIds.has(n.id) && n.type === "message").length;

  const showFAB = !FAB_HIDDEN_SECTIONS.has(activeSection);

  return (
    <div
      className="flex flex-col bg-crm text-crm-text overflow-hidden"
      style={{ height: "100svh", minHeight: "-webkit-fill-available", maxHeight: "-webkit-fill-available" }}
    >
      {/* Animated gradient accent — 3px top edge */}
      <div className="h-[3px] flex-shrink-0 bg-gradient-to-r from-primary via-emerald-400 to-primary/40 animate-gradient-shift" />

      {/* Top bar */}
      <MobileTopBar activeSection={activeSection} onNavigate={onNavigate} />

      {/* Scrollable module content */}
      <main
        className={`flex-1 overflow-y-auto overscroll-contain relative ${EDGE_TO_EDGE_SECTIONS.has(activeSection) ? "" : "px-4 pt-3"}`}
        style={{
          paddingBottom: "calc(64px + env(safe-area-inset-bottom, 8px))",
          backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div key={activeSection} className="animate-fade-in relative z-10 w-full min-h-0">
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
        unreadMessages={unreadMessages}
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

      <CRMTour onNavigate={onNavigate} autoStart />
    </div>
  );
}