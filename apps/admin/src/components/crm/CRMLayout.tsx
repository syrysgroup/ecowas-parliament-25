import React, { ReactNode, useState, useEffect } from "react";
import {
  Settings, Sun, Moon, User, Lock, Globe, LogOut, HelpCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import CRMSidebar from "./CRMSidebar";
import { CRM_MODULES } from "./crmModules";
import { CRM_ROLE_META } from "./crmRoles";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CRMAvatar from "@/components/crm/CRMAvatar";
import CRMTour, { useCRMTour } from "@/components/crm/CRMTour";
import { NotificationBell } from "./CRMNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileCRMLayout from "./mobile/MobileCRMLayout";

interface CRMLayoutProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  children: ReactNode;
}

// ─── CRM Theme Toggle ─────────────────────────────────────────────────────────
function CRMThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";
  return (
    <button
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-1.5 rounded-lg transition-colors text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────
export default function CRMLayout({ activeSection, onNavigate, children }: CRMLayoutProps) {
  const isMobile = useIsMobile();
  const { user, roles, signOut } = useAuthContext();
  const { startTour } = useCRMTour(onNavigate);
  const activeModule = CRM_MODULES.find(m => m.section === activeSection);

  if (isMobile) {
    return (
      <MobileCRMLayout activeSection={activeSection} onNavigate={onNavigate}>
        {children}
      </MobileCRMLayout>
    );
  }
  const moduleLabel  = activeModule?.label ?? "Dashboard";
  const ModuleIcon   = activeModule?.icon;

  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "User";

  // Primary role badge
  const primaryRole = roles[0];
  const primaryRoleMeta = primaryRole ? CRM_ROLE_META[primaryRole] : null;

  return (
    <div className="flex h-screen bg-crm text-crm-text overflow-hidden">
      <CRMSidebar activeSection={activeSection} onNavigate={onNavigate} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top gradient accent line */}
        <div className="h-[3px] bg-gradient-to-r from-primary via-emerald-400 to-primary/40 flex-shrink-0" />

        {/* Top bar */}
        <header className="h-13 border-b border-crm-border flex items-center px-4 flex-shrink-0 bg-crm-card/95 backdrop-blur-sm">
          {/* Left: breadcrumb */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {ModuleIcon && <ModuleIcon size={13} className="text-primary flex-shrink-0" />}
            <span className="text-[10px] font-mono text-crm-text-dim tracking-widest uppercase hidden sm:block">
              ECOWAS · CRM
            </span>
            <span className="text-crm-border hidden sm:block">/</span>
            <span className="text-[13px] font-semibold text-crm-text truncate">{moduleLabel}</span>
          </div>

          {/* Right: notification bell + theme toggle + settings + user dropdown */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <NotificationBell onNavigate={onNavigate} />

            <CRMThemeToggle />

            <button
              onClick={() => startTour()}
              className="p-1.5 rounded-lg transition-colors text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface"
              title="Guided Tour"
            >
              <HelpCircle size={15} />
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className={`p-1.5 rounded-lg transition-colors ${
                activeSection === "settings"
                  ? "bg-crm-border text-crm-text-secondary"
                  : "text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface"
              }`}
              title="Settings"
            >
              <Settings size={15} />
            </button>

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button id="crm-topbar-user" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-crm-surface transition-colors outline-none">
                  <CRMAvatar src={user?.user_metadata?.avatar_url} name={displayName} size="sm" />
                  <span className="text-[11px] text-crm-text-muted hidden md:block truncate max-w-[100px]">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 bg-crm-card border-crm-border text-crm-text shadow-2xl shadow-black/60 z-50"
              >
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CRMAvatar src={user?.user_metadata?.avatar_url} name={displayName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-crm-text truncate">{displayName}</p>
                      <p className="text-[10px] text-crm-text-muted font-normal truncate">{user?.email}</p>
                    </div>
                  </div>
                  {primaryRoleMeta && (
                    <span className={`text-[9px] font-mono border rounded px-2 py-0.5 ${primaryRoleMeta.bgColour} ${primaryRoleMeta.colour} ${primaryRoleMeta.borderColour}`}>
                      {primaryRoleMeta.label}
                    </span>
                  )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-crm-border" />

                <DropdownMenuItem
                  onClick={() => onNavigate("profile")}
                  className="flex items-center gap-2.5 text-[12px] text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface cursor-pointer"
                >
                  <User size={13} />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onNavigate("settings")}
                  className="flex items-center gap-2.5 text-[12px] text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface cursor-pointer"
                >
                  <Settings size={13} />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onNavigate("settings")}
                  className="flex items-center gap-2.5 text-[12px] text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface cursor-pointer"
                >
                  <Lock size={13} />
                  Change Password
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-crm-border" />

                <DropdownMenuItem asChild>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-[12px] text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface cursor-pointer w-full px-2 py-1.5 rounded-sm"
                  >
                    <Globe size={13} />
                    Visit Site
                  </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-crm-border" />

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2.5 text-[12px] text-red-400 hover:text-red-300 hover:bg-destructive/10 cursor-pointer"
                >
                  <LogOut size={13} />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content — subtle dot-grid pattern background */}
        <main
          className="flex-1 overflow-y-auto p-3 md:p-6 relative"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="relative z-10 w-full">{children}</div>
        </main>
      </div>

      {/* CRM Tour — auto-starts for new users */}
      <CRMTour onNavigate={onNavigate} autoStart />
    </div>
  );
}