import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search, Plus, Edit2, Check, X, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, ExternalLink, RefreshCw, Loader2,
} from "lucide-react";

type SeoPage = {
  id: string;
  page_path: string;
  title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  noindex: boolean;
  updated_at: string;
};

type EditState = Partial<Omit<SeoPage, "id" | "updated_at">>;

// ─── SEO Score ────────────────────────────────────────────────────────────────
function seoScore(page: SeoPage): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  if (!page.title) { issues.push("Missing title"); score -= 25; }
  else if (page.title.length < 30) { issues.push("Title too short (< 30 chars)"); score -= 10; }
  else if (page.title.length > 60) { issues.push("Title too long (> 60 chars)"); score -= 10; }

  if (!page.meta_description) { issues.push("Missing meta description"); score -= 25; }
  else if (page.meta_description.length < 70) { issues.push("Description too short (< 70 chars)"); score -= 10; }
  else if (page.meta_description.length > 160) { issues.push("Description too long (> 160 chars)"); score -= 10; }

  if (!page.focus_keyword) { issues.push("No focus keyword"); score -= 10; }
  if (page.noindex) { issues.push("Page is set to noindex"); score -= 20; }

  return { score: Math.max(0, score), issues };
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-950 border-emerald-800 text-emerald-400"
              : score >= 50 ? "bg-amber-950 border-amber-800 text-amber-400"
              : "bg-red-950 border-red-800 text-red-400";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {score}
    </span>
  );
}

