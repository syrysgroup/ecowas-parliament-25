/**
 * CRMTour — Role-aware guided tour for the ECOWAS Parliament CRM.
 *
 * Uses Shepherd.js (loaded from CDN via useEffect).
 * Steps are filtered by the user's roles so sponsors see different
 * steps than admins.
 *
 * Usage:
 *   <CRMTour onNavigate={onNavigate} />
 *   or programmatically: startTour()
 */

import { useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CRMTourProps {
  onNavigate: (section: string) => void;
  /** Auto-start the tour on first login (checks localStorage) */
  autoStart?: boolean;
}

// ── Step definitions ──────────────────────────────────────────────────────────
interface TourStep {
  /** CSS selector or element ID to attach to */
  attachTo?: string;
  title: string;
  text: string;
  /** Roles that should see this step (empty = all roles) */
  roles?: string[];
  /** Side to attach the popover */
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** Navigate to a section before showing this step */
  navigateTo?: string;
}

const STEPS: TourStep[] = [
  {
    title: "Welcome to the ECOWAS Parliament CRM 🌍",
    text: "This guided tour will walk you through the key features of your workspace. It takes about 2 minutes. You can skip at any time.",
    placement: "center",
  },
  {
    attachTo: "#crm-sidebar",
    title: "Navigation Sidebar",
    text: "The sidebar gives you access to all modules. Modules available to you depend on your role. Click any item to navigate.",
    placement: "right",
  },
  {
    attachTo: "#crm-topbar-notifications",
    title: "Notifications",
    text: "Get real-time alerts for new emails, tasks, events and pending applications — all in one place.",
    placement: "bottom",
  },
  {
    attachTo: "#crm-topbar-user",
    title: "Your Profile",
    text: "Click your avatar to view your profile, change your password, or sign out.",
    placement: "bottom",
  },
  {
    attachTo: '[data-tour="dashboard"]',
    title: "Dashboard",
    text: "The dashboard gives you a snapshot of key metrics — registrations, active events, revenue and country coverage.",
    roles: ["super_admin", "admin", "moderator", "project_director", "programme_lead"],
    navigateTo: "dashboard",
  },
  {
    attachTo: '[data-tour="email-inbox"]',
    title: "Email Inbox",
    text: "Send and receive emails using your ECOWAS Parliament email account. Replies, attachments and signatures all work directly here.",
    navigateTo: "email-inbox",
  },
  {
    attachTo: '[data-tour="calendar"]',
    title: "Calendar",
    text: "All published events are automatically added to your calendar. You can also add personal events or global events visible to your whole team.",
    roles: ["super_admin", "admin", "moderator", "project_director", "programme_lead", "communications_officer"],
    navigateTo: "calendar",
  },
  {
    attachTo: '[data-tour="tasks"]',
    title: "Tasks",
    text: "Create and assign tasks to team members. Track progress with a Kanban-style board.",
    roles: ["super_admin", "admin", "moderator", "project_director", "programme_lead"],
    navigateTo: "tasks",
  },
  {
    attachTo: '[data-tour="people"]',
    title: "People & Team",
    text: "Manage team members, view profiles, upload photos and assign roles from here.",
    roles: ["super_admin", "admin"],
    navigateTo: "people",
  },
  {
    attachTo: '[data-tour="stakeholders"]',
    title: "Stakeholder Profiles",
    text: "Add and manage leadership, team and advisory profiles that appear on the public-facing Stakeholders page.",
    roles: ["super_admin", "admin", "moderator"],
    navigateTo: "stakeholders",
  },
  {
    attachTo: '[data-tour="sponsors-manager"]',
    title: "Sponsors & Partners",
    text: "Manage all sponsors and implementing partners. Logos display boldly on the public site — upload or paste a URL.",
    roles: ["super_admin", "admin", "sponsor_manager"],
    navigateTo: "sponsors-manager",
  },
  {
    attachTo: '[data-tour="sponsor-metrics"]',
    title: "Sponsor Metrics",
    text: "View your visibility data, engagement reports and brand exposure across all programme pillars.",
    roles: ["sponsor"],
    navigateTo: "sponsor-metrics",
  },
  {
    attachTo: '[data-tour="settings"]',
    title: "Settings & Configuration",
    text: "Administrators can configure email accounts, branding, user permissions, and site content from Settings.",
    roles: ["super_admin", "admin"],
    navigateTo: "settings",
  },
  {
    title: "You're all set! 🎉",
    text: "Explore your workspace. You can restart this tour at any time from the Help menu in the top bar.",
    placement: "center",
  },
];

const TOUR_DONE_KEY = "crm_tour_done_v1";

// ── Shepherd loader ───────────────────────────────────────────────────────────
let shepherdLoaded = false;

async function loadShepherd(): Promise<void> {
  if (shepherdLoaded || typeof window === "undefined") return;
  if ((window as any).Shepherd) { shepherdLoaded = true; return; }

  // Load CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdnjs.cloudflare.com/ajax/libs/shepherd.js/11.2.0/css/shepherd.min.css";
  document.head.appendChild(link);

  // Load JS
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/shepherd.js/11.2.0/shepherd.min.js";
    script.onload = () => { shepherdLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCRMTour(onNavigate: (s: string) => void) {
  const { roles } = useAuthContext();
  const { toast } = useToast();
  const tourRef = useRef<any>(null);

  const startTour = useCallback(async () => {
    await loadShepherd();
    const Shepherd = (window as any).Shepherd;
    if (!Shepherd) {
      toast({ title: "Tour unavailable", description: "Could not load tour library.", variant: "destructive" });
      return;
    }

    // Destroy any existing tour
    if (tourRef.current) {
      try { tourRef.current.complete(); } catch { /**/ }
    }

    // Filter steps by role
    const filteredSteps = STEPS.filter(step =>
      !step.roles || step.roles.some(r => roles.includes(r as any))
    );

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: "crm-shepherd-step",
        scrollTo: { behavior: "smooth", block: "center" },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
      },
    });

    tourRef.current = tour;

    filteredSteps.forEach((step, idx) => {
      const isLast = idx === filteredSteps.length - 1;
      const isFirst = idx === 0;

      const buttons = [];
      if (!isFirst) {
        buttons.push({
          text: "← Back",
          classes: "shepherd-button shepherd-button-secondary",
          action() { tour.back(); },
        });
      }
      buttons.push({
        text: isLast ? "Finish Tour" : "Next →",
        classes: "shepherd-button shepherd-button-primary",
        action() {
          if (isLast) {
            tour.complete();
            localStorage.setItem(TOUR_DONE_KEY, "1");
          } else {
            // Navigate first, then advance
            const nextStep = filteredSteps[idx + 1];
            if (nextStep?.navigateTo) {
              onNavigate(nextStep.navigateTo);
              setTimeout(() => tour.next(), 300);
            } else {
              tour.next();
            }
          }
        },
      });

      // Navigate if this step needs it
      if (step.navigateTo) {
        onNavigate(step.navigateTo);
      }

      tour.addStep({
        id: `step-${idx}`,
        title: `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <span>${step.title}</span>
            <span style="font-size:10px;font-weight:600;opacity:0.4;font-family:monospace">${idx + 1}/${filteredSteps.length}</span>
          </div>`,
        text: step.text,
        attachTo: step.attachTo
          ? { element: step.attachTo, on: step.placement ?? "bottom" }
          : undefined,
        buttons,
        floatingUIOptions: step.placement === "center"
          ? { middleware: [] }
          : undefined,
      });
    });

    tour.on("complete", () => {
      toast({ title: "Tour complete! 🎉", description: "You can restart the tour from Help any time." });
    });
    tour.on("cancel", () => {
      localStorage.setItem(TOUR_DONE_KEY, "1");
    });

    tour.start();
  }, [roles, onNavigate, toast]);

  return { startTour };
}

// ── Auto-start wrapper ────────────────────────────────────────────────────────
export default function CRMTour({ onNavigate, autoStart = false }: CRMTourProps) {
  const { startTour } = useCRMTour(onNavigate);

  useEffect(() => {
    if (!autoStart) return;
    const done = localStorage.getItem(TOUR_DONE_KEY);
    if (done) return;
    // Delay so the CRM layout has fully mounted
    const t = setTimeout(() => startTour(), 1500);
    return () => clearTimeout(t);
  }, [autoStart, startTour]);

  return null; // renderless — call startTour() imperatively
}
