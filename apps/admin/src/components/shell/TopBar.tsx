import { Search, HelpCircle, Sun, Moon, ChevronRight, User, Settings, LogOut, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/crm/CRMNotifications";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CRMAvatar from "@/components/crm/CRMAvatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { CRM_ROLE_META } from "@/components/crm/crmRoles";

export default function TopBar({
  moduleLabel,
  moduleIcon: ModuleIcon,
  onNavigate,
  onOpenPalette,
}: {
  moduleLabel: string;
  moduleIcon?: React.ComponentType<{ className?: string }>;
  onNavigate: (s: string) => void;
  onOpenPalette: () => void;
}) {
  const { user, roles, signOut } = useAuthContext();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "User";
  const primaryRole = roles[0];
  const primaryRoleMeta = primaryRole ? CRM_ROLE_META[primaryRole] : null;

  return (
    <header className="h-14 flex items-center px-4 gap-3 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-1))] flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] min-w-0">
        <span className="text-[hsl(var(--text-3))] font-mono tracking-widest uppercase text-[10px] hidden md:inline">ECOWAS</span>
        <ChevronRight className="h-3 w-3 text-[hsl(var(--text-3))] hidden md:inline" />
        {ModuleIcon && <ModuleIcon className="h-3.5 w-3.5 text-[hsl(var(--brand-green))]" />}
        <span className="font-semibold text-[hsl(var(--text-1))] truncate">{moduleLabel}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Cmd+K trigger */}
      <button
        onClick={onOpenPalette}
        className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg bg-[hsl(var(--surface-2))] border border-[hsl(var(--border-subtle))] text-[12px] text-[hsl(var(--text-3))] hover:border-[hsl(var(--brand-green))] hover:text-[hsl(var(--text-2))] transition-colors min-w-[260px]"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[hsl(var(--surface-3))] text-[hsl(var(--text-2))]">⌘K</kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <NotificationBell onNavigate={onNavigate} />
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[hsl(var(--text-3))] hover:bg-[hsl(var(--surface-3))] hover:text-[hsl(var(--text-1))] transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}
        <button
          onClick={() => onNavigate("settings")}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[hsl(var(--text-3))] hover:bg-[hsl(var(--surface-3))] hover:text-[hsl(var(--text-1))] transition-colors"
          title="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 h-8 px-1.5 rounded-lg hover:bg-[hsl(var(--surface-3))] transition-colors outline-none">
              <CRMAvatar src={user?.user_metadata?.avatar_url} name={displayName} size="sm" />
              <span className="text-[12px] text-[hsl(var(--text-2))] hidden md:block truncate max-w-[120px]">{displayName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <CRMAvatar src={user?.user_metadata?.avatar_url} name={displayName} size="sm" />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold truncate">{displayName}</p>
                  <p className="text-[10px] text-[hsl(var(--text-3))] truncate">{user?.email}</p>
                </div>
              </div>
              {primaryRoleMeta && (
                <span className={`text-[9px] font-mono border rounded px-2 py-0.5 ${primaryRoleMeta.bgColour} ${primaryRoleMeta.colour} ${primaryRoleMeta.borderColour}`}>
                  {primaryRoleMeta.label}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate("profile")}><User className="h-3.5 w-3.5 mr-2" />Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate("settings")}><Settings className="h-3.5 w-3.5 mr-2" />Settings</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center"><Globe className="h-3.5 w-3.5 mr-2" />Visit site</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-red-500"><LogOut className="h-3.5 w-3.5 mr-2" />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}