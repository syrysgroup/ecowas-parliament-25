import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Compass, MapPin, Edit2, Info, Crosshair, ArrowUp, ArrowDown, ExternalLink, Target } from "lucide-react";
import { toast } from "sonner";
import { validateEquirectangular, generateDerivatives } from "@/lib/panorama";
import HotspotPicker from "./panorama/HotspotPicker";

type Scene = {
  id: string; slug: string; name: string; description: string | null;
  panorama_url: string; preview_url: string | null; mobile_panorama_url: string | null;
  default_yaw: number; default_pitch: number; default_zoom: number;
  display_order: number; is_active: boolean;
};
type Hotspot = {
  id: string; scene_id: string; yaw: number; pitch: number;
  title: string; description: string | null;
  image_url: string | null; link_url: string | null;
  display_order: number; is_active: boolean;
};

const WEB_TOUR_URL =
  (import.meta.env.VITE_WEB_BASE_URL?.replace(/\/$/, "") ?? "") + "/parliament-tour";

export default function PanoramaModule() {
  const qc = useQueryClient();
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [sceneDialog, setSceneDialog] = useState<Partial<Scene> | null>(null);
  const [hotspotDialog, setHotspotDialog] = useState<Partial<Hotspot> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const scenesQ = useQuery({
    queryKey: ["crm-panorama-scenes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parliament_panorama_scenes" as any)
        .select("*").order("display_order");
      if (error) throw error;
      return (data ?? []) as unknown as Scene[];
    },
  });

  const hotspotsQ = useQuery({
    queryKey: ["crm-panorama-hotspots", activeSceneId],
    enabled: !!activeSceneId,
    queryFn: async () => {
      const { data, error } = await supabase.from("parliament_panorama_hotspots" as any)
        .select("*").eq("scene_id", activeSceneId).order("display_order");
      if (error) throw error;
      return (data ?? []) as unknown as Hotspot[];
    },
  });

  const saveScene = useMutation({
    mutationFn: async (s: Partial<Scene>) => {
      const payload = {
        slug: s.slug, name: s.name, description: s.description,
        panorama_url: s.panorama_url,
        preview_url: s.preview_url,
        mobile_panorama_url: s.mobile_panorama_url,
        default_yaw: s.default_yaw ?? 0, default_pitch: s.default_pitch ?? 0,
        display_order: s.display_order ?? 0, is_active: s.is_active ?? true,
      };
      if (s.id) {
        const { error } = await supabase.from("parliament_panorama_scenes" as any)
          .update(payload).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("parliament_panorama_scenes" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-panorama-scenes"] });
      setSceneDialog(null);
      toast.success("Scene saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteScene = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("parliament_panorama_scenes" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-panorama-scenes"] });
      toast.success("Scene deleted");
    },
  });

  const saveHotspot = useMutation({
    mutationFn: async (h: Partial<Hotspot>) => {
      const payload = {
        scene_id: h.scene_id, yaw: h.yaw ?? 0, pitch: h.pitch ?? 0,
        title: h.title, description: h.description,
        image_url: h.image_url, link_url: h.link_url,
        display_order: h.display_order ?? 0, is_active: h.is_active ?? true,
      };
      if (h.id) {
        const { error } = await supabase.from("parliament_panorama_hotspots" as any)
          .update(payload).eq("id", h.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("parliament_panorama_hotspots" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-panorama-hotspots", activeSceneId] });
      setHotspotDialog(null);
      toast.success("Hotspot saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteHotspot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("parliament_panorama_hotspots" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-panorama-hotspots", activeSceneId] });
      toast.success("Hotspot deleted");
    },
  });

  async function uploadBlob(blob: Blob, name: string): Promise<string | null> {
    const path = `${Date.now()}-${name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
    const { error } = await supabase.storage.from("parliament-panorama").upload(path, blob, {
      cacheControl: "31536000", upsert: false, contentType: blob.type || "image/jpeg",
    });
    if (error) throw error;
    return supabase.storage.from("parliament-panorama").getPublicUrl(path).data.publicUrl;
  }

  async function uploadPanorama(file: File): Promise<void> {
    setUploading(true);
    try {
      const check = await validateEquirectangular(file);
      if (!check.ok) {
        toast.error(check.error);
        return;
      }
      toast.message(`Uploading ${check.width}×${check.height} panorama + derivatives…`);
      const fullUrl = await uploadBlob(file, file.name);
      const { mobile, preview } = await generateDerivatives(file, check.width);
      const base = file.name.replace(/\.[^.]+$/, "");
      const mobileUrl = mobile ? await uploadBlob(mobile, `${base}-mobile.jpg`) : null;
      const previewUrl = preview ? await uploadBlob(preview, `${base}-preview.jpg`) : null;
      setSceneDialog((prev) => prev ? {
        ...prev,
        panorama_url: fullUrl ?? prev.panorama_url,
        mobile_panorama_url: mobileUrl ?? prev.mobile_panorama_url ?? null,
        preview_url: previewUrl ?? prev.preview_url ?? null,
      } : prev);
      toast.success("Panorama uploaded with mobile + preview derivatives");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setUploading(false); }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" /> Parliament 360° Tour
          </h1>
          <p className="text-sm text-muted-foreground">Manage panorama scenes and interactive hotspots for the virtual tour.</p>
        </div>
        <Button onClick={() => setSceneDialog({ is_active: true, default_yaw: 0, default_pitch: 0, display_order: (scenesQ.data?.length ?? 0) + 1 })}>
          <Plus className="h-4 w-4 mr-1" /> New Scene
        </Button>
      </div>

      <Tabs value="scenes">
        <TabsList>
          <TabsTrigger value="scenes">Scenes ({scenesQ.data?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="scenes" className="space-y-4 mt-4">
          <div className="flex gap-2 p-3 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
            <div>
              <strong className="text-foreground">DJI Mini 3 capture workflow:</strong> in DJI Fly, choose
              <em> Photo → Pano → Sphere</em>. The drone shoots ~26 frames and the app auto-stitches them
              into a single 2:1 equirectangular JPG (typically 8192×4096). Export that stitched file and
              upload it here — uploads that aren't 2:1 will be rejected. Mobile and preview derivatives
              are generated automatically.
            </div>
          </div>
          {scenesQ.isLoading ? <p className="text-muted-foreground">Loading…</p> :
            scenesQ.data?.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {s.name}
                    {!s.is_active && <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Hidden</span>}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setActiveSceneId(activeSceneId === s.id ? null : s.id)}>
                      <MapPin className="h-4 w-4 mr-1" /> Hotspots
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSceneDialog(s)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${s.name}"?`)) deleteScene.mutate(s.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img src={s.panorama_url} alt={s.name} className="w-48 h-24 object-cover rounded border border-border" />
                    <div className="flex-1 text-sm space-y-1">
                      <p className="text-muted-foreground">{s.description}</p>
                      <p className="text-xs text-muted-foreground">Slug: <code>{s.slug}</code> · Order: {s.display_order}</p>
                    </div>
                  </div>

                  {activeSceneId === s.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Hotspots</h4>
                        <Button size="sm" onClick={() => setHotspotDialog({ scene_id: s.id, is_active: true, yaw: 0, pitch: 0, display_order: (hotspotsQ.data?.length ?? 0) + 1 })}>
                          <Plus className="h-3 w-3 mr-1" /> Add Hotspot
                        </Button>
                      </div>
                      {hotspotsQ.data?.length === 0 && <p className="text-xs text-muted-foreground">No hotspots yet.</p>}
                      <div className="space-y-2">
                        {hotspotsQ.data?.map((h) => (
                          <div key={h.id} className="flex items-center justify-between p-2.5 rounded border border-border bg-muted/30">
                            <div className="text-sm">
                              <p className="font-medium">{h.title}</p>
                              <p className="text-xs text-muted-foreground">yaw {h.yaw.toFixed(2)} · pitch {h.pitch.toFixed(2)}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setHotspotDialog(h)}><Edit2 className="h-3.5 w-3.5" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete "${h.title}"?`)) deleteHotspot.mutate(h.id); }}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          }
        </TabsContent>
      </Tabs>

      {/* Scene editor */}
      <Dialog open={!!sceneDialog} onOpenChange={(o) => !o && setSceneDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{sceneDialog?.id ? "Edit Scene" : "New Scene"}</DialogTitle></DialogHeader>
          {sceneDialog && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={sceneDialog.name ?? ""} onChange={(e) => setSceneDialog({ ...sceneDialog, name: e.target.value })} /></div>
              <div><Label>Slug (URL key)</Label><Input value={sceneDialog.slug ?? ""} onChange={(e) => setSceneDialog({ ...sceneDialog, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div>
              <div><Label>Description</Label><Textarea value={sceneDialog.description ?? ""} onChange={(e) => setSceneDialog({ ...sceneDialog, description: e.target.value })} /></div>
              <div>
                <Label>Panorama Image (equirectangular 2:1 JPEG)</Label>
                <div className="flex gap-2">
                  <Input value={sceneDialog.panorama_url ?? ""} placeholder="https://… or upload →"
                    onChange={(e) => setSceneDialog({ ...sceneDialog, panorama_url: e.target.value })} />
                  <label className="inline-flex">
                    <input type="file" accept="image/jpeg,image/png" hidden onChange={async (e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                        await uploadPanorama(f);
                        e.target.value = "";
                    }} />
                    <Button asChild variant="outline" disabled={uploading}><span><Upload className="h-4 w-4 mr-1" />{uploading ? "Uploading…" : "Upload"}</span></Button>
                  </label>
                </div>
                {sceneDialog.panorama_url && <img src={sceneDialog.panorama_url} alt="" className="mt-2 w-full h-32 object-cover rounded border border-border" />}
                {(sceneDialog.mobile_panorama_url || sceneDialog.preview_url) && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {sceneDialog.mobile_panorama_url && <>✓ mobile derivative </>}
                    {sceneDialog.preview_url && <>✓ preview derivative</>}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Default Yaw (rad)</Label><Input type="number" step="0.1" value={sceneDialog.default_yaw ?? 0} onChange={(e) => setSceneDialog({ ...sceneDialog, default_yaw: parseFloat(e.target.value) })} /></div>
                <div><Label>Default Pitch (rad)</Label><Input type="number" step="0.1" value={sceneDialog.default_pitch ?? 0} onChange={(e) => setSceneDialog({ ...sceneDialog, default_pitch: parseFloat(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div><Label>Display Order</Label><Input type="number" value={sceneDialog.display_order ?? 0} onChange={(e) => setSceneDialog({ ...sceneDialog, display_order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-center gap-2 pb-2"><Switch checked={sceneDialog.is_active ?? true} onCheckedChange={(v) => setSceneDialog({ ...sceneDialog, is_active: v })} /><Label>Active</Label></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSceneDialog(null)}>Cancel</Button>
            <Button onClick={() => sceneDialog && saveScene.mutate(sceneDialog)} disabled={saveScene.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hotspot editor */}
      <Dialog open={!!hotspotDialog} onOpenChange={(o) => !o && setHotspotDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{hotspotDialog?.id ? "Edit Hotspot" : "New Hotspot"}</DialogTitle></DialogHeader>
          {hotspotDialog && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={hotspotDialog.title ?? ""} onChange={(e) => setHotspotDialog({ ...hotspotDialog, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={hotspotDialog.description ?? ""} onChange={(e) => setHotspotDialog({ ...hotspotDialog, description: e.target.value })} /></div>
              {(() => {
                const scene = scenesQ.data?.find((s) => s.id === hotspotDialog.scene_id);
                if (!scene?.panorama_url) {
                  return <p className="text-xs text-amber-600">Upload a panorama for this scene to enable visual hotspot placement.</p>;
                }
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1.5"><Crosshair className="h-3.5 w-3.5" /> Click in the panorama to place the hotspot</Label>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setPickerOpen((v) => !v)}>
                        {pickerOpen ? "Hide viewer" : "Show viewer"}
                      </Button>
                    </div>
                    {pickerOpen && (
                      <HotspotPicker
                        panoramaUrl={scene.panorama_url}
                        yaw={hotspotDialog.yaw ?? 0}
                        pitch={hotspotDialog.pitch ?? 0}
                        onPick={(y, p) => setHotspotDialog((prev) => prev ? { ...prev, yaw: y, pitch: p } : prev)}
                      />
                    )}
                  </div>
                );
              })()}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Yaw (rad, -π to π)</Label><Input type="number" step="0.05" value={hotspotDialog.yaw ?? 0} onChange={(e) => setHotspotDialog({ ...hotspotDialog, yaw: parseFloat(e.target.value) })} /></div>
                <div><Label>Pitch (rad, -π/2 to π/2)</Label><Input type="number" step="0.05" value={hotspotDialog.pitch ?? 0} onChange={(e) => setHotspotDialog({ ...hotspotDialog, pitch: parseFloat(e.target.value) })} /></div>
              </div>
              <div><Label>Image URL (optional)</Label><Input value={hotspotDialog.image_url ?? ""} onChange={(e) => setHotspotDialog({ ...hotspotDialog, image_url: e.target.value })} /></div>
              <div><Label>Link URL (optional)</Label><Input value={hotspotDialog.link_url ?? ""} onChange={(e) => setHotspotDialog({ ...hotspotDialog, link_url: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div><Label>Order</Label><Input type="number" value={hotspotDialog.display_order ?? 0} onChange={(e) => setHotspotDialog({ ...hotspotDialog, display_order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-center gap-2 pb-2"><Switch checked={hotspotDialog.is_active ?? true} onCheckedChange={(v) => setHotspotDialog({ ...hotspotDialog, is_active: v })} /><Label>Active</Label></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHotspotDialog(null)}>Cancel</Button>
            <Button onClick={() => hotspotDialog && saveHotspot.mutate(hotspotDialog)} disabled={saveHotspot.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}