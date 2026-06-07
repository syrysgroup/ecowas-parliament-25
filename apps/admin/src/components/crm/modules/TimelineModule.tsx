import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, ArrowUp, ArrowDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const MODULE = "site-content";

interface TimelineEvent {
  id: string;
  month_label: string;
  sort_order: number;
  country: string;
  city: string;
  title: string;
  description: string;
  programme: string;
  deliverables: string[];
  highlight: boolean;
  is_published: boolean;
  updated_at: string;
}

const PROGRAMMES = [
  "general", "youth", "trade", "women", "civic", "culture", "parliament", "awards",
];

// ── Event drawer ───────────────────────────────────────────────────────────
function EventDialog({ open, onClose, event }: { open: boolean; onClose: () => void; event?: TimelineEvent | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!event;

  const [form, setForm] = useState({
    month_label:  event?.month_label  ?? "",
    sort_order:   event?.sort_order   ?? 0,
    country:      event?.country      ?? "",
    city:         event?.city         ?? "",
    title:        event?.title        ?? "",
    description:  event?.description  ?? "",
    programme:    event?.programme    ?? "general",
    deliverables: (event?.deliverables ?? []).join("\n"),
    highlight:    event?.highlight    ?? false,
    is_published: event?.is_published ?? true,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        month_label:  form.month_label.trim(),
        sort_order:   Number(form.sort_order) || 0,
        country:      form.country,
        city:         form.city,
        title:        form.title.trim(),
        description:  form.description,
        programme:    form.programme,
        deliverables: form.deliverables.split("\n").map(s => s.trim()).filter(Boolean),
        highlight:    form.highlight,
        is_published: form.is_published,
      };
      if (isEdit) {
        const { error } = await supabase.from("timeline_events" as any).update(payload).eq("id", event!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("timeline_events" as any).insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeline_events"] });
      toast({ title: isEdit ? "Event updated" : "Event created" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Timeline Event" : "New Timeline Event"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Month Label *</Label>
              <Input value={form.month_label} onChange={e => setForm({ ...form, month_label: e.target.value })}
                placeholder="January 2026" className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Sort Order</Label>
              <Input type="number" value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Country</Label>
              <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                placeholder="🇳🇬 Nigeria" className="h-9" />
            </div>
            <div>
              <Label className="text-xs">City</Label>
              <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="Abuja" className="h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Title *</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4} className="resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Programme</Label>
              <select value={form.programme} onChange={e => setForm({ ...form, programme: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.highlight} onCheckedChange={v => setForm({ ...form, highlight: v })} />
                <Label className="text-xs">Highlight (Milestone)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={v => setForm({ ...form, is_published: v })} />
                <Label className="text-xs">Published</Label>
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs">Deliverables (one per line)</Label>
            <Textarea value={form.deliverables} onChange={e => setForm({ ...form, deliverables: e.target.value })}
              rows={4} className="resize-none font-mono text-xs" placeholder={"Item one\nItem two\nItem three"} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title.trim() || !form.month_label.trim()}>
            <Save size={14} className="mr-1" />
            {save.isPending ? "Saving…" : (isEdit ? "Update" : "Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Simple Site Content editor (re-used for the 3 page-content keys) ──────
function PageContentCard({ sectionKey, label }: { sectionKey: string; label: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["site-content", sectionKey],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*").eq("section_key", sectionKey).maybeSingle();
      return data;
    },
  });
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  if (data && !initialized) {
    setValues((data.content as any) ?? {});
    setInitialized(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!data) return;
      const { error } = await supabase.from("site_content").update({ content: values }).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-content", sectionKey] });
      toast({ title: `${label} saved` });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="bg-crm-card border border-crm-border rounded-xl p-4 text-xs text-crm-text-muted">Loading…</div>;
  if (!data)     return <div className="bg-crm-card border border-crm-border rounded-xl p-4 text-xs text-crm-text-muted">No row found for <code>{sectionKey}</code>.</div>;

  const keys = Object.keys(values);
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-crm-text">{label}</p>
          <p className="text-[10px] font-mono text-emerald-500">{sectionKey}</p>
        </div>
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
          <Save size={11} /> {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {keys.map(k => {
          const isLong = k === "items" || k === "buttons" || k === "description" || k === "subtitle";
          return (
            <div key={k} className={`space-y-1 ${isLong ? "col-span-2" : ""}`}>
              <Label className="text-[11px] text-crm-text-dim">{k}</Label>
              {isLong ? (
                <Textarea value={values[k] ?? ""} onChange={e => setValues(v => ({ ...v, [k]: e.target.value }))}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none font-mono" rows={4} />
              ) : (
                <Input value={values[k] ?? ""} onChange={e => setValues(v => ({ ...v, [k]: e.target.value }))}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main module ────────────────────────────────────────────────────────────
export default function TimelineModule() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [tab, setTab] = useState<"events" | "content">("events");
  const [editing, setEditing] = useState<TimelineEvent | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: events = [], isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ["timeline_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timeline_events" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any;
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, sort_order }: { id: string; sort_order: number }) => {
      const { error } = await supabase.from("timeline_events" as any).update({ sort_order }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timeline_events"] }),
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("timeline_events" as any).update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timeline_events"] }); toast({ title: "Updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("timeline_events" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timeline_events"] }); toast({ title: "Deleted" }); setDeleting(null); },
  });

  const move = (idx: number, dir: -1 | 1) => {
    const a = events[idx], b = events[idx + dir];
    if (!a || !b) return;
    reorderMutation.mutate({ id: a.id, sort_order: b.sort_order });
    reorderMutation.mutate({ id: b.id, sort_order: a.sort_order });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Programme Timeline</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            Manage the events shown on the public <code>/timeline</code> page and its hero / gallery / CTA copy.
          </p>
        </div>
        {tab === "events" && canCreate(MODULE) && (
          <Button onClick={() => setEditing(null)} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
            <Plus size={14} /> New Event
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-crm-border">
        {(["events", "content"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t ? "border-emerald-500 text-emerald-400" : "border-transparent text-crm-text-muted hover:text-crm-text"
            }`}>
            {t === "events" ? "Events" : "Page Content"}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <>
          {isLoading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}

          <div className="overflow-x-auto bg-crm-card border border-crm-border rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-crm-surface text-crm-text-dim uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Month</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Location</th>
                  <th className="px-3 py-2 text-left">Programme</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={e.id} className="border-t border-crm-border hover:bg-crm-surface/40">
                    <td className="px-3 py-2 text-crm-text-muted">{e.sort_order}</td>
                    <td className="px-3 py-2 text-crm-text whitespace-nowrap">{e.month_label}</td>
                    <td className="px-3 py-2 text-crm-text font-medium">
                      <div className="flex items-center gap-2">
                        {e.highlight && <Star size={12} className="text-amber-400 fill-amber-400" />}
                        <span>{e.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-crm-text-muted">{e.country} · {e.city}</td>
                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase">{e.programme}</span></td>
                    <td className="px-3 py-2 text-center">
                      {e.is_published
                        ? <span className="text-emerald-400 text-[10px]">● Published</span>
                        : <span className="text-amber-400 text-[10px]">● Hidden</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={i === 0} onClick={() => move(i, -1)} title="Move up">
                          <ArrowUp size={12} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={i === events.length - 1} onClick={() => move(i, 1)} title="Move down">
                          <ArrowDown size={12} />
                        </Button>
                        {canEdit(MODULE) && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                            onClick={() => togglePublishMutation.mutate({ id: e.id, is_published: !e.is_published })}
                            title={e.is_published ? "Hide" : "Publish"}>
                            {e.is_published ? <Eye size={12} className="text-emerald-400" /> : <EyeOff size={12} className="text-amber-400" />}
                          </Button>
                        )}
                        {canEdit(MODULE) && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditing(e)} title="Edit">
                            <Pencil size={12} />
                          </Button>
                        )}
                        {canDelete(MODULE) && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => setDeleting(e.id)} title="Delete">
                            <Trash2 size={12} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && events.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-crm-text-muted">No timeline events yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "content" && (
        <div className="space-y-4">
          <PageContentCard sectionKey="timeline_hero" label="Hero" />
          <PageContentCard sectionKey="timeline_launch_highlights" label="Launch Highlights Gallery" />
          <PageContentCard sectionKey="timeline_cta" label="Closing CTA" />
        </div>
      )}

      {/* Edit / create dialog */}
      {editing !== undefined && (
        <EventDialog open={true} onClose={() => setEditing(undefined)} event={editing ?? undefined} />
      )}

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete event?</DialogTitle></DialogHeader>
          <p className="text-sm text-crm-text-muted">This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteMutation.mutate(deleting!)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
