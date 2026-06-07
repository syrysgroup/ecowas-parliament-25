import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ImageUploadOrUrl from "@/components/shared/ImageUploadOrUrl";

interface Sponsor { id: string; name: string; }
interface Widget { id: string; key: string; label: string; description: string | null; default_enabled: boolean; position: number; }
interface PortalSettings { id?: string; sponsor_id: string; enabled_widgets: string[]; custom_message_html: string | null; branding_logo_url: string | null; }
interface Download { id: string; sponsor_id: string; title: string; file_url: string; category: string | null; visible: boolean; }

export default function SponsorPortalConfigModule() {
  const [sponsorId, setSponsorId] = useState<string>("");

  const { data: sponsors = [] } = useQuery<Sponsor[]>({
    queryKey: ["sponsors-list"],
    queryFn: async () => {
      const { data } = await supabase.from("sponsors").select("id, name").order("name");
      return data ?? [];
    },
  });

  const { data: widgets = [] } = useQuery<Widget[]>({
    queryKey: ["portal-widgets"],
    queryFn: async () => {
      const { data } = await supabase.from("sponsor_portal_widgets").select("*").order("position");
      return data ?? [];
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Sponsor Portal Config</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Choose which widgets and downloads each sponsor sees on /sponsor-dashboard.</p>
        </div>
        <a href="/sponsor-dashboard" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-crm-text-dim hover:text-emerald-400">
          <ExternalLink size={11} /> Open dashboard
        </a>
      </div>

      <div className="max-w-xs">
        <Label className="text-[11px] text-crm-text-dim">Select sponsor</Label>
        <Select value={sponsorId} onValueChange={setSponsorId}>
          <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 mt-1"><SelectValue placeholder="Pick a sponsor…" /></SelectTrigger>
          <SelectContent className="bg-crm-card border-crm-border max-h-72">
            {sponsors.map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {sponsorId && (
        <Tabs defaultValue="widgets">
          <TabsList className="bg-crm-surface border border-crm-border h-8">
            <TabsTrigger value="widgets"   className="text-xs h-7">Widgets & Branding</TabsTrigger>
            <TabsTrigger value="downloads" className="text-xs h-7">Brand Assets</TabsTrigger>
          </TabsList>
          <TabsContent value="widgets"   className="mt-4"><WidgetsPanel sponsorId={sponsorId} widgets={widgets} /></TabsContent>
          <TabsContent value="downloads" className="mt-4"><DownloadsPanel sponsorId={sponsorId} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function WidgetsPanel({ sponsorId, widgets }: { sponsorId: string; widgets: Widget[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: settings } = useQuery<PortalSettings | null>({
    queryKey: ["portal-settings", sponsorId],
    queryFn: async () => {
      const { data } = await supabase.from("sponsor_portal_settings").select("*").eq("sponsor_id", sponsorId).maybeSingle();
      return (data as any) ?? null;
    },
  });

  const enabledSet = new Set(settings?.enabled_widgets ?? widgets.filter(w => w.default_enabled).map(w => w.key));
  const [message, setMessage] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);

  const currentMessage = message ?? settings?.custom_message_html ?? "";
  const currentLogo = logo ?? settings?.branding_logo_url ?? "";

  const upsert = useMutation({
    mutationFn: async (payload: Partial<PortalSettings>) => {
      const merged = {
        sponsor_id: sponsorId,
        enabled_widgets: settings?.enabled_widgets ?? Array.from(enabledSet),
        custom_message_html: currentMessage,
        branding_logo_url: currentLogo,
        ...payload,
      };
      const { error } = await supabase.from("sponsor_portal_settings").upsert(merged as any, { onConflict: "sponsor_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal-settings", sponsorId] });
      toast({ title: "Saved" });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const toggleWidget = (key: string, on: boolean) => {
    const next = new Set(enabledSet);
    if (on) next.add(key); else next.delete(key);
    upsert.mutate({ enabled_widgets: Array.from(next) });
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <p className="text-[11px] text-crm-text-dim font-semibold uppercase tracking-wider">Widgets shown on this sponsor's dashboard</p>
        {widgets.map(w => (
          <div key={w.id} className="flex items-center justify-between bg-crm-card border border-crm-border rounded-lg px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-crm-text">{w.label}</p>
              <p className="text-[10px] text-crm-text-muted">{w.description}</p>
            </div>
            <Switch checked={enabledSet.has(w.key)} onCheckedChange={on => toggleWidget(w.key, on)} />
          </div>
        ))}
      </div>

      <div>
        <Label className="text-[11px] text-crm-text-dim">Custom welcome message (HTML allowed)</Label>
        <Textarea value={currentMessage} onChange={e => setMessage(e.target.value)} rows={4}
          className="bg-crm-surface border-crm-border text-crm-text text-xs mt-1" />
      </div>

      <div>
        <Label className="text-[11px] text-crm-text-dim mb-1 block">Sponsor branding logo</Label>
        <ImageUploadOrUrl value={currentLogo} onChange={setLogo} bucket="sponsor-logos" pathPrefix="portal-branding/" />
      </div>

      <Button size="sm" onClick={() => upsert.mutate({})} disabled={upsert.isPending}
        className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
        {upsert.isPending ? "Saving…" : "Save welcome & branding"}
      </Button>
    </div>
  );
}

function DownloadsPanel({ sponsorId }: { sponsorId: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: downloads = [] } = useQuery<Download[]>({
    queryKey: ["portal-downloads", sponsorId],
    queryFn: async () => {
      const { data } = await supabase.from("sponsor_portal_downloads").select("*").eq("sponsor_id", sponsorId).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [category, setCategory] = useState("brand");

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sponsor_portal_downloads").insert({
        sponsor_id: sponsorId, title, file_url: fileUrl, category, visible: true,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["portal-downloads", sponsorId] }); setTitle(""); setFileUrl(""); toast({ title: "Asset added" }); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("sponsor_portal_downloads").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal-downloads", sponsorId] }),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase.from("sponsor_portal_downloads").update({ visible }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal-downloads", sponsorId] }),
  });

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-crm-card border border-crm-border rounded-xl p-3 space-y-2">
        <p className="text-[11px] text-crm-text-dim font-semibold uppercase tracking-wider">Add new asset</p>
        <Input placeholder="Title (e.g. Brand Guidelines 2026)" value={title} onChange={e => setTitle(e.target.value)} className="bg-crm-surface border-crm-border text-xs h-8" />
        <ImageUploadOrUrl value={fileUrl} onChange={setFileUrl} bucket="cms-media" pathPrefix={`sponsor-portal/${sponsorId}/`} label="File (PDF, image, etc.)" />
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label className="text-[11px] text-crm-text-dim">Category</Label>
            <Input value={category} onChange={e => setCategory(e.target.value)} className="bg-crm-surface border-crm-border text-xs h-8 mt-1" />
          </div>
          <Button size="sm" onClick={() => add.mutate()} disabled={!title || !fileUrl || add.isPending} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
            <Plus size={12} /> Add
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        {downloads.map(d => (
          <div key={d.id} className="flex items-center justify-between bg-crm-card border border-crm-border rounded-lg px-3 py-2">
            <div className="min-w-0 flex-1">
              <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-400 hover:underline truncate block">{d.title}</a>
              <p className="text-[10px] text-crm-text-muted">{d.category}</p>
            </div>
            <Switch checked={d.visible} onCheckedChange={visible => toggle.mutate({ id: d.id, visible })} />
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 ml-2" onClick={() => del.mutate(d.id)}><Trash2 size={12} /></Button>
          </div>
        ))}
        {!downloads.length && <p className="text-xs text-crm-text-muted text-center py-6">No assets yet.</p>}
      </div>
    </div>
  );
}
