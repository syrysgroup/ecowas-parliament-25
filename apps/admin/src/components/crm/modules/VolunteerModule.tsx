import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Mail, Check, X, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import ImageUploadOrUrl from "@/components/shared/ImageUploadOrUrl";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  interests: string[] | null;
  availability: string | null;
  motivation: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface FormField {
  id: string;
  key: string;
  label: string;
  field_type: string;
  options: any;
  required: boolean;
  position: number;
  active: boolean;
}

const STATUS = ["new", "reviewing", "accepted", "rejected"] as const;
const FIELD_TYPES = ["text", "email", "tel", "textarea", "select", "checkbox"];

// ────────────────────────────────────────────────────────────────────────────
// Applications inbox
// ────────────────────────────────────────────────────────────────────────────
function ApplicationsInbox() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [interestFilter, setInterestFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Application | undefined>();

  const { data: apps = [], isLoading } = useQuery<Application[]>({
    queryKey: ["volunteer-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteer_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status?: string; notes?: string }) => {
      const payload: any = {};
      if (status !== undefined) payload.status = status;
      if (notes !== undefined) payload.notes = notes;
      const { error } = await supabase.from("volunteer_applications").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-apps"] });
      toast({ title: "Application updated" });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("volunteer_applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-apps"] });
      setSelected(undefined);
      toast({ title: "Application deleted" });
    },
  });

  const distinctCountries = [...new Set(apps.map(a => a.country).filter(Boolean))].sort() as string[];
  const distinctInterests = [...new Set(apps.flatMap(a => a.interests ?? []))].filter(Boolean).sort();

  const statusFiltered = filter === "all" ? apps : apps.filter(a => a.status === filter);
  const countryFiltered = countryFilter === "all" ? statusFiltered : statusFiltered.filter(a => a.country === countryFilter);
  const filtered = interestFilter === "all" ? countryFiltered : countryFiltered.filter(a => (a.interests ?? []).includes(interestFilter));
  const counts = STATUS.reduce((acc, s) => { acc[s] = apps.filter(a => a.status === s).length; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}
          className="text-xs h-7">All ({apps.length})</Button>
        {STATUS.map(s => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}
            className="text-xs h-7 capitalize">{s} ({counts[s] ?? 0})</Button>
        ))}
      </div>

      {/* Country + interest filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {distinctCountries.length > 0 && (
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-7 w-40">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent className="bg-crm-card border-crm-border">
              <SelectItem value="all" className="text-xs">All countries</SelectItem>
              {distinctCountries.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {distinctInterests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setInterestFilter("all")}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${interestFilter === "all" ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-crm-surface text-crm-text-dim border-crm-border hover:border-crm-border-hover"}`}>
              All interests
            </button>
            {distinctInterests.map(i => (
              <button key={i} onClick={() => setInterestFilter(i)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors capitalize ${interestFilter === i ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-crm-surface text-crm-text-dim border-crm-border hover:border-crm-border-hover"}`}>
                {i}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-emerald-500" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-crm-text-muted text-center py-10">No applications yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} onClick={() => setSelected(a)}
              className="bg-crm-card border border-crm-border rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-500/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-crm-text">{a.full_name}</span>
                    <Badge variant="outline" className="text-[10px] capitalize border-crm-border text-crm-text-dim">{a.status}</Badge>
                  </div>
                  <p className="text-[11px] text-crm-text-muted truncate">{a.email} {a.country ? `· ${a.country}` : ""}</p>
                  <p className="text-[11px] text-crm-text-dim mt-1 line-clamp-2">{a.motivation}</p>
                </div>
                <p className="text-[10px] text-crm-text-dim flex-shrink-0">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(undefined)}>
        <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">{selected?.full_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-xs">
              <div><span className="text-crm-text-dim">Email:</span> <a href={`mailto:${selected.email}`} className="text-emerald-400">{selected.email}</a></div>
              {selected.phone && <div><span className="text-crm-text-dim">Phone:</span> {selected.phone}</div>}
              {selected.country && <div><span className="text-crm-text-dim">Country:</span> {selected.country}</div>}
              {selected.availability && <div><span className="text-crm-text-dim">Availability:</span> {selected.availability}</div>}
              {selected.interests?.length ? <div><span className="text-crm-text-dim">Interests:</span> {selected.interests.join(", ")}</div> : null}
              {selected.motivation && (
                <div>
                  <p className="text-crm-text-dim mb-1">Motivation:</p>
                  <p className="bg-crm-surface border border-crm-border rounded-lg p-2 whitespace-pre-wrap">{selected.motivation}</p>
                </div>
              )}
              <div>
                <Label className="text-[11px] text-crm-text-dim">Status</Label>
                <Select value={selected.status} onValueChange={v => updateStatus.mutate({ id: selected.id, status: v })}>
                  <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-crm-card border-crm-border">
                    {STATUS.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-crm-text-dim">Internal notes</Label>
                <Textarea defaultValue={selected.notes ?? ""}
                  onBlur={e => e.target.value !== (selected.notes ?? "") && updateStatus.mutate({ id: selected.id, notes: e.target.value })}
                  rows={3} className="bg-crm-surface border-crm-border text-crm-text text-xs mt-1" />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="ghost" size="sm" onClick={() => selected && del.mutate(selected.id)}
              className="text-red-400 hover:text-red-300 text-xs"><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <a href={`mailto:${selected?.email}`}><Mail className="h-3 w-3 mr-1" />Reply</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Form schema editor
// ────────────────────────────────────────────────────────────────────────────
function FormFieldsEditor() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<FormField | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: fields = [], isLoading } = useQuery<FormField[]>({
    queryKey: ["volunteer-fields"],
    queryFn: async () => {
      const { data, error } = await supabase.from("volunteer_form_fields").select("*").order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (f: Partial<FormField>) => {
      if (f.id) {
        const { error } = await supabase.from("volunteer_form_fields").update(f).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("volunteer_form_fields").insert(f as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-fields"] });
      setDialogOpen(false);
      setEditing(undefined);
      toast({ title: "Field saved" });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("volunteer_form_fields").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-fields"] });
      toast({ title: "Field removed" });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-crm-text-muted">These fields appear on the public /volunteer form. Drag positions via the number input.</p>
        <Button size="sm" onClick={() => { setEditing(undefined); setDialogOpen(true); }}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1"><Plus size={12} /> Add Field</Button>
      </div>

      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (
        <div className="space-y-2">
          {fields.map(f => (
            <div key={f.id} className="bg-crm-card border border-crm-border rounded-xl px-3 py-2 flex items-center gap-3">
              <span className="text-[10px] font-mono text-crm-text-dim w-8">{f.position}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-crm-text">{f.label}</span>
                  <Badge variant="outline" className="text-[10px] border-crm-border text-crm-text-dim">{f.field_type}</Badge>
                  {f.required && <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-0">required</Badge>}
                  {!f.active && <Badge variant="outline" className="text-[10px] border-crm-border text-crm-text-dim">hidden</Badge>}
                </div>
                <p className="text-[10px] text-crm-text-muted font-mono">{f.key}</p>
              </div>
              <Switch checked={f.active} onCheckedChange={v => save.mutate({ id: f.id, active: v })} />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted" onClick={() => { setEditing(f); setDialogOpen(true); }}><Pencil size={12} /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => del.mutate(f.id)}><Trash2 size={12} /></Button>
            </div>
          ))}
        </div>
      )}

      <FieldDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditing(undefined); }} field={editing} onSave={f => save.mutate(f)} />
    </div>
  );
}

function FieldDialog({ open, onClose, field, onSave }: {
  open: boolean; onClose: () => void; field?: FormField; onSave: (f: Partial<FormField>) => void;
}) {
  const [form, setForm] = useState<Partial<FormField>>(() => field ?? {
    key: "", label: "", field_type: "text", options: [], required: false, position: 100, active: true,
  });
  const [optionsText, setOptionsText] = useState(JSON.stringify(field?.options ?? []));

  const submit = () => {
    let opts: any = [];
    try { opts = JSON.parse(optionsText); } catch { opts = []; }
    onSave({ ...form, options: opts });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader><DialogTitle className="text-sm">{field ? "Edit Field" : "New Field"}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-xs">
          <div>
            <Label className="text-[11px] text-crm-text-dim">Label *</Label>
            <Input value={form.label ?? ""} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 mt-1" />
          </div>
          <div>
            <Label className="text-[11px] text-crm-text-dim">Key (no spaces) *</Label>
            <Input value={form.key ?? ""} onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 mt-1 font-mono" disabled={!!field} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px] text-crm-text-dim">Type</Label>
              <Select value={form.field_type} onValueChange={v => setForm(f => ({ ...f, field_type: v }))}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  {FIELD_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] text-crm-text-dim">Position</Label>
              <Input type="number" value={form.position ?? 0} onChange={e => setForm(f => ({ ...f, position: parseInt(e.target.value) || 0 }))}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 mt-1" />
            </div>
          </div>
          {(form.field_type === "select" || form.field_type === "checkbox") && (
            <div>
              <Label className="text-[11px] text-crm-text-dim">Options (JSON array)</Label>
              <Textarea value={optionsText} onChange={e => setOptionsText(e.target.value)}
                rows={3} className="bg-crm-surface border-crm-border text-crm-text text-xs mt-1 font-mono"
                placeholder='["Option 1","Option 2"]' />
            </div>
          )}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2"><Switch checked={!!form.required} onCheckedChange={v => setForm(f => ({ ...f, required: v }))} /><span className="text-[11px]">Required</span></label>
            <label className="flex items-center gap-2"><Switch checked={form.active !== false} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} /><span className="text-[11px]">Active</span></label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
          <Button size="sm" onClick={submit} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page content editor (hero, intro, sidebar copy)
// ────────────────────────────────────────────────────────────────────────────
function PageContentEditor() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: row, isLoading } = useQuery({
    queryKey: ["site-content", "volunteer"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("content").eq("section_key", "volunteer").maybeSingle();
      return (data?.content as Record<string, string>) ?? {};
    },
  });

  const [draft, setDraft] = useState<Record<string, string>>({});
  const value = (k: string, fallback = "") => (k in draft ? draft[k] : row?.[k] ?? fallback);

  const save = useMutation({
    mutationFn: async () => {
      const merged = { ...(row ?? {}), ...draft };
      const { error } = await supabase.from("site_content").upsert(
        { section_key: "volunteer", content: merged } as any, { onConflict: "section_key" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-content", "volunteer"] });
      setDraft({});
      toast({ title: "Page content saved" });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin mx-auto" />;

  return (
    <div className="space-y-3 text-xs max-w-2xl">
      <p className="text-[11px] text-crm-text-muted">Controls every word and image on the public /volunteer page.</p>
      {[
        { k: "badge",    label: "Badge text"   },
        { k: "title",    label: "Hero title *" },
        { k: "subtitle", label: "Hero subtitle" },
        { k: "form_title", label: "Form heading" },
        { k: "form_desc",  label: "Form description" },
        { k: "success_title", label: "Success title" },
        { k: "success_desc",  label: "Success description" },
        { k: "privacy_note",  label: "Privacy note (under form)" },
        { k: "expectations_title", label: "What to expect — title" },
        { k: "expectations_list",  label: "What to expect — list (one per line)" },
        { k: "contact_email",  label: "Contact email shown" },
      ].map(f => (
        <div key={f.k}>
          <Label className="text-[11px] text-crm-text-dim">{f.label}</Label>
          {f.k.endsWith("desc") || f.k.endsWith("list") || f.k.endsWith("note") ? (
            <Textarea rows={3} value={value(f.k)} onChange={e => setDraft(d => ({ ...d, [f.k]: e.target.value }))}
              className="bg-crm-surface border-crm-border text-crm-text text-xs mt-1" />
          ) : (
            <Input value={value(f.k)} onChange={e => setDraft(d => ({ ...d, [f.k]: e.target.value }))}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 mt-1" />
          )}
        </div>
      ))}
      <div>
        <Label className="text-[11px] text-crm-text-dim">Hero background image</Label>
        <ImageUploadOrUrl value={value("hero_image")} onChange={v => setDraft(d => ({ ...d, hero_image: v }))}
          bucket="cms-media" pathPrefix="volunteer/" />
      </div>
      <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending || Object.keys(draft).length === 0}
        className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
        {save.isPending ? "Saving…" : `Save ${Object.keys(draft).length || ""} changes`}
      </Button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
export default function VolunteerModule() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Volunteer</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Applications inbox, form-field editor, and page content.</p>
        </div>
        <a href="/volunteer" target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-crm-text-dim hover:text-emerald-400">
          <ExternalLink size={11} /> Open public page
        </a>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList className="bg-crm-surface border border-crm-border h-8">
          <TabsTrigger value="inbox" className="text-xs h-7">Inbox</TabsTrigger>
          <TabsTrigger value="fields" className="text-xs h-7">Form Fields</TabsTrigger>
          <TabsTrigger value="page" className="text-xs h-7">Page Content</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox" className="mt-4"><ApplicationsInbox /></TabsContent>
        <TabsContent value="fields" className="mt-4"><FormFieldsEditor /></TabsContent>
        <TabsContent value="page" className="mt-4"><PageContentEditor /></TabsContent>
      </Tabs>
    </div>
  );
}
