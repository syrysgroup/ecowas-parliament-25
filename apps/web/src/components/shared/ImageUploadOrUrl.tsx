import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Link2, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateId } from "@/utils/id";
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
  value,
  onChange,
  bucket,
  pathPrefix = "",
  label = "Image",
  accept = "image/*",
  maxSizeMB = 5,
  previewClassName = "h-16 w-auto object-contain",
}: ImageUploadOrUrlProps) {
  // Auto-detect initial mode: if value looks like a URL typed in (not a Supabase storage URL), start in URL mode
  const isStorageUrl = value?.includes("supabase.co/storage") || value?.includes("/object/public/");
  const [mode, setMode] = useState<"upload" | "url">(
    value && !isStorageUrl ? "url" : "upload"
  );
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      toast.success("Image URL applied");
    }
  };

  const handleUpload = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File exceeds ${maxSizeMB} MB limit`);
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${pathPrefix}${Date.now()}_${generateId().slice(0, 8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl);
      setUrlInput(publicUrl);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    toast.success("Image removed");
  };

  const previewSrc = mode === "url" ? urlInput : value;

  return (
    <div className="space-y-2">
      {label && <Label className="text-[11px] text-crm-text-dim">{label}</Label>}

      {/* Preview */}
      {previewSrc && (
        <div className="relative w-fit group">
          <img
            src={previewSrc}
            alt="Preview"
            className={previewClassName}
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            onLoad={e => { (e.target as HTMLImageElement).style.display = ""; }}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-1.5 -right-1.5 hidden group-hover:flex w-5 h-5 rounded-full bg-red-600 text-white items-center justify-center shadow-sm"
            title="Remove image"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1 bg-crm-surface border border-crm-border rounded-lg p-0.5 w-fit">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1 text-[11px] rounded-md transition-colors flex items-center gap-1 ${
            mode === "upload"
              ? "bg-crm-card text-crm-text shadow-sm"
              : "text-crm-text-muted hover:text-crm-text"
          }`}
        >
          <Upload size={11} /> Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-3 py-1 text-[11px] rounded-md transition-colors flex items-center gap-1 ${
            mode === "url"
              ? "bg-crm-card text-crm-text shadow-sm"
              : "text-crm-text-muted hover:text-crm-text"
          }`}
        >
          <Link2 size={11} /> Paste URL
        </button>
      </div>

      {/* Upload mode */}
      {mode === "upload" && (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="border-crm-border text-crm-text-muted text-xs gap-1.5 h-8"
          >
            {uploading ? (
              <><Loader2 size={12} className="animate-spin" /> Uploading…</>
            ) : (
              <><Upload size={12} /> Choose File</>
            )}
          </Button>
          {value && !uploading && (
            <span className="text-[10px] text-crm-text-dim truncate max-w-[180px]">
              {value.split("/").pop()}
            </span>
          )}
        </div>
      )}

      {/* URL mode */}
      {mode === "url" && (
        <div className="flex gap-2 items-center">
          <Input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyUrl()}
            onBlur={applyUrl}
            placeholder="https://example.com/image.png"
            className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyUrl}
            className="border-crm-border text-crm-text-muted text-xs h-8 shrink-0"
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}