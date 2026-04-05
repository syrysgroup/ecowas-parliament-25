import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Image, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SponsorRow {
  id: string; name: string; slug: string; logo_url: string | null;
  description: string | null; tier: string; website: string | null;
  email: string | null; programmes: string[]; is_published: boolean;
  sort_order: number;
}

interface PartnerRow {
  id: string; name: string; slug: string; logo_url: string | null;
  description: string | null; partner_type: string; website: string | null;
  lead_name: string | null; lead_role: string | null; lead_image_url: string | null;
  is_published: boolean; sort_order: number;
}

function SponsorDialog({ open, onClose, sponsor }: { open: boolean; onClose: () => void; sponsor?: SponsorRow }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!sponsor;
  const [name, setName] = useState(sponsor?.name ?? "");
  const [slug, setSlug] = useState(sponsor?.slug ?? "");
  const [logoUrl, setLogoUrl] = useState(sponsor?.logo_url ?? "");
  const [description, setDescription] = useState(sponsor?.description ?? "");
  const [tier, setTier] = useState(sponsor?.tier ?? "standard");
  const [website, setWebsite] = useState(sponsor?.website ?? "");
  const [email, setEmail] = useState(sponsor?.email ?? "");
  const [programmes, setProgrammes] = useState(sponsor?.programmes?.join(", ") ?? "");
  const [isPublished, setIsPublished] = useState(sponsor?.is_published ?? false);
  const [sortOrder, setSortOrder] = useState(sponsor?.sort_order?.toString() ?? "0");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("sponsor-logos").upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from("sponsor-logos").getPublicUrl(path);
      setLogoUrl(publicUrl);
    } finally { setUploading(false); }
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name, slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        logo_url: logoUrl || null, description: description || null, tier,
        website: website || null, email: email || null,
        programmes: programmes ? programmes.split(",").map(p => p.trim()).filter(Boolean) : [],
        is_published: isPublished, sort_order: parseInt(sortOrder) || 0,
        updated_at: new Date().toISOString(),
      };
      if (isEdit) await (supabase as any).from("sponsors").update(payload).eq("id", sponsor.id);
      else await (supabase as any).from("sponsors").insert(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sponsors-manager"] }); onClose(); },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">{isEdit ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-2">
            <Label className="text-[11px] text-crm-text-dim">Logo</Label>
            {logoUrl && <img src={logoUrl} alt="" className="h-16 w-auto rounded border border-crm-border" />}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="border-crm-border text-crm-text-muted text-xs gap-1"><Image size={12} /> {uploading ? "Uploading…" : "Upload Logo"}</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Name *</Label>
              <Input value={name} onChange={e => { setName(e.target.value); if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")); }}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Slug</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  <SelectItem value="platinum" className="text-crm-text text-xs">Platinum</SelectItem>
                  <SelectItem value="gold" className="text-crm-text text-xs">Gold</SelectItem>
                  <SelectItem value="silver" className="text-crm-text text-xs">Silver</SelectItem>
                  <SelectItem value="standard" className="text-crm-text text-xs">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Sort Order</Label>
              <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Website</Label>
            <Input value={website} onChange={e => setWebsite(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="https://..." />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Email</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Programmes (comma-separated)</Label>
            <Input value={programmes} onChange={e => setProgrammes(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="Trade, Youth, Women" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-crm-text-dim">Published</Label>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" disabled={!name.trim() || save.isPending} onClick={() => save.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">{save.isPending ? "Saving…" : isEdit ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PartnerDialog({ open, onClose, partner }: { open: boolean; onClose: () => void; partner?: PartnerRow }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!partner;
  const [name, setName] = useState(partner?.name ?? "");
  const [slug, setSlug] = useState(partner?.slug ?? "");
  const [logoUrl, setLogoUrl] = useState(partner?.logo_url ?? "");
  const [description, setDescription] = useState(partner?.description ?? "");
  const [partnerType, setPartnerType] = useState(partner?.partner_type ?? "implementing");
  const [website, setWebsite] = useState(partner?.website ?? "");
  const [leadName, setLeadName] = useState(partner?.lead_name ?? "");
  const [leadRole, setLeadRole] = useState(partner?.lead_role ?? "");
  const [isPublished, setIsPublished] = useState(partner?.is_published ?? false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const path = `partners/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("sponsor-logos").upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from("sponsor-logos").getPublicUrl(path);
      setLogoUrl(publicUrl);
    } finally { setUploading(false); }
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name, slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        logo_url: logoUrl || null, description: description || null, partner_type: partnerType,
        website: website || null, lead_name: leadName || null, lead_role: leadRole || null,
        is_published: isPublished, updated_at: new Date().toISOString(),
      };
      if (isEdit) await (supabase as any).from("partners").update(payload).eq("id", partner.id);
      else await (supabase as any).from("partners").insert(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partners-manager"] }); onClose(); },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">{isEdit ? "Edit Partner" : "Add Partner"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-2">
            <Label className="text-[11px] text-crm-text-dim">Logo</Label>
            {logoUrl && <img src={logoUrl} alt="" className="h-16 w-auto rounded border border-crm-border" />}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="border-crm-border text-crm-text-muted text-xs gap-1"><Image size={12} /> {uploading ? "Uploading…" : "Upload Logo"}</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Name *</Label>
              <Input value={name} onChange={e => { setName(e.target.value); if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")); }}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Type</Label>
              <Select value={partnerType} onValueChange={setPartnerType}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  <SelectItem value="implementing" className="text-crm-text text-xs">Implementing</SelectItem>
                  <SelectItem value="institutional" className="text-crm-text text-xs">Institutional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Lead Name</Label>
              <Input value={leadName} onChange={e => setLeadName(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Lead Role</Label>
              <Input value={leadRole} onChange={e => setLeadRole(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Website</Label>
            <Input value={website} onChange={e => setWebsite(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-crm-text-dim">Published</Label>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" disabled={!name.trim() || save.isPending} onClick={() => save.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">{save.isPending ? "Saving…" : isEdit ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SponsorsManagerModule() {
  const { isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const [tab, setTab] = useState("sponsors");
  const [addSponsorOpen, setAddSponsorOpen] = useState(false);
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  const [editSponsor, setEditSponsor] = useState<SponsorRow | null>(null);
  const [editPartner, setEditPartner] = useState<PartnerRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: sponsors = [], isLoading: loadingS } = useQuery<SponsorRow[]>({
    queryKey: ["sponsors-manager"],
    queryFn: async () => { const { data } = await (supabase as any).from("sponsors").select("*").order("sort_order"); return data ?? []; },
  });

  const { data: partners = [], isLoading: loadingP } = useQuery<PartnerRow[]>({
    queryKey: ["partners-manager"],
    queryFn: async () => { const { data } = await (supabase as any).from("partners").select("*").order("sort_order"); return data ?? []; },
  });

  const deleteSponsor = useMutation({
    mutationFn: async (id: string) => { await (supabase as any).from("sponsors").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sponsors-manager"] }); setConfirmDelete(null); },
  });

  const deletePartner = useMutation({
    mutationFn: async (id: string) => { await (supabase as any).from("partners").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partners-manager"] }); setConfirmDelete(null); },
  });

  const togglePublish = async (table: string, id: string, published: boolean) => {
    await (supabase as any).from(table).update({ is_published: published }).eq("id", id);
    qc.invalidateQueries({ queryKey: [table === "sponsors" ? "sponsors-manager" : "partners-manager"] });
  };

  const loading = tab === "sponsors" ? loadingS : loadingP;
  const items = tab === "sponsors" ? sponsors : partners;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Sponsors & Partners</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Manage sponsors and partners displayed on the website</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => tab === "sponsors" ? setAddSponsorOpen(true) : setAddPartnerOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> Add {tab === "sponsors" ? "Sponsor" : "Partner"}
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-crm-surface border border-crm-border">
          <TabsTrigger value="sponsors" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Sponsors ({sponsors.length})
          </TabsTrigger>
          <TabsTrigger value="partners" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Partners ({partners.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sponsors" className="mt-4 space-y-2">
          {loadingS && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}
          {!loadingS && sponsors.map(s => (
            <div key={s.id} className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-center gap-4 hover:border-crm-border-hover transition-colors">
              {s.logo_url ? <img src={s.logo_url} alt="" className="w-12 h-12 object-contain rounded" /> : <div className="w-12 h-12 bg-crm-surface rounded flex items-center justify-center text-crm-text-dim"><Users size={16} /></div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-semibold text-crm-text">{s.name}</p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${s.is_published ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-crm-surface text-crm-text-muted border-crm-border"}`}>
                    {s.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-crm-surface text-crm-text-dim border-crm-border capitalize">{s.tier}</span>
                </div>
                {s.programmes.length > 0 && <p className="text-[10px] text-crm-text-dim mt-0.5">{s.programmes.join(", ")}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => togglePublish("sponsors", s.id, !s.is_published)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors">
                    {s.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button onClick={() => setEditSponsor(s)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors"><Pencil size={12} /></button>
                  {confirmDelete === s.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deleteSponsor.mutate(s.id)} className="text-[10px] text-red-400 bg-red-950 border border-red-800 rounded px-2 py-1">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-2 py-1">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(s.id)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  )}
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="partners" className="mt-4 space-y-2">
          {loadingP && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}
          {!loadingP && partners.map(p => (
            <div key={p.id} className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-center gap-4 hover:border-crm-border-hover transition-colors">
              {p.logo_url ? <img src={p.logo_url} alt="" className="w-12 h-12 object-contain rounded" /> : <div className="w-12 h-12 bg-crm-surface rounded flex items-center justify-center text-crm-text-dim"><Users size={16} /></div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-semibold text-crm-text">{p.name}</p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${p.is_published ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-crm-surface text-crm-text-muted border-crm-border"}`}>
                    {p.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-crm-surface text-crm-text-dim border-crm-border capitalize">{p.partner_type}</span>
                </div>
                {p.lead_name && <p className="text-[10px] text-crm-text-dim mt-0.5">{p.lead_name} — {p.lead_role}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => togglePublish("partners", p.id, !p.is_published)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors">
                    {p.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button onClick={() => setEditPartner(p)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors"><Pencil size={12} /></button>
                  {confirmDelete === p.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deletePartner.mutate(p.id)} className="text-[10px] text-red-400 bg-red-950 border border-red-800 rounded px-2 py-1">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-2 py-1">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(p.id)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  )}
                </div>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <SponsorDialog open={addSponsorOpen} onClose={() => setAddSponsorOpen(false)} />
      {editSponsor && <SponsorDialog open={!!editSponsor} onClose={() => setEditSponsor(null)} sponsor={editSponsor} />}
      <PartnerDialog open={addPartnerOpen} onClose={() => setAddPartnerOpen(false)} />
      {editPartner && <PartnerDialog open={!!editPartner} onClose={() => setEditPartner(null)} partner={editPartner} />}
    </div>
  );
}
