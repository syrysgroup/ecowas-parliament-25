import { useState, useMemo } from "react";
import { ChevronDown, Pin, Search } from "lucide-react";
import { CRM_MODULES, MODULE_GROUPS, getModulesForRoles, type ModuleGroup } from "@/components/crm/crmModules";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const PIN_KEY = "shellv2:pinned";

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
    <aside className="w-[248px] flex-shrink-0 h-full flex flex-col bg-[hsl(var(--surface-2))] border-r border-[hsl(var(--border-subtle))]">
      {/* Brand */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[hsl(var(--border-subtle))]">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-black text-[11px] tracking-tight"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          E
        </div>
        <div className="leading-tight">
          <p className="text-[12px] font-bold text-[hsl(var(--text-1))]">ECOWAS Admin</p>
          <p className="text-[9px] uppercase tracking-widest text-[hsl(var(--text-3))]">Parliament @25</p>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--text-3))]" />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter modules…"
            className="w-full h-8 pl-8 pr-2 rounded-lg bg-[hsl(var(--surface-3))] text-[12px] text-[hsl(var(--text-1))] placeholder:text-[hsl(var(--text-3))] outline-none border border-transparent focus:border-[hsl(var(--brand-green))] transition-colors"
          />
        </div>
      </div>

      {/* Module list */}
      <nav className="flex-1 overflow-y-auto crm-scroll px-2 pb-4 space-y-3">
        {pinnedModules.length > 0 && (
          <Group label="PINNED" collapsed={false} onToggle={() => {}} items={pinnedModules}
            active={activeSection} onPin={togglePin} pinned={pinned} onSelect={onNavigate} />
        )}
        {MODULE_GROUPS.map(g => {
          const items = modules.filter(m => m.group === g && matches(m.label));
          if (items.length === 0) return null;
          return (
            <Group key={g} label={g} collapsed={collapsed.has(g)} onToggle={() => toggleGroup(g)}
              items={items} active={activeSection} onPin={togglePin} pinned={pinned} onSelect={onNavigate} />
          );
        })}
      </nav>
    </aside>
  );
}

function Group({
  label, items, collapsed, onToggle, active, onSelect, onPin, pinned,
}: {
  label: string;
  items: typeof CRM_MODULES;
  collapsed: boolean;
  onToggle: () => void;
  active: string;
  onSelect: (s: string) => void;
  onPin: (id: string) => void;
  pinned: Set<string>;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold tracking-widest text-[hsl(var(--text-3))] hover:text-[hsl(var(--text-2))]"
      >
        <span>{label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", collapsed && "-rotate-90")} />
      </button>
      {!collapsed && (
        <ul className="mt-1 space-y-0.5">
          {items.map(m => {
            const Icon = m.icon;
            const isActive = active === m.section;
            return (
              <li key={m.id} className="group relative">
                <button
                  onClick={() => onSelect(m.section)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] transition-all",
                    isActive
                      ? "bg-[hsl(var(--brand-green)/0.12)] text-[hsl(var(--brand-green))] font-semibold"
                      : "text-[hsl(var(--text-2))] hover:bg-[hsl(var(--surface-3))] hover:text-[hsl(var(--text-1))]",
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-[hsl(var(--brand-green))]" : "text-[hsl(var(--text-3))]")} />
                  <span className="truncate flex-1 text-left">{m.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-green))]" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onPin(m.id); }}
                  className={cn(
                    "absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                    pinned.has(m.id) && "opacity-100 text-[hsl(var(--brand-yellow))]"
                  )}
                  title={pinned.has(m.id) ? "Unpin" : "Pin"}
                >
                  <Pin className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}