// ─── Inline editor row ────────────────────────────────────────────────────────
function PageRow({ page, onSave, onDelete }: {
  page: SeoPage;
  onSave: (id: string, edits: EditState) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [draft, setDraft] = useState<EditState>({});
  const { score, issues } = seoScore(page);

  const startEdit = () => {
    setDraft({
      page_path: page.page_path,
      title: page.title ?? "",
      meta_description: page.meta_description ?? "",
      og_title: page.og_title ?? "",
      og_description: page.og_description ?? "",
      focus_keyword: page.focus_keyword ?? "",
      canonical_url: page.canonical_url ?? "",
      noindex: page.noindex,
    });
    setEditing(true);
    setExpanded(true);
  };

  const cancelEdit = () => { setEditing(false); setDraft({}); };

  const save = async () => {
    setSaving(true);
    try { await onSave(page.id, draft); setEditing(false); setDraft({}); }
    finally { setSaving(false); }
  };

  const field = (key: keyof EditState, label: string, placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-[10px] text-crm-text-muted">{label}</Label>
      <Input
        value={(draft[key] as string) ?? ""}
        onChange={e => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-8"
      />
    </div>
  );

  return (
    <div className="border border-crm-border rounded-xl overflow-hidden">
      {/* Summary row */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-crm-card hover:bg-crm-surface transition-colors cursor-pointer"
        onClick={() => !editing && setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-mono text-crm-text truncate">{page.page_path}</span>
            {page.noindex && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 border border-red-900 text-red-400">noindex</span>
            )}
          </div>
          <p className="text-[10px] text-crm-text-muted truncate mt-0.5">{page.title ?? "No title"}</p>
        </div>
        <ScorePill score={score} />
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); startEdit(); }}
            className="p-1.5 rounded hover:bg-crm-border text-crm-text-dim hover:text-crm-text transition-colors"
            title="Edit"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
            className="p-1.5 rounded hover:bg-crm-border text-crm-text-dim hover:text-crm-text transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Expanded detail / edit */}
      {expanded && (
        <div className="border-t border-crm-border bg-crm-surface/50 px-4 py-4">
          {editing ? (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                {field("page_path", "Page path", "/example-page")}
                {field("focus_keyword", "Focus keyword", "ECOWAS Parliament")}
                {field("title", `Title (${(draft.title as string ?? "").length}/60)`, "Page title")}
                {field("meta_description", `Description (${(draft.meta_description as string ?? "").length}/160)`, "Meta description")}
                {field("og_title", "OG Title", "Open Graph title")}
                {field("og_description", "OG Description", "Open Graph description")}
                {field("canonical_url", "Canonical URL", "https://...")}
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={draft.noindex ?? false}
                  onCheckedChange={v => setDraft(prev => ({ ...prev, noindex: v }))}
                  className="data-[state=checked]:bg-red-600"
                />
                <span className="text-[12px] text-crm-text-muted">No-index (hide from search engines)</span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={save} disabled={saving} className="text-[11px] gap-1.5 h-7">
                  {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit} className="text-[11px] gap-1.5 h-7 border-crm-border text-crm-text-muted">
                  <X size={11} /> Cancel
                </Button>
                <button
                  onClick={() => onDelete(page.id)}
                  className="ml-auto text-[10px] text-red-500 hover:text-red-400 transition-colors"
                >
                  Delete page
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Read-only detail */}
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  ["Title",           page.title],
                  ["Meta description", page.meta_description],
                  ["Focus keyword",   page.focus_keyword],
                  ["OG title",        page.og_title],
                  ["OG description",  page.og_description],
                  ["Canonical URL",   page.canonical_url],
                ].map(([label, val]) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-[9px] uppercase tracking-wider text-crm-text-faint">{label}</p>
                    <p className="text-[11px] text-crm-text-muted truncate">{val ?? <span className="italic text-crm-text-faint">Not set</span>}</p>
                  </div>
                ))}
              </div>
              {issues.length > 0 && (
                <div className="space-y-1 mt-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-400">Issues</p>
                  {issues.map(issue => (
                    <div key={issue} className="flex items-center gap-1.5 text-[10px] text-amber-400">
                      <AlertTriangle size={9} /> {issue}
                    </div>
                  ))}
                </div>
              )}
              {issues.length === 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <CheckCircle2 size={10} /> All SEO checks passed
                </div>
              )}
              <p className="text-[9px] text-crm-text-faint">
                Updated {new Date(page.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Page Modal (inline) ──────────────────────────────────────────────────
function AddPageRow({ onAdd, onCancel }: { onAdd: (draft: EditState) => Promise<void>; onCancel: () => void }) {
  const [draft, setDraft] = useState<EditState>({ noindex: false });
  const [saving, setSaving] = useState(false);

  const field = (key: keyof EditState, label: string, placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-[10px] text-crm-text-muted">{label}</Label>
      <Input
        value={(draft[key] as string) ?? ""}
        onChange={e => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-8"
      />
    </div>
  );

  return (
    <div className="border border-emerald-800/50 rounded-xl bg-crm-card p-4 space-y-3">
      <p className="text-[11px] font-semibold text-crm-text">New page</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {field("page_path", "Page path *", "/your-page")}
        {field("focus_keyword", "Focus keyword", "ECOWAS Parliament")}
        {field("title", "Title (max 60 chars)", "Page title")}
        {field("meta_description", "Meta description (max 160 chars)", "Description")}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={async () => { setSaving(true); try { await onAdd(draft); } finally { setSaving(false); } }} disabled={saving || !draft.page_path} className="text-[11px] gap-1.5 h-7">
          {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Add
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="text-[11px] h-7 border-crm-border text-crm-text-muted">
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SEOModule() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [sortBy, setSortBy] = useState<"path" | "score">("score");

  const { data: pages = [], isLoading, refetch } = useQuery({
    queryKey: ["seo-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_pages")
        .select("*")
        .order("page_path");
      if (error) throw error;
      return (data ?? []) as SeoPage[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, edits }: { id: string; edits: EditState }) => {
      const { error } = await supabase
        .from("seo_pages")
        .update({ ...edits, updated_at: new Date().toISOString(), updated_by: user?.id ?? null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seo-pages"] });
      toast({ title: "SEO data saved" });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const addMutation = useMutation({
    mutationFn: async (draft: EditState) => {
      const { error } = await supabase
        .from("seo_pages")
        .insert({ ...draft, updated_by: user?.id ?? null } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seo-pages"] });
      toast({ title: "Page added" });
      setAdding(false);
    },
    onError: (e: any) => toast({ title: "Add failed", description: e.message, variant: "destructive" }),
  });

  const deletePage = useCallback(async (id: string) => {
    const { error } = await supabase.from("seo_pages").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["seo-pages"] });
    toast({ title: "Page deleted" });
  }, [qc, toast]);

  const filtered = pages
    .filter(p => !search || p.page_path.toLowerCase().includes(search.toLowerCase()) || (p.title ?? "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "score") return seoScore(a).score - seoScore(b).score;
      return a.page_path.localeCompare(b.page_path);
    });

  const avgScore = pages.length > 0
    ? Math.round(pages.reduce((s, p) => s + seoScore(p).score, 0) / pages.length)
    : 0;

  const okCount = pages.filter(p => seoScore(p).score >= 80).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-crm-text">SEO Manager</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            Manage meta tags, descriptions and SEO settings for each page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-crm-border text-crm-text-dim hover:text-crm-text transition-colors" title="Refresh">
            <RefreshCw size={13} />
          </button>
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-crm-border text-crm-text-muted hover:text-crm-text transition-colors">
            <ExternalLink size={11} /> Search Console
          </a>
          <Button size="sm" onClick={() => setAdding(true)} className="text-[11px] gap-1.5 h-8">
            <Plus size={12} /> Add Page
          </Button>
        </div>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-crm-card border border-crm-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-crm-text">{avgScore}</p>
          <p className="text-[10px] uppercase tracking-widest text-crm-text-dim mt-0.5">Avg SEO score</p>
        </div>
        <div className="bg-crm-card border border-crm-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{okCount}</p>
          <p className="text-[10px] uppercase tracking-widest text-crm-text-dim mt-0.5">Pages passing</p>
        </div>
        <div className="bg-crm-card border border-crm-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{pages.length - okCount}</p>
          <p className="text-[10px] uppercase tracking-widest text-crm-text-dim mt-0.5">Need attention</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-crm-text-dim" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="pl-8 bg-crm-card border-crm-border text-crm-text text-[12px] h-8"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["score", "path"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${sortBy === s ? "bg-crm-border text-crm-text" : "text-crm-text-muted hover:text-crm-text"}`}
            >
              {s === "score" ? "Lowest score" : "Path A–Z"}
            </button>
          ))}
        </div>
      </div>

      {/* Add row */}
      {adding && (
        <AddPageRow
          onAdd={draft => addMutation.mutateAsync(draft)}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Page list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-crm-text-muted" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Search size={32} className="text-crm-text-faint" />
          <p className="text-[13px] text-crm-text-muted">
            {search ? "No pages match your search" : "No SEO pages yet"}
          </p>
          {!search && (
            <Button size="sm" onClick={() => setAdding(true)} className="text-[11px] gap-1.5">
              <Plus size={12} /> Add your first page
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(page => (
            <PageRow
              key={page.id}
              page={page}
              onSave={(id, edits) => saveMutation.mutateAsync({ id, edits })}
              onDelete={deletePage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
