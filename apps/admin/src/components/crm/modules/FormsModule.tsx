import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, Save, Inbox } from "lucide-react";
import { useBulkSelection } from "@/hooks/useBulkSelection";

const FIELD_TYPES = ["text","email","textarea","select","checkbox","multicheck","radio","file","date","phone","country","number","url"] as const;
type FType = typeof FIELD_TYPES[number];

interface Form { id: string; slug: string; title: string; status: string; }
interface Field { id: string; form_id: string; position: number; key: string; label: string; help_text: string | null; type: FType; required: boolean; options: any; }
interface Sub { id: string; form_id: string; payload: any; status: string; created_at: string; }

export default function FormsModule() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: forms = [] } = useQuery({
    queryKey: ["admin-forms"],
    queryFn: async () => {
      const { data } = await supabase.from("form_definitions").select("id, slug, title, status").order("title");
      return (data ?? []) as Form[];
    },
  });

  const createForm = useMutation({
    mutationFn: async () => {
      const slug = prompt("Form slug (e.g. contact, volunteer):")?.trim();
      if (!slug) throw new Error("cancelled");
      const { data, error } = await supabase.from("form_definitions").insert({ slug, title: slug }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (f: any) => { qc.invalidateQueries({ queryKey: ["admin-forms"] }); setSelectedId(f.id); },
    onError: (e: any) => { if (e.message !== "cancelled") toast.error(e.message); },
  });

  return (
    <div className="flex h-full">
      <aside className="w-72 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h2 className="font-bold">Forms</h2>
          <Button size="sm" onClick={() => createForm.mutate()}><Plus size={14}/> New</Button>
        </div>
        <div className="overflow-auto flex-1">
          {forms.map((f) => (
            <div key={f.id} onClick={() => setSelectedId(f.id)} className={`p-3 border-b border-border cursor-pointer hover:bg-muted/40 ${selectedId === f.id ? "bg-muted" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{f.title}</span>
                <Badge variant={f.status === "active" ? "default" : "secondary"} className="text-[10px]">{f.status}</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">{f.slug}</div>
            </div>
          ))}
          {forms.length === 0 && <p className="p-4 text-sm text-muted-foreground">No forms yet.</p>}
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {selectedId ? <FormEditor formId={selectedId} /> : <div className="h-full flex items-center justify-center text-muted-foreground">Select a form.</div>}
      </main>
    </div>
  );
}

function FormEditor({ formId }: { formId: string }) {
  const qc = useQueryClient();
  const { data: form } = useQuery({
    queryKey: ["admin-form", formId],
    queryFn: async () => {
      const { data } = await supabase.from("form_definitions").select("*").eq("id", formId).single();
      return data as any;
    },
  });

  const updateForm = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await supabase.from("form_definitions").update(patch).eq("id", formId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-form", formId] }); qc.invalidateQueries({ queryKey: ["admin-forms"] }); toast.success("Saved"); },
  });

  if (!form) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{form.title}</h1>
          <p className="text-xs text-muted-foreground">slug: {form.slug}</p>
        </div>
        <Button size="sm" onClick={() => updateForm.mutate({ status: form.status === "active" ? "disabled" : "active" })}>
          {form.status === "active" ? "Disable" : "Activate"}
        </Button>
      </header>
      <Tabs defaultValue="builder">
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="submissions"><Inbox size={14} className="mr-1"/> Submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="builder"><FieldsEditor formId={formId} /></TabsContent>
        <TabsContent value="settings">
          <div className="space-y-3 mt-4 max-w-2xl">
            <div><Label>Title</Label><Input defaultValue={form.title} onBlur={(e) => updateForm.mutate({ title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea defaultValue={form.description ?? ""} onBlur={(e) => updateForm.mutate({ description: e.target.value })} /></div>
            <div><Label>Success message</Label><Input defaultValue={form.success_message} onBlur={(e) => updateForm.mutate({ success_message: e.target.value })} /></div>
            <div><Label>Notify email (admin)</Label><Input type="email" defaultValue={form.notify_email ?? ""} onBlur={(e) => updateForm.mutate({ notify_email: e.target.value || null })} /></div>
            <div><Label>Autoresponder subject</Label><Input defaultValue={form.autoresponder_subject ?? ""} onBlur={(e) => updateForm.mutate({ autoresponder_subject: e.target.value || null })} /></div>
            <div><Label>Autoresponder body</Label><Textarea defaultValue={form.autoresponder_body ?? ""} onBlur={(e) => updateForm.mutate({ autoresponder_body: e.target.value || null })} /></div>
          </div>
        </TabsContent>
        <TabsContent value="submissions"><SubmissionsInbox formId={formId} /></TabsContent>
      </Tabs>
    </div>
  );
}

function FieldsEditor({ formId }: { formId: string }) {
  const qc = useQueryClient();
  const { data: fields = [] } = useQuery({
    queryKey: ["admin-fields", formId],
    queryFn: async () => {
      const { data } = await supabase.from("form_fields").select("*").eq("form_id", formId).order("position");
      return (data ?? []) as Field[];
    },
  });

  const addField = useMutation({
    mutationFn: async () => {
      const key = prompt("Field key (snake_case):")?.trim();
      if (!key) throw new Error("cancelled");
      const { error } = await supabase.from("form_fields").insert({ form_id: formId, key, label: key, type: "text", position: fields.length });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-fields", formId] }),
    onError: (e: any) => { if (e.message !== "cancelled") toast.error(e.message); },
  });

  return (
    <div className="mt-4 space-y-3">
      <Button size="sm" onClick={() => addField.mutate()}><Plus size={14}/> Add field</Button>
      {fields.map((f) => <FieldRow key={f.id} field={f} />)}
      {fields.length === 0 && <p className="text-sm text-muted-foreground">No fields. Add one above.</p>}
    </div>
  );
}

function FieldRow({ field }: { field: Field }) {
  const qc = useQueryClient();
  const [v, setV] = useState(field);
  const save = useMutation({
    mutationFn: async () => {
      const opts = typeof v.options === "string" ? safeParseOptions(v.options) : v.options;
      const { error } = await supabase.from("form_fields").update({
        key: v.key, label: v.label, help_text: v.help_text, type: v.type, required: v.required, options: opts,
      }).eq("id", field.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-fields", field.form_id] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async () => {
      if (!confirm("Delete field?")) throw new Error("cancelled");
      const { error } = await supabase.from("form_fields").delete().eq("id", field.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-fields", field.form_id] }),
    onError: (e: any) => { if (e.message !== "cancelled") toast.error(e.message); },
  });
  return (
    <div className="border border-border rounded p-3 bg-card space-y-2">
      <div className="grid sm:grid-cols-4 gap-2">
        <div><Label className="text-xs">Key</Label><Input value={v.key} onChange={(e) => setV({ ...v, key: e.target.value })} className="h-8 text-xs"/></div>
        <div><Label className="text-xs">Label</Label><Input value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} className="h-8 text-xs"/></div>
        <div>
          <Label className="text-xs">Type</Label>
          <Select value={v.type} onValueChange={(t) => setV({ ...v, type: t as FType })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
            <SelectContent>{FIELD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-1 text-xs"><Checkbox checked={v.required} onCheckedChange={(c) => setV({ ...v, required: !!c })}/> Required</label>
        </div>
      </div>
      <div><Label className="text-xs">Help text</Label><Input value={v.help_text ?? ""} onChange={(e) => setV({ ...v, help_text: e.target.value })} className="h-8 text-xs"/></div>
      {["select","radio","multicheck"].includes(v.type) && (
        <div>
          <Label className="text-xs">Options (one per line: label|value)</Label>
          <Textarea
            value={Array.isArray(v.options) ? (v.options as any[]).map((o) => `${o.label}|${o.value}`).join("\n") : ""}
            onChange={(e) => setV({ ...v, options: e.target.value as any })}
            rows={3} className="text-xs"
          />
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => del.mutate()}><Trash2 size={14} className="text-destructive"/></Button>
        <Button size="sm" onClick={() => save.mutate()}><Save size={14}/> Save</Button>
      </div>
    </div>
  );
}

function safeParseOptions(s: string) {
  return s.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, value] = l.split("|");
    return { label: label?.trim() ?? "", value: (value ?? label)?.trim() ?? "" };
  });
}

function SubmissionsInbox({ formId }: { formId: string }) {
  const qc = useQueryClient();
  const { data: subs = [] } = useQuery({
    queryKey: ["admin-subs", formId],
    queryFn: async () => {
      const { data } = await supabase.from("form_submissions").select("*").eq("form_id", formId).order("created_at", { ascending: false }).limit(200);
      return (data ?? []) as Sub[];
    },
  });
  const bulk = useBulkSelection(subs);

  const setStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("form_submissions").update({ status }).in("id", bulk.selectedIds);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-subs", formId] }); bulk.reset(); toast.success("Updated"); },
  });
  const del = useMutation({
    mutationFn: async () => {
      if (!confirm(`Delete ${bulk.selectedCount} submission(s)?`)) throw new Error("cancelled");
      const { error } = await supabase.from("form_submissions").delete().in("id", bulk.selectedIds);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-subs", formId] }); bulk.reset(); },
    onError: (e: any) => { if (e.message !== "cancelled") toast.error(e.message); },
  });

  const exportCsv = () => {
    const rows = subs.filter((s) => bulk.selectedCount === 0 || bulk.isSelected(s.id));
    const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r.payload ?? {}))));
    const csv = [["id","created_at","status",...keys].join(",")]
      .concat(rows.map((r) => [r.id, r.created_at, r.status, ...keys.map((k) => JSON.stringify(r.payload?.[k] ?? ""))].join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `submissions-${formId}.csv`;
    a.click();
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => bulk.toggleAll()}>{bulk.allSelected ? "Unselect all" : "Select all"}</Button>
        {bulk.selectedCount > 0 && (
          <>
            <span className="text-xs">{bulk.selectedCount} selected</span>
            <Button size="sm" variant="outline" onClick={() => setStatus.mutate("read")}>Mark read</Button>
            <Button size="sm" variant="outline" onClick={() => setStatus.mutate("archived")}>Archive</Button>
            <Button size="sm" variant="outline" onClick={() => setStatus.mutate("spam")}>Spam</Button>
            <Button size="sm" variant="destructive" onClick={() => del.mutate()}>Delete</Button>
          </>
        )}
        <Button size="sm" variant="outline" onClick={exportCsv} className="ml-auto">Export CSV</Button>
      </div>
      <div className="border border-border rounded">
        {subs.map((s) => (
          <div key={s.id} className="border-b border-border p-3 flex items-start gap-2">
            <Checkbox checked={bulk.isSelected(s.id)} onCheckedChange={() => bulk.toggle(s.id)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant={s.status === "new" ? "default" : "secondary"}>{s.status}</Badge>
                <span className="text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
              </div>
              <pre className="text-xs mt-1 whitespace-pre-wrap break-words">{JSON.stringify(s.payload, null, 2)}</pre>
            </div>
          </div>
        ))}
        {subs.length === 0 && <p className="p-4 text-sm text-muted-foreground">No submissions yet.</p>}
      </div>
    </div>
  );
}