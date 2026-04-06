import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

const BrandingSettings = () => {
  const { settings, updateSetting } = useGlobalSettings();
  const branding = settings.branding as { primary_color?: string; logo_url?: string } ?? {};
  const appName = settings.app_name as string ?? "ECOWAS Parliament CRM";

  const [name, setName] = useState(appName);
  const [color, setColor] = useState(branding.primary_color ?? "#008000");
  const [logoPreview, setLogoPreview] = useState(branding.logo_url ?? "/images/logo/logo.png");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logos/app-logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("branding").getPublicUrl(path);
      setLogoPreview(publicUrl);
      await updateSetting("branding", { ...branding, logo_url: publicUrl });
      toast.success("Logo updated");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    await updateSetting("app_name", name);
    await updateSetting("branding", { ...branding, primary_color: color });
    toast.success("Branding settings saved");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Logo uploader */}
        <Card className="flex-1">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-foreground mb-4">App Logo</p>
            <div className="flex flex-col items-center gap-3">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-16 w-auto object-contain border border-border rounded-lg p-2 bg-card"
                loading="lazy"
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? "Uploading…" : "Upload Logo"}
              </Button>
              <p className="text-xs text-muted-foreground">PNG, SVG recommended. Max 2MB.</p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="flex-1">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-foreground mb-4">Live Preview</p>
            <div className="rounded-lg border border-border p-4 flex items-center gap-3" style={{ borderColor: color }}>
              <img src={logoPreview} alt="Logo" className="h-8 w-auto object-contain" />
              <div>
                <p className="text-sm font-bold" style={{ color }}>{name}</p>
                <p className="text-xs text-muted-foreground">Powered by ECOWAS</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>App Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="App Name" />
        </div>
        <div className="space-y-1.5">
          <Label>Primary Brand Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-12 rounded border border-border cursor-pointer p-0.5"
            />
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono text-sm" />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-fit">Save Branding</Button>
    </div>
  );
};

export default BrandingSettings;
