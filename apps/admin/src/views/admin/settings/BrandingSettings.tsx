import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { LOGO_RECOMMENDED, FAVICON_RECOMMENDED } from "@/lib/constants";

const BrandingSettings = () => {
  const { settings, updateSetting } = useGlobalSettings();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const branding = settings.branding as { primary_color?: string; logo_url?: string; favicon_url?: string } ?? {};
  const appName = settings.app_name as string ?? "ECOWAS Parliament CRM";

  const [name, setName] = useState(appName);
  const [color, setColor] = useState(branding.primary_color ?? "#008000");
  const [logoPreview, setLogoPreview] = useState(branding.logo_url ?? "/images/logo/logo.png");
  const [faviconPreview, setFaviconPreview] = useState(branding.favicon_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [faviconUrlInput, setFaviconUrlInput] = useState("");
  const [logoMode, setLogoMode] = useState<"upload" | "url">("upload");
  const [faviconMode, setFaviconMode] = useState<"upload" | "url">("upload");
  const fileRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: "logo" | "favicon") => {
    const setLoading = type === "logo" ? setUploading : setFaviconUploading;
    setLoading(true);
    try {
      // Verify user is authenticated before uploading
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to upload files. Please refresh and try again.");
        return;
      }

      const ext = file.name.split(".").pop();
      const path = `${type}s/app-${type}-${Date.now()}.${ext}`;

      // Attempt upload with explicit content type
      const { error } = await supabase.storage
        .from("branding")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        if (error.message?.includes("Bucket not found") || error.message?.includes("not found")) {
          toast.error("Storage bucket 'branding' not found. Please contact your administrator to verify storage configuration.");
        } else if (error.message?.includes("row-level security") || error.message?.includes("policy")) {
          toast.error("Permission denied. Ensure your account has admin or super_admin privileges.");
        } else {
          throw error;
        }
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("branding").getPublicUrl(path);

      if (type === "logo") {
        setLogoPreview(publicUrl);
        await updateSetting("branding", { ...branding, logo_url: publicUrl });
        await (supabase as any).from("site_settings").upsert({ key: "site_logo_url", value: JSON.stringify(publicUrl) }, { onConflict: "key" });
        qc.invalidateQueries({ queryKey: ["site-settings"] });
       } else {
        setFaviconPreview(publicUrl);
        await updateSetting("branding", { ...branding, favicon_url: publicUrl });
        await (supabase as any).from("site_settings").upsert({ key: "site_favicon_url", value: JSON.stringify(publicUrl) }, { onConflict: "key" });
        qc.invalidateQueries({ queryKey: ["site-settings"] });
        updateFaviconLink(publicUrl);
      }
      toast.success(`${type === "logo" ? t("crm.branding.logoUpdated") : "Favicon updated"}`);
    } catch (e: any) {
      console.error("Upload error:", e);
      toast.error(e.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const updateFaviconLink = (url: string) => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  };

  const handleSave = async () => {
    await updateSetting("app_name", name);
    await updateSetting("branding", { ...branding, primary_color: color, logo_url: logoPreview, favicon_url: faviconPreview });
    await (supabase as any).from("site_settings").upsert({ key: "site_logo_url", value: JSON.stringify(logoPreview) }, { onConflict: "key" });
    await (supabase as any).from("site_settings").upsert({ key: "site_name", value: JSON.stringify(name) }, { onConflict: "key" });
    await (supabase as any).from("site_settings").upsert({ key: "site_favicon_url", value: JSON.stringify(faviconPreview) }, { onConflict: "key" });
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    if (faviconPreview) updateFaviconLink(faviconPreview);
    toast.success(t("crm.branding.saved"));
  };

  const ModeToggle = ({ mode, setMode }: { mode: "upload" | "url"; setMode: (m: "upload" | "url") => void }) => (
    <div className="flex gap-1 bg-muted rounded-lg p-0.5 w-fit mb-2">
      <button type="button" onClick={() => setMode("upload")}
        className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${mode === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
        <Upload size={10} className="inline mr-1" />Upload
      </button>
      <button type="button" onClick={() => setMode("url")}
        className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${mode === "url" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
        <Link2 size={10} className="inline mr-1" />URL
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Logo uploader */}
        <Card className="flex-1">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-foreground mb-1">{t("crm.branding.appLogo")}</p>
            <p className="text-[10px] text-muted-foreground mb-1">{t("crm.branding.logoHint")}</p>
            <p className="text-[9px] text-muted-foreground/70 mb-3">
              Display: {LOGO_RECOMMENDED.display} · Upload at {LOGO_RECOMMENDED.width}×{LOGO_RECOMMENDED.height}px for retina
            </p>
            <ModeToggle mode={logoMode} setMode={setLogoMode} />
            <div className="flex flex-col items-center gap-3">
              <img src={logoPreview} alt="Logo preview"
                className="h-16 w-auto object-contain border border-border rounded-lg p-2 bg-card" loading="lazy" />
              {logoMode === "upload" ? (
                <>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "logo")} />
                  <Button variant="outline" size="sm" className="gap-2"
                    onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploading ? "Uploading…" : "Upload Logo"}
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 w-full">
                  <Input value={logoUrlInput} onChange={e => setLogoUrlInput(e.target.value)}
                    placeholder="https://..." className="text-xs flex-1" />
                  <Button size="sm" variant="outline" onClick={() => {
                    if (logoUrlInput.trim()) { setLogoPreview(logoUrlInput.trim()); setLogoUrlInput(""); }
                  }}>Apply</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Favicon uploader */}
        <Card className="flex-1">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-foreground mb-1">{t("crm.branding.favicon")}</p>
            <p className="text-[10px] text-muted-foreground mb-1">{t("crm.branding.faviconHint")}</p>
            <p className="text-[9px] text-muted-foreground/70 mb-3">
              Sizes: {FAVICON_RECOMMENDED.size}×{FAVICON_RECOMMENDED.size}px (browser) · {FAVICON_RECOMMENDED.apple}×{FAVICON_RECOMMENDED.apple}px (Apple) · {FAVICON_RECOMMENDED.pwa512}×{FAVICON_RECOMMENDED.pwa512}px (PWA)
            </p>
            <ModeToggle mode={faviconMode} setMode={setFaviconMode} />
            <div className="flex flex-col items-center gap-3">
              {faviconPreview && (
                <img src={faviconPreview} alt="Favicon preview"
                  className="h-8 w-8 object-contain border border-border rounded p-0.5 bg-card" loading="lazy" />
              )}
              {faviconMode === "upload" ? (
                <>
                  <input ref={faviconRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "favicon")} />
                  <Button variant="outline" size="sm" className="gap-2"
                    onClick={() => faviconRef.current?.click()} disabled={faviconUploading}>
                    {faviconUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {faviconUploading ? "Uploading…" : "Upload Favicon"}
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 w-full">
                  <Input value={faviconUrlInput} onChange={e => setFaviconUrlInput(e.target.value)}
                    placeholder="https://..." className="text-xs flex-1" />
                  <Button size="sm" variant="outline" onClick={() => {
                    if (faviconUrlInput.trim()) { setFaviconPreview(faviconUrlInput.trim()); setFaviconUrlInput(""); }
                  }}>Apply</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm font-medium text-foreground mb-4">{t("crm.branding.livePreview")}</p>
          <div className="rounded-lg border border-border p-4 flex items-center gap-3" style={{ borderColor: color }}>
            <img src={logoPreview} alt="Logo" className="h-8 w-auto object-contain" />
            <div>
              <p className="text-sm font-bold" style={{ color }}>{name}</p>
              <p className="text-xs text-muted-foreground">Powered by ECOWAS</p>
            </div>
            {faviconPreview && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Favicon:</span>
                <img src={faviconPreview} alt="Favicon" className="h-5 w-5 object-contain" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{t("crm.branding.appName")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="App Name" />
        </div>
        <div className="space-y-1.5">
          <Label>{t("crm.branding.primaryColor")}</Label>
          <div className="flex gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="h-9 w-12 rounded border border-border cursor-pointer p-0.5" />
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono text-sm" />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-fit">{t("crm.branding.save")}</Button>
    </div>
  );
};

export default BrandingSettings;
