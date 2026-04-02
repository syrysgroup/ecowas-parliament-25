import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout, Plus, Pencil, Trash2, Eye, CheckCircle2, Clock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  status: "draft" | "review" | "published";
  updated_at: string;
  editor_name: string | null;
}

const STATUS_CONFIG = {
  draft:     { label: "Draft",     classes: "bg-[#111a14] text-[#6b8f72] border-[#2a3d2d]",          icon: Clock },
  review:    { label: "In Review", classes: "bg-amber-950 text-amber-400 border-amber-800",           icon: Eye },
  published: { label: "Published", classes: "bg-emerald-950 text-emerald-400 border-emerald-800",     icon: CheckCircle2 },
};

const STATUS_NEXT: Record<CmsPage["status"], CmsPage["status"] | null> = {
  draft: "review",
  review: "published",
  published: null,
};

// ─── Page Dialog ───────────────────────────────────────────────────────────────
function PageDialog({ open, onClose, page }: {
  open: boolean; onClose: () => void; page?: CmsPage;
}) {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [title, setTitle] = useState(page?.title ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [status, setStatus] = useState<CmsPage["status"]>(page?.status ?? "draft");

  const isEdit = !!page;

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        title,
        content: content || null,
        status,
        last_edited_by: user!.id,
        updated_at: new Date().toISOString(),
      };
      if (isEdit) {
        await (supabase as any).from("cms_pages").update(payload).eq("id", page.id);
      } else {
        await (supabase as any).from("cms_pages").insert(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-pages"] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1610] border-[#1e2d22] text-[#c8e0cc] max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-[#c8e0cc]">
            {isEdit ? "Edit Page" : "New Page"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-[#4a6650]">Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)}
                className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8"
                placeholder="Page title" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-[#4a6650]">Slug *</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)}
                className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8 font-mono"
                placeholder="e.g. about-us" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as CmsPage["status"])}>
              <SelectTrigger className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1610] border-[#1e2d22]">
                <SelectItem value="draft"     className="text-[#c8e0cc] text-xs">Draft</SelectItem>
                <SelectItem value="review"    className="text-[#c8e0cc] text-xs">In Review</SelectItem>
                <SelectItem value="published" className="text-[#c8e0cc] text-xs">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Content</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)}
              className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs min-h-[160px] resize-none font-mono"
              placeholder="Page content (markdown or plain text)" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-[#1e2d22] text-[#6b8f72] text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!title.trim() || !slug.trim() || save.isPending}
            onClick={() => save.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function CMSModule() {
  const { isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CmsPage | null>(null);
  const [previewTarget, setPreviewTarget] = useState<CmsPage | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data = [], isLoading } = useQuery<CmsPage[]>({
    queryKey: ["cms-pages"],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("cms_pages")
        .select("id, slug, title, content, status, updated_at, editor:profiles!cms_pages_last_edited_by_fkey(full_name)")
        .order("updated_at", { ascending: false });
      if (res.error?.code === "42P01") return [];
      return (res.data ?? []).map((d: any) => ({
        id: d.id, slug: d.slug, title: d.title,
        content: d.content ?? null, status: d.status,
        updated_at: d.updated_at,
        editor_name: d.editor?.full_name ?? null,
      }));
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("cms_pages").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-pages"] });
      setConfirmDeleteId(null);
    },
  });

  const advanceStatus = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: CmsPage["status"] }) => {
      await (supabase as any).from("cms_pages").update({ status: next }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-pages"] }),
  });

  const filtered = filterStatus === "all" ? data : data.filter(p => p.status === filterStatus);
  const reviewCount = data.filter(p => p.status === "review").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#c8e0cc]">CMS Editor</h2>
          <p className="text-[12px] text-[#6b8f72] mt-0.5">Manage public website pages and their content</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setAddOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> New Page
          </Button>
        )}
      </div>

      {/* Status summary + filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = data.filter(p => p.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
                className={`flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-opacity ${cfg.classes} ${filterStatus !== "all" && filterStatus !== key ? "opacity-40" : ""}`}
              >
                <cfg.icon size={10} />
                {cfg.label}: {count}
              </button>
            );
          })}
        </div>
        {reviewCount > 0 && (
          <span className="text-[10px] text-amber-400 font-mono">
            {reviewCount} page{reviewCount !== 1 ? "s" : ""} awaiting review
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
          <Layout className="h-6 w-6 text-[#4a6650]" />
          <p className="text-sm text-[#6b8f72]">No pages found.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(page => {
          const statusCfg = STATUS_CONFIG[page.status];
          const nextStatus = STATUS_NEXT[page.status];
          const isConfirming = confirmDeleteId === page.id;

          return (
            <div key={page.id} className="bg-[#0d1610] border border-[#1e2d22] rounded-xl p-4 hover:border-[#2a3d2d] transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[13px] font-semibold text-[#c8e0cc]">{page.title}</p>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${statusCfg.classes}`}>{statusCfg.label}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-mono text-emerald-500 bg-[#111a14] border border-[#1e2d22] rounded px-1.5 py-0.5">/{page.slug}</span>
                    <span className="text-[10px] text-[#4a6650]">Updated {format(parseISO(page.updated_at), "d MMM yyyy, HH:mm")}</span>
                    {page.editor_name && <span className="text-[10px] text-[#4a6650]">by {page.editor_name}</span>}
                  </div>
                  {page.content && (
                    <p className="text-[10px] text-[#4a6650] mt-1 line-clamp-1">{page.content.slice(0, 120)}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setPreviewTarget(page)}
                    className="w-7 h-7 rounded flex items-center justify-center bg-[#111a14] border border-[#1e2d22] text-[#4a6650] hover:text-[#a0c4a8] transition-colors"
                    title="Preview"
                  >
                    <Eye size={12} />
                  </button>

                  {isAdmin && nextStatus && !isConfirming && (
                    <button
                      onClick={() => advanceStatus.mutate({ id: page.id, next: nextStatus })}
                      disabled={advanceStatus.isPending}
                      className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950 border border-emerald-800 rounded px-2 py-1 hover:bg-emerald-900 transition-colors"
                    >
                      <Send size={10} /> {STATUS_CONFIG[nextStatus].label}
                    </button>
                  )}

                  {isAdmin && !isConfirming && (
                    <>
                      <button onClick={() => setEditTarget(page)}
                        className="w-7 h-7 rounded flex items-center justify-center bg-[#111a14] border border-[#1e2d22] text-[#4a6650] hover:text-[#a0c4a8] transition-colors">
                        <Pencil size={12} />
                      </button>
                      {page.status !== "published" && (
                        <button onClick={() => setConfirmDeleteId(page.id)}
                          className="w-7 h-7 rounded flex items-center justify-center bg-[#111a14] border border-[#1e2d22] text-[#4a6650] hover:text-red-400 hover:border-red-900 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </>
                  )}

                  {isAdmin && isConfirming && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deletePage.mutate(page.id)} disabled={deletePage.isPending}
                        className="text-[10px] font-semibold text-red-400 bg-red-950 border border-red-800 rounded px-2 py-1">
                        {deletePage.isPending ? "…" : "Delete"}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-[#4a6650] bg-[#111a14] border border-[#1e2d22] rounded px-2 py-1">
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Dialog */}
      {previewTarget && (
        <Dialog open={!!previewTarget} onOpenChange={() => setPreviewTarget(null)}>
          <DialogContent className="bg-[#0d1610] border-[#1e2d22] text-[#c8e0cc] max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold text-[#c8e0cc]">{previewTarget.title}</DialogTitle>
              <p className="text-[10px] font-mono text-emerald-500">/{previewTarget.slug}</p>
            </DialogHeader>
            <div className="mt-2 text-[12px] text-[#c8e0cc] whitespace-pre-wrap font-mono border border-[#1e2d22] rounded-lg p-4 bg-[#111a14] min-h-[120px]">
              {previewTarget.content ?? "(No content)"}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <PageDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {editTarget && (
        <PageDialog page={editTarget} open={!!editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}
