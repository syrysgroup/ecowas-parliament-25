import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Loader2,
  Eye, ChevronDown, ChevronUp, Globe, MessageSquare, Twitter,
  BarChart2, Clock, CheckSquare, Archive,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ParliamentContent {
  id: string;
  title: string;
  session_ref: string | null;
  session_date: string | null;
  committee: string | null;
  raw_input: string | null;
  summary_en: string | null;
  summary_fr: string | null;
  summary_pt: string | null;
  whatsapp_en: string | null;
  telegram_en: string | null;
  social_x: string | null;
  status: string;
  country_tags: string[];
  topic_tags: string[];
  source_doc: string | null;
  fact_checked: boolean;
  created_at: string;
  updated_at: string;
}

const COUNTRY_OPTIONS = [
  "Benin","Burkina Faso","Cape Verde","Côte d'Ivoire","Gambia","Ghana",
  "Guinea","Guinea-Bissau","Liberia","Mali","Niger","Nigeria","Senegal",
  "Sierra Leone","Togo",
];

const TOPIC_OPTIONS = ["trade","youth","security","women","culture","governance","health","agriculture"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft:     { label: "Draft",     color: "text-zinc-400",    bg: "bg-zinc-900",     border: "border-zinc-700" },
  review:    { label: "In Review", color: "text-amber-400",   bg: "bg-amber-950",    border: "border-amber-800" },
  approved:  { label: "Approved",  color: "text-blue-400",    bg: "bg-blue-950",     border: "border-blue-800" },
  published: { label: "Published", color: "text-emerald-400", bg: "bg-emerald-950",  border: "border-emerald-800" },
  archived:  { label: "Archived",  color: "text-slate-400",   bg: "bg-slate-900",    border: "border-slate-700" },
};

type InternalTab = "upload" | "review" | "log";

