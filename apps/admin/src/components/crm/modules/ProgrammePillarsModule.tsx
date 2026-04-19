import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PillarRow {
  id: string;
  slug: string;
  emoji: string | null;
  color: string | null;
  icon_bg: string | null;
  route: string | null;
  progress_percent: number;
  lead_name: string | null;
  sponsors: string[];
  display_order: number;
  is_active: boolean;
}

function PillarDialog({ open, onClose, pillar }: { open: boolean; onClose: () => void; pillar?: PillarRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!pillar;

  const [slug, setSlug] = useState(pillar?.slug ?? "");
  const [emoji, setEmoji] = useState(pillar?.emoji ?? "");
  const [color, setColor] = useState(pillar?.color ?? "hsl(152 100% 26%)");
  const [iconBg, setIconBg] = useState(pillar?.icon_bg ?? "bg-primary/10");
  const [route, setRoute] = useState(pillar?.route ?? "");
  const [progress, setProgress] = useState(pillar?.progress_percent?.toString() ?? "0");
  const [leadName, setLeadName] = useState(pillar?.lead_name ?? "");
  const [sponsors, setSponsors] = useState(pillar?.sponsors?.join(", ") ?? "");
  const [displayOrder, setDisplayOrder] = useState(pillar?.display_order?.toString() ?? "0");
  const [isActive, setIsActive] = useState(pillar?.is_active ?? true);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        emoji: emoji || null,
        color: color || null,
        icon_bg: iconBg || null,
        route: route || null,
        progress_percent: Math.min(100, Math.max(0, parseInt(progress) || 0)),
        lead_name: leadName || null,
        sponsors: sponsors ? sponsors.split(",").map(s => s.trim()).filter(Boolean) : [],
        display_order: parseInt(displayOrder) || 0,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };
      if (isEdit) {
        const { error } = await supabase.from("programme_pillars").update(payload).eq("id", pillar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("programme_pillars").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programme_pillars"] });
      toast({ title: isEdit ? "Pillar updated" : "Pillar created" });
      onClose();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? "Edit Programme Pillar" : "Add Programme Pillar"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Slug *</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)}
                placeholder="youth" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Emoji</Label>
              <Input value={emoji} onChange={e => setEmoji(e.target.value)}
                placeholder="🚀" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Route (e.g. /programmes/youth)</Label>
            <Input value={route} onChange={e => setRoute(e.target.value)}
              placeholder="/programmes/youth" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Accent Colour (CSS)</Label>
              <Input value={color} onChange={e => setColor(e.target.value)}
                placeholder="hsl(152 100% 26%)" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Icon Background (Tailwind)</Label>
              <Input value={iconBg} onChange={e => setIconBg(e.target.value)}
                placeholder="bg-primary/10" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Progress % (0–100)</Label>
              <Input type="number" min={0} max={100} value={progress} onChange={e => setProgress(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Display Order</Label>
              <Input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Lead Name</Label>
            <Input value={leadName} onChange={e => setLeadName(e.target.value)}
              placeholder="K. Asante" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Sponsors (comma-separated)</Label>
            <Input value={sponsors} onChange={e => setSponsors(e.target.value)}
              placeholder="AfDB, UNDP" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-[11px] text-crm-text-dim">Active (visible on public site)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-crm-text-muted">Cancel</Button>
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending || !slug}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Pillar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProgrammePillarsModule() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PillarRow | undefined>();
  const [deleting, setDeleting] = useState<PillarRow | undefined>();

  const { data: pillars = [], isLoading } = useQuery<PillarRow[]>({
    queryKey: ["programme_pillars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programme_pillars")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("programme_pillars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programme_pillars"] });
      toast({ title: "Pillar deleted" });
      setDeleting(undefined);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditing(undefined); setDialogOpen(true); };
  const openEdit = (p: PillarRow) => { setEditing(p); setDialogOpen(true); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Programme Pillars</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            Manage the 7 programme pillars displayed on the homepage grid. Changes reflect immediately on the public site.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
          <Plus size={13} /> Add Pillar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {pillars.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-crm-card border border-crm-border rounded-xl px-4 py-3">
              <GripVertical size={14} className="text-crm-text-dim flex-shrink-0" />
              <span className="text-lg">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-crm-text font-mono">{p.slug}</span>
                  {!p.is_active && <Badge variant="outline" className="text-[10px] text-crm-text-dim border-crm-border">Hidden</Badge>}
                </div>
                <p className="text-[11px] text-crm-text-muted">{p.route} · Lead: {p.lead_name || "TBD"} · {p.progress_percent}%</p>
                {p.sponsors?.length > 0 && (
                  <p className="text-[10px] text-emerald-500 mt-0.5">{p.sponsors.join(" · ")}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted hover:text-crm-text" onClick={() => openEdit(p)}>
                  <Pencil size={12} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted hover:text-red-400" onClick={() => setDeleting(p)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
          {pillars.length === 0 && (
            <p className="text-sm text-crm-text-muted text-center py-10">No pillars yet. Click "Add Pillar" to create the first one.</p>
          )}
        </div>
      )}

      <PillarDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(undefined); }}
        pillar={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={o => !o && setDeleting(undefined)}>
        <AlertDialogContent className="bg-crm-card border-crm-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-crm-text text-sm">Delete pillar?</AlertDialogTitle>
            <AlertDialogDescription className="text-crm-text-muted text-xs">
              This will permanently remove the "{deleting?.slug}" pillar from the public site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-crm-border text-crm-text text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && deleteMutation.mutate(deleting.id)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
