import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const MODULE = "site-content";

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
      { key: "badge", label: "Badge / Eyebrow Text", type: "text" },
      { key: "title", label: "Title (use | to split accent)", type: "text" },
      { key: "subtitle", label: "Subtitle Line", type: "text" },
      { key: "description", label: "Description Paragraph", type: "textarea" },
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
  stats: {
    label: "Homepage Stats (About Section)",
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
  countdown: {
    label: "Countdown Timer",
    fields: [
      { key: "target_date", label: "Target Date (YYYY-MM-DD)", type: "text" },
      { key: "label", label: "Event Label", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
    ],
  },
  pillars: {
    label: "Programmes / Pillars Grid",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "subtitle", label: "Section Subtitle", type: "textarea" },
    ],
  },
  did_you_know: {
    label: "Did You Know Section",
    fields: [
      { key: "fact1", label: "Fact 1", type: "textarea" },
      { key: "fact2", label: "Fact 2", type: "textarea" },
      { key: "fact3", label: "Fact 3", type: "textarea" },
      { key: "fact4", label: "Fact 4", type: "textarea" },
    ],
  },
  anniversary: {
    label: "Anniversary Section (Parliament@25)",
    fields: [
      { key: "badge", label: "Badge Text", type: "text" },
      { key: "heading_prefix", label: "Heading Prefix", type: "text" },
      { key: "p1", label: "Paragraph 1", type: "textarea" },
      { key: "p2", label: "Paragraph 2", type: "textarea" },
      { key: "p3", label: "Paragraph 3", type: "textarea" },
    ],
  },
  speaker: {
    label: "Speaker Spotlight",
    fields: [
      { key: "name", label: "Speaker Name", type: "text" },
      { key: "title", label: "Speaker Title", type: "text" },
      { key: "quote", label: "Speaker Quote", type: "textarea" },
      { key: "image_url", label: "Speaker Image URL", type: "text" },
    ],
  },
  implementing_partners: {
    label: "Implementing Partners Intro",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "description", label: "Section Description", type: "textarea" },
    ],
  },
  newsletter: {
    label: "Newsletter CTA Section",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "button_text", label: "Button Text", type: "text" },
    ],
  },
  sponsor_cta: {
    label: "Become a Sponsor CTA",
    fields: [
      { key: "title", label: "CTA Title", type: "text" },
      { key: "description", label: "CTA Description", type: "textarea" },
      { key: "button_text", label: "Button Text", type: "text" },
      { key: "button_url", label: "Button Link URL", type: "text" },
    ],
  },
  sponsor_portal_stats: {
    label: "Sponsor Portal — Impact Stats",
    fields: [
      { key: "stat1_value", label: "Stat 1 Value (e.g. 400M+)", type: "text" },
      { key: "stat1_label", label: "Stat 1 Label", type: "text" },
      { key: "stat2_value", label: "Stat 2 Value (e.g. 12)", type: "text" },
      { key: "stat2_label", label: "Stat 2 Label", type: "text" },
      { key: "stat3_value", label: "Stat 3 Value (e.g. 40+)", type: "text" },
      { key: "stat3_label", label: "Stat 3 Label", type: "text" },
      { key: "stat4_value", label: "Stat 4 Value (e.g. 2.4M)", type: "text" },
      { key: "stat4_label", label: "Stat 4 Label", type: "text" },
    ],
  },
  anniversary_stats: {
    label: "Anniversary Section — Stats Grid",
    fields: [
      { key: "stat1_value", label: "Stat 1 Value (e.g. 25)", type: "text" },
      { key: "stat1_label", label: "Stat 1 Label (e.g. Years of ECOWAS Parliament Initiatives)", type: "text" },
      { key: "stat2_value", label: "Stat 2 Value (e.g. 12)", type: "text" },
      { key: "stat2_label", label: "Stat 2 Label", type: "text" },
      { key: "stat3_value", label: "Stat 3 Value (e.g. 7)", type: "text" },
      { key: "stat3_label", label: "Stat 3 Label", type: "text" },
      { key: "stat4_value", label: "Stat 4 Value (e.g. 1,200+)", type: "text" },
      { key: "stat4_label", label: "Stat 4 Label", type: "text" },
    ],
  },
  sponsor_portal_why: {
    label: "Sponsor Portal — Why Sponsor (JSON array)",
    fields: [
      { key: "points", label: 'JSON array of {title, desc} objects', type: "textarea" },
    ],
  },
  sponsor_portal_tiers: {
    label: "Sponsor Portal — Tiers (JSON array)",
    fields: [
      { key: "tiers", label: 'JSON array of tier objects (name, tagline, benefits[], featured, class, badgeClass)', type: "textarea" },
    ],
  },
  contact_info: {
    label: "Contact Page — Cards & Offices",
    fields: [
      { key: "cards", label: 'Contact cards JSON (array of {type, label, value, desc})', type: "textarea" },
      { key: "offices", label: 'Offices JSON (array of {city, country, role, address})', type: "textarea" },
    ],
  },
  parliament_initiative: {
    label: "Parliament Initiative Page (/about)",
    fields: [
      { key: "hero_title",         label: "Hero Title",                    type: "text"     },
      { key: "hero_desc",          label: "Hero Description",              type: "textarea" },
      { key: "why_title",          label: "Why a Year-Long Programme? — Title", type: "text" },
      { key: "why_desc",           label: "Why a Year-Long Programme? — Body",  type: "textarea" },
      { key: "living_title",       label: "A Living Story — Title",        type: "text"     },
      { key: "living_desc",        label: "A Living Story — Body",         type: "textarea" },
      { key: "focus_title",        label: "Priority Focus Areas — Title",  type: "text"     },
      { key: "focus1_title",       label: "Focus Area 1 — Title",          type: "text"     },
      { key: "focus1_desc",        label: "Focus Area 1 — Description",    type: "textarea" },
      { key: "focus2_title",       label: "Focus Area 2 — Title",          type: "text"     },
      { key: "focus2_desc",        label: "Focus Area 2 — Description",    type: "textarea" },
      { key: "focus3_title",       label: "Focus Area 3 — Title",          type: "text"     },
      { key: "focus3_desc",        label: "Focus Area 3 — Description",    type: "textarea" },
      { key: "focus4_title",       label: "Focus Area 4 — Title",          type: "text"     },
      { key: "focus4_desc",        label: "Focus Area 4 — Description",    type: "textarea" },
      { key: "partnerships_title", label: "Strategic Partnerships — Title", type: "text"    },
      { key: "partnerships_desc",  label: "Strategic Partnerships — Body", type: "textarea" },
      { key: "vision_title",       label: "Vision 2050 — Title",           type: "text"     },
      { key: "vision_desc",        label: "Vision 2050 — Body",            type: "textarea" },
    ],
  },
  ecowas_parliament: {
    label: "ECOWAS Parliament Page (/ecowas-parliament)",
    fields: [
      { key: "page_title",       label: "Hero Title",                          type: "text"     },
      { key: "tagline",          label: "Hero Tagline",                        type: "text"     },
      { key: "founding_badge",   label: "Founding Badge Text",                 type: "text"     },
      { key: "website",          label: "Official Website URL (no https://)",  type: "text"     },
      { key: "glance_badge",     label: "At a Glance — Badge Label",           type: "text"     },
      { key: "numbers_title",    label: "At a Glance — Section Title",         type: "text"     },
      { key: "committees_title", label: "Standing Committees — Title",         type: "text"     },
      { key: "committees_desc",  label: "Standing Committees — Description",   type: "textarea" },
      { key: "cta_title",        label: "Get Involved CTA — Title",            type: "text"     },
      { key: "cta_desc",         label: "Get Involved CTA — Description",      type: "textarea" },
    ],
  },
  media_kit_hero: {
    label: "Media Kit Page — Hero",
    fields: [
      { key: "badge",         label: "Hero Badge Text",                   type: "text"     },
      { key: "hero_title",    label: "Hero Title",                        type: "text"     },
      { key: "hero_desc",     label: "Hero Description",                  type: "textarea" },
      { key: "full_pack_url", label: "Full Pack Download URL",            type: "text"     },
      { key: "contact_email", label: "Hero Contact Email (button label)", type: "text"     },
    ],
  },
  media_contact: {
    label: "Media Kit Page — Contact Card",
    fields: [
      { key: "section_title",         label: "Card Heading",           type: "text"     },
      { key: "section_desc",          label: "Card Description",       type: "textarea" },
      { key: "contact_name",          label: "Contact Name",           type: "text"     },
      { key: "contact_title",         label: "Contact Job Title",      type: "text"     },
      { key: "contact_email",         label: "Contact Email Address",  type: "text"     },
      { key: "contact_response_time", label: "Response Time Note",     type: "text"     },
      { key: "full_pack_url",         label: "Full Pack Download URL", type: "text"     },
    ],
  },
};

