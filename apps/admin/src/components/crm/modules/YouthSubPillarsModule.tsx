import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ImageUploadOrUrl from "@/components/shared/ImageUploadOrUrl";

interface SubPillar {
  id: string; slug: string; title: string; tagline: string | null;
  hero_image_url: string | null; intro_html: string | null;
  cta_label: string | null; cta_url: string | null; active: boolean;
}
interface Milestone { id: string; sub_pillar_id: string; title: string; date: string | null; description: string | null; position: number; }
interface Submission { id: string; sub_pillar_id: string; applicant_name: string; email: string; country: string | null; project_title: string; project_summary: string | null; status: string; created_at: string; }

export default function YouthSubPillarsModule() {
  const [selected, setSelected] = useState<string | null>(null);

  const { data: pillars = [], isLoading } = useQuery<SubPillar[]>({
    queryKey: ["youth-sub-pillars"],
    queryFn: async () => {
      const { data, error } = await supabase.from("youth_sub_pillars").select("*").order("title");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Youth Sub-Pillars</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Manage Innovators Challenge, Smart Challenge, and any youth sub-programme content, milestones, and submissions.</p>
        </div>
        <a href="/programmes/youth" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-crm-text-dim hover:text-emerald-400">
          <ExternalLink size={11} /> View Youth page
        </a>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        <PillarList pillars={pillars} isLoading={isLoading} selected={selected} onSelect={setSelected} />
        {selected ? (
          <PillarDetail pillarId={selected} pillar={pillars.find(p => p.id === selected)!} />
        ) : (
          <div className="bg-crm-card border border-crm-border rounded-xl p-8 text-center">
            <p className="text-sm text-crm-text-muted">Select a sub-pillar to edit content, milestones, and submissions.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PillarList({ pillars, isLoading, selected, onSelect }: {
  pillars: SubPillar[]; isLoading: boolean; selected: string | null; onSelect: (id: string) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubPillar | undefined>();

  return (
    <div className="space-y-2">
      <Button size="sm" onClick={() => { setEditing(undefined); setDialogOpen(true); }}
        className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1 w-full">
        <Plus size={12} /> New sub-pillar
      </Button>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : pillars.map(p => (
        <button key={p.id} onClick={() => onSelect(p.id)}
          className={`w-full text-left bg-crm-card border rounded-lg px-3 py-2 transition-colors ${selected === p.id ? "border-emerald-500/60" : "border-crm-border hover:border-emerald-500/30"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-crm-text">{p.title}</span>
            {!p.active && <Badge variant="outline" className="text-[10px] border-crm-border text-crm-text-dim">hidden</Badge>}
          </div>
          <p className="text-[10px] text-crm-text-muted font-mono">/programmes/youth/{p.slug}</p>
        </button>
      ))}
      <PillarDialog open={dialogOpen} onClose={() => setDialogOpen(false)} pillar={editing} />
    </div>
  );
}

function PillarDialog({ open, onClose, pillar }: { open: boolean; onClose: () => void; pillar?: SubPillar }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<SubPillar>>(pillar ?? { slug: "", title: "", active: true });

  const save = useMutation({
    mutationFn: async () => {
      if (form.id) {
        const { error } = await supabase.from("youth_sub_pillars").update(form).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("youth_sub_pillars").insert(form as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["youth-sub-pillars"] }); onClose(); toast({ title: "Saved" }); },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader><DialogTitle className="text-sm">{pillar ? "Edit sub-pillar" : "New sub-pillar"}</DialogTitle></DialogHeader>
        <div className="space-y-2 text-xs">
          <div><Label className="text-[11px] text-crm-text-dim">Title</Label><Input value={form.title ?? ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-crm-surface border-crm-border text-xs h-8 mt-1" /></div>
          <div><Label className="text-[11px] text-crm-text-dim">Slug (URL)</Label><Input value={form.slug ?? ""} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="bg-crm-surface border-crm-border text-xs h-8 mt-1 font-mono" /></div>
          <label className="flex items-center gap-2"><Switch checked={form.active !== false} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} /><span className="text-[11px]">Active</span></label>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
          <Button size="sm" onClick={() => save.mutate()} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PillarDetail({ pillarId, pillar }: { pillarId: string; pillar: SubPillar }) {
  return (
    <Tabs defaultValue="content">
      <TabsList className="bg-crm-surface border border-crm-border h-8">
        <TabsTrigger value="content"     className="text-xs h-7">Content</TabsTrigger>
        <TabsTrigger value="milestones"  className="text-xs h-7">Milestones</TabsTrigger>
        <TabsTrigger value="submissions" className="text-xs h-7">Submissions</TabsTrigger>
      </TabsList>
      <TabsContent value="content"     className="mt-4"><ContentTab pillar={pillar} /></TabsContent>
      <TabsContent value="milestones"  className="mt-4"><MilestonesTab pillarId={pillarId} /></TabsContent>
      <TabsContent value="submissions" className="mt-4"><SubmissionsTab pillarId={pillarId} /></TabsContent>
    </Tabs>
  );
}

function ContentTab({ pillar }: { pillar: SubPillar }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<SubPillar>(pillar);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("youth_sub_pillars").update({
        title: form.title, tagline: form.tagline, hero_image_url: form.hero_image_url,
        intro_html: form.intro_html, cta_label: form.cta_label, cta_url: form.cta_url, active: form.active,
      }).eq("id", pillar.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["youth-sub-pillars"] }); toast({ title: "Saved" }); },
  });

  return (
    <div className="space-y-3 max-w-2xl text-xs">
      <div><Label className="text-[11px] text-crm-text-dim">Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-crm-surface border-crm-border text-xs h-8 mt-1" /></div>
      <div><Label className="text-[11px] text-crm-text-dim">Tagline</Label><Input value={form.tagline ?? ""} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} className="bg-crm-surface border-crm-border text-xs h-8 mt-1" /></div>
      <div><Label className="text-[11px] text-crm-text-dim">Hero image</Label><ImageUploadOrUrl value={form.hero_image_url ?? ""} onChange={v => setForm(f => ({ ...f, hero_image_url: v }))} bucket="cms-media" pathPrefix={`youth/${form.slug}/`} /></div>
      <div><Label className="text-[11px] text-crm-text-dim">Intro (HTML allowed)</Label><Textarea rows={6} value={form.intro_html ?? ""} onChange={e => setForm(f => ({ ...f, intro_html: e.target.value }))} className="bg-crm-surface border-crm-border text-xs mt-1" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-[11px] text-crm-text-dim">CTA label</Label><Input value={form.cta_label ?? ""} onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))} className="bg-crm-surface border-crm-border text-xs h-8 mt-1" /></div>
        <div><Label className="text-[11px] text-crm-text-dim">CTA URL</Label><Input value={form.cta_url ?? ""} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} className="bg-crm-surface border-crm-border text-xs h-8 mt-1" /></div>
      </div>
      <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">{save.isPending ? "Saving…" : "Save"}</Button>
    </div>
  );
}

function MilestonesTab({ pillarId }: { pillarId: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: items = [] } = useQuery<Milestone[]>({
    queryKey: ["youth-milestones", pillarId],
    queryFn: async () => {
      const { data } = await supabase.from("youth_milestones").select("*").eq("sub_pillar_id", pillarId).order("position");
      return data ?? [];
    },
  });
  const [editing, setEditing] = useState<Partial<Milestone> | null>(null);

  const save = useMutation({
    mutationFn: async (m: Partial<Milestone>) => {
      const payload = { ...m, sub_pillar_id: pillarId };
      if (m.id) {
        const { error } = await supabase.from("youth_milestones").update(payload).eq("id", m.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("youth_milestones").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["youth-milestones", pillarId] }); setEditing(null); toast({ title: "Saved" }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("youth_milestones").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["youth-milestones", pillarId] }),
  });

  return (
    <div className="space-y-2">
      <Button size="sm" onClick={() => setEditing({ title: "", position: (items[items.length-1]?.position ?? 0) + 10 })}
        className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1"><Plus size={12} /> New milestone</Button>
      {items.map(m => (
        <div key={m.id} className="flex items-center gap-2 bg-crm-card border border-crm-border rounded-lg px-3 py-2">
          <span className="text-[10px] font-mono text-crm-text-dim w-8">{m.position}</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-crm-text">{m.title}</p>
            <p className="text-[10px] text-crm-text-muted">{m.date} · {m.description}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(m)}><Pencil size={12} /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => del.mutate(m.id)}><Trash2 size={12} /></Button>
        </div>
      ))}
      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
            <DialogHeader><DialogTitle className="text-sm">{editing.id ? "Edit milestone" : "New milestone"}</DialogTitle></DialogHeader>
            <div className="space-y-2 text-xs">
              <Input placeholder="Title" value={editing.title ?? ""} onChange={e => setEditing(m => ({ ...m!, title: e.target.value }))} className="bg-crm-surface border-crm-border text-xs h-8" />
              <Input type="date" value={editing.date ?? ""} onChange={e => setEditing(m => ({ ...m!, date: e.target.value }))} className="bg-crm-surface border-crm-border text-xs h-8" />
              <Textarea placeholder="Description" value={editing.description ?? ""} onChange={e => setEditing(m => ({ ...m!, description: e.target.value }))} rows={3} className="bg-crm-surface border-crm-border text-xs" />
              <Input type="number" placeholder="Position" value={editing.position ?? 0} onChange={e => setEditing(m => ({ ...m!, position: parseInt(e.target.value) || 0 }))} className="bg-crm-surface border-crm-border text-xs h-8" />
            </div>
            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)} className="text-xs">Cancel</Button>
              <Button size="sm" onClick={() => save.mutate(editing)} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SubmissionsTab({ pillarId }: { pillarId: string }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery<Submission[]>({
    queryKey: ["youth-submissions", pillarId],
    queryFn: async () => {
      const { data } = await supabase.from("youth_submissions").select("*").eq("sub_pillar_id", pillarId).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("youth_submissions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["youth-submissions", pillarId] }),
  });

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-xs text-crm-text-muted text-center py-6">No submissions yet.</p>}
      {items.map(s => (
        <div key={s.id} className="bg-crm-card border border-crm-border rounded-lg px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-crm-text">{s.project_title}</p>
              <p className="text-[10px] text-crm-text-muted">{s.applicant_name} · {s.email} · {s.country}</p>
              <p className="text-[11px] text-crm-text-dim mt-1 line-clamp-2">{s.project_summary}</p>
            </div>
            <Select value={s.status} onValueChange={v => update.mutate({ id: s.id, status: v })}>
              <SelectTrigger className="bg-crm-surface border-crm-border text-xs h-7 w-28"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-crm-card border-crm-border">
                {["pending","reviewing","shortlisted","accepted","rejected"].map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}
