import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Copy, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { BulkActionBar } from "@/components/crm/shared/BulkActionBar";
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
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

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

  const bulkDeleteMut = useMutation({
    mutationFn: async (names: string[]) => {
      const { error } = await supabase.storage.from("cms-media").remove(names);
      if (error) throw error;
    },
    onSuccess: (_d, names) => {
      qc.invalidateQueries({ queryKey: ["media-library"] });
      bulk.reset();
      setConfirmBulkDelete(false);
      toast({ title: `Deleted ${names.length} file${names.length !== 1 ? "s" : ""}` });
    },
    onError: (e: any) => toast({ title: "Bulk delete failed", description: e.message, variant: "destructive" }),
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const bulk = useBulkSelection(filtered);

  const copySelectedUrls = () => {
    const urls = bulk.selectedItems.map(i => i.url).join("\n");
    navigator.clipboard.writeText(urls);
    toast({ title: `Copied ${bulk.selectedCount} URL${bulk.selectedCount !== 1 ? "s" : ""}` });
  };

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

      <div className="flex items-center gap-3">
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search files…"
          className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 max-w-xs" />
        {filtered.length > 0 && (
          <label className="flex items-center gap-2 text-[11px] text-crm-text-dim cursor-pointer">
            <Checkbox
              checked={bulk.allSelected ? true : bulk.someSelected ? "indeterminate" : false}
              onCheckedChange={() => bulk.toggleAll()}
              className="border-crm-border"
            />
            Select all ({filtered.length})
          </label>
        )}
      </div>

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
        {filtered.map(f => {
          const selected = bulk.isSelected(f.id);
          return (
            <div key={f.id}
              className={`bg-crm-card border rounded-xl overflow-hidden group relative transition-colors ${selected ? "border-emerald-700 ring-1 ring-emerald-700/40" : "border-crm-border"}`}>
              <div className="absolute top-2 left-2 z-10 bg-crm-card/80 backdrop-blur rounded p-0.5">
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => bulk.toggle(f.id)}
                  className="border-crm-border"
                  aria-label={`Select ${f.name}`}
                />
              </div>
              <div className="aspect-square bg-crm-surface cursor-pointer" onClick={() => bulk.toggle(f.id)}>
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
          );
        })}
      </div>

      <BulkActionBar count={bulk.selectedCount} onClear={bulk.reset}>
        <Button size="sm" variant="outline" onClick={copySelectedUrls}
          className="h-7 text-xs gap-1 border-crm-border">
          <Copy size={11} /> Copy URLs
        </Button>
        <Button size="sm" variant="destructive"
          onClick={() => setConfirmBulkDelete(true)}
          disabled={bulkDeleteMut.isPending}
          className="h-7 text-xs gap-1">
          <Trash2 size={11} /> Delete
        </Button>
      </BulkActionBar>

      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent className="bg-crm-card border-crm-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-crm-text text-sm">Delete {bulk.selectedCount} file{bulk.selectedCount !== 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription className="text-crm-text-muted text-xs">
              The selected file{bulk.selectedCount !== 1 ? "s" : ""} will be permanently removed from storage. Any pages still referencing them will show broken images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-crm-border text-crm-text text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMut.mutate(bulk.selectedItems.map(i => i.name))}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
