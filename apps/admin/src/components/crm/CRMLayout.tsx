import { ReactNode, useState, useRef, useEffect } from "react";
import { Bell, Settings, X, Sun, Moon, User, Lock, Globe, LogOut, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import CRMSidebar from "./CRMSidebar";
import { CRM_MODULES } from "./crmModules";
import { CRM_ROLE_META } from "./crmRoles";
import { supabase } from "@/integrations/supabase/client";
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

interface CRMLayoutProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  children: ReactNode;
}

// ─── Notification item ────────────────────────────────────────────────────────
interface NotifItem {
  id: string;
  type: "message" | "task" | "event" | "application";
  title: string;
  body: string;
  time: string;
  read: boolean;
  sourceId?: string;
}

function useNotifications() {
  const { user, roles } = useAuthContext();
  const isAdmin = roles.some(r => ["super_admin", "admin", "moderator"].includes(r));

  return useQuery<NotifItem[]>({
    queryKey: ["crm-notifications", user?.id],
    queryFn: async () => {
      const items: NotifItem[] = [];

      // ── Unread inbox messages ────────────────────────────────────────────────
      // Each source is fetched independently so a single failing table doesn't
      // wipe out notifications from the other sources.
      try {
        const msgRes = await (supabase as any)
          .from("crm_messages")
          .select("id, subject, body, sent_at, is_read")
          .eq("to_user_id", user!.id)
          .eq("is_read", false)
          .eq("is_archived", false)
          .order("sent_at", { ascending: false })
          .limit(5);

        (msgRes.data ?? []).forEach((m: any) => {
          items.push({
            id: `msg-${m.id}`,
            type: "message",
            title: "New message",
            body: m.subject || "(No subject)",
            time: m.sent_at,
            read: false,
            sourceId: m.id,
          });
        });
      } catch {
        // crm_messages unavailable — skip silently
      }

      // ── Tasks assigned to me (created in last 48 h) ──────────────────────────
      try {
        const now = new Date();
        const since = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
        const taskRes = await (supabase as any)
          .from("tasks")
          .select("id, title, created_at")
          .eq("assignee_id", user!.id)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(3);

        (taskRes.data ?? []).forEach((t: any) => {
          items.push({
            id: `task-${t.id}`,
            type: "task",
            title: "Task assigned",
            body: t.title,
            time: t.created_at,
            read: false,
            sourceId: t.id,
          });
        });
      } catch {
        // tasks unavailable — skip silently
      }

      // ── Events today ─────────────────────────────────────────────────────────
      try {
        const nowTs = new Date();
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const evtRes = await (supabase as any)
          .from("crm_calendar_events")
          .select("id, title, start_time, created_by")
          .or(`created_by.eq.${user!.id},is_global.eq.true`)
          .gte("start_time", nowTs.toISOString())
          .lte("start_time", todayEnd.toISOString())
          .order("start_time", { ascending: true })
          .limit(3);

        (evtRes.data ?? []).forEach((e: any) => {
          items.push({
            id: `evt-${e.id}`,
            type: "event",
            title: "Event today",
            body: e.title,
            time: e.start_time,
            read: false,
            sourceId: e.id,
          });
        });
      } catch {
        // calendar events unavailable — skip silently
      }

      // ── Pending applications (admin / moderator only) ─────────────────────────
      if (isAdmin) {
        try {
          const appRes = await (supabase as any)
            .from("applications")
            .select("id, country, created_at")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(3);

          (appRes.data ?? []).forEach((a: any) => {
            items.push({
              id: `app-${a.id}`,
              type: "application",
              title: "Pending application",
              body: `From ${a.country || "unknown country"}`,
              time: a.created_at,
              read: false,
              sourceId: a.id,
            });
          });
        } catch {
          // applications unavailable — skip silently
        }
      }

      // Sort newest first
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return items;
    },
    enabled: !!user?.id,
    refetchInterval: 60_000,  // refresh every minute
    retry: 0,                 // ✅ don't hammer Supabase on network blips;
                              //    the 60-second interval will retry naturally
  });
}

const NOTIF_ICON: Record<NotifItem["type"], string> = {
  message:     "bg-blue-950 border-blue-800 text-blue-400",
  task:        "bg-amber-950 border-amber-800 text-amber-400",
  event:       "bg-emerald-950 border-emerald-800 text-emerald-400",
  application: "bg-violet-950 border-violet-800 text-violet-400",
};

// ─── Notification dropdown ────────────────────────────────────────────────────
function NotificationBell({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const { user } = useAuthContext();
  const { data: rawNotifs = [], isLoading } = useNotifications();

  const notifs = rawNotifs.filter(n => !dismissed.has(n.id));
  const unread = notifs.length;

  const markMessageRead = useMutation({
    mutationFn: async (messageId: string) => {
      await (supabase as any)
        .from("crm_messages")
        .update({ is_read: true })
        .eq("id", messageId)
        .eq("to_user_id", user?.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm-notifications", user?.id] }),
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotifClick = (n: NotifItem) => {
    setOpen(false);
    setDismissed(prev => new Set(prev).add(n.id));
    if (n.type === "message" && n.sourceId) {
      markMessageRead.mutate(n.sourceId);
      onNavigate("email-inbox");
    } else if (n.type === "task") {
      onNavigate("tasks");
    } else if (n.type === "event") {
      onNavigate("calendar");
    } else if (n.type === "application") {
      onNavigate("parliament-ops");
    }
  };

  const handleDismissAll = () => {
    setDismissed(new Set(rawNotifs.map(n => n.id)));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        id="crm-topbar-notifications"
        onClick={() => setOpen(v => !v)}
        className={`relative p-1.5 rounded-lg transition-colors ${
          open ? "bg-crm-border text-crm-text-secondary" : "text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface"
        }`}
        title="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-crm-card border border-crm-border rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-crm-border">
            <span className="text-[12px] font-semibold text-crm-text-secondary">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400">
                  {unread} new
                </span>
              )}
              {unread > 0 && (
                <button onClick={handleDismissAll} className="text-[9px] text-crm-text-faint hover:text-crm-text-muted transition-colors">
                  Dismiss all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <div className="w-4 h-4 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Bell size={20} className="text-crm-text-faint" />
                <p className="text-[11px] text-crm-text-faint">All caught up</p>
              </div>
            ) : (
              <div className="divide-y divide-crm-border">
                {notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-crm-surface transition-colors text-left"
                  >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${NOTIF_ICON[n.type]}`}>
                      <Bell size={10} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-crm-text">{n.title}</p>
                      <p className="text-[10px] text-crm-text-muted truncate">{n.body}</p>
                      <p className="text-[9px] text-crm-text-faint mt-0.5">
                        {format(parseISO(n.time), "d MMM · h:mm a")}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {rawNotifs.length > 0 && (
            <div className="px-4 py-2 border-t border-crm-border">
              <button
                onClick={() => { onNavigate("email-inbox"); setOpen(false); }}
                className="text-[10px] text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Go to inbox →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
  const { user, roles, signOut } = useAuthContext();
  const { startTour } = useCRMTour(onNavigate);
  const activeModule = CRM_MODULES.find(m => m.section === activeSection);
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