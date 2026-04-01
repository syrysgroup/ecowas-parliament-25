import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileClock, Trophy, Vote } from "lucide-react";
import { format, parseISO } from "date-fns";

interface QueueItem {
  id: string;
  full_name: string;
  country: string;
  created_at: string;
  status?: string;
  vote_count?: number;
}

const STATUS_STYLE: Record<string, string> = {
  pending:  "bg-amber-950 text-amber-400 border-amber-800",
  approved: "bg-emerald-950 text-emerald-400 border-emerald-800",
  rejected: "bg-red-950 text-red-400 border-red-800",
};

export default function ParliamentOpsModule() {
  const [applications,    setApplications]    = useState<QueueItem[]>([]);
  const [nominations,     setNominations]     = useState<QueueItem[]>([]);
  const [representatives, setRepresentatives] = useState<QueueItem[]>([]);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [appRes, nomRes, repRes] = await Promise.all([
        (supabase as any)
          .from("applications")
          .select("id, country, created_at, status, profiles!inner(full_name)")
          .order("created_at", { ascending: false })
          .limit(20),
        (supabase as any)
          .from("public_nominee_leaderboard")
          .select("id, full_name, country, created_at, vote_count")
          .order("vote_count", { ascending: false })
          .limit(20),
        (supabase as any)
          .from("public_representatives")
          .select("id, full_name, country, verified_at")
          .order("verified_at", { ascending: false })
          .limit(20),
      ]);

      setApplications(
        (appRes.data ?? []).map((a: any) => ({
          id: a.id,
          full_name: a.profiles?.full_name ?? "Applicant",
          country: a.country,
          created_at: a.created_at,
          status: a.status,
        }))
      );
      setNominations(
        (nomRes.data ?? []).map((n: any) => ({
          id: n.id,
          full_name: n.full_name,
          country: n.country,
          created_at: n.created_at,
          vote_count: n.vote_count,
        }))
      );
      setRepresentatives(
        (repRes.data ?? []).map((r: any) => ({
          id: r.id,
          full_name: r.full_name,
          country: r.country,
          created_at: r.verified_at,
        }))
      );
      setLoading(false);
    };
    void load();
  }, []);

  const pending = applications.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#c8e0cc]">Parliament Operations</h2>
        <p className="text-[12px] text-[#6b8f72] mt-0.5">
          Review applications, track nominations, and manage verified delegates
        </p>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending applications", value: loading ? "…" : String(pending),             icon: FileClock, accent: "border-amber-800 text-amber-400 bg-amber-950"    },
          { label: "Qualified nominees",   value: loading ? "…" : String(nominations.length),  icon: Vote,      accent: "border-blue-800 text-blue-400 bg-blue-950"        },
          { label: "Verified delegates",   value: loading ? "…" : String(representatives.length), icon: Trophy, accent: "border-emerald-800 text-emerald-400 bg-emerald-950" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#0d1610] border border-[#1e2d22] rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${s.accent}`}>
                <Icon size={15} />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4a6650]">{s.label}</p>
                <p className="text-2xl font-bold text-[#c8e0cc]">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="grid xl:grid-cols-3 gap-5">
          {/* Applications */}
          <Section title="Application queue" icon={FileClock}>
            {applications.length === 0 ? (
              <Empty text="No applications yet." />
            ) : applications.map(a => (
              <ItemRow key={a.id} item={a}>
                <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${STATUS_STYLE[a.status ?? "pending"] ?? STATUS_STYLE.pending}`}>
                  {a.status ?? "pending"}
                </span>
              </ItemRow>
            ))}
          </Section>

          {/* Nominations */}
          <Section title="Nomination leaderboard" icon={Vote}>
            {nominations.length === 0 ? (
              <Empty text="No nominees yet." />
            ) : nominations.map(n => (
              <ItemRow key={n.id} item={n}>
                <span className="text-[9px] font-mono border border-blue-800 rounded px-1.5 py-0.5 bg-blue-950 text-blue-400">
                  {n.vote_count ?? 0} votes
                </span>
              </ItemRow>
            ))}
          </Section>

          {/* Representatives */}
          <Section title="Verified delegates" icon={CheckCircle2}>
            {representatives.length === 0 ? (
              <Empty text="No verified delegates yet." />
            ) : representatives.map(r => (
              <ItemRow key={r.id} item={r}>
                <CheckCircle2 size={13} className="text-emerald-500" />
              </ItemRow>
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-[#0d1610] border border-[#1e2d22] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d22]">
        <Icon size={13} className="text-[#4a6650]" />
        <h3 className="text-[12px] font-semibold text-[#a0c4a8]">{title}</h3>
      </div>
      <div className="divide-y divide-[#1e2d22]">{children}</div>
    </div>
  );
}

function ItemRow({ item, children }: { item: QueueItem; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-[#111a14] transition-colors">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-[#c8e0cc] truncate">{item.full_name}</p>
        <p className="text-[10px] text-[#4a6650]">{item.country}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-[12px] text-[#3a5040]">{text}</p>
    </div>
  );
}
