import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Pencil, Trash2, Send, Clock, CheckCircle2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Campaign {
  id: string;
  title: string;
  type: "email" | "social" | "press";
  status: "draft" | "active" | "completed";
  target_audience: string | null;
  scheduled_at: string | null;
  notes: string | null;
  created_at: string;
  created_by_name: string | null;
}

const TYPE_CONFIG = {
  email:  { label: "Email",  classes: "bg-blue-950 text-blue-400 border-blue-800",       icon: Send },
  social: { label: "Social", classes: "bg-violet-950 text-violet-400 border-violet-800", icon: Megaphone },
  press:  { label: "Press",  classes: "bg-amber-950 text-amber-400 border-amber-800",    icon: Megaphone },
};

const STATUS_CONFIG = {
  draft:     { label: "Draft",     classes: "bg-crm-surface text-crm-text-muted border-crm-border-hover", icon: Clock },
  active:    { label: "Active",    classes: "bg-emerald-950 text-emerald-400 border-emerald-800", icon: Play },
  completed: { label: "Completed", classes: "bg-slate-900 text-slate-400 border-slate-700", icon: CheckCircle2 },
};

const STATUS_NEXT: Record<Campaign["status"], Campaign["status"] | null> = {
  draft: "active",
  active: "completed",
  completed: null,
};

