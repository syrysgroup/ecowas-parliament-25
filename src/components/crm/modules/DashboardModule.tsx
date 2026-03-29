import { useQuery } from "@tanstack/react-query";
import { CheckSquare, Calendar, Users, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PRIORITY_COLOURS: Record<string, string> = {
  urgent: "text-red-400 bg-red-950 border-red-800",
  high:   "text-orange-400 bg-orange-950 border-orange-800",
  medium: "text-amber-400 bg-amber-950 border-amber-800",
  low:    "text-emerald-400 bg-emerald-950 border-emerald-800",
};

const STATUS_COLOURS: Record<string, string> = {
  todo:        "text-[#6b8f72] bg-[#111a14] border-[#1e2d22]",
  in_progress: "text-blue-400 bg-blue-950 border-blue-800",
  review:      "text-amber-400 bg-amber-950 border-amber-800",
  done:        "text-emerald-400 bg-emerald-950 border-emerald-800",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done",
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, accent, loading }: StatCardProps) {
  return (
    <div className={`bg-[#0d1610] border border-[#1e2d22] rounded-xl p-4 flex items-start gap-4`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-mono uppercase tracking-widest text-[#4a6650] mb-1">{label}</p>
        {loading ? (
          <div className="h-7 w-12 bg-[#1e2d22] rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-[#c8e0cc]">{value}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardModule({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { user, isSuperAdmin, isProjectDirector, isSponsor } = useAuthContext();

  // My assigned tasks (last 5)
  const { data: myTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["crm-my-tasks", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("tasks")
        .select("id, title, status, priority, due_date, pillar")
        .eq("assignee_id", user?.id)
        .neq("status", "done")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!user?.id && !isSponsor,
  });

  // Task counts for stat cards
  const { data: taskCounts, isLoading: countsLoading } = useQuery({
    queryKey: ["crm-task-counts"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("tasks")
        .select("status");
      if (!data) return { total: 0, open: 0 };
      const total = data.length;
      const open = data.filter((t: any) => t.status !== "done").length;
      return { total, open };
    },
    enabled: !!user?.id && !isSponsor,
  });

  // Upcoming calendar events (next 3)
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["crm-upcoming-events"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data } = await (supabase as any)
        .from("crm_calendar_events")
        .select("id, title, start_time, colour")
        .gte("start_time", now)
        .order("start_time", { ascending: true })
        .limit(3);
      return data ?? [];
    },
    enabled: !!user?.id && !isSponsor,
  });

  // Team member count (profiles)
  const { data: memberCount } = useQuery({
    queryKey: ["crm-member-count"],
    queryFn: async () => {
      const { count } = await (supabase as any)
        .from("profiles")
        .select("id", { count: "exact", head: true });
      return count ?? 0;
    },
    enabled: (isSuperAdmin || isProjectDirector) && !isSponsor,
  });

  const EVENT_DOT: Record<string, string> = {
    green: "bg-emerald-500", blue: "bg-blue-500", amber: "bg-amber-500",
    red: "bg-red-500", violet: "bg-violet-500", teal: "bg-teal-500",
  };

  if (isSponsor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-[#111a14] border border-[#1e2d22] flex items-center justify-center">
          <CheckSquare className="h-7 w-7 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#c8e0cc]">Welcome to your Sponsor Portal</h2>
          <p className="text-sm text-[#6b8f72] mt-1 max-w-xs">
            Use Sponsor Metrics to view your visibility reports and engagement data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={countsLoading ? "—" : (taskCounts?.total ?? 0)}
          icon={<CheckSquare size={18} className="text-emerald-400" />}
          accent="bg-emerald-950 border border-emerald-800"
          loading={countsLoading}
        />
        <StatCard
          label="Open Tasks"
          value={countsLoading ? "—" : (taskCounts?.open ?? 0)}
          icon={<AlertCircle size={18} className="text-amber-400" />}
          accent="bg-amber-950 border border-amber-800"
          loading={countsLoading}
        />
        <StatCard
          label="Upcoming Events"
          value={eventsLoading ? "—" : (events?.length ?? 0)}
          icon={<Calendar size={18} className="text-blue-400" />}
          accent="bg-blue-950 border border-blue-800"
          loading={eventsLoading}
        />
        {(isSuperAdmin || isProjectDirector) && (
          <StatCard
            label="Team Members"
            value={memberCount ?? "—"}
            icon={<Users size={18} className="text-violet-400" />}
            accent="bg-violet-950 border border-violet-800"
          />
        )}
      </div>

      {/* My tasks + upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-[#0d1610] border border-[#1e2d22] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d22]">
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#4a6650]">My Tasks</h3>
            <button
              onClick={() => onNavigate("tasks")}
              className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 hover:text-emerald-400 transition-colors"
            >
              View all <ArrowRight size={10} />
            </button>
          </div>
          <div className="divide-y divide-[#111a14]">
            {tasksLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex gap-3">
                  <div className="h-4 flex-1 bg-[#1e2d22] rounded animate-pulse" />
                </div>
              ))
            ) : myTasks?.length === 0 ? (
              <p className="px-4 py-6 text-[12px] text-[#4a6650] text-center">No open tasks assigned to you</p>
            ) : (
              myTasks?.map((task: any) => (
                <div key={task.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-[#c8e0cc] font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.pillar && (
                        <span className="text-[9px] font-mono text-[#4a6650] uppercase">{task.pillar}</span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-[10px] text-[#4a6650]">
                          <Clock size={9} />
                          {format(parseISO(task.due_date), "d MMM")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${PRIORITY_COLOURS[task.priority] ?? ""}`}>
                      {task.priority}
                    </span>
                    <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${STATUS_COLOURS[task.status] ?? ""}`}>
                      {STATUS_LABELS[task.status] ?? task.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-[#0d1610] border border-[#1e2d22] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d22]">
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#4a6650]">Upcoming Events</h3>
            <button
              onClick={() => onNavigate("calendar")}
              className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 hover:text-emerald-400 transition-colors"
            >
              Calendar <ArrowRight size={10} />
            </button>
          </div>
          <div className="divide-y divide-[#111a14]">
            {eventsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex gap-3">
                  <div className="h-4 flex-1 bg-[#1e2d22] rounded animate-pulse" />
                </div>
              ))
            ) : events?.length === 0 ? (
              <p className="px-4 py-6 text-[12px] text-[#4a6650] text-center">No upcoming events scheduled</p>
            ) : (
              events?.map((ev: any) => (
                <div key={ev.id} className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_DOT[ev.colour] ?? "bg-emerald-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-[#c8e0cc] font-medium truncate">{ev.title}</p>
                    <p className="text-[10px] text-[#4a6650] mt-0.5">
                      {format(parseISO(ev.start_time), "EEE d MMM · h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