function SectionEditor({
  section, onSaved, allowEdit, allowDelete,
}: {
  section: SiteContentRow;
  onSaved: () => void;
  allowEdit: boolean;
  allowDelete: boolean;
}) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const template = SECTION_TEMPLATES[section.section_key];
  const [values, setValues] = useState<Record<string, string>>(section.content as any ?? {});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("site_content").update({
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await supabase.from("site_content").delete().eq("id", section.id);
      toast({ title: "Section deleted" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
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
        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <>
              <span className="text-[10px] text-red-400 mr-1">Sure?</span>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)} className="text-xs text-crm-text-muted h-7">No</Button>
              <Button size="sm" onClick={handleDelete} disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white text-xs h-7">
                {deleting ? "…" : "Yes, Delete"}
              </Button>
            </>
          ) : (
            <>
              {allowDelete && (
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}
                  className="text-crm-text-muted hover:text-red-400 text-xs gap-1 h-7">
                  <Trash2 size={11} />
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={saving || !allowEdit}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
                <Save size={11} /> {saving ? "Saving…" : "Save"}
              </Button>
            </>
          )}
        </div>
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
  const { canCreate, canEdit, canDelete } = usePermissions();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [newKey, setNewKey] = useState("");

  const { data: sections = [], isLoading } = useQuery<SiteContentRow[]>({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*").order("section_key");
      return data ?? [];
    },
  });

  const createSection = useMutation({
    mutationFn: async () => {
      const template = SECTION_TEMPLATES[newKey];
      const defaultContent: Record<string, string> = {};
      if (template) template.fields.forEach(f => { defaultContent[f.key] = ""; });
      await supabase.from("site_content").insert({
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
        <p className="text-[12px] text-crm-text-muted mt-0.5">Edit homepage sections and site-wide content. Changes reflect on the public website immediately.</p>
      </div>

      {availableTemplates.length > 0 && canCreate(MODULE) && (
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
          <SectionEditor key={s.id} section={s}
            onSaved={() => qc.invalidateQueries({ queryKey: ["site-content"] })}
            allowEdit={canEdit(MODULE)}
            allowDelete={canDelete(MODULE)}
          />
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
