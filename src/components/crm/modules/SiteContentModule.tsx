import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Save, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SiteContentRow {
  id: string;
  section_key: string;
  content: Record<string, any>;
  updated_at: string;
}

const SECTION_TEMPLATES: Record<string, { label: string; fields: { key: string; label: string; type: "text" | "textarea" }[] }> = {
  hero: {
    label: "Homepage Hero",
    fields: [
      { key: "badge", label: "Badge Text", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  stats: {
    label: "Homepage Stats",
    fields: [
      { key: "stat1_value", label: "Stat 1 Value", type: "text" },
      { key: "stat1_label", label: "Stat 1 Label", type: "text" },
      { key: "stat2_value", label: "Stat 2 Value", type: "text" },
      { key: "stat2_label", label: "Stat 2 Label", type: "text" },
      { key: "stat3_value", label: "Stat 3 Value", type: "text" },
      { key: "stat3_label", label: "Stat 3 Label", type: "text" },
      { key: "stat4_value", label: "Stat 4 Value", type: "text" },
      { key: "stat4_label", label: "Stat 4 Label", type: "text" },
    ],
  },
  quote: {
    label: "Homepage Quote",
    fields: [
      { key: "text", label: "Quote Text", type: "textarea" },
      { key: "author", label: "Author", type: "text" },
      { key: "role", label: "Author Role", type: "text" },
    ],
  },
  about: {
    label: "About Section",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
  },
};

function SectionEditor({ section, onSaved }: { section: SiteContentRow; onSaved: () => void }) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const template = SECTION_TEMPLATES[section.section_key];
  const [values, setValues] = useState<Record<string, string>>(section.content as any ?? {});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await (supabase as any).from("site_content").update({
        content: values,
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }).eq("id", section.id);
      toast({ title: "Saved" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const fields = template?.fields ?? Object.keys(values).map(key => ({
    key, label: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), type: "text" as const,
  }));

  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-crm-text">{template?.label ?? section.section_key}</p>
          <p className="text-[10px] font-mono text-emerald-500">{section.section_key}</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
          <Save size={11} /> {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.key} className={`space-y-1 ${f.type === "textarea" ? "col-span-2" : ""}`}>
            <Label className="text-[11px] text-crm-text-dim">{f.label}</Label>
            {f.type === "textarea" ? (
              <Textarea value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={3} />
            ) : (
              <Input value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SiteContentModule() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [newKey, setNewKey] = useState("");

  const { data: sections = [], isLoading } = useQuery<SiteContentRow[]>({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("site_content").select("*").order("section_key");
      return data ?? [];
    },
  });

  const createSection = useMutation({
    mutationFn: async () => {
      const template = SECTION_TEMPLATES[newKey];
      const defaultContent: Record<string, string> = {};
      if (template) template.fields.forEach(f => { defaultContent[f.key] = ""; });
      await (supabase as any).from("site_content").insert({
        section_key: newKey, content: defaultContent, updated_by: user?.id,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site-content"] }); setNewKey(""); toast({ title: "Section created" }); },
  });

  const existingKeys = sections.map(s => s.section_key);
  const availableTemplates = Object.entries(SECTION_TEMPLATES).filter(([k]) => !existingKeys.includes(k));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-crm-text">Site Content Manager</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">Edit homepage sections and site-wide content</p>
      </div>

      {/* Add section */}
      {availableTemplates.length > 0 && (
        <div className="flex items-center gap-2">
          <select value={newKey} onChange={e => setNewKey(e.target.value)}
            className="bg-crm-surface border border-crm-border text-crm-text text-xs rounded-lg px-3 py-2">
            <option value="">Add section…</option>
            {availableTemplates.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {newKey && (
            <Button size="sm" onClick={() => createSection.mutate()} disabled={createSection.isPending}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
              <Plus size={12} /> Create
            </Button>
          )}
        </div>
      )}

      {isLoading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}

      <div className="space-y-4">
        {sections.map(s => (
          <SectionEditor key={s.id} section={s} onSaved={() => qc.invalidateQueries({ queryKey: ["site-content"] })} />
        ))}
      </div>

      {!isLoading && sections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-crm-text-muted">No site content sections yet. Add one above to get started.</p>
        </div>
      )}
    </div>
  );
}
