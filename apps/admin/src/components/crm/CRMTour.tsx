/**
 * CRMTour — Role-aware guided tour for the ECOWAS Parliament Initiatives CRM.
 */

import { useEffect, useCallback, useRef } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CRMTourProps {
  onNavigate: (section: string) => void;
  autoStart?: boolean;
}

// ── Step definitions ───────────────────────────────────────────────
interface TourStep {
  attachTo?: string;
  title: string;
  text: string;
  roles?: string[];
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** If set, the CRM navigates to this section before this step is shown. */
  navigateTo?: string;
}

const STEPS: TourStep[] = [
  {
    title: "Welcome to the ECOWAS Parliament Initiatives CRM 🌍",
    text: "This guided tour introduces your workspace. Use the buttons below to move through each step.",
    placement: "center",
  },
  {
    attachTo: "#crm-sidebar",
    title: "Navigation Sidebar",
    text: "Access all CRM modules from here. Click any item to jump to that section.",
    placement: "right",
  },
  {
    attachTo: "#crm-topbar-notifications",
    title: "Notifications",
    text: "Real-time alerts for messages, tasks, events, and applications appear here.",
    placement: "bottom",
  },
  {
    attachTo: "#crm-topbar-user",
    title: "Your Profile",
    text: "Manage your account, view your role, and sign out from this menu.",
    placement: "bottom",
  },
  {
    attachTo: '[data-tour="dashboard"]',
    title: "Dashboard",
    text: "View key metrics and quick-navigation tiles for your most-used sections.",
    roles: ["super_admin", "admin", "moderator", "project_director", "programme_lead"],
    navigateTo: "dashboard",
  },
  {
    attachTo: '[data-tour="email-inbox"]',
    title: "Email Inbox",
    text: "Send and receive messages with your team directly inside the CRM.",
    navigateTo: "email-inbox",
  },
  {
    title: "You're all set! 🎉",
    text: "You can restart this tour any time by clicking the <strong>?</strong> icon in the top bar.",
    placement: "center",
  },
];

const TOUR_DONE_KEY = "crm_tour_done_v1";

// Silently remove event listeners and hide the tour without triggering
// "complete" or "cancel" callbacks — used when starting a fresh tour over
// an existing one so no spurious toasts fire.
function destroyTourSilently(tour: InstanceType<typeof Shepherd.Tour>) {
  try {
    tour.off("complete");
    tour.off("cancel");
    if (tour.isActive()) tour.hide();
  } catch { /* ignore */ }
}

// ── Hook ───────────────────────────────────────────────────────────
export function useCRMTour(onNavigate: (s: string) => void) {
  const { roles } = useAuthContext();
  const { toast } = useToast();
  const tourRef = useRef<InstanceType<typeof Shepherd.Tour> | null>(null);

  const startTour = useCallback(() => {
    if (typeof window === "undefined") return;

    // Silently close any running tour before starting a new one.
    if (tourRef.current) {
      destroyTourSilently(tourRef.current);
      tourRef.current = null;
    }

    // Filter steps by role
    const filteredSteps = STEPS.filter(
      (step) => !step.roles || step.roles.some((r) => roles.includes(r as any))
    );
    const total = filteredSteps.length;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: "crm-shepherd-step",
        scrollTo: { behavior: "smooth", block: "center" },
      },
    });

    tourRef.current = tour;

    const getPlacement = (
      placement?: TourStep["placement"]
    ): "top" | "bottom" | "left" | "right" | undefined => {
      if (!placement || placement === "center") return undefined;
      return placement;
    };

    filteredSteps.forEach((step, idx) => {
      const isLast  = idx === total - 1;
      const isFirst = idx === 0;
      const isCenter = step.placement === "center";

      // Step counter rendered as HTML inside the step body
      const textWithCounter =
        `<span class="crm-tour-counter">${idx + 1} / ${total}</span>` +
        step.text;

      const buttons: Shepherd.Step.StepOptionsButton[] = [];

      if (!isFirst) {
        buttons.push({
          text: "← Back",
          secondary: true,
          action: tour.back,
        });
      }

      buttons.push({
        text: isLast ? "Finish ✓" : "Next →",
        action: () => {
          if (isLast) {
            tour.complete();
            localStorage.setItem(TOUR_DONE_KEY, "1");
          } else {
            const next = filteredSteps[idx + 1];
            if (next?.navigateTo) {
              // Navigate first, then advance the tour once the new section has
              // had time to mount its DOM elements (sidebar links, etc.).
              onNavigate(next.navigateTo);
              setTimeout(() => {
                if (tour.isActive()) tour.next();
              }, 450);
            } else {
              tour.next();
            }
          }
        },
      });

      // NOTE: Do NOT call onNavigate() here during step registration.
      // The old code navigated for every step that had navigateTo during
      // tour initialisation, which immediately jumped the app to email-inbox
      // before the tour popup even appeared.

      tour.addStep({
        id: `step-${idx}`,
        title: step.title,
        text: textWithCounter,
        attachTo:
          step.attachTo && !isCenter
            ? {
                element: step.attachTo,
                on: getPlacement(step.placement) ?? "bottom",
              }
            : undefined,
        buttons,
      });
    });

    tour.on("complete", () => {
      toast({
        title: "Tour complete 🎉",
        description: "You can restart it anytime via the ? button.",
      });
    });

    tour.on("cancel", () => {
      localStorage.setItem(TOUR_DONE_KEY, "1");
    });

    tour.start();
  }, [roles, onNavigate, toast]);

  return { startTour };
}

// ── Auto-start wrapper ─────────────────────────────────────────────
export default function CRMTour({
  onNavigate,
  autoStart = false,
}: CRMTourProps) {
  const { startTour } = useCRMTour(onNavigate);

  useEffect(() => {
    if (!autoStart) return;
    const done = localStorage.getItem(TOUR_DONE_KEY);
    if (done) return;
    const t = setTimeout(() => startTour(), 1200);
    return () => clearTimeout(t);
  }, [autoStart, startTour]);

  return null;
}
