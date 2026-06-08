import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronsLeft, ChevronsRight, Pin, Search } from "lucide-react";
import { CRM_MODULES, MODULE_GROUPS, getModulesForRoles, type ModuleGroup } from "@/components/crm/crmModules";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const PIN_KEY = "shellv2:pinned";
const COLLAPSED_KEY = "shellv2:collapsed";

function loadPinned(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(PIN_KEY) || "[]")); } catch { return new Set(); }
}

export default function ModuleSidebar({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate: (section: string) => void;
}) {
  const { roles } = useAuthContext();
  const modules = useMemo(() => getModulesForRoles(roles).filter(m => !m.hideFromSidebar), [roles]);
  const [filter, setFilter] = useState("");
  const [pinned, setPinned] = useState<Set<string>>(loadPinned);
  const [collapsed, setCollapsed] = useState<Set<ModuleGroup>>(new Set());
  const [railCollapsed, setRailCollapsed] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem(COLLAPSED_KEY) === "1",
  );

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, railCollapsed ? "1" : "0");
  }, [railCollapsed]);

  // Keyboard: [ toggles the rail
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "[" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setRailCollapsed(v => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const togglePin = (id: string) => {
    setPinned(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(PIN_KEY, JSON.stringify([...next]));
      return next;
    });
  };
  const toggleGroup = (g: ModuleGroup) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  };

  const q = filter.trim().toLowerCase();
  const matches = (label: string) => !q || label.toLowerCase().includes(q);

  const pinnedModules = modules.filter(m => pinned.has(m.id) && matches(m.label));

  return (
    <aside
      className={cn(
        "flex-shrink-0 h-full flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--border-subtle))] transition-[width] duration-150",
        railCollapsed ? "w-[56px]" : "w-[224px]",
      )}
    >
      {/* Brand */}
      <div className={cn("h-12 flex items-center gap-2.5 px-3 border-b border-[hsl(var(--border-subtle))]", railCollapsed && "justify-center px-0")}>
        <div
          className="h-6 w-6 rounded-md flex items-center justify-center text-white font-black text-[10px] tracking-tight flex-shrink-0"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          E
        </div>
        {!railCollapsed && (
          <div className="leading-tight min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-[hsl(var(--text-1))] truncate">ECOWAS Admin</p>
            <p className="text-[9px] uppercase tracking-widest text-[hsl(var(--text-3))]">Parliament @25</p>
          </div>
        )}
        {!railCollapsed && (
          <button
            onClick={() => setRailCollapsed(true)}
            className="h-6 w-6 rounded-md flex items-center justify-center text-[hsl(var(--text-3))] hover:bg-[hsl(var(--surface-3))] hover:text-[hsl(var(--text-1))]"
            title="Collapse sidebar (⌘[)"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Expand-from-rail button when collapsed */}
      {railCollapsed && (
        <button
          onClick={() => setRailCollapsed(false)}
          className="mx-auto mt-2 h-7 w-7 rounded-md flex items-center justify-center text-[hsl(var(--text-3))] hover:bg-[hsl(var(--surface-3))] hover:text-[hsl(var(--text-1))]"
          title="Expand sidebar (⌘[)"
          aria-label="Expand sidebar"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Search */}
      {!railCollapsed && (
        <div className="p-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[hsl(var(--text-3))]" />
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter modules…"
              className="w-full h-7 pl-7 pr-2 rounded-md bg-[hsl(var(--surface-3))] text-[12px] text-[hsl(var(--text-1))] placeholder:text-[hsl(var(--text-3))] outline-none border border-transparent focus:border-[hsl(var(--brand-green))] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Module list */}
      <nav className={cn("flex-1 overflow-y-auto crm-scroll pb-4", railCollapsed ? "px-1 pt-2 space-y-1" : "px-2 space-y-2")}>
        {pinnedModules.length > 0 && (
          <Group rail={railCollapsed} label="PINNED" collapsed={false} onToggle={() => {}} items={pinnedModules}
            active={activeSection} onPin={togglePin} pinned={pinned} onSelect={onNavigate} />
        )}
        {MODULE_GROUPS.map(g => {
          const items = modules.filter(m => m.group === g && matches(m.label));
          if (items.length === 0) return null;
          return (
            <Group key={g} rail={railCollapsed} label={g} collapsed={collapsed.has(g)} onToggle={() => toggleGroup(g)}
              items={items} active={activeSection} onPin={togglePin} pinned={pinned} onSelect={onNavigate} />
          );
        })}
      </nav>
    </aside>
  );
}

function Group({
  label, items, collapsed, onToggle, active, onSelect, onPin, pinned, rail,
}: {
  label: string;
  items: typeof CRM_MODULES;
  collapsed: boolean;
  onToggle: () => void;
  active: string;
  onSelect: (s: string) => void;
  onPin: (id: string) => void;
  pinned: Set<string>;
  rail: boolean;
}) {
  return (
    <div>
      {!rail && (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-2 py-1 text-[9.5px] font-semibold tracking-[0.12em] uppercase text-[hsl(var(--text-3))] hover:text-[hsl(var(--text-2))]"
        >
          <span>{label}</span>
          <ChevronDown className={cn("h-3 w-3 transition-transform", collapsed && "-rotate-90")} />
        </button>
      )}
      {(!collapsed || rail) && (
        <ul className={cn(rail ? "space-y-1" : "mt-0.5 space-y-0.5")}>
          {items.map(m => {
            const Icon = m.icon;
            const isActive = active === m.section;
            return (
              <li key={m.id} className="group relative">
                <button
                  onClick={() => onSelect(m.section)}
                  title={rail ? m.label : undefined}
                  className={cn(
                    "w-full flex items-center rounded-md text-[12.5px] transition-colors relative",
                    rail ? "h-8 w-8 mx-auto justify-center" : "gap-2.5 px-2.5 py-1.5",
                    isActive
                      ? "bg-[hsl(var(--surface-3))] text-[hsl(var(--text-1))] font-semibold"
                      : "text-[hsl(var(--text-2))] hover:bg-[hsl(var(--surface-3))] hover:text-[hsl(var(--text-1))]",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-[hsl(var(--brand-green))]" />
                  )}
                  <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[hsl(var(--brand-green))]" : "text-[hsl(var(--text-3))]")} />
                  {!rail && <span className="truncate flex-1 text-left">{m.label}</span>}
                </button>
                {!rail && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onPin(m.id); }}
                    className={cn(
                      "absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                      pinned.has(m.id) && "opacity-100 text-[hsl(var(--brand-yellow))]"
                    )}
                    title={pinned.has(m.id) ? "Unpin" : "Pin"}
                    aria-label={pinned.has(m.id) ? "Unpin module" : "Pin module"}
                  >
                    <Pin className="h-3 w-3" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
