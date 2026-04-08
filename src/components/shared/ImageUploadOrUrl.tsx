import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Link2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadOrUrlProps {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  pathPrefix?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  previewClassName?: string;
}

export default function ImageUploadOrUrl({
  value, onChange, bucket, pathPrefix = "", label = "Image",
  accept = "image/*", maxSizeMB = 2, previewClassName = "h-16 w-auto object-contain",
}: ImageUploadOrUrlProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value?.startsWith("http") ? value : "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${pathPrefix}${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      toast.success("Image URL applied");
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs">{label}</Label>}

      {/* Toggle */}
      <div className="flex gap-1 bg-muted rounded-lg p-0.5 w-fit">
        <button type="button" onClick={() => setMode("upload")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
          <Upload size={12} className="inline mr-1" />Upload
        </button>
        <button type="button" onClick={() => setMode("url")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === "url" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
          <Link2 size={12} className="inline mr-1" />URL
        </button>
      </div>

      {mode === "upload" ? (
        <div className="flex items-center gap-3">
          {value && <img src={value} alt="Preview" className={previewClassName} loading="lazy" />}
          <input ref={fileRef} type="file" accept={accept} className="hidden"
            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          <Button type="button" variant="outline" size="sm" className="gap-1.5"
            onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? "Uploading…" : "Choose File"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input value={urlInput} onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.png" className="text-sm flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={handleUrlApply}>Apply</Button>
        </div>
      )}
    </div>
  );
}
