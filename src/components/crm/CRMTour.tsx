/**
 * CRMTour — Role-aware guided tour for the ECOWAS Parliament CRM.
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
  navigateTo?: string;
}

const STEPS: TourStep[] = [
  {
    title: "Welcome to the ECOWAS Parliament CRM 🌍",
    text: "This guided tour introduces your workspace.",
    placement: "center",
  },
  {
    attachTo: "#crm-sidebar",
    title: "Navigation Sidebar",
    text: "Access all modules here.",
    placement: "right",
  },
  {
    attachTo: "#crm-topbar-notifications",
    title: "Notifications",
    text: "Real-time alerts appear here.",
    placement: "bottom",
  },
  {
    attachTo: "#crm-topbar-user",
    title: "Your Profile",
    text: "Manage your account here.",
    placement: "bottom",
  },
  {
    attachTo: '[data-tour="dashboard"]',
    title: "Dashboard",
    text: "View key metrics here.",
    roles: ["super_admin", "admin", "moderator", "project_director", "programme_lead"],
    navigateTo: "dashboard",
  },
  {
    attachTo: '[data-tour="email-inbox"]',
    title: "Email Inbox",
    text: "Manage emails here.",
    navigateTo: "email-inbox",
  },
  {
    title: "You're all set! 🎉",
    text: "You can restart this tour anytime.",
    placement: "center",
  },
];

const TOUR_DONE_KEY = "crm_tour_done_v1";

// ── Hook ───────────────────────────────────────────────────────────
export function useCRMTour(onNavigate: (s: string) => void) {
  const { roles } = useAuthContext();
  const { toast } = useToast();
  const tourRef = useRef<InstanceType<typeof Shepherd.Tour> | null>(null);

  const startTour = useCallback(() => {
    if (typeof window === "undefined") return;

    // Filter steps by role
    const filteredSteps = STEPS.filter(
      (step) => !step.roles || step.roles.some((r) => roles.includes(r as any))
    );

    // Destroy previous tour if exists
    if (tourRef.current) {
      try {
        tourRef.current.complete();
      } catch {}
    }

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
      const isLast = idx === filteredSteps.length - 1;
      const isFirst = idx === 0;
      const isCenter = step.placement === "center";

      const buttons: any[] = [];

      if (!isFirst) {
        buttons.push({
          text: "Back",
          action: tour.back,
        });
      }

      buttons.push({
        text: isLast ? "Finish" : "Next",
        action: () => {
          if (isLast) {
            tour.complete();
            localStorage.setItem(TOUR_DONE_KEY, "1");
          } else {
            const next = filteredSteps[idx + 1];

            if (next?.navigateTo) {
              onNavigate(next.navigateTo);
              setTimeout(() => tour.next(), 300);
            } else {
              tour.next();
            }
          }
        },
      });

      // Navigate if needed
      if (step.navigateTo) {
        onNavigate(step.navigateTo);
      }

      tour.addStep({
        id: `step-${idx}`,
        title: step.title,
        text: step.text,

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
        description: "You can restart it anytime.",
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