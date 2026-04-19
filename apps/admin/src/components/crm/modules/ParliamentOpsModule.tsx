import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { CheckCircle2, FileClock, Trophy, Vote, Check, X, UserMinus } from "lucide-react";

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
  const { isAdmin, isSuperAdmin } = useAuthContext();
  const qc = useQueryClient();

  const { data: applications = [], isLoading: loadingApps } = useQuery<QueueItem[]>({
    queryKey: ["parliament-applications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, country, created_at, status, profiles!inner(full_name)")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []).map((a: any) => ({
        id: a.id,
        full_name: a.profiles?.full_name ?? "Applicant",
        country: a.country,
        created_at: a.created_at,
        status: a.status,
      }));
    },
  });

  const { data: nominations = [], isLoading: loadingNoms } = useQuery<QueueItem[]>({
    queryKey: ["parliament-nominations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("public_nominee_leaderboard")
        .select("id, full_name, country, created_at, vote_count")
        .order("vote_count", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const { data: representatives = [], isLoading: loadingReps } = useQuery<QueueItem[]>({
    queryKey: ["parliament-representatives"],
    queryFn: async () => {
      const { data } = await supabase
        .from("public_representatives")
        .select("id, full_name, country, verified_at")
        .order("verified_at", { ascending: false })
        .limit(20);
      return (data ?? []).map((r: any) => ({
        id: r.id,
        full_name: r.full_name,
        country: r.country,
        created_at: r.verified_at,
      }));
    },
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from("applications").update({ status }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parliament-applications"] }),
  });

  const removeDelegate = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("public_representatives").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parliament-representatives"] }),
  });

  const loading = loadingApps || loadingNoms || loadingReps;
  const pending = applications.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-crm-text">Parliament Operations</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">
          Review applications, track nominations, and manage verified delegates
        </p>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending applications", value: loading ? "…" : String(pending),                icon: FileClock, accent: "border-amber-800 text-amber-400 bg-amber-950"    },
          { label: "Qualified nominees",   value: loading ? "…" : String(nominations.length),     icon: Vote,      accent: "border-blue-800 text-blue-400 bg-blue-950"        },
          { label: "Verified delegates",   value: loading ? "…" : String(representatives.length), icon: Trophy,    accent: "border-emerald-800 text-emerald-400 bg-emerald-950" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${s.accent}`}>
                <Icon size={15} />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-crm-text-dim">{s.label}</p>
                <p className="text-2xl font-bold text-crm-text">{s.value}</p>
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
              <ItemRow key={a.id} item={a} actions={
                isAdmin && a.status === "pending" ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateApplicationStatus.mutate({ id: a.id, status: "approved" })}
                      title="Approve"
                      className="w-6 h-6 rounded flex items-center justify-center bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 transition-colors"
                    >
                      <Check size={11} />
                    </button>
                    <button
                      onClick={() => updateApplicationStatus.mutate({ id: a.id, status: "rejected" })}
                      title="Reject"
                      className="w-6 h-6 rounded flex items-center justify-center bg-red-950 border border-red-800 text-red-400 hover:bg-red-900 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ) : (
                  <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${STATUS_STYLE[a.status ?? "pending"] ?? STATUS_STYLE.pending}`}>
                    {a.status ?? "pending"}
                  </span>
                )
              } />
            ))}
          </Section>

          {/* Nominations */}
          <Section title="Nomination leaderboard" icon={Vote}>
            {nominations.length === 0 ? (
              <Empty text="No nominees yet." />
            ) : nominations.map(n => (
              <ItemRow key={n.id} item={n} actions={
                <span className="text-[9px] font-mono border border-blue-800 rounded px-1.5 py-0.5 bg-blue-950 text-blue-400">
                  {n.vote_count ?? 0} votes
                </span>
              } />
            ))}
          </Section>

          {/* Representatives */}
          <Section title="Verified delegates" icon={CheckCircle2}>
            {representatives.length === 0 ? (
              <Empty text="No verified delegates yet." />
            ) : representatives.map(r => (
              <ItemRow key={r.id} item={r} actions={
                isSuperAdmin ? (
                  <button
                    onClick={() => removeDelegate.mutate(r.id)}
                    title="Remove delegate"
                    className="w-6 h-6 rounded flex items-center justify-center bg-red-950 border border-red-800 text-red-400 hover:bg-red-900 transition-colors"
                  >
                    <UserMinus size={11} />
                  </button>
                ) : (
                  <CheckCircle2 size={13} className="text-emerald-500" />
                )
              } />
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-crm-border">
        <Icon size={13} className="text-crm-text-dim" />
        <h3 className="text-[12px] font-semibold text-crm-text-secondary">{title}</h3>
      </div>
      <div className="divide-y divide-crm-border">{children}</div>
    </div>
  );
}

function ItemRow({ item, actions }: { item: QueueItem; actions: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-crm-surface transition-colors">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-crm-text truncate">{item.full_name}</p>
        <p className="text-[10px] text-crm-text-dim">{item.country}</p>
      </div>
      <div className="flex-shrink-0">{actions}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-[12px] text-crm-text-faint">{text}</p>
    </div>
  );
}
