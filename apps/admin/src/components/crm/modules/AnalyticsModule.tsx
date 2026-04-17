import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Users, MessageSquare, CheckSquare, FileText, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, parseISO, startOfWeek } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = ["#34d399", "#60a5fa", "#f59e0b", "#f87171", "#a78bfa"];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${accent}`}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-crm-text-dim">{label}</p>
        <p className="text-2xl font-bold text-crm-text">{value}</p>
      </div>
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: { background: "hsl(var(--crm-card))", border: "1px solid hsl(var(--crm-border))", borderRadius: 8 },
  labelStyle: { color: "hsl(var(--crm-text-muted))", fontSize: 10 },
  itemStyle: { color: "hsl(var(--crm-text))", fontSize: 11 },
};

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsModule() {
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const days = Number(range);
  const since = subDays(new Date(), days).toISOString();

  // Tasks by status
  const { data: taskStats } = useQuery({
    queryKey: ["analytics-tasks"],
    queryFn: async () => {
      const res = await (supabase as any).from("tasks").select("status, created_at");
      if (res.error) return { byStatus: [], velocity: [] };
      const rows: { status: string; created_at: string }[] = res.data ?? [];
      const byStatus = Object.entries(
        rows.reduce((acc: Record<string, number>, r) => {
          acc[r.status] = (acc[r.status] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      // weekly velocity: tasks created per week (last 8 weeks)
      const weeks: Record<string, number> = {};
      rows.forEach(r => {
        const w = format(startOfWeek(parseISO(r.created_at)), "MMM d");
        weeks[w] = (weeks[w] ?? 0) + 1;
      });
      const velocity = Object.entries(weeks).slice(-8).map(([week, count]) => ({ week, count }));
      return { byStatus, velocity };
    },
  });

  // Messages per day (last N days)
  const { data: msgData } = useQuery({
    queryKey: ["analytics-messages", range],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("crm_messages")
        .select("sent_at")
        .gte("sent_at", since);
      if (res.error) return [];
      const byDay: Record<string, number> = {};
      (res.data ?? []).forEach((r: any) => {
        const d = format(parseISO(r.sent_at), "MMM d");
        byDay[d] = (byDay[d] ?? 0) + 1;
      });
      return Object.entries(byDay).map(([day, count]) => ({ day, count }));
    },
  });

  // Application funnel
  const { data: appStats } = useQuery({
    queryKey: ["analytics-apps"],
    queryFn: async () => {
      const res = await (supabase as any).from("applications").select("status");
      if (res.error) return [];
      const counts: Record<string, number> = {};
      (res.data ?? []).forEach((r: any) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  // Team + event summary counts
  const { data: counts } = useQuery({
    queryKey: ["analytics-counts"],
    queryFn: async () => {
      const [profiles, events, tasks, messages] = await Promise.all([
        (supabase as any).from("profiles").select("id", { count: "exact", head: true }),
        (supabase as any).from("events").select("id", { count: "exact", head: true }),
        (supabase as any).from("tasks").select("id", { count: "exact", head: true }),
        (supabase as any).from("crm_messages").select("id", { count: "exact", head: true }),
      ]);
      return {
        profiles: profiles.count ?? 0,
        events:   events.count ?? 0,
        tasks:    tasks.count ?? 0,
        messages: messages.count ?? 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Analytics</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Platform-wide activity insights</p>
        </div>
        <Select value={range} onValueChange={v => setRange(v as "7" | "30" | "90")}>
          <SelectTrigger className="bg-crm-card border-crm-border text-crm-text text-xs h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-crm-card border-crm-border">
            <SelectItem value="7"  className="text-crm-text text-xs">Last 7 days</SelectItem>
            <SelectItem value="30" className="text-crm-text text-xs">Last 30 days</SelectItem>
            <SelectItem value="90" className="text-crm-text text-xs">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Team members" value={counts?.profiles ?? "…"} icon={Users}         accent="bg-emerald-950 border-emerald-800 text-emerald-400" />
        <StatCard label="Total tasks"  value={counts?.tasks ?? "…"}    icon={CheckSquare}   accent="bg-blue-950 border-blue-800 text-blue-400" />
        <StatCard label="Messages"     value={counts?.messages ?? "…"} icon={MessageSquare} accent="bg-violet-950 border-violet-800 text-violet-400" />
        <StatCard label="Events"       value={counts?.events ?? "…"}   icon={Calendar}      accent="bg-amber-950 border-amber-800 text-amber-400" />
      </div>

      {/* Task velocity + status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-crm-card border border-crm-border rounded-xl p-4">
          <p className="text-[11px] font-semibold text-crm-text mb-3">Task velocity (weekly)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={taskStats?.velocity ?? []}>
              <XAxis dataKey="week" tick={{ fill: "#4a6650", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4a6650", fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#34d399" radius={[3, 3, 0, 0]} name="Tasks created" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-crm-card border border-crm-border rounded-xl p-4">
          <p className="text-[11px] font-semibold text-crm-text mb-3">Tasks by status</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={taskStats?.byStatus ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {(taskStats?.byStatus ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Message activity */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-4">
        <p className="text-[11px] font-semibold text-crm-text mb-3">Message activity</p>
        {msgData && msgData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={msgData}>
              <XAxis dataKey="day" tick={{ fill: "#4a6650", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4a6650", fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2} dot={false} name="Messages" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-32 text-crm-text-dim text-sm">
            No message activity in this period.
          </div>
        )}
      </div>

      {/* Application funnel */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-4">
        <p className="text-[11px] font-semibold text-crm-text mb-3">Application funnel</p>
        {appStats && appStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={appStats} layout="vertical">
              <XAxis type="number" tick={{ fill: "#4a6650", fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#6b8f72", fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} name="Applications">
                {(appStats ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-32 text-crm-text-dim text-sm">
            No application data yet.
          </div>
        )}
      </div>
    </div>
  );
}
