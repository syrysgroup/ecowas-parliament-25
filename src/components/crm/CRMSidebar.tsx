import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getModulesForRoles, CRM_MODULES } from "./crmModules";
import { CRM_ROLE_META } from "./crmRoles";
import type { ModuleId } from "./crmModules";

const STORAGE_KEY = "crm_sidebar_collapsed";

interface CRMSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function CRMSidebar({ activeSection, onNavigate }: CRMSidebarProps) {
  const { user, roles, signOut } = useAuthContext();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); }
    catch { /* ignore */ }
  }, [collapsed]);

  const visibleModules = getModulesForRoles(roles);

  // Display name + role badge
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "User";
  const primaryRole = roles[0];
  const roleMeta = primaryRole ? CRM_ROLE_META[primaryRole] : null;

  // Active module id
  const activeModule = CRM_MODULES.find(m => m.section === activeSection);

  return (
    <aside
      className={`
        flex flex-col h-screen bg-[#080d0a] border-r border-[#1e2d22]
        transition-all duration-200 ease-in-out flex-shrink-0
        ${collapsed ? "w-[56px]" : "w-[220px]"}
      `}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center border-b border-[#1e2d22] px-3 h-14 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">EP</span>
            </div>
            <span className="text-white font-semibold text-sm truncate">CRM</span>
            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950 border border-emerald-800 rounded px-1.5 py-0.5 flex-shrink-0">25</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">EP</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-[#4a6650] hover:text-[#a0c4a8] transition-colors p-1 rounded flex-shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 text-[#4a6650] hover:text-[#a0c4a8] transition-colors p-1 rounded"
          title="Expand sidebar"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        <ul className="space-y-0.5 px-2">
          {visibleModules.map(mod => {
            const isActive = mod.section === activeSection;
            const Icon = mod.icon;
            return (
              <li key={mod.id}>
                <button
                  onClick={() => onNavigate(mod.section)}
                  title={collapsed ? mod.label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all duration-100
                    ${isActive
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "text-[#6b8f72] hover:text-[#a0c4a8] hover:bg-[#111a14] border border-transparent"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-[12.5px] font-medium truncate">{mod.label}</span>
                  )}
                  {!collapsed && mod.isStub && (
                    <span className="ml-auto text-[9px] font-mono text-[#3a5040] bg-[#111a14] border border-[#1e2d22] rounded px-1 flex-shrink-0">
                      soon
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile + sign out */}
      <div className={`border-t border-[#1e2d22] p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#1e2d22] flex items-center justify-center flex-shrink-0 text-emerald-400 text-xs font-bold uppercase">
                {displayName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium text-[#c8e0cc] truncate">{displayName}</p>
                {roleMeta && (
                  <p className={`text-[10px] font-mono ${roleMeta.colour} truncate`}>
                    {roleMeta.label}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-[#4a6650] hover:text-[#ef5350] hover:bg-[#2a1010] transition-colors"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={signOut}
            title="Sign out"
            className="text-[#4a6650] hover:text-[#ef5350] transition-colors p-1"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}