// ─── Upload tab ───────────────────────────────────────────────────────────────
function UploadTab() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    session_ref: "",
    session_date: "",
    committee: "",
    source_doc: "",
    raw_input: "",
  });
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  function update(field: string, val: string) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  async function handleSaveDraft() {
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from("parliament_content").insert({
      title: form.title.trim(),
      session_ref: form.session_ref.trim() || null,
      session_date: form.session_date || null,
      committee: form.committee.trim() || null,
      source_doc: form.source_doc.trim() || null,
      raw_input: form.raw_input.trim() || null,
      created_by: user?.id,
      status: "draft",
    }).select("id").single();
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      setSavedId(data.id);
      qc.invalidateQueries({ queryKey: ["parliament-content-list"] });
      toast({ title: "Draft saved", description: form.title });
    }
  }

  async function handleProcessAI() {
    let id = savedId;
    if (!id) {
      if (!form.title.trim() || !form.raw_input.trim()) {
        toast({ title: "Title and transcript are required before processing", variant: "destructive" });
        return;
      }
      if (!form.source_doc.trim()) {
        toast({ title: "Source document required", description: "Add a source document reference before processing with AI", variant: "destructive" });
        return;
      }
      setSaving(true);
      const { data, error } = await supabase.from("parliament_content").insert({
        title: form.title.trim(),
        session_ref: form.session_ref.trim() || null,
        session_date: form.session_date || null,
        committee: form.committee.trim() || null,
        source_doc: form.source_doc.trim(),
        raw_input: form.raw_input.trim(),
        created_by: user?.id,
        status: "draft",
      }).select("id").single();
      setSaving(false);
      if (error || !data) {
        toast({ title: "Failed to save before processing", description: error?.message, variant: "destructive" });
        return;
      }
      id = data.id;
      setSavedId(id);
      qc.invalidateQueries({ queryKey: ["parliament-content-list"] });
    }

    if (!form.source_doc.trim() && !savedId) {
      toast({ title: "Source document required", variant: "destructive" });
      return;
    }

    setProcessing(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("parliament-ai", {
      body: { content_id: id },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    setProcessing(false);

    if (res.error || res.data?.error) {
      toast({ title: "AI processing failed", description: res.data?.error ?? res.error?.message, variant: "destructive" });
    } else {
      toast({ title: "AI processing complete", description: "EN/FR/PT summaries and platform formats generated. Content moved to Review." });
      qc.invalidateQueries({ queryKey: ["parliament-content-list"] });
      setForm({ title: "", session_ref: "", session_date: "", committee: "", source_doc: "", raw_input: "" });
      setSavedId(null);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-crm-card border border-crm-border rounded-xl p-5 space-y-4">
        <h3 className="text-[14px] font-semibold text-crm-text flex items-center gap-2">
          <Upload size={15} className="text-amber-400" />
          New Parliament Content
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] font-mono text-crm-text-muted uppercase tracking-wide">Title *</Label>
            <Input value={form.title} onChange={e => update("title", e.target.value)}
              placeholder="e.g. 5th Extraordinary Session — Trade Protocol"
              className="bg-crm-surface border-crm-border text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono text-crm-text-muted uppercase tracking-wide">Session Ref</Label>
            <Input value={form.session_ref} onChange={e => update("session_ref", e.target.value)}
              placeholder="e.g. EP-2026-S05"
              className="bg-crm-surface border-crm-border text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono text-crm-text-muted uppercase tracking-wide">Session Date</Label>
            <Input type="date" value={form.session_date} onChange={e => update("session_date", e.target.value)}
              className="bg-crm-surface border-crm-border text-[13px]" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] font-mono text-crm-text-muted uppercase tracking-wide">Committee</Label>
            <Input value={form.committee} onChange={e => update("committee", e.target.value)}
              placeholder="e.g. Committee on Trade, Customs and Free Movement"
              className="bg-crm-surface border-crm-border text-[13px]" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] font-mono text-crm-text-muted uppercase tracking-wide">
              Source Document * <span className="text-red-400 normal-case font-normal">(required for AI processing)</span>
            </Label>
            <Input value={form.source_doc} onChange={e => update("source_doc", e.target.value)}
              placeholder="URL or filename of official source document"
              className="bg-crm-surface border-crm-border text-[13px]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] font-mono text-crm-text-muted uppercase tracking-wide">
            Session Transcript / Notes *
          </Label>
          <textarea
            value={form.raw_input}
            onChange={e => update("raw_input", e.target.value)}
            rows={10}
            placeholder="Paste the full session transcript or notes here. The AI will process this into EN/FR/PT summaries and platform-specific formats..."
            className="w-full bg-crm-surface border border-crm-border rounded-lg px-3 py-2.5 text-[12px] text-crm-text placeholder:text-crm-text-faint resize-y font-mono focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving || processing}
            className="text-[11px] border-crm-border text-crm-text-muted hover:text-crm-text">
            {saving ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
            Save Draft
          </Button>
          <Button size="sm" onClick={handleProcessAI} disabled={saving || processing || !form.raw_input.trim()}
            className="bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-700 text-[11px]">
            {processing ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
            {processing ? "Processing with AI..." : "Process with AI"}
          </Button>
        </div>

        {processing && (
          <p className="text-[11px] text-amber-400 font-mono animate-pulse">
            Running Claude AI — generating EN/FR/PT summaries + WhatsApp/Telegram/X formats…
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Content row (expandable) ─────────────────────────────────────────────────
function ContentRow({ item, onRefresh }: { item: ParliamentContent; onRefresh: () => void }) {
  const { user, isSuperAdmin } = useAuthContext();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.draft;

  async function changeStatus(newStatus: string) {
    setUpdating(true);
    const patch: Record<string, any> = { status: newStatus };
    if (newStatus === "review")    patch.reviewed_by   = user?.id;
    if (newStatus === "approved")  patch.approved_by   = user?.id;
    if (newStatus === "published") patch.published_at  = new Date().toISOString();
    const { error } = await supabase.from("parliament_content").update(patch).eq("id", item.id);
    setUpdating(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Status → ${newStatus}` });
      onRefresh();
    }
  }

  async function toggleFactCheck() {
    const { error } = await supabase.from("parliament_content")
      .update({ fact_checked: !item.fact_checked })
      .eq("id", item.id);
    if (!error) onRefresh();
  }

  async function updateTags(field: "country_tags" | "topic_tags", tags: string[]) {
    await supabase.from("parliament_content").update({ [field]: tags }).eq("id", item.id);
    onRefresh();
  }

  return (
    <div className="bg-crm-card border border-crm-border rounded-lg overflow-hidden">
      {/* Row header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-crm-surface/50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-crm-text truncate">{item.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {item.session_ref && (
              <span className="text-[10px] font-mono text-crm-text-faint">{item.session_ref}</span>
            )}
            {item.session_date && (
              <span className="text-[10px] text-crm-text-faint">{new Date(item.session_date).toLocaleDateString()}</span>
            )}
            {item.committee && (
              <span className="text-[10px] text-crm-text-faint truncate max-w-[200px]">{item.committee}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${st.color} ${st.bg} ${st.border}`}>
            {st.label}
          </span>
          {item.fact_checked && (
            <span className="text-[10px] text-emerald-400 font-mono">✓ fact-checked</span>
          )}
          {expanded ? <ChevronUp size={13} className="text-crm-text-faint" /> : <ChevronDown size={13} className="text-crm-text-faint" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-crm-border px-4 py-4 space-y-4">
          {/* Workflow actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-crm-text-faint uppercase tracking-wide">Actions:</span>
            {item.status === "draft" && (
              <Button size="sm" onClick={() => changeStatus("review")} disabled={updating}
                className="bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[10px] h-7 px-3">
                Submit for Review
              </Button>
            )}
            {item.status === "review" && (
              <Button size="sm" onClick={() => changeStatus("approved")} disabled={updating}
                className="bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[10px] h-7 px-3">
                Approve
              </Button>
            )}
            {item.status === "approved" && (
              <Button size="sm" onClick={() => changeStatus("published")} disabled={updating}
                className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] h-7 px-3">
                Publish
              </Button>
            )}
            {item.status !== "archived" && item.status !== "draft" && (
              <Button size="sm" variant="ghost" onClick={() => changeStatus("archived")} disabled={updating}
                className="text-crm-text-faint hover:text-crm-text-muted text-[10px] h-7 px-2">
                Archive
              </Button>
            )}
            {updating && <Loader2 size={12} className="animate-spin text-crm-text-faint" />}
          </div>

          {/* Fact-check + tags */}
          <div className="flex items-start gap-6 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={toggleFactCheck}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  item.fact_checked ? "bg-emerald-600 border-emerald-600" : "border-crm-border"
                }`}
              >
                {item.fact_checked && <CheckSquare size={10} className="text-white" />}
              </div>
              <span className="text-[11px] text-crm-text-muted">Fact-checked</span>
            </label>
            {item.source_doc && (
              <div className="flex items-center gap-1.5 text-[11px] text-crm-text-muted">
                <FileText size={11} />
                <span className="truncate max-w-[200px]">{item.source_doc}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-crm-text-faint uppercase tracking-wide">Country Tags</p>
              <div className="flex flex-wrap gap-1">
                {COUNTRY_OPTIONS.slice(0, 8).map(c => (
                  <button key={c}
                    onClick={() => {
                      const curr = item.country_tags ?? [];
                      updateTags("country_tags", curr.includes(c) ? curr.filter(x => x !== c) : [...curr, c]);
                    }}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      (item.country_tags ?? []).includes(c)
                        ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                        : "bg-crm-surface border-crm-border text-crm-text-faint hover:text-crm-text-muted"
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-crm-text-faint uppercase tracking-wide">Topic Tags</p>
              <div className="flex flex-wrap gap-1">
                {TOPIC_OPTIONS.map(t => (
                  <button key={t}
                    onClick={() => {
                      const curr = item.topic_tags ?? [];
                      updateTags("topic_tags", curr.includes(t) ? curr.filter(x => x !== t) : [...curr, t]);
                    }}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      (item.topic_tags ?? []).includes(t)
                        ? "bg-blue-950 border-blue-800 text-blue-400"
                        : "bg-crm-surface border-crm-border text-crm-text-faint hover:text-crm-text-muted"
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* AI outputs */}
          {(item.summary_en || item.summary_fr || item.summary_pt) && (
            <div className="space-y-3">
              <p className="text-[10px] font-mono text-crm-text-faint uppercase tracking-wide">AI-Generated Content</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "summary_en", label: "Summary EN", val: item.summary_en },
                  { key: "summary_fr", label: "Summary FR", val: item.summary_fr },
                  { key: "summary_pt", label: "Summary PT", val: item.summary_pt },
                ].map(({ key, label, val }) => val ? (
                  <div key={key} className="bg-crm-surface border border-crm-border rounded-lg p-3 space-y-1.5">
                    <p className="text-[10px] font-mono text-crm-text-muted uppercase">{label}</p>
                    <p className="text-[11px] text-crm-text-dim leading-relaxed line-clamp-6">{val}</p>
                  </div>
                ) : null)}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: MessageSquare, label: "WhatsApp EN", val: item.whatsapp_en },
                  { icon: Globe,         label: "Telegram EN", val: item.telegram_en },
                  { icon: Twitter,       label: "X/Twitter",   val: item.social_x },
                ].map(({ icon: Icon, label, val }) => val ? (
                  <div key={label} className="bg-crm-surface border border-crm-border rounded-lg p-3 space-y-1.5">
                    <p className="text-[10px] font-mono text-crm-text-muted flex items-center gap-1">
                      <Icon size={10} /> {label}
                    </p>
                    <p className="text-[11px] text-crm-text-dim leading-relaxed line-clamp-5">{val}</p>
                  </div>
                ) : null)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Review tab ───────────────────────────────────────────────────────────────
function ReviewTab() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: items = [], isLoading, refetch } = useQuery<ParliamentContent[]>({
    queryKey: ["parliament-content-list", statusFilter],
    queryFn: async () => {
      let q = supabase.from("parliament_content" as any).select("*").order("created_at", { ascending: false }).limit(50);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data } = await q;
      return (data ?? []) as ParliamentContent[];
    },
  });

  const statuses = ["all", "draft", "review", "approved", "published", "archived"];

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => {
          const cfg = s === "all" ? null : STATUS_CONFIG[s];
          return (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[10px] font-mono px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === s
                  ? cfg ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "bg-crm-surface border-crm-border text-crm-text"
                  : "border-crm-border text-crm-text-faint hover:text-crm-text-muted"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label ?? s}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-crm-text-muted text-[13px]">
          <Loader2 size={14} className="animate-spin" /> Loading content...
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-12 text-crm-text-faint text-[13px]">
          No parliament content found. Upload a transcript to get started.
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <ContentRow key={item.id} item={item} onRefresh={() => refetch()} />
        ))}
      </div>
    </div>
  );
}

// ─── Distribution log tab ─────────────────────────────────────────────────────
function DistributionLogTab() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["distribution-log"],
    queryFn: async () => {
      const { data } = await supabase
        .from("distribution_log" as any)
        .select("*, parliament_content(title)")
        .order("sent_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const PLATFORM_COLORS: Record<string, string> = {
    whatsapp: "text-emerald-400", telegram: "text-blue-400",
    x: "text-sky-400", instagram: "text-pink-400",
    youtube: "text-red-400", web: "text-amber-400",
  };

  const STATUS_COLORS: Record<string, string> = {
    sent: "text-emerald-400", failed: "text-red-400",
    pending: "text-amber-400", retry: "text-orange-400",
  };

  if (isLoading) return (
    <div className="flex items-center gap-2 text-crm-text-muted text-[13px]">
      <Loader2 size={14} className="animate-spin" /> Loading distribution log...
    </div>
  );

  if (logs.length === 0) return (
    <div className="text-center py-12 text-crm-text-faint text-[13px]">
      No distribution events yet. Publish content and send to channels to see logs here.
    </div>
  );

  return (
    <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-crm-border bg-crm-surface">
            {["Content","Platform","Language","Status","Recipients","Sent At"].map(h => (
              <th key={h} className="text-left px-4 py-2.5 font-mono text-[9px] uppercase tracking-widest text-crm-text-faint">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(logs as any[]).map((row: any) => (
            <tr key={row.id} className="border-b border-crm-border/50 hover:bg-crm-surface/50">
              <td className="px-4 py-2.5 text-crm-text-muted max-w-[200px] truncate">
                {row.parliament_content?.title ?? "—"}
              </td>
              <td className={`px-4 py-2.5 font-mono font-semibold ${PLATFORM_COLORS[row.platform] ?? "text-crm-text-muted"}`}>
                {row.platform}
              </td>
              <td className="px-4 py-2.5 text-crm-text-faint uppercase">{row.language}</td>
              <td className={`px-4 py-2.5 font-mono ${STATUS_COLORS[row.status] ?? "text-crm-text-faint"}`}>
                {row.status}
              </td>
              <td className="px-4 py-2.5 text-crm-text-faint">{row.recipients ?? "—"}</td>
              <td className="px-4 py-2.5 text-crm-text-faint">
                {new Date(row.sent_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main module ──────────────────────────────────────────────────────────────
const TABS: { id: InternalTab; label: string; icon: React.ElementType }[] = [
  { id: "upload", label: "Upload & Process",  icon: Upload },
  { id: "review", label: "Review & Approve",  icon: Eye },
  { id: "log",    label: "Distribution Log",  icon: BarChart2 },
];

export default function ParliamentContentModule() {
  const [tab, setTab] = useState<InternalTab>("upload");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[20px] font-bold text-crm-text">Parliament Content Hub</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            Upload session transcripts → AI generates EN/FR/PT summaries + distribution formats → editorial review → publish
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all ${
                tab === t.id
                  ? "bg-gradient-to-r from-amber-900 to-amber-950 text-amber-300 border border-amber-700 shadow-[0_0_10px_hsl(38,90%,50%,0.15)]"
                  : "text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface border border-transparent"
              }`}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "upload" && <UploadTab />}
      {tab === "review" && <ReviewTab />}
      {tab === "log"    && <DistributionLogTab />}
    </div>
  );
}
