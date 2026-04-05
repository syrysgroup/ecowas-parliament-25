import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Copy, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  name: string;
  id: string;
  url: string;
  created_at: string;
}

export default function MediaLibraryModule() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: files = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ["media-library"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("cms-media").list("", {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      return (data ?? [])
        .filter(f => f.name !== ".emptyFolderPlaceholder")
        .map(f => ({
          name: f.name,
          id: f.id ?? f.name,
          url: supabase.storage.from("cms-media").getPublicUrl(f.name).data.publicUrl,
          created_at: f.created_at ?? "",
        }));
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("cms-media").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      toast({ title: "Uploaded", description: fileName });
      qc.invalidateQueries({ queryKey: ["media-library"] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteMut = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.storage.from("cms-media").remove([name]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media-library"] });
      toast({ title: "Deleted" });
    },
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Media Library</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Upload and manage images for the website</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
            <Upload size={12} /> {uploading ? "Uploading…" : "Upload Image"}
          </Button>
        </div>
      </div>

      <Input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search files…"
        className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 max-w-xs" />

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-10 w-10 text-crm-text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm text-crm-text-muted">No media files yet. Upload your first image.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(f => (
          <div key={f.id} className="bg-crm-card border border-crm-border rounded-xl overflow-hidden group">
            <div className="aspect-square bg-crm-surface">
              <img src={f.url} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-2 space-y-1.5">
              <p className="text-[10px] text-crm-text truncate" title={f.name}>{f.name}</p>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] text-crm-text-dim hover:text-emerald-400"
                  onClick={() => handleCopy(f.url)}>
                  {copiedUrl === f.url ? <CheckCircle2 size={10} /> : <Copy size={10} />}
                  <span className="ml-1">{copiedUrl === f.url ? "Copied" : "URL"}</span>
                </Button>
                <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] text-red-400 hover:text-red-300"
                  onClick={() => deleteMut.mutate(f.name)} disabled={deleteMut.isPending}>
                  <Trash2 size={10} /><span className="ml-1">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
