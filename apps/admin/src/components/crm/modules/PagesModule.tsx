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
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, Save, FileText, Image as ImageIcon } from "lucide-react";
import { useBulkSelection } from "@/hooks/useBulkSelection";

const SECTION_KINDS = ["hero","text","stats","cards","gallery","cta","form","html"] as const;
type Kind = typeof SECTION_KINDS[number];

interface Page { id: string; slug: string; route: string; title: string; status: string; updated_at: string; }
interface Section { id: string; page_id: string; key: string; kind: Kind; position: number; visible: boolean; props: any; }
interface Item { id: string; section_id: string; position: number; data: any; image_url: string | null; }

export default function PagesModule() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: pages = [] } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data } = await supabase.from("pages").select("id, slug, route, title, status, updated_at").order("title");
      return (data ?? []) as Page[];
    },
  });

  const bulk = useBulkSelection(pages);

  const createPage = useMutation({
    mutationFn: async () => {
      const slug = prompt("Page slug (e.g. home, about, programmes-youth):")?.trim();
      if (!slug) throw new Error("cancelled");
      const { data, error } = await supabase.from("pages").insert({
        slug, route: `/${slug === "home" ? "" : slug}`, title: slug,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (p: any) => { qc.invalidateQueries({ queryKey: ["admin-pages"] }); setSelectedId(p.id); toast.success("Page created"); },
    onError: (e: any) => { if (e.message !== "cancelled") toast.error(e.message); },
  });

  const bulkStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("pages").update({ status, published_at: status === "published" ? new Date().toISOString() : null }).in("id", bulk.selectedIds);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pages"] }); bulk.reset(); toast.success("Updated"); },
  });

  const bulkDelete = useMutation({
    mutationFn: async () => {
      if (!confirm(`Delete ${bulk.selectedCount} page(s)?`)) throw new Error("cancelled");
      const { error } = await supabase.from("pages").delete().in("id", bulk.selectedIds);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pages"] }); bulk.reset(); toast.success("Deleted"); },
    onError: (e: any) => { if (e.message !== "cancelled") toast.error(e.message); },
  });

  return (
    <div className="flex h-full">
      {/* List */}
      <aside className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><FileText size={16}/> Pages</h2>
          <Button size="sm" onClick={() => createPage.mutate()}><Plus size={14}/> New</Button>
        </div>
        {bulk.selectedCount > 0 && (
          <div className="p-2 border-b border-border bg-muted/40 flex items-center gap-2 text-xs">
            <span>{bulk.selectedCount} selected</span>
            <Button size="sm" variant="outline" onClick={() => bulkStatus.mutate("published")}>Publish</Button>
            <Button size="sm" variant="outline" onClick={() => bulkStatus.mutate("draft")}>Draft</Button>
            <Button size="sm" variant="destructive" onClick={() => bulkDelete.mutate()}>Delete</Button>
          </div>
        )}
        <div className="overflow-auto flex-1">
          {pages.length === 0 && <p className="p-4 text-sm text-muted-foreground">No pages yet.</p>}
          {pages.map((p) => (
            <div key={p.id} className={`p-3 border-b border-border flex items-center gap-2 cursor-pointer hover:bg-muted/40 ${selectedId === p.id ? "bg-muted" : ""}`} onClick={() => setSelectedId(p.id)}>
              <Checkbox checked={bulk.isSelected(p.id)} onCheckedChange={() => bulk.toggle(p.id)} onClick={(e) => e.stopPropagation()} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground truncate">{p.route}</div>
              </div>
              <Badge variant={p.status === "published" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
            </div>
          ))}
        </div>
      </aside>
      {/* Editor */}
      <main className="flex-1 overflow-auto">
        {selectedId ? <PageEditor pageId={selectedId} /> : (
          <div className="h-full flex items-center justify-center text-muted-foreground">Select a page to edit.</div>
        )}
      </main>
    </div>
  );
}

function PageEditor({ pageId }: { pageId: string }) {
  const qc = useQueryClient();
  const { data: page } = useQuery({
    queryKey: ["admin-page", pageId],
    queryFn: async () => {
      const { data } = await supabase.from("pages").select("*").eq("id", pageId).single();
      return data as Page & { description: string | null; seo: any; og_image: string | null };
    },
  });
  const { data: sections = [] } = useQuery({
    queryKey: ["admin-sections", pageId],
    queryFn: async () => {
      const { data } = await supabase.from("page_sections").select("*").eq("page_id", pageId).order("position");
      return (data ?? []) as Section[];
    },
  });

  const updatePage = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await supabase.from("pages").update(patch).eq("id", pageId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-page", pageId] }); qc.invalidateQueries({ queryKey: ["admin-pages"] }); toast.success("Saved"); },
  });

  const addSection = useMutation({
    mutationFn: async (kind: Kind) => {
      const key = prompt("Section key (unique):")?.trim();
      if (!key) throw new Error("cancelled");
      const { error } = await supabase.from("page_sections").insert({ page_id: pageId, key, kind, position: sections.length, props: {}, visible: true });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-sections", pageId] }); toast.success("Section added"); },
    onError: (e: any) => { if (e.message !== "cancelled") toast.error(e.message); },
  });

  if (!page) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{page.title}</h1>
          <p className="text-xs text-muted-foreground">{page.route}</p>
        </div>
        <div className="flex gap-2">
          <a href={`https://id-preview--1ed5a853-728f-4051-ab73-a3b809cb6c93.lovable.app${page.route}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><Eye size={14}/> Preview</Button>
          </a>
          <Button size="sm" onClick={() => updatePage.mutate({ status: page.status === "published" ? "draft" : "published", published_at: page.status === "published" ? null : new Date().toISOString() })}>
            {page.status === "published" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input defaultValue={page.title} onBlur={(e) => updatePage.mutate({ title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Route</Label>
          <Input defaultValue={page.route} onBlur={(e) => updatePage.mutate({ route: e.target.value })} />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Description (SEO)</Label>
          <Textarea defaultValue={page.description ?? ""} onBlur={(e) => updatePage.mutate({ description: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>OG Image URL</Label>
          <Input defaultValue={page.og_image ?? ""} onBlur={(e) => updatePage.mutate({ og_image: e.target.value || null })} />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Sections</h2>
          <Select onValueChange={(v) => addSection.mutate(v as Kind)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="+ Add section..." /></SelectTrigger>
            <SelectContent>
              {SECTION_KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          {sections.map((s, i) => <SectionEditor key={s.id} section={s} index={i} total={sections.length} />)}
          {sections.length === 0 && <p className="text-sm text-muted-foreground">No sections yet. Add one above.</p>}
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, index, total }: { section: Section; index: number; total: number; }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [props, setProps] = useState<any>(section.props ?? {});

  const { data: items = [] } = useQuery({
    queryKey: ["admin-section-items", section.id],
    queryFn: async () => {
      const { data } = await supabase.from("page_section_items").select("*").eq("section_id", section.id).order("position");
      return (data ?? []) as Item[];
    },
    enabled: open,
  });

  const saveSection = useMutation({
    mutationFn: async (patch: any) => {
      const { error } = await supabase.from("page_sections").update(patch).eq("id", section.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-sections", section.page_id] }); toast.success("Saved"); },
  });

  const moveSection = (dir: -1 | 1) => {
    saveSection.mutate({ position: section.position + dir });
  };

  const deleteSection = useMutation({
    mutationFn: async () => {
      if (!confirm("Delete this section?")) throw new Error("cancelled");
      const { error } = await supabase.from("page_sections").delete().eq("id", section.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sections", section.page_id] }),
    onError: (e: any) => { if (e.message !== "cancelled") toast.error(e.message); },
  });

  const addItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("page_section_items").insert({ section_id: section.id, position: items.length, data: {} });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-section-items", section.id] }),
  });

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="flex items-center gap-2 p-3">
        <Badge variant="outline">{section.kind}</Badge>
        <span className="font-medium text-sm flex-1">{section.key}</span>
        <Button size="icon" variant="ghost" disabled={index === 0} onClick={() => moveSection(-1)}><ArrowUp size={14}/></Button>
        <Button size="icon" variant="ghost" disabled={index === total - 1} onClick={() => moveSection(1)}><ArrowDown size={14}/></Button>
        <Checkbox checked={section.visible} onCheckedChange={(c) => saveSection.mutate({ visible: !!c })} title="Visible" />
        <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Edit"}</Button>
        <Button size="icon" variant="ghost" onClick={() => deleteSection.mutate()}><Trash2 size={14} className="text-destructive"/></Button>
      </div>
      {open && (
        <div className="border-t border-border p-3 space-y-3">
          <PropsEditor kind={section.kind} value={props} onChange={setProps} />
          <Button size="sm" onClick={() => saveSection.mutate({ props })}><Save size={14}/> Save props</Button>

          {["stats","cards","gallery"].includes(section.kind) && (
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Items</h4>
                <Button size="sm" variant="outline" onClick={() => addItem.mutate()}><Plus size={12}/> Add item</Button>
              </div>
              <div className="space-y-2">
                {items.map((it) => <ItemEditor key={it.id} item={it} kind={section.kind} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PropsEditor({ kind, value, onChange }: { kind: Kind; value: any; onChange: (v: any) => void; }) {
  const upd = (k: string, v: any) => onChange({ ...value, [k]: v });
  const fields: { key: string; label: string; type?: "textarea" }[] = (() => {
    switch (kind) {
      case "hero": return [
        { key: "eyebrow", label: "Eyebrow" },
        { key: "title", label: "Title" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "background_image", label: "Background image URL" },
        { key: "cta_label", label: "CTA label" },
        { key: "cta_href", label: "CTA link" },
      ];
      case "text": return [{ key: "title", label: "Title" }, { key: "body", label: "Body (HTML)", type: "textarea" }];
      case "cards":
      case "stats":
      case "gallery": return [{ key: "title", label: "Title" }];
      case "cta": return [
        { key: "title", label: "Title" }, { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "cta_label", label: "CTA label" }, { key: "cta_href", label: "CTA link" },
      ];
      case "form": return [
        { key: "title", label: "Title" }, { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "form_slug", label: "Form slug" },
      ];
      case "html": return [{ key: "body", label: "Raw HTML", type: "textarea" }];
      default: return [];
    }
  })();
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {fields.map((f) => (
        <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
          <Label className="text-xs">{f.label}</Label>
          {f.type === "textarea" ? (
            <Textarea value={value[f.key] ?? ""} onChange={(e) => upd(f.key, e.target.value)} rows={4} />
          ) : (
            <Input value={value[f.key] ?? ""} onChange={(e) => upd(f.key, e.target.value)} />
          )}
        </div>
      ))}
    </div>
  );
}

function ItemEditor({ item, kind }: { item: Item; kind: Kind }) {
  const qc = useQueryClient();
  const [data, setData] = useState<any>(item.data ?? {});
  const [imageUrl, setImageUrl] = useState(item.image_url ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("page_section_items").update({ data, image_url: imageUrl || null }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Item saved"),
  });
  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("page_section_items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-section-items", item.section_id] }),
  });

  const fields = kind === "stats"
    ? [{ key: "value", label: "Value" }, { key: "label", label: "Label" }]
    : kind === "cards"
      ? [{ key: "title", label: "Title" }, { key: "description", label: "Description" }, { key: "cta", label: "CTA label" }, { key: "href", label: "CTA link" }]
      : [{ key: "alt", label: "Alt text" }];

  return (
    <div className="border border-border rounded p-2 space-y-2 bg-background">
      <div className="grid grid-cols-2 gap-2">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="text-xs">{f.label}</Label>
            <Input value={data[f.key] ?? ""} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} className="h-8 text-xs" />
          </div>
        ))}
        {(kind === "cards" || kind === "gallery") && (
          <div className="col-span-2">
            <Label className="text-xs flex items-center gap-1"><ImageIcon size={12}/> Image URL</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="h-8 text-xs" />
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={() => del.mutate()}><Trash2 size={12}/></Button>
        <Button size="sm" onClick={() => save.mutate()}><Save size={12}/> Save</Button>
      </div>
    </div>
  );
}