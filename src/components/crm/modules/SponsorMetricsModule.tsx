import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Eye, Handshake, Clock, Pencil, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SponsorUser {
  id: string;
  full_name: string;
  email: string;
  country: string;
}

type Tier = "gold" | "silver" | "bronze";

const TIER_CONFIG: Record<Tier, { label: string; classes: string; accent: string }> = {
  gold:   { label: "Gold",   classes: "bg-amber-950 text-amber-400 border-amber-800",   accent: "border-l-amber-500"  },
  silver: { label: "Silver", classes: "bg-slate-900 text-slate-300 border-slate-700",   accent: "border-l-slate-400"  },
  bronze: { label: "Bronze", classes: "bg-orange-950 text-orange-400 border-orange-800", accent: "border-l-orange-500" },
};

function deriveTier(index: number): Tier {
  if (index < 2) return "gold";
  if (index < 5) return "silver";
  return "bronze";
}

// ─── Edit Sponsor Dialog ───────────────────────────────────────────────────────
function EditSponsorDialog({ sponsor, tier, open, onClose, onTierChange }: {
  sponsor: SponsorUser;
  tier: Tier;
  open: boolean;
  onClose: () => void;
  onTierChange: (id: string, tier: Tier) => void;
}) {
  const qc = useQueryClient();
  const [fullName, setFullName] = useState(sponsor.full_name);
  const [country, setCountry] = useState(sponsor.country);
  const [selectedTier, setSelectedTier] = useState<Tier>(tier);

  const update = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("profiles")
        .update({ full_name: fullName, country })
        .eq("id", sponsor.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-sponsors"] });
      onTierChange(sponsor.id, selectedTier);
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1610] border-[#1e2d22] text-[#c8e0cc] max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-[#c8e0cc]">Edit Sponsor</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)}
              className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Country</Label>
            <Input value={country} onChange={e => setCountry(e.target.value)}
              className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Tier</Label>
            <Select value={selectedTier} onValueChange={v => setSelectedTier(v as Tier)}>
              <SelectTrigger className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1610] border-[#1e2d22]">
                <SelectItem value="gold"   className="text-[#c8e0cc] text-xs">Gold</SelectItem>
                <SelectItem value="silver" className="text-[#c8e0cc] text-xs">Silver</SelectItem>
                <SelectItem value="bronze" className="text-[#c8e0cc] text-xs">Bronze</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-[#1e2d22] text-[#6b8f72] text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!fullName.trim() || update.isPending}
            onClick={() => update.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {update.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function SponsorMetricsModule() {
  const { isAdmin, isSuperAdmin } = useAuthContext();
  const qc = useQueryClient();
  const [tierOverrides, setTierOverrides] = useState<Record<string, Tier>>({});
  const [editTarget, setEditTarget] = useState<SponsorUser | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

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

  const removeSponsorRole = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("user_roles")
        .delete()
        .eq("user_id", id)
        .eq("role", "sponsor");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-sponsors"] });
      setConfirmRemoveId(null);
    },
  });

  const getTier = (sponsor: SponsorUser, index: number): Tier =>
    tierOverrides[sponsor.id] ?? deriveTier(index);

  const goldCount   = sponsors.filter((sp, i) => getTier(sp, i) === "gold").length;
  const silverCount = sponsors.filter((sp, i) => getTier(sp, i) === "silver").length;
  const bronzeCount = sponsors.filter((sp, i) => getTier(sp, i) === "bronze").length;

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
          { label: "Total sponsors", value: isLoading ? "…" : String(sponsors.length), icon: Handshake, accent: "bg-emerald-950 border-emerald-800 text-emerald-400" },
          { label: "Gold tier",      value: isLoading ? "…" : String(goldCount),        icon: TrendingUp, accent: "bg-amber-950 border-amber-800 text-amber-400"    },
          { label: "Silver tier",    value: isLoading ? "…" : String(silverCount),      icon: TrendingUp, accent: "bg-slate-900 border-slate-700 text-slate-300"     },
          { label: "Bronze tier",    value: isLoading ? "…" : String(bronzeCount),      icon: TrendingUp, accent: "bg-orange-950 border-orange-800 text-orange-400"  },
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

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && sponsors.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#111a14] border border-[#1e2d22] flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-[#4a6650]" />
          </div>
          <p className="text-sm text-[#6b8f72]">
            No sponsor accounts yet. Invite sponsors via the People &amp; Access module.
          </p>
        </div>
      )}

      {!isLoading && sponsors.length > 0 && (
        <div className="space-y-3">
          {sponsors.map((sp, i) => {
            const tier = getTier(sp, i);
            const cfg = TIER_CONFIG[tier];
            const initials = sp.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
            const isConfirming = confirmRemoveId === sp.id;

            return (
              <div
                key={sp.id}
                className={`bg-[#0d1610] border border-[#1e2d22] rounded-xl p-4 border-l-4 ${cfg.accent}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1e2d22] flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0 uppercase">
                    {initials}
                  </div>

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

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="hidden sm:flex gap-2">
                      {[
                        { label: "Impressions", icon: Eye },
                        { label: "Report",      icon: TrendingUp },
                      ].map(({ label, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-1 bg-[#111a14] border border-[#1e2d22] rounded-lg px-2 py-1">
                          <Icon size={11} className="text-[#4a6650]" />
                          <span className="text-[10px] text-[#4a6650]">{label}</span>
                          <span className="text-[10px] text-[#2a3d2d] font-mono ml-1">—</span>
                        </div>
                      ))}
                    </div>

                    {isAdmin && !isConfirming && (
                      <button
                        onClick={() => { setEditTarget(sp); setEditOpen(true); }}
                        className="w-7 h-7 rounded flex items-center justify-center bg-[#111a14] border border-[#1e2d22] text-[#4a6650] hover:text-[#a0c4a8] hover:bg-[#1e2d22] transition-colors"
                        title="Edit sponsor"
                      >
                        <Pencil size={12} />
                      </button>
                    )}

                    {isSuperAdmin && !isConfirming && (
                      <button
                        onClick={() => setConfirmRemoveId(sp.id)}
                        className="w-7 h-7 rounded flex items-center justify-center bg-[#111a14] border border-[#1e2d22] text-[#4a6650] hover:text-red-400 hover:border-red-900 hover:bg-red-950 transition-colors"
                        title="Remove sponsor role"
                      >
                        <UserMinus size={12} />
                      </button>
                    )}

                    {isSuperAdmin && isConfirming && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeSponsorRole.mutate(sp.id)}
                          disabled={removeSponsorRole.isPending}
                          className="text-[10px] font-semibold text-red-400 hover:text-red-300 bg-red-950 border border-red-800 rounded px-2 py-1 transition-colors"
                        >
                          {removeSponsorRole.isPending ? "…" : "Remove"}
                        </button>
                        <button
                          onClick={() => setConfirmRemoveId(null)}
                          className="text-[10px] text-[#4a6650] hover:text-[#a0c4a8] bg-[#111a14] border border-[#1e2d22] rounded px-2 py-1 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </div>

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

      {editTarget && (
        <EditSponsorDialog
          sponsor={editTarget}
          tier={getTier(editTarget, sponsors.findIndex(s => s.id === editTarget.id))}
          open={editOpen}
          onClose={() => { setEditOpen(false); setEditTarget(null); }}
          onTierChange={(id, t) => setTierOverrides(prev => ({ ...prev, [id]: t }))}
        />
      )}
    </div>
  );
}
