import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Plus, Pencil, Trash2, Eye, Image, Send, Search, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "@/components/ui/sonner";

interface NewsRow {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string | null; cover_image_url: string | null; author_id: string | null;
  status: string; published_at: string | null; created_at: string;
  external_links?: { title: string; url: string }[];
}

const PAGE_SIZE = 20;

function ArticleDialog({ open, onClose, article }: { open: boolean; onClose: () => void; article?: NewsRow }) {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [coverUrl, setCoverUrl] = useState(article?.cover_image_url ?? "");
  const [status, setStatus] = useState(article?.status ?? "draft");
  const [uploading, setUploading] = useState(false);
  const [externalLinks, setExternalLinks] = useState<{ title: string; url: string }[]>(
    article?.external_links ?? []
  );

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("news-images").upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from("news-images").getPublicUrl(path);
      setCoverUrl(publicUrl);
    } finally { setUploading(false); }
  };

  const addLink = () => setExternalLinks(prev => [...prev, { title: "", url: "" }]);
  const removeLink = (i: number) => setExternalLinks(prev => prev.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: "title" | "url", value: string) =>
    setExternalLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));

  const save = useMutation({
    mutationFn: async () => {
      const wasNotPublished = !article?.published_at || article?.status !== "published";
      const isNowPublished  = status === "published";
      const payload: any = {
        title, slug: slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        excerpt: excerpt || null, content: content || null, cover_image_url: coverUrl || null,
        status, updated_at: new Date().toISOString(),
        external_links: externalLinks.filter(l => l.url.trim()),
        ...(isNowPublished && wasNotPublished ? { published_at: new Date().toISOString() } : {}),
      };
      if (isEdit) await (supabase as any).from("news_articles").update(payload).eq("id", article.id);
      else await (supabase as any).from("news_articles").insert({ ...payload, author_id: user!.id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news-editor"] });
      qc.invalidateQueries({ queryKey: ["homepage-latest-news"] });
      toast("Article saved");
      onClose();
    },
    onError: (err: any) => toast(err.message || "Failed to save"),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">{isEdit ? "Edit Article" : "New Article"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-2">
            <Label className="text-[11px] text-crm-text-dim">Cover Image</Label>
            {coverUrl && <img src={coverUrl} alt="" className="w-full h-40 object-cover rounded-lg border border-crm-border" />}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="border-crm-border text-crm-text-muted text-xs gap-1"><Image size={12} /> {uploading ? "Uploading…" : "Upload"}</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Title *</Label>
              <Input value={title} onChange={e => { setTitle(e.target.value); if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")); }}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Slug</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Excerpt</Label>
            <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={2} />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Content</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none font-mono" rows={8} placeholder="Article content (markdown supported)" />
          </div>

          {/* External Links */}
          <div className="space-y-2 bg-crm-surface border border-crm-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-crm-text-dim font-semibold flex items-center gap-1">
                <LinkIcon size={11} /> External Media Links
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addLink}
                className="border-crm-border text-crm-text-muted text-[10px] gap-1 h-6 px-2">
                <Plus size={10} /> Add Link
              </Button>
            </div>
            {externalLinks.map((link, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input value={link.title} onChange={e => updateLink(i, "title", e.target.value)}
                  placeholder="Link title" className="bg-crm-card border-crm-border text-crm-text text-xs h-7" />
                <Input value={link.url} onChange={e => updateLink(i, "url", e.target.value)}
                  placeholder="https://..." className="bg-crm-card border-crm-border text-crm-text text-xs h-7 font-mono" />
                <button onClick={() => removeLink(i)} className="w-7 h-7 rounded flex items-center justify-center text-red-400 hover:bg-red-950 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {["draft", "published"].map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`text-[10px] font-mono px-3 py-1.5 rounded border transition-colors ${
                  status === s ? "bg-emerald-950 text-emerald-400 border-emerald-700" : "bg-crm-surface text-crm-text-dim border-crm-border"
                }`}>{s === "draft" ? "Draft" : "Published"}</button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" disabled={!title.trim() || save.isPending} onClick={() => save.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">{save.isPending ? "Saving…" : isEdit ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NewsEditorModule() {
  const { isAdmin } = useAuthContext();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NewsRow | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const { data: articles = [], isLoading } = useQuery<NewsRow[]>({
    queryKey: ["news-editor"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("news_articles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = articles.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => { await (supabase as any).from("news_articles").delete().eq("id", id); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news-editor"] });
      qc.invalidateQueries({ queryKey: ["homepage-latest-news"] });
      setConfirmDeleteId(null);
      toast("Article deleted");
    },
  });

  const publish = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("news_articles").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["news-editor"] }); toast("Published"); },
  });

  const bulkDelete = useMutation({
    mutationFn: async () => {
      await Promise.all([...selectedIds].map(id => (supabase as any).from("news_articles").delete().eq("id", id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news-editor"] });
      setSelectedIds(new Set());
      toast("Deleted selected articles");
    },
  });

  const bulkPublish = useMutation({
    mutationFn: async () => {
      await Promise.all([...selectedIds].map(id =>
        (supabase as any).from("news_articles").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id)
      ));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news-editor"] });
      setSelectedIds(new Set());
      toast("Published selected articles");
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === paged.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paged.map(a => a.id)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">News & Articles</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Manage news articles for the website</p>
        </div>
        {canCreate("news") && (
          <Button size="sm" onClick={() => setAddOpen(true)} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> New Article
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-text-dim" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 pl-8" placeholder="Search articles..." />
        </div>
        {["all", "draft", "published"].map(f => (
          <button key={f} onClick={() => { setStatusFilter(f as any); setPage(0); }}
            className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-colors ${
              statusFilter === f ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-crm-surface text-crm-text-muted border-crm-border"
            }`}>{f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} ({articles.filter(a => f === "all" || a.status === f).length})</button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 bg-crm-surface border border-crm-border rounded-lg px-3 py-2">
          <span className="text-[11px] text-crm-text-muted">{selectedIds.size} selected</span>
          {canDelete("news") && (
            <Button size="sm" variant="outline" onClick={() => bulkDelete.mutate()}
              className="border-red-800 text-red-400 text-[10px] h-6 px-2">Delete</Button>
          )}
          <Button size="sm" variant="outline" onClick={() => bulkPublish.mutate()}
            className="border-emerald-800 text-emerald-400 text-[10px] h-6 px-2">Publish</Button>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}

      <div className="space-y-2">
        {paged.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <Checkbox checked={selectedIds.size === paged.length && paged.length > 0} onCheckedChange={toggleAll} />
            <span className="text-[10px] text-crm-text-dim">Select all</span>
          </div>
        )}
        {paged.map(a => (
          <div key={a.id} className="bg-crm-card border border-crm-border rounded-xl overflow-hidden hover:border-crm-border-hover transition-colors">
            <div className="flex items-center">
              <div className="px-3">
                <Checkbox checked={selectedIds.has(a.id)} onCheckedChange={() => toggleSelect(a.id)} />
              </div>
              {a.cover_image_url && <img src={a.cover_image_url} alt="" className="w-24 h-20 object-cover flex-shrink-0" width={96} height={80} loading="lazy" decoding="async" />}
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-[13px] font-semibold text-crm-text">{a.title}</p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${a.status === "published" ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-crm-surface text-crm-text-muted border-crm-border"}`}>
                    {a.status}
                  </span>
                  {(a.external_links?.length ?? 0) > 0 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-blue-950 text-blue-400 border-blue-800">
                      {a.external_links!.length} links
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-crm-text-dim">{format(parseISO(a.created_at), "d MMM yyyy")}</p>
                {a.excerpt && <p className="text-[10px] text-crm-text-dim mt-0.5 line-clamp-1">{a.excerpt}</p>}
              </div>
              <div className="flex items-center gap-1 p-3 flex-shrink-0">
                {a.status === "draft" && canEdit("news") && (
                  <button onClick={() => publish.mutate(a.id)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950 border border-emerald-800 rounded px-2 py-1">
                    <Send size={10} /> Publish
                  </button>
                )}
                {canEdit("news") && (
                  <button onClick={() => setEditTarget(a)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors"><Pencil size={12} /></button>
                )}
                {canDelete("news") && (
                  confirmDeleteId === a.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deleteArticle.mutate(a.id)} className="text-[10px] text-red-400 bg-red-950 border border-red-800 rounded px-2 py-1">Delete</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-2 py-1">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(a.id)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="text-[10px] text-crm-text-muted px-2 py-1 rounded border border-crm-border disabled:opacity-30">Prev</button>
          <span className="text-[10px] text-crm-text-dim">Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="text-[10px] text-crm-text-muted px-2 py-1 rounded border border-crm-border disabled:opacity-30">Next</button>
        </div>
      )}

      <ArticleDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {editTarget && <ArticleDialog open={!!editTarget} onClose={() => setEditTarget(null)} article={editTarget} />}
    </div>
  );
}
