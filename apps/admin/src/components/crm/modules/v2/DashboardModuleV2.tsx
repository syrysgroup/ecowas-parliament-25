import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, UserPlus, Handshake, CheckSquare, Calendar,
  Newspaper, Mail, Bell, ArrowRight, Briefcase,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { PageHeader, Surface, StatCard, EmptyState } from "@/components/shell/primitives";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

function useDashboardStats(enabled: boolean) {
  return useQuery({
    queryKey: ["crm-dashboard-system-stats-v2"],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const [usersRes, invitesRes, sponsorsRes, tasksRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("invitations").select("id", { count: "exact", head: true }).is("accepted_at", null),
        supabase.from("sponsors").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "done"),
      ]);
      return {
        users: usersRes.count ?? 0,
        invites: invitesRes.count ?? 0,
        sponsors: sponsorsRes.count ?? 0,
        tasks: tasksRes.count ?? 0,
      };
    },
  });
}

function useUpcomingEvents(userId: string | undefined) {
  return useQuery({
    queryKey: ["dash-v2-upcoming-events", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("crm_calendar_events")
        .select("id, title, start_time, colour")
        .or(`created_by.eq.${userId},is_global.eq.true`)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(5);
      return data ?? [];
    },
  });
}

function useMyOpenTasks(userId: string | undefined) {
  return useQuery({
    queryKey: ["dash-v2-my-tasks", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id, title, priority, due_date, status")
        .eq("assignee_id", userId!)
        .neq("status", "done")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(6);
      return data ?? [];
    },
  });
}

const PRIORITY_TONE: Record<string, string> = {
  urgent: "text-[hsl(var(--brand-red))]",
  high: "text-orange-500",
  medium: "text-[hsl(var(--brand-yellow))]",
  low: "text-[hsl(var(--brand-green))]",
};

export default function DashboardModuleV2({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { user, isSponsor, isSuperAdmin, isAdmin } = useAuthContext();
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "there";

  const stats = useDashboardStats(isSuperAdmin || isAdmin);
  const events = useUpcomingEvents(user?.id);
  const myTasks = useMyOpenTasks(user?.id);

  if (isSponsor) {
    return (
      <>
        <PageHeader
          icon={LayoutDashboard}
          title="Sponsor Portal"
          description="Visibility reports and engagement data."
        />
        <EmptyState
          icon={Briefcase}
          title="Welcome to your portal"
          description="Use Sponsor Metrics to view visibility reports and engagement data."
          action={
            <Button onClick={() => onNavigate("sponsor-metrics")} className="gap-1.5">
              Go to Sponsor Metrics <ArrowRight size={14} />
            </Button>
          }
        />
      </>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        icon={LayoutDashboard}
        title={`${greeting}, ${displayName.split(" ")[0]}`}
        description={format(new Date(), "EEEE, MMMM d")}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => onNavigate("tasks")} className="gap-1.5">
              <CheckSquare size={14} /> Tasks
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate("calendar")} className="gap-1.5">
              <Calendar size={14} /> Calendar
            </Button>
            <Button size="sm" onClick={() => onNavigate("email-inbox")} className="gap-1.5">
              <Mail size={14} /> Inbox
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total users" value={stats.data?.users ?? "—"} icon={Users} tone="brand" />
        <StatCard label="Pending invites" value={stats.data?.invites ?? "—"} icon={UserPlus} tone="warn" />
        <StatCard label="Active sponsors" value={stats.data?.sponsors ?? "—"} icon={Handshake} tone="default" />
        <StatCard label="Open tasks" value={stats.data?.tasks ?? "—"} icon={CheckSquare} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* My open tasks */}
        <Surface className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-[hsl(var(--text-1))]">My open tasks</h3>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-[12px] text-[hsl(var(--brand-green))] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {myTasks.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11" />)}
            </div>
          ) : (myTasks.data ?? []).length === 0 ? (
            <EmptyState icon={CheckSquare} title="No open tasks" description="You're all caught up." />
          ) : (
            <ul className="divide-y divide-[hsl(var(--border-subtle))]">
              {myTasks.data!.map((t: any) => (
                <li key={t.id}
                  onClick={() => onNavigate("tasks")}
                  className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[hsl(var(--surface-2))] rounded px-2 -mx-2 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[hsl(var(--text-1))] truncate">{t.title}</p>
                    <p className="text-[11px] text-[hsl(var(--text-3))]">
                      {t.due_date ? `Due ${format(parseISO(t.due_date), "d MMM")}` : "No due date"}
                    </p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${PRIORITY_TONE[t.priority] ?? ""}`}>
                    {t.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        {/* Upcoming events */}
        <Surface className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-[hsl(var(--text-1))]">Upcoming</h3>
            <button
              onClick={() => onNavigate("calendar")}
              className="text-[12px] text-[hsl(var(--brand-green))] hover:underline flex items-center gap-1"
            >
              Calendar <ArrowRight size={12} />
            </button>
          </div>
          {events.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (events.data ?? []).length === 0 ? (
            <EmptyState icon={Calendar} title="Nothing scheduled" description="Your calendar is clear." />
          ) : (
            <ul className="space-y-2">
              {events.data!.map((ev: any) => (
                <li key={ev.id}
                  onClick={() => onNavigate("calendar")}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-[hsl(var(--surface-2))] cursor-pointer transition-colors">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-[hsl(var(--surface-3))] flex-shrink-0">
                    <span className="text-[9px] uppercase text-[hsl(var(--text-3))] font-semibold leading-none">
                      {format(parseISO(ev.start_time), "MMM")}
                    </span>
                    <span className="text-[14px] font-bold text-[hsl(var(--text-1))] leading-none mt-0.5">
                      {format(parseISO(ev.start_time), "d")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[hsl(var(--text-1))] truncate">{ev.title}</p>
                    <p className="text-[11px] text-[hsl(var(--text-3))]">
                      {format(parseISO(ev.start_time), "h:mm a")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>

      {/* Quick navigation */}
      <div className="mt-6">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--text-3))] mb-3">
          Quick actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Newsletter", section: "newsletter", icon: Mail },
            { label: "News", section: "news-editor", icon: Newspaper },
            { label: "Events", section: "events-manager", icon: Calendar },
            { label: "People", section: "people", icon: Users },
            { label: "Sponsors", section: "sponsors-partners", icon: Handshake },
            { label: "Notifications", section: "settings", icon: Bell },
          ].map(({ label, section, icon: Icon }) => (
            <button
              key={section}
              onClick={() => onNavigate(section)}
              className="group p-3 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-1))] hover:border-[hsl(var(--brand-green))] hover:shadow-[var(--shadow-elev-1)] transition-all text-left"
            >
              <Icon className="h-4 w-4 text-[hsl(var(--brand-green))] mb-2" />
              <p className="text-[12px] font-semibold text-[hsl(var(--text-1))]">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}