import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe,
  Users,
  Mail,
  Monitor,
  MapPin,
  RefreshCw,
  Smartphone,
  Laptop,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

type Tab = "overview" | "visitors" | "charts";

function StatCard({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-sky-950 border border-sky-800 text-sky-400">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-crm-text-dim">
          {label}
        </p>
        <p className="text-2xl font-bold text-crm-text">{value}</p>
      </div>
    </div>
  );
}

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#a855f7", "#ef4444"];

export default function GeoAnalyticsModule() {
  const [tab, setTab] = useState<Tab>("overview");
  const [searchQ, setSearchQ] = useState("");
  const [range, setRange] = useState<"7" | "30" | "90" | "all">("30");

  const { data: visitors = [], refetch: refetchVisitors } = useQuery({
    queryKey: ["geo-visitors", range],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_visitors")
        .select("*")
        .order("created_at", { ascending: false });

      return data ?? [];
    },
  });

  const { data: contacts = [], refetch: refetchContacts } = useQuery({
    queryKey: ["geo-contacts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      return data ?? [];
    },
  });

  // FILTER BY DATE RANGE
  const filteredByDate = useMemo(() => {
    if (range === "all") return visitors;

    const days = Number(range);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return visitors.filter(
      (v: any) => new Date(v.created_at).getTime() >= cutoff
    );
  }, [visitors, range]);

  // SEARCH FILTER
  const filteredVisitors = useMemo(() => {
    return filteredByDate.filter((v: any) =>
      !searchQ
        ? true
        : (
            v.country +
            v.city +
            v.ip_address +
            v.current_page
          )
            .toLowerCase()
            .includes(searchQ.toLowerCase())
    );
  }, [filteredByDate, searchQ]);

  // ─────────────────────────────
  // GEO AGGREGATIONS
  // ─────────────────────────────

  const countryData = useMemo(() => {
    const map: any = {};
    filteredVisitors.forEach((v: any) => {
      const c = v.country || "Unknown";
      map[c] = (map[c] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]: any) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredVisitors]);

  const cityData = useMemo(() => {
    const map: any = {};
    filteredVisitors.forEach((v: any) => {
      const key = `${v.city || "Unknown"} (${v.country || "?"})`;
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]: any) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredVisitors]);

  const deviceData = useMemo(() => {
    const map: any = {};
    filteredVisitors.forEach((v: any) => {
      const d = v.device || "Unknown";
      map[d] = (map[d] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]: any) => ({
      name,
      value,
    }));
  }, [filteredVisitors]);

  const dailyData = useMemo(() => {
    const map: any = {};
    filteredVisitors.forEach((v: any) => {
      const d = new Date(v.created_at).toISOString().slice(0, 10);
      map[d] = (map[d] || 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, value]) => ({
        date: date.slice(5),
        value,
      }));
  }, [filteredVisitors]);

  const sessions = new Set(
    filteredVisitors.map((v: any) => v.session_id).filter(Boolean)
  ).size;

  const countries = new Set(
    filteredVisitors.map((v: any) => v.country).filter(Boolean)
  ).size;

  const conversionRate =
    filteredVisitors.length > 0
      ? ((contacts.length / filteredVisitors.length) * 100).toFixed(2)
      : "0";

  const bounceRate = useMemo(() => {
    if (filteredVisitors.length === 0) return "0";
    const sessionCounts: Record<string, number> = {};
    filteredVisitors.forEach((v: any) => {
      if (v.session_id) sessionCounts[v.session_id] = (sessionCounts[v.session_id] ?? 0) + 1;
    });
    const sessionList = Object.values(sessionCounts);
    if (sessionList.length === 0) return "0";
    const bounced = sessionList.filter(c => c === 1).length;
    return ((bounced / sessionList.length) * 100).toFixed(1);
  }, [filteredVisitors]);

  const tabs = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "visitors", label: "Visitors", icon: Users },
    { id: "charts", label: "Charts", icon: Monitor },
  ];

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">
            Geo Analytics v2
          </h2>
          <p className="text-xs text-crm-text-muted">
            Real-time geography, behavior & conversion insights
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            className="text-xs bg-crm-card border border-crm-border rounded px-2 py-1"
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
          >
            <option value="7">7D</option>
            <option value="30">30D</option>
            <option value="90">90D</option>
            <option value="all">All</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              refetchVisitors();
              refetchContacts();
            }}
          >
            <RefreshCw size={12} />
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Visitors" value={filteredVisitors.length} icon={Users} />
        <StatCard label="Countries" value={countries} icon={Globe} />
        <StatCard label="Sessions" value={sessions} icon={Monitor} />
        <StatCard label="Leads" value={contacts.length} icon={Mail} />
      </div>

      {/* INSIGHTS BAR */}
      <div className="grid md:grid-cols-3 gap-3">
        <StatCard label="Conversion rate" value={`${conversionRate}%`} icon={Mail} />
        <StatCard label="Bounce rate (est.)" value={`${bounceRate}%`} icon={Monitor} />
        <StatCard label="Avg sessions" value={(filteredVisitors.length / (sessions || 1)).toFixed(2)} icon={Globe} />
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-3 py-2 text-xs rounded-lg border ${
              tab === t.id
                ? "bg-sky-950 text-sky-400 border-sky-800"
                : "border-crm-border text-crm-text-muted"
            }`}
          >
            <t.icon size={12} className="inline mr-1" />
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-4">

          {/* COUNTRY */}
          <div className="bg-crm-card p-4 rounded-xl border">
            <h3 className="text-xs mb-2 font-semibold">Top Countries</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={countryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CITIES */}
          <div className="bg-crm-card p-4 rounded-xl border">
            <h3 className="text-xs mb-2 font-semibold">Top Cities</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DEVICES */}
          <div className="bg-crm-card p-4 rounded-xl border">
            <h3 className="text-xs mb-2 font-semibold">Devices</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deviceData} dataKey="value" label>
                  {deviceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* TRAFFIC */}
          <div className="bg-crm-card p-4 rounded-xl border">
            <h3 className="text-xs mb-2 font-semibold">Traffic trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="value" stroke="#a855f7" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VISITORS */}
      {tab === "visitors" && (
        <div className="bg-crm-card border rounded-xl p-3 max-h-[500px] overflow-y-auto">
          {filteredVisitors.slice(0, 100).map((v: any) => (
            <div
              key={v.id}
              className="flex justify-between text-xs border-b py-2"
            >
              <span>{v.country} / {v.city}</span>
              <span>{v.current_page}</span>
              <span>{v.device}</span>
              <span>{new Date(v.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* CHARTS EXTRA */}
      {tab === "charts" && (
        <div className="text-xs text-crm-text-muted">
          Add advanced funnels, heatmaps, and session replay here.
        </div>
      )}
    </div>
  );
}