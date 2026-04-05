import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe, Users, Mail, Monitor, Clock, MapPin, Filter, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

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

type GeoTab = "visitors" | "contacts" | "charts";

export default function GeoAnalyticsModule() {
  const [tab, setTab] = useState<GeoTab>("visitors");
  const [searchQ, setSearchQ] = useState("");

  const { data: visitors = [], isLoading: loadingVisitors, refetch: refetchVisitors } = useQuery({
    queryKey: ["geo-visitors"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("site_visitors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      return data ?? [];
    },
  });

  const { data: contacts = [], isLoading: loadingContacts, refetch: refetchContacts } = useQuery({
    queryKey: ["geo-contacts"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  // Country breakdown
  const countryMap: Record<string, number> = {};
  visitors.forEach((v: any) => {
    const c = v.country || "Unknown";
    countryMap[c] = (countryMap[c] || 0) + 1;
  });
  const countryChart = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count }));

  // Daily trend (last 30 days)
  const dayMap: Record<string, number> = {};
  visitors.forEach((v: any) => {
    const d = new Date(v.created_at).toISOString().slice(0, 10);
    dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const dailyChart = Object.entries(dayMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, count]) => ({ date: date.slice(5), count }));

  // Page breakdown
  const pageMap: Record<string, number> = {};
  visitors.forEach((v: any) => {
    const p = v.current_page || "/";
    pageMap[p] = (pageMap[p] || 0) + 1;
  });
  const topPages = Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const uniqueCountries = new Set(visitors.map((v: any) => v.country).filter(Boolean)).size;
  const uniqueSessions = new Set(visitors.map((v: any) => v.session_id).filter(Boolean)).size;

  const filteredVisitors = visitors.filter((v: any) =>
    !searchQ ||
    (v.country || "").toLowerCase().includes(searchQ.toLowerCase()) ||
    (v.ip_address || "").includes(searchQ) ||
    (v.current_page || "").toLowerCase().includes(searchQ.toLowerCase())
  );

  const tabs: { id: GeoTab; label: string; icon: React.ElementType }[] = [
    { id: "visitors", label: "Visitors", icon: Users },
    { id: "contacts", label: "Contact Leads", icon: Mail },
    { id: "charts", label: "Charts", icon: Globe },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-sky-950 border border-sky-800 flex items-center justify-center">
              <Globe size={12} className="text-sky-400" />
            </div>
            <h2 className="text-lg font-bold text-crm-text">Geo Analytics</h2>
          </div>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Website visitor analytics & contact submissions</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => { refetchVisitors(); refetchContacts(); }}
          className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs gap-1.5 h-8">
          <RefreshCw size={12} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total visits" value={loadingVisitors ? "…" : visitors.length} icon={Users} accent="bg-sky-950 border-sky-800 text-sky-400" />
        <StatCard label="Countries" value={loadingVisitors ? "…" : uniqueCountries} icon={Globe} accent="bg-emerald-950 border-emerald-800 text-emerald-400" />
        <StatCard label="Sessions" value={loadingVisitors ? "…" : uniqueSessions} icon={Monitor} accent="bg-violet-950 border-violet-800 text-violet-400" />
        <StatCard label="Contact leads" value={loadingContacts ? "…" : contacts.length} icon={Mail} accent="bg-amber-950 border-amber-800 text-amber-400" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
              tab === t.id ? "bg-sky-950 text-sky-400 border border-sky-800" : "text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface border border-transparent"
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Visitors Tab */}
      {tab === "visitors" && (
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between gap-3">
            <h3 className="text-[12px] font-semibold text-crm-text-secondary">Recent visitors ({filteredVisitors.length})</h3>
            <Input placeholder="Search country, IP, page…" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-7 w-56" />
          </div>
          {loadingVisitors ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-5 h-5 border-2 border-sky-700 border-t-sky-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-crm-border max-h-[500px] overflow-y-auto">
              {filteredVisitors.slice(0, 100).map((v: any) => (
                <div key={v.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-crm-surface transition-colors text-[11px]">
                  <MapPin size={11} className="text-sky-400 flex-shrink-0" />
                  <span className="text-crm-text font-medium w-20 truncate">{v.country || "—"}</span>
                  <span className="text-crm-text-dim w-16 truncate">{v.city || "—"}</span>
                  <span className="text-crm-text-dim font-mono w-28 truncate">{v.ip_address || "—"}</span>
                  <span className="text-crm-text-muted flex-1 truncate">{v.current_page || "/"}</span>
                  <span className="text-crm-text-dim w-16 truncate">{v.device || "—"}</span>
                  <span className="text-crm-text-faint w-20 truncate">{v.browser || "—"}</span>
                  <span className="text-crm-text-faint w-28 truncate">{new Date(v.created_at).toLocaleString()}</span>
                </div>
              ))}
              {filteredVisitors.length === 0 && (
                <p className="text-[12px] text-crm-text-faint text-center py-8">No visitor data yet.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contacts Tab */}
      {tab === "contacts" && (
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-crm-border">
            <h3 className="text-[12px] font-semibold text-crm-text-secondary">Contact submissions ({contacts.length})</h3>
          </div>
          {loadingContacts ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-5 h-5 border-2 border-sky-700 border-t-sky-400 rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-[12px] text-crm-text-faint text-center py-8">No contact submissions yet.</p>
          ) : (
            <div className="divide-y divide-crm-border max-h-[500px] overflow-y-auto">
              {contacts.map((c: any) => (
                <div key={c.id} className="px-4 py-3 hover:bg-crm-surface transition-colors">
                  <div className="flex items-center gap-3 text-[12px]">
                    <Mail size={11} className="text-amber-400 flex-shrink-0" />
                    <span className="text-crm-text font-semibold">{c.name || "—"}</span>
                    <span className="text-crm-text-muted">{c.email || "—"}</span>
                    <span className="text-crm-text-dim">{c.phone || ""}</span>
                    <span className="text-crm-text-faint ml-auto">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  {c.message && <p className="text-[11px] text-crm-text-dim mt-1 ml-6 line-clamp-2">{c.message}</p>}
                  {c.source_page && <p className="text-[10px] text-crm-text-faint mt-0.5 ml-6">From: {c.source_page}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Charts Tab */}
      {tab === "charts" && (
        <div className="space-y-4">
          {/* Country bar chart */}
          <div className="bg-crm-card border border-crm-border rounded-xl p-4">
            <h3 className="text-[12px] font-semibold text-crm-text-secondary mb-3">Visitors by country</h3>
            {countryChart.length === 0 ? (
              <p className="text-[12px] text-crm-text-faint text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={countryChart}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--crm-text-dim))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--crm-text-dim))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--crm-card))", border: "1px solid hsl(var(--crm-border))", fontSize: 11 }} />
                  <Bar dataKey="count" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Daily trend */}
          <div className="bg-crm-card border border-crm-border rounded-xl p-4">
            <h3 className="text-[12px] font-semibold text-crm-text-secondary mb-3">Daily visitor trend</h3>
            {dailyChart.length === 0 ? (
              <p className="text-[12px] text-crm-text-faint text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--crm-border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--crm-text-dim))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--crm-text-dim))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--crm-card))", border: "1px solid hsl(var(--crm-border))", fontSize: 11 }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(160, 70%, 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top pages */}
          <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-crm-border">
              <h3 className="text-[12px] font-semibold text-crm-text-secondary">Most visited pages</h3>
            </div>
            <div className="divide-y divide-crm-border">
              {topPages.map(([page, count]) => (
                <div key={page} className="flex items-center justify-between px-4 py-2.5 text-[11px]">
                  <span className="text-crm-text font-mono">{page}</span>
                  <span className="text-crm-text-muted font-bold">{count}</span>
                </div>
              ))}
              {topPages.length === 0 && (
                <p className="text-[12px] text-crm-text-faint text-center py-6">No page data yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
