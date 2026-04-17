import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Lock, Download, AlertCircle, Plus, Trash2, Pencil, Upload, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Doc {
  id: string;
  title: string;
  category: string;
  file_type: string;
  file_size_kb: number | null;
  restricted: boolean;
  file_url: string | null;
  language: string;
  created_at: string;
  uploader_name: string | null;
}

const TYPE_STYLE: Record<string, string> = {
  PDF: "bg-red-950 text-red-400 border-red-800",
  DOC: "bg-blue-950 text-blue-400 border-blue-800",
  XLS: "bg-emerald-950 text-emerald-400 border-emerald-800",
  PPT: "bg-orange-950 text-orange-400 border-orange-800",
  ZIP: "bg-violet-950 text-violet-400 border-violet-800",
};

const FILE_TYPES = ["PDF", "DOC", "XLS", "PPT", "ZIP"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
];

const LANG_BADGE: Record<string, string> = {
  en: "bg-blue-950 text-blue-400 border-blue-800",
  fr: "bg-violet-950 text-violet-400 border-violet-800",
  pt: "bg-emerald-950 text-emerald-400 border-emerald-800",
};

// ─── Add Document Dialog ───────────────────────────────────────────────────────
function AddDocumentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [fileType, setFileType] = useState("PDF");
  const [restricted, setRestricted] = useState(false);
  const [language, setLanguage] = useState("en");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ""));
      const ext = f.name.split(".").pop()?.toUpperCase();
      if (ext && FILE_TYPES.includes(ext)) setFileType(ext);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setUploading(true);
    try {
      let fileUrl: string | null = null;
      let fileSizeKb: number | null = null;

      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("documents").upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
        fileUrl = urlData.publicUrl;
        fileSizeKb = Math.round(file.size / 1024);
      }

      await (supabase as any).from("documents").insert({
        title,
        category: category || "General",
        file_type: fileType,
        file_size_kb: fileSizeKb,
        restricted,
        file_url: fileUrl,
        language,
        uploaded_by: user!.id,
      });

      qc.invalidateQueries({ queryKey: ["crm-documents"] });
      setTitle(""); setCategory("General"); setFileType("PDF");
      setRestricted(false); setLanguage("en"); setFile(null);
      onClose();
      toast({ title: "Document uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">Add Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          {/* File upload */}
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">File</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-crm-border rounded-lg p-4 text-center cursor-pointer hover:border-emerald-700 transition-colors"
            >
              <Upload size={20} className="mx-auto text-crm-text-dim mb-1" />
              <p className="text-[11px] text-crm-text-dim">
                {file ? file.name : "Click to select a file"}
              </p>
              {file && <p className="text-[9px] text-crm-text-dim mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>}
            </div>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
              placeholder="Document title" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Category</Label>
              <Input value={category} onChange={e => setCategory(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                placeholder="General" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">File type</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  {FILE_TYPES.map(t => (
                    <SelectItem key={t} value={t} className="text-crm-text text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.value} value={l.value} className="text-crm-text text-xs">{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={restricted} onCheckedChange={setRestricted} />
            <Label className="text-[11px] text-crm-text-dim">Restricted (admin-only access)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!title.trim() || uploading}
            onClick={handleSubmit}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {uploading ? "Uploading…" : "Add Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Document Dialog ──────────────────────────────────────────────────────
function EditDocumentDialog({ doc, open, onClose }: { doc: Doc; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(doc.title);
  const [category, setCategory] = useState(doc.category);
  const [fileType, setFileType] = useState(doc.file_type);
  const [restricted, setRestricted] = useState(doc.restricted);
  const [language, setLanguage] = useState(doc.language || "en");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setUploading(true);
    try {
      let fileUrl = doc.file_url;
      let fileSizeKb = doc.file_size_kb;

      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("documents").upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
        fileUrl = urlData.publicUrl;
        fileSizeKb = Math.round(file.size / 1024);
      }

      await (supabase as any).from("documents").update({
        title,
        category: category || "General",
        file_type: fileType,
        file_size_kb: fileSizeKb,
        restricted,
        file_url: fileUrl,
        language,
      }).eq("id", doc.id);

      qc.invalidateQueries({ queryKey: ["crm-documents"] });
      onClose();
      toast({ title: "Document updated" });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">Edit Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          {/* Replace file */}
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Replace file (optional)</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-crm-border rounded-lg p-3 text-center cursor-pointer hover:border-emerald-700 transition-colors"
            >
              <p className="text-[11px] text-crm-text-dim">
                {file ? file.name : "Click to upload new file"}
              </p>
            </div>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Category</Label>
              <Input value={category} onChange={e => setCategory(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">File type</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  {FILE_TYPES.map(t => (
                    <SelectItem key={t} value={t} className="text-crm-text text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.value} value={l.value} className="text-crm-text text-xs">{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={restricted} onCheckedChange={setRestricted} />
            <Label className="text-[11px] text-crm-text-dim">Restricted</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!title.trim() || uploading}
            onClick={handleSubmit}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {uploading ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DocumentsModule() {
  const { isAdmin } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Doc | null>(null);
  const [filterLang, setFilterLang] = useState<string>("all");

  const { data, isLoading } = useQuery<Doc[] | null>({
    queryKey: ["crm-documents"],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("documents")
        .select("id, title, category, file_type, file_size_kb, restricted, file_url, language, created_at, uploader:profiles!documents_uploaded_by_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (res.error?.code === "42P01") return null;

      return (res.data ?? []).map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category ?? "General",
        file_type: d.file_type ?? "PDF",
        file_size_kb: d.file_size_kb ?? null,
        restricted: d.restricted ?? false,
        file_url: d.file_url ?? null,
        language: d.language ?? "en",
        created_at: d.created_at,
        uploader_name: d.uploader?.full_name ?? null,
      }));
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("documents").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-documents"] });
      setConfirmDeleteId(null);
      toast({ title: "Document deleted" });
    },
  });

  const filteredDocs = (data ?? []).filter(d => filterLang === "all" || d.language === filterLang);

  if (!isLoading && data === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-crm-surface border border-crm-border flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-crm-text">Documents table not set up</h2>
          <p className="text-sm text-crm-text-muted mt-2 max-w-sm">
            The documents table needs to be created in Supabase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Documents</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            Upload and manage shared files, MoU templates, budget documents, and reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterLang} onValueChange={setFilterLang}>
            <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 w-28">
              <Globe size={11} className="mr-1" /><SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-crm-card border-crm-border">
              <SelectItem value="all" className="text-crm-text text-xs">All langs</SelectItem>
              {LANGUAGES.map(l => (
                <SelectItem key={l.value} value={l.value} className="text-crm-text text-xs">{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button size="sm" onClick={() => setAddOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
              <Plus size={13} /> Upload Document
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filteredDocs.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-crm-surface border border-crm-border flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-crm-text-dim" />
          </div>
          <p className="text-sm text-crm-text-muted">No documents uploaded yet.</p>
        </div>
      )}

      {!isLoading && filteredDocs.length > 0 && (
        <div className="space-y-2">
          {filteredDocs.map(doc => {
            const typeStyle = TYPE_STYLE[doc.file_type] ?? TYPE_STYLE["PDF"];
            const langStyle = LANG_BADGE[doc.language] ?? LANG_BADGE["en"];
            const langLabel = LANGUAGES.find(l => l.value === doc.language)?.label ?? doc.language;
            const sizeStr = doc.file_size_kb
              ? doc.file_size_kb >= 1024
                ? `${(doc.file_size_kb / 1024).toFixed(1)} MB`
                : `${doc.file_size_kb} KB`
              : null;
            const isConfirming = confirmDeleteId === doc.id;

            return (
              <div
                key={doc.id}
                className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-center gap-3 hover:border-crm-border-hover transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 border ${typeStyle}`}>
                  {doc.file_type}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-crm-text truncate">{doc.title}</p>
                    {doc.restricted && (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-amber-400 bg-amber-950 border border-amber-800 rounded px-1.5 py-0.5 flex-shrink-0">
                        <Lock size={8} /> Restricted
                      </span>
                    )}
                    <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${langStyle}`}>
                      {langLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-mono text-crm-text-dim bg-crm-surface border border-crm-border rounded px-1.5 py-0.5">
                      {doc.category}
                    </span>
                    {sizeStr && <span className="text-[10px] text-crm-text-dim">{sizeStr}</span>}
                    <span className="text-[10px] text-crm-text-dim">
                      {format(parseISO(doc.created_at), "d MMM yyyy")}
                    </span>
                    {doc.uploader_name && (
                      <span className="text-[10px] text-crm-text-dim">by {doc.uploader_name}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {doc.file_url ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 bg-crm-surface border border-crm-border rounded-lg px-2.5 py-1.5 transition-colors"
                      title="Download"
                    >
                      <Download size={12} /> Download
                    </a>
                  ) : (
                    <span className="text-[10px] text-crm-text-dim italic">No file</span>
                  )}

                  {isAdmin && !isConfirming && (
                    <button
                      onClick={() => setEditTarget(doc)}
                      className="flex items-center gap-1 text-[11px] text-crm-text-dim hover:text-crm-text-secondary bg-crm-surface border border-crm-border rounded-lg px-2.5 py-1.5 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </button>
                  )}

                  {isAdmin && !isConfirming && (
                    <button
                      onClick={() => setConfirmDeleteId(doc.id)}
                      className="flex items-center gap-1 text-[11px] text-crm-text-dim hover:text-red-400 bg-crm-surface border border-crm-border hover:border-red-900 rounded-lg px-2.5 py-1.5 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}

                  {isAdmin && isConfirming && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteDocument.mutate(doc.id)}
                        disabled={deleteDocument.isPending}
                        className="text-[10px] font-semibold text-red-400 hover:text-red-300 bg-red-950 border border-red-800 rounded px-2 py-1 transition-colors"
                      >
                        {deleteDocument.isPending ? "…" : "Delete"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddDocumentDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {editTarget && (
        <EditDocumentDialog doc={editTarget} open={!!editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}
