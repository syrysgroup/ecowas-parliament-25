import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Eye, Handshake, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CRM_ROLE_META } from "../crmRoles";

interface SponsorUser {
  id: string;
  full_name: string;
  email: string;
  country: string;
}

const TIER_CONFIG = {
  gold:   { label: "Gold",   classes: "bg-amber-950 text-amber-400 border-amber-800",  accent: "border-l-amber-500"  },
  silver: { label: "Silver", classes: "bg-slate-900 text-slate-300 border-slate-700",  accent: "border-l-slate-400"  },
  bronze: { label: "Bronze", classes: "bg-orange-950 text-orange-400 border-orange-800", accent: "border-l-orange-500" },
};

// Sponsors are users with the "sponsor" role. Tier is not yet in the DB
// so we derive it from position (first 2 = gold, next 3 = silver, rest = bronze).
function deriveTier(index: number): "gold" | "silver" | "bronze" {
  if (index < 2) return "gold";
  if (index < 5) return "silver";
  return "bronze";
}

export default function SponsorMetricsModule() {
  const { data: sponsors = [], isLoading } = useQuery<SponsorUser[]>({
    queryKey: ["crm-sponsors"],
    queryFn: async () => {
      const rolesRes = await (supabase as any)
        .from("user_roles")
        .select("user_id")
        .eq("role", "sponsor");

      const ids: string[] = (rolesRes.data ?? []).map((r: any) => r.user_id);
      if (ids.length === 0) return [];

      const profilesRes = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email, country")
        .in("id", ids)
        .order("full_name", { ascending: true });

      return (profilesRes.data ?? []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name ?? "Unnamed Sponsor",
        email: p.email ?? "",
        country: p.country ?? "—",
      }));
    },
  });

  const goldCount   = sponsors.filter((_, i) => deriveTier(i) === "gold").length;
  const silverCount = sponsors.filter((_, i) => deriveTier(i) === "silver").length;
  const bronzeCount = sponsors.filter((_, i) => deriveTier(i) === "bronze").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#c8e0cc]">Sponsor Metrics</h2>
        <p className="text-[12px] text-[#6b8f72] mt-0.5">
          Visibility reports and engagement tracking for each sponsor partner
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total sponsors",  value: isLoading ? "…" : String(sponsors.length), icon: Handshake, accent: "bg-emerald-950 border-emerald-800 text-emerald-400" },
          { label: "Gold tier",       value: isLoading ? "…" : String(goldCount),        icon: TrendingUp, accent: "bg-amber-950 border-amber-800 text-amber-400"     },
          { label: "Silver tier",     value: isLoading ? "…" : String(silverCount),      icon: TrendingUp, accent: "bg-slate-900 border-slate-700 text-slate-300"      },
          { label: "Bronze tier",     value: isLoading ? "…" : String(bronzeCount),      icon: TrendingUp, accent: "bg-orange-950 border-orange-800 text-orange-400"   },
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

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sponsors.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#111a14] border border-[#1e2d22] flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-[#4a6650]" />
          </div>
          <p className="text-sm text-[#6b8f72]">
            No sponsor accounts yet. Invite sponsors via Super Admin → Invitations.
          </p>
        </div>
      )}

      {/* Sponsor list */}
      {!isLoading && sponsors.length > 0 && (
        <div className="space-y-3">
          {sponsors.map((sp, i) => {
            const tier = deriveTier(i);
            const cfg = TIER_CONFIG[tier];
            const initials = sp.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

            return (
              <div
                key={sp.id}
                className={`bg-[#0d1610] border border-[#1e2d22] rounded-xl p-4 border-l-4 ${cfg.accent}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#1e2d22] flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0 uppercase">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-[13px] font-semibold text-[#c8e0cc]">{sp.full_name}</p>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${cfg.classes}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6b8f72]">{sp.email}</p>
                    <p className="text-[10px] text-[#4a6650] mt-0.5">{sp.country}</p>
                  </div>

                  {/* Placeholder metric chips */}
                  <div className="hidden sm:flex gap-2 flex-shrink-0">
                    {[
                      { label: "Impressions", icon: Eye  },
                      { label: "Report",      icon: TrendingUp },
                    ].map(({ label, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-1 bg-[#111a14] border border-[#1e2d22] rounded-lg px-2 py-1">
                        <Icon size={11} className="text-[#4a6650]" />
                        <span className="text-[10px] text-[#4a6650]">{label}</span>
                        <span className="text-[10px] text-[#2a3d2d] font-mono ml-1">—</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics note */}
                <div className="mt-3 pt-3 border-t border-[#1e2d22] flex items-center gap-2">
                  <Clock size={10} className="text-[#3a5040]" />
                  <p className="text-[10px] text-[#3a5040] font-mono">
                    Detailed visibility metrics will be available once sponsor reporting is configured.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