// ─── Campaign Dialog ───────────────────────────────────────────────────────────
function CampaignDialog({ open, onClose, campaign }: {
  open: boolean; onClose: () => void; campaign?: Campaign;
}) {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [type, setType] = useState<Campaign["type"]>(campaign?.type ?? "email");
  const [status, setStatus] = useState<Campaign["status"]>(campaign?.status ?? "draft");
  const [audience, setAudience] = useState(campaign?.target_audience ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    campaign?.scheduled_at ? campaign.scheduled_at.slice(0, 16) : ""
  );
  const [notes, setNotes] = useState(campaign?.notes ?? "");

  const isEdit = !!campaign;

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        type,
        status,
        target_audience: audience || null,
        scheduled_at: scheduledAt || null,
        notes: notes || null,
      };
      if (isEdit) {
        await (supabase as any).from("campaigns").update(payload).eq("id", campaign.id);
      } else {
        await (supabase as any).from("campaigns").insert({ ...payload, created_by: user!.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? "Edit Campaign" : "New Campaign"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
              placeholder="Campaign name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Type</Label>
              <Select value={type} onValueChange={v => setType(v as Campaign["type"])}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  <SelectItem value="email"  className="text-crm-text text-xs">Email</SelectItem>
                  <SelectItem value="social" className="text-crm-text text-xs">Social</SelectItem>
                  <SelectItem value="press"  className="text-crm-text text-xs">Press</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as Campaign["status"])}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  <SelectItem value="draft"     className="text-crm-text text-xs">Draft</SelectItem>
                  <SelectItem value="active"    className="text-crm-text text-xs">Active</SelectItem>
                  <SelectItem value="completed" className="text-crm-text text-xs">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Target audience</Label>
              <Input value={audience} onChange={e => setAudience(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                placeholder="e.g. All delegates" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Schedule</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs min-h-[60px] resize-none"
              placeholder="Brief description or objectives" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!title.trim() || save.isPending}
            onClick={() => save.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function MarketingModule() {
  const { isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("campaigns")
        .select("id, title, type, status, target_audience, scheduled_at, notes, created_at, creator:profiles!campaigns_created_by_fkey(full_name)")
        .order("created_at", { ascending: false });
      if (res.error?.code === "42P01") return [];
      return (res.data ?? []).map((d: any) => ({
        id: d.id, title: d.title, type: d.type, status: d.status,
        target_audience: d.target_audience ?? null,
        scheduled_at: d.scheduled_at ?? null,
        notes: d.notes ?? null, created_at: d.created_at,
        created_by_name: d.creator?.full_name ?? null,
      }));
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("campaigns").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      setConfirmDeleteId(null);
    },
  });

  const advanceStatus = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: Campaign["status"] }) => {
      await (supabase as any).from("campaigns").update({ status: next }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const filtered = data.filter(c =>
    (filterType === "all" || c.type === filterType) &&
    (filterStatus === "all" || c.status === filterStatus)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Marketing Console</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Campaign management and audience targeting</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setAddOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> New Campaign
          </Button>
        )}
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = data.filter(c => c.status === key).length;
          return (
            <div key={key} className={`flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-lg border ${cfg.classes}`}>
              <cfg.icon size={10} />
              {cfg.label}: {count}
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="bg-crm-card border-crm-border text-crm-text text-xs h-8 w-32">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="bg-crm-card border-crm-border">
            <SelectItem value="all"    className="text-crm-text text-xs">All types</SelectItem>
            <SelectItem value="email"  className="text-crm-text text-xs">Email</SelectItem>
            <SelectItem value="social" className="text-crm-text text-xs">Social</SelectItem>
            <SelectItem value="press"  className="text-crm-text text-xs">Press</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-crm-card border-crm-border text-crm-text text-xs h-8 w-32">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-crm-card border-crm-border">
            <SelectItem value="all"       className="text-crm-text text-xs">All statuses</SelectItem>
            <SelectItem value="draft"     className="text-crm-text text-xs">Draft</SelectItem>
            <SelectItem value="active"    className="text-crm-text text-xs">Active</SelectItem>
            <SelectItem value="completed" className="text-crm-text text-xs">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
          <Megaphone className="h-6 w-6 text-crm-text-dim" />
          <p className="text-sm text-crm-text-muted">No campaigns found.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(c => {
          const typeCfg   = TYPE_CONFIG[c.type];
          const statusCfg = STATUS_CONFIG[c.status];
          const nextStatus = STATUS_NEXT[c.status];
          const isConfirming = confirmDeleteId === c.id;
          const TypeIcon = typeCfg.icon;

          return (
            <div key={c.id} className="bg-crm-card border border-crm-border rounded-xl p-4 hover:border-crm-border-hover transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${typeCfg.classes}`}>
                  <TypeIcon size={14} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[13px] font-semibold text-crm-text">{c.title}</p>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${typeCfg.classes}`}>{typeCfg.label}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${statusCfg.classes}`}>{statusCfg.label}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {c.target_audience && (
                      <span className="text-[10px] font-mono text-crm-text-dim bg-crm-surface border border-crm-border rounded px-1.5 py-0.5">{c.target_audience}</span>
                    )}
                    {c.scheduled_at && (
                      <span className="text-[10px] text-crm-text-muted">
                        Scheduled {format(parseISO(c.scheduled_at), "d MMM yyyy, HH:mm")}
                      </span>
                    )}
                    <span className="text-[10px] text-crm-text-dim">{format(parseISO(c.created_at), "d MMM yyyy")}</span>
                    {c.created_by_name && <span className="text-[10px] text-crm-text-dim">by {c.created_by_name}</span>}
                  </div>
                  {c.notes && <p className="text-[10px] text-crm-text-dim mt-1 truncate">{c.notes}</p>}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isAdmin && nextStatus && !isConfirming && (
                    <button
                      onClick={() => advanceStatus.mutate({ id: c.id, next: nextStatus })}
                      disabled={advanceStatus.isPending}
                      className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 border border-emerald-800 rounded px-2 py-1 hover:bg-emerald-900 transition-colors"
                    >
                      → {STATUS_CONFIG[nextStatus].label}
                    </button>
                  )}
                  {isAdmin && !isConfirming && (
                    <>
                      <button onClick={() => setEditTarget(c)}
                        className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(c.id)}
                        className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-red-400 hover:border-red-900 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                  {isAdmin && isConfirming && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deleteCampaign.mutate(c.id)} disabled={deleteCampaign.isPending}
                        className="text-[10px] font-semibold text-red-400 bg-red-950 border border-red-800 rounded px-2 py-1">
                        {deleteCampaign.isPending ? "…" : "Delete"}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-2 py-1">
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CampaignDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {editTarget && (
        <CampaignDialog campaign={editTarget} open={!!editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}
