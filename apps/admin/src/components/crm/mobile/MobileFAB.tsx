import React, { useState } from "react";
import { Plus, CheckSquare, Calendar, MessageSquare, Pencil } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FABAction {
  icon: LucideIcon;
  label: string;
  section: string;
}

const FAB_ACTIONS: Record<string, FABAction[]> = {
  "": [
    { icon: CheckSquare,   label: "New Task",    section: "tasks"    },
    { icon: Calendar,      label: "New Event",   section: "calendar" },
    { icon: MessageSquare, label: "New Chat",    section: "comms"    },
  ],
  "tasks": [
    { icon: CheckSquare, label: "Task Board", section: "tasks" },
  ],
  "comms": [
    { icon: Pencil, label: "New Message", section: "comms" },
  ],
  "calendar": [
    { icon: Calendar, label: "Calendar",  section: "calendar" },
  ],
};

interface MobileFABProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function MobileFAB({ activeSection, onNavigate }: MobileFABProps) {
  const [expanded, setExpanded] = useState(false);
  const actions = FAB_ACTIONS[activeSection] ?? FAB_ACTIONS[""];

  const handleAction = (section: string) => {
    setExpanded(false);
    onNavigate(section);
  };

  return (
    <>
      {/* Backdrop when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setExpanded(false)}
        />
      )}

      <div className="fixed bottom-20 right-4 z-40 flex flex-col-reverse items-end gap-2">
        {/* Mini action buttons */}
        {expanded && actions.map((act, i) => (
          <div
            key={act.label}
            className="flex items-center gap-2 animate-slide-up"
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
          >
            <span className="text-[11px] font-medium bg-crm-card border border-crm-border rounded-full px-2.5 py-1 shadow-lg text-crm-text whitespace-nowrap">
              {act.label}
            </span>
            <button
              onClick={() => handleAction(act.section)}
              className="w-10 h-10 rounded-full bg-crm-surface border border-crm-border shadow-lg flex items-center justify-center text-crm-text-muted hover:text-crm-text transition-colors active:scale-90"
            >
              <act.icon size={17} />
            </button>
          </div>
        ))}

        {/* Primary FAB */}
        <button
          onClick={() => setExpanded(v => !v)}
          className={`
            w-14 h-14 rounded-full shadow-xl flex items-center justify-center
            transition-all duration-200 active:scale-90
            ${expanded
              ? "bg-crm-surface border-2 border-[hsl(var(--ecowas-green))] text-[hsl(var(--ecowas-green))] rotate-45"
              : "bg-[hsl(var(--ecowas-green))] text-white"
            }
          `}
          style={{
            boxShadow: expanded
              ? "0 4px 20px hsl(var(--ecowas-green) / 0.3)"
              : "0 6px 24px hsl(var(--ecowas-green) / 0.5)",
          }}
          aria-label={expanded ? "Close quick actions" : "Quick actions"}
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
}
