import type { AppRole } from "@/contexts/AuthContext";
import { useMobileSections } from "./useMobileSections";

interface MobileBottomNavProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  roles: AppRole[];
  onMoreOpen: () => void;
  unreadMessages?: number;
}

export default function MobileBottomNav({
  activeSection, onNavigate, roles, onMoreOpen, unreadMessages = 0,
}: MobileBottomNavProps) {
  const tabs = useMobileSections(roles);

  const primarySections = tabs.filter(t => t.section !== null).map(t => t.section as string);
  const isMoreActive = activeSection !== "" && !primarySections.includes(activeSection);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-crm-card/98 backdrop-blur-xl border-t border-crm-border/50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch h-16">
        {tabs.map(tab => {
          const isActive = tab.section !== null
            ? activeSection === tab.section
            : isMoreActive;
          const Icon = tab.icon;
          const badge = tab.id === "messages" ? unreadMessages : 0;

          return (
            <button
              key={tab.id}
              onClick={() => tab.section !== null ? onNavigate(tab.section) : onMoreOpen()}
              className={`
                relative flex-1 flex flex-col items-center justify-center gap-0.5
                min-h-[44px] transition-colors duration-150 group select-none
                ${isActive ? "text-[hsl(var(--ecowas-green))]" : "text-crm-text-dim"}
              `}
              aria-label={tab.label}
            >
              {isActive && (
                <span className="absolute inset-x-3 top-0 h-0.5 rounded-b-full bg-[hsl(var(--ecowas-green))] animate-tab-pop" />
              )}

              <Icon
                size={22}
                className={`transition-transform duration-150 ${isActive ? "scale-110" : "group-active:scale-95"}`}
                strokeWidth={isActive ? 2.5 : 1.75}
              />

              <span className={`text-[10px] leading-none transition-opacity ${isActive ? "opacity-100 font-semibold" : "opacity-50 font-medium"}`}>
                {tab.label}
              </span>

              {badge > 0 && (
                <span className="absolute top-1.5 left-1/2 translate-x-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center animate-bounce-in">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
