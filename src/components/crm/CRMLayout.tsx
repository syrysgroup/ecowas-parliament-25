import { ReactNode, useState, useRef, useEffect } from "react";
import { Bell, Settings, X, Sun, Moon, User, Lock, Globe, LogOut, CheckCircle2, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import CRMSidebar from "./CRMSidebar";
import { CRM_MODULES } from "./crmModules";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select as UISelect,
  SelectContent as UISelectContent,
  SelectItem as UISelectItem,
  SelectTrigger as UISelectTrigger,
  SelectValue as UISelectValue,
} from "@/components/ui/select";

const ECOWAS_COUNTRIES = [
  "Benin","Burkina Faso","Cape Verde","Côte d'Ivoire","Gambia",
  "Ghana","Guinea","Guinea-Bissau","Liberia","Mali","Niger",
  "Nigeria","Senegal","Sierra Leone","Togo",
];

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
          id: `msg-${m.id}`, type: "message", title: "New message",
          body: m.subject || "(No subject)", time: m.sent_at, read: false, sourceId: m.id,
        });
      });

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
          id: `task-${t.id}`, type: "task", title: "Task assigned",
          body: t.title, time: t.created_at, read: false, sourceId: t.id,
        });
      });

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
          id: `evt-${e.id}`, type: "event", title: "Event today",
          body: e.title, time: e.start_time, read: false, sourceId: e.id,
        });
      });

      if (isAdmin) {
        const appRes = await (supabase as any)
          .from("applications")
          .select("id, country, created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(3);

        (appRes.data ?? []).forEach((a: any) => {
          items.push({
            id: `app-${a.id}`, type: "application", title: "Pending application",
            body: `From ${a.country || "unknown country"}`, time: a.created_at, read: false, sourceId: a.id,
          });
        });
      }

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return items;
    },
    enabled: !!user?.id,
    refetchInterval: 60_000,
  });
}

const NOTIF_ICON: Record<NotifItem["type"], string> = {
  message:     "bg-primary/10 border-primary/30 text-primary",
  task:        "bg-accent/10 border-accent/30 text-accent-foreground",
  event:       "bg-primary/10 border-primary/30 text-primary",
  application: "bg-secondary/10 border-secondary/30 text-secondary",
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
        onClick={() => setOpen(v => !v)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          open ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
        title="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-bounce-in min-w-[18px] h-[18px]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 z-50 overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 border border-destructive/30 text-destructive">
                  {unread} new
                </span>
              )}
              {unread > 0 && (
                <button onClick={handleDismissAll} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                  Dismiss all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell size={22} className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground">All caught up</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-all duration-150 text-left"
                  >
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${NOTIF_ICON[n.type]}`}>
                      <Bell size={11} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {format(parseISO(n.time), "d MMM · h:mm a")}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {rawNotifs.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border">
              <button
                onClick={() => { onNavigate("email-inbox"); setOpen(false); }}
                className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
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

// ─── Profile Completion Modal ─────────────────────────────────────────────────
function ProfileCompletionModal({ userId }: { userId: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-completion-check", userId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("full_name, title, country, phone")
        .eq("id", userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const needsCompletion = !isLoading && profile && (!profile.full_name || !profile.title);

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setTitle(profile.title ?? "");
      setCountry(profile.country ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !title.trim()) {
      toast({ title: "Full name and title are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          title: title.trim(),
          country: country || null,
          phone: phone.trim() || null,
        })
        .eq("id", userId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["profile-completion-check", userId] });
      toast({ title: "Profile saved" });
    } catch (err: any) {
      toast({ title: "Failed to save profile", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !needsCompletion) return null;

  return (
    <Dialog open modal>
      <DialogContent
        className="bg-card border-border text-foreground max-w-md"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <User size={16} className="text-primary" />
            Complete your profile
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1">
          Please fill in the required information before using the CRM.
        </p>
        <form onSubmit={handleSave} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Full Name <span className="text-destructive">*</span></Label>
            <Input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Amara Koné"
              required
              className="bg-muted border-border text-foreground text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Title / Position <span className="text-destructive">*</span></Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Programme Coordinator"
              required
              className="bg-muted border-border text-foreground text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Country</Label>
            <UISelect value={country} onValueChange={setCountry}>
              <UISelectTrigger className="bg-muted border-border text-foreground text-sm">
                <UISelectValue placeholder="Select country" />
              </UISelectTrigger>
              <UISelectContent className="bg-card border-border text-foreground">
                {ECOWAS_COUNTRIES.map(c => (
                  <UISelectItem key={c} value={c}>{c}</UISelectItem>
                ))}
              </UISelectContent>
            </UISelect>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Phone (optional)</Label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+226 00 00 00 00"
              type="tel"
              className="bg-muted border-border text-foreground text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={saving || !fullName.trim() || !title.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
          >
            {saving ? "Saving…" : "Save & Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
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
      className="p-2 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:rotate-12"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────
export default function CRMLayout({ activeSection, onNavigate, children }: CRMLayoutProps) {
  const { user, roles, signOut } = useAuthContext();
  const isMobile = useIsMobile();
  const activeModule = CRM_MODULES.find(m => m.section === activeSection);
  const moduleLabel = activeModule?.label ?? "Dashboard";

  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <CRMSidebar activeSection={activeSection} onNavigate={onNavigate} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Glassmorphism header */}
        <header className="h-14 glass-header flex items-center px-4 md:px-6 flex-shrink-0 z-10">
          {/* Left: breadcrumb with animation */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isMobile && <div className="w-10" />} {/* spacer for hamburger */}
            <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase hidden sm:block">
              ECOWAS Parliament 25
            </span>
            <span className="text-border hidden sm:block">/</span>
            <span
              key={moduleLabel}
              className="text-sm font-semibold text-foreground truncate animate-fade-in"
            >
              {moduleLabel}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
            <NotificationBell onNavigate={onNavigate} />
            <CRMThemeToggle />

            <button
              onClick={() => onNavigate("settings")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                activeSection === "settings"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              title="Settings"
            >
              <Settings size={18} />
            </button>

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-all duration-200 outline-none ml-1">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary uppercase flex-shrink-0 ring-2 ring-primary/20">
                    {initial}
                  </div>
                  <span className="text-xs text-muted-foreground hidden md:block truncate max-w-[100px]">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-52 bg-card border-border text-foreground shadow-2xl z-50 animate-scale-in"
              >
                <DropdownMenuLabel className="pb-1">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground font-normal truncate">{user?.email}</p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                  onClick={() => onNavigate("profile")}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                >
                  <User size={14} />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onNavigate("settings")}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                >
                  <Settings size={14} />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onNavigate("settings")}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                >
                  <Lock size={14} />
                  Change Password
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem asChild>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer w-full px-2 py-1.5 rounded-sm"
                  >
                    <Globe size={14} />
                    Visit Site
                  </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2.5 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Profile completion gate */}
      {user && <ProfileCompletionModal userId={user.id} />}
    </div>
  );
}
