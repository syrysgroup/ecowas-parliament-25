import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Plus, Pencil, Trash2, Eye, Image, Users, Search, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "@/components/ui/sonner";

interface SponsorRow {
  id: string; name: string; slug: string; logo_url: string | null;
  description: string | null; acronym: string | null; about: string | null;
  tier: string; website: string | null;
  email: string | null; programmes: string[]; is_published: boolean;
  sort_order: number; is_ecowas_sponsor?: boolean;
}

interface PartnerRow {
  id: string; name: string; slug: string; logo_url: string | null;
  description: string | null; long_description: string[] | null;
  social_links: Record<string, string> | null;
  partner_type: string; website: string | null;
  lead_name: string | null; lead_role: string | null; lead_image_url: string | null;
  is_published: boolean; sort_order: number;
}

interface ProgrammePillar {
  id: string; slug: string; emoji: string | null;
}

// ─── Programme multi-checkbox dropdown ───────────────────────────────────────
function ProgrammeSelect({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: pillars = [] } = useQuery<ProgrammePillar[]>({
    queryKey: ["programme_pillars_active"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("programme_pillars")
        .select("id, slug, emoji")
        .eq("is_active", true)
        .order("display_order");
      return data ?? [];
    },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (slug: string) => {
    onChange(selected.includes(slug) ? selected.filter(s => s !== slug) : [...selected, slug]);
  };

  const label = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 bg-crm-surface border border-crm-border text-crm-text text-xs h-8 px-2.5 rounded-md hover:border-crm-border-hover transition-colors"
      >
        <span className="truncate">
          {selected.length === 0
            ? "Select programmes…"
            : `${selected.length} programme${selected.length > 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown size={12} className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-crm-card border border-crm-border rounded-lg shadow-lg">
          {pillars.length === 0 ? (
            <p className="text-[11px] text-crm-text-dim px-3 py-2">No active programmes found</p>
          ) : (
            pillars.map(p => (
              <label key={p.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-crm-surface cursor-pointer">
                <Checkbox
                  checked={selected.includes(p.slug)}
                  onCheckedChange={() => toggle(p.slug)}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <span className="text-xs text-crm-text">
                  {p.emoji && <span className="mr-1">{p.emoji}</span>}
                  {label(p.slug)}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sponsor Dialog ───────────────────────────────────────────────────────────
function SponsorDialog({ open, onClose, sponsor }: { open: boolean; onClose: () => void; sponsor?: SponsorRow }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!sponsor;
  const [name, setName] = useState(sponsor?.name ?? "");
  const [logoUrl, setLogoUrl] = useState(sponsor?.logo_url ?? "");
  const [acronym, setAcronym] = useState(sponsor?.acronym ?? "");
  const [description, setDescription] = useState(sponsor?.description ?? "");
  const [about, setAbout] = useState(sponsor?.about ?? "");
  const [tier, setTier] = useState(sponsor?.tier ?? "standard");
  const [website, setWebsite] = useState(sponsor?.website ?? "");
  const [email, setEmail] = useState(sponsor?.email ?? "");
  const [programmes, setProgrammes] = useState<string[]>(sponsor?.programmes ?? []);
  const [isEcowas, setIsEcowas] = useState(sponsor?.is_ecowas_sponsor ?? false);
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
      const autoSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const payload: any = {
        name,
        // On create: auto-generate slug. On edit: keep existing slug (stable URLs).
        slug: isEdit ? sponsor.slug : autoSlug,
        logo_url: logoUrl || null, description: description || null,
        acronym: acronym || null, about: about || null, tier,
        website: website || null, email: email || null,
        programmes,
        is_ecowas_sponsor: isEcowas,
        is_published: isPublished, sort_order: parseInt(sortOrder) || 0,
        updated_at: new Date().toISOString(),
      };
      if (isEdit) await (supabase as any).from("sponsors").update(payload).eq("id", sponsor.id);
      else await (supabase as any).from("sponsors").insert(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsors-manager"] });
      qc.invalidateQueries({ queryKey: ["sponsors-public"] });
      qc.invalidateQueries({ queryKey: ["sponsor"] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">{isEdit ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          {/* Logo */}
          <div className="space-y-2">
            <Label className="text-[11px] text-crm-text-dim">Logo</Label>
            {logoUrl && <img src={logoUrl} alt="" className="h-16 w-auto rounded border border-crm-border" loading="lazy" decoding="async" />}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="border-crm-border text-crm-text-muted text-xs gap-1"><Image size={12} /> {uploading ? "Uploading…" : "Upload Logo"}</Button>
          </div>

          {/* Name (full width) */}
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>

          {/* Short Name + Tier */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Short Name</Label>
              <Input value={acronym} onChange={e => setAcronym(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="e.g. NASENI" />
            </div>
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
          </div>

          {/* Website + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Website</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="https://…" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>

          {/* Programmes multi-select */}
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Programmes</Label>
            <ProgrammeSelect selected={programmes} onChange={setProgrammes} />
          </div>

          {/* ECOWAS Parliament Initiatives toggle */}
          <div className="flex items-center justify-between bg-crm-surface border border-crm-border rounded-lg px-3 py-2">
            <div>
              <p className="text-[12px] text-crm-text">Sponsor of ECOWAS Parliament Initiatives</p>
              <p className="text-[10px] text-crm-text-dim mt-0.5">Mark this sponsor as supporting ECOWAS Parliament directly</p>
            </div>
            <Switch checked={isEcowas} onCheckedChange={setIsEcowas} />
          </div>

          {/* Sort order */}
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>

          {/* Short description */}
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Short Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={2} />
          </div>

          {/* Full about */}
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Full About (shown on sponsor detail page)</Label>
            <Textarea value={about} onChange={e => setAbout(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={4}
              placeholder="Detailed description shown on their dedicated page…" />
          </div>

          {/* Published */}
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

// ─── Partner Dialog ───────────────────────────────────────────────────────────
function PartnerDialog({ open, onClose, partner }: { open: boolean; onClose: () => void; partner?: PartnerRow }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const leadImageRef = useRef<HTMLInputElement>(null);
  const isEdit = !!partner;
  const [name, setName] = useState(partner?.name ?? "");
  const [logoUrl, setLogoUrl] = useState(partner?.logo_url ?? "");
  const [description, setDescription] = useState(partner?.description ?? "");
  const [longDescription, setLongDescription] = useState(partner?.long_description?.join("\n\n") ?? "");
  const [partnerType, setPartnerType] = useState(partner?.partner_type ?? "implementing");
  const [website, setWebsite] = useState(partner?.website ?? "");
  const [leadName, setLeadName] = useState(partner?.lead_name ?? "");
  const [leadRole, setLeadRole] = useState(partner?.lead_role ?? "");
  const [leadImageUrl, setLeadImageUrl] = useState(partner?.lead_image_url ?? "");
  const [twitterUrl, setTwitterUrl] = useState(partner?.social_links?.twitter ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(partner?.social_links?.linkedin ?? "");
  const [facebookUrl, setFacebookUrl] = useState(partner?.social_links?.facebook ?? "");
  const [isPublished, setIsPublished] = useState(partner?.is_published ?? false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLead, setUploadingLead] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const path = `partners/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("sponsor-logos").upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from("sponsor-logos").getPublicUrl(path);
      setLogoUrl(publicUrl);
    } finally { setUploading(false); }
  };

  const handleLeadUpload = async (file: File) => {
    setUploadingLead(true);
    try {
      const path = `partner-leads/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("sponsor-logos").upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from("sponsor-logos").getPublicUrl(path);
      setLeadImageUrl(publicUrl);
    } finally { setUploadingLead(false); }
  };

  const save = useMutation({
    mutationFn: async () => {
      const socialLinks: Record<string, string> = {};
      if (twitterUrl) socialLinks.twitter = twitterUrl;
      if (linkedinUrl) socialLinks.linkedin = linkedinUrl;
      if (facebookUrl) socialLinks.facebook = facebookUrl;

      const autoSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const payload: any = {
        name,
        slug: isEdit ? partner.slug : autoSlug,
        logo_url: logoUrl || null, description: description || null, partner_type: partnerType,
        long_description: longDescription
          ? longDescription.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
          : [],
        website: website || null, lead_name: leadName || null, lead_role: leadRole || null,
        lead_image_url: leadImageUrl || null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : {},
        is_published: isPublished, updated_at: new Date().toISOString(),
      };
      if (isEdit) await (supabase as any).from("partners").update(payload).eq("id", partner.id);
      else await (supabase as any).from("partners").insert(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners-manager"] });
      qc.invalidateQueries({ queryKey: ["partners-public"] });
      qc.invalidateQueries({ queryKey: ["partner"] });
      onClose();
    },
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
            {logoUrl && <img src={logoUrl} alt="" className="h-16 w-auto rounded border border-crm-border" loading="lazy" decoding="async" />}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="border-crm-border text-crm-text-muted text-xs gap-1"><Image size={12} /> {uploading ? "Uploading…" : "Upload Logo"}</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Type</Label>
              <Select value={partnerType} onValueChange={setPartnerType}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  <SelectItem value="implementing" className="text-crm-text text-xs">Implementing</SelectItem>
                  <SelectItem value="institutional" className="text-crm-text text-xs">Institutional</SelectItem>
                  <SelectItem value="consultant" className="text-crm-text text-xs">Consultant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Lead / Contact Name</Label>
              <Input value={leadName} onChange={e => setLeadName(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Lead Role / Title</Label>
              <Input value={leadRole} onChange={e => setLeadRole(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] text-crm-text-dim">Lead / Contact Photo</Label>
            {leadImageUrl && <img src={leadImageUrl} alt="" className="h-16 w-16 object-cover rounded-full border border-crm-border" loading="lazy" decoding="async" />}
            <input ref={leadImageRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLeadUpload(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" onClick={() => leadImageRef.current?.click()} disabled={uploadingLead}
              className="border-crm-border text-crm-text-muted text-xs gap-1"><Image size={12} /> {uploadingLead ? "Uploading…" : "Upload Lead Photo"}</Button>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Website</Label>
            <Input value={website} onChange={e => setWebsite(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="https://…" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Short Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={2} />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Full Description (separate paragraphs with a blank line)</Label>
            <Textarea value={longDescription} onChange={e => setLongDescription(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={6}
              placeholder={"Paragraph one…\n\nParagraph two…\n\nParagraph three…"} />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Twitter / X URL</Label>
            <Input value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="https://x.com/…" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">LinkedIn URL</Label>
            <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="https://linkedin.com/in/…" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Facebook URL</Label>
            <Input value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="https://facebook.com/…" />
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SponsorsManagerModule() {
  const { isAdmin } = useAuthContext();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const qc = useQueryClient();
  const [tab, setTab] = useState("sponsors");
  const [addSponsorOpen, setAddSponsorOpen] = useState(false);
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  const [editSponsor, setEditSponsor] = useState<SponsorRow | null>(null);
  const [editPartner, setEditPartner] = useState<PartnerRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: sponsors = [], isLoading: loadingS } = useQuery<SponsorRow[]>({
    queryKey: ["sponsors-manager"],
    queryFn: async () => { const { data } = await (supabase as any).from("sponsors").select("*").order("sort_order"); return data ?? []; },
  });

  const { data: partners = [], isLoading: loadingP } = useQuery<PartnerRow[]>({
    queryKey: ["partners-manager"],
    queryFn: async () => { const { data } = await (supabase as any).from("partners").select("*").order("sort_order"); return data ?? []; },
  });

  const filteredSponsors = sponsors.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPartners = partners.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  // Clear selection when switching tabs
  const handleTabChange = (t: string) => { setTab(t); setSelectedIds(new Set()); };

  // Master checkbox state
  const activeList = tab === "sponsors" ? filteredSponsors : filteredPartners;
  const allSelected = activeList.length > 0 && activeList.every(item => selectedIds.has(item.id));
  const someSelected = activeList.some(item => selectedIds.has(item.id)) && !allSelected;

  const deleteSponsor = useMutation({
    mutationFn: async (id: string) => { await (supabase as any).from("sponsors").delete().eq("id", id); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsors-manager"] });
      qc.invalidateQueries({ queryKey: ["sponsors-public"] });
      setConfirmDelete(null);
      toast("Sponsor deleted");
    },
  });

  const deletePartner = useMutation({
    mutationFn: async (id: string) => { await (supabase as any).from("partners").delete().eq("id", id); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners-manager"] });
      qc.invalidateQueries({ queryKey: ["partners-public"] });
      setConfirmDelete(null);
      toast("Partner deleted");
    },
  });

  const toggleSponsorPublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      await (supabase as any).from("sponsors").update({ is_published: published }).eq("id", id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sponsors-manager"] }); qc.invalidateQueries({ queryKey: ["sponsors-public"] }); },
  });

  const togglePartnerPublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      await (supabase as any).from("partners").update({ is_published: published }).eq("id", id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partners-manager"] }); qc.invalidateQueries({ queryKey: ["partners-public"] }); },
  });

  const bulkDelete = useMutation({
    mutationFn: async () => {
      const table = tab === "sponsors" ? "sponsors" : "partners";
      await Promise.all([...selectedIds].map(id => (supabase as any).from(table).delete().eq("id", id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [tab === "sponsors" ? "sponsors-manager" : "partners-manager"] });
      setSelectedIds(new Set());
      toast("Deleted selected items");
    },
  });

  const bulkPublish = useMutation({
    mutationFn: async () => {
      const table = tab === "sponsors" ? "sponsors" : "partners";
      await Promise.all([...selectedIds].map(id => (supabase as any).from(table).update({ is_published: true }).eq("id", id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [tab === "sponsors" ? "sponsors-manager" : "partners-manager"] });
      qc.invalidateQueries({ queryKey: [tab === "sponsors" ? "sponsors-public" : "partners-public"] });
      setSelectedIds(new Set());
      toast("Published selected items");
    },
  });

  const bulkUnpublish = useMutation({
    mutationFn: async () => {
      const table = tab === "sponsors" ? "sponsors" : "partners";
      await Promise.all([...selectedIds].map(id => (supabase as any).from(table).update({ is_published: false }).eq("id", id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [tab === "sponsors" ? "sponsors-manager" : "partners-manager"] });
      qc.invalidateQueries({ queryKey: [tab === "sponsors" ? "sponsors-public" : "partners-public"] });
      setSelectedIds(new Set());
      toast("Unpublished selected items");
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeList.map(item => item.id)));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Sponsors & Partners</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Manage sponsors and partners displayed on the website</p>
        </div>
        {canCreate("sponsors") && (
          <Button size="sm" onClick={() => tab === "sponsors" ? setAddSponsorOpen(true) : setAddPartnerOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> Add {tab === "sponsors" ? "Sponsor" : "Partner"}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-text-dim" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 pl-8" placeholder="Search sponsors & partners..." />
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 bg-crm-surface border border-crm-border rounded-lg px-3 py-2">
          <span className="text-[11px] text-crm-text-muted">{selectedIds.size} selected</span>
          {canEdit("sponsors") && (
            <>
              <Button size="sm" variant="outline" onClick={() => bulkPublish.mutate()} disabled={bulkPublish.isPending}
                className="border-emerald-800 text-emerald-400 text-[10px] h-6 px-2">
                Publish selected
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkUnpublish.mutate()} disabled={bulkUnpublish.isPending}
                className="border-amber-800 text-amber-400 text-[10px] h-6 px-2">
                Unpublish selected
              </Button>
            </>
          )}
          {canDelete("sponsors") && (
            <Button size="sm" variant="outline" onClick={() => bulkDelete.mutate()} disabled={bulkDelete.isPending}
              className="border-red-800 text-red-400 text-[10px] h-6 px-2">
              Delete selected
            </Button>
          )}
        </div>
      )}

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="bg-crm-surface border border-crm-border">
          <TabsTrigger value="sponsors" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Sponsors ({sponsors.length})
          </TabsTrigger>
          <TabsTrigger value="partners" className="text-xs data-[state=active]:bg-emerald-950 data-[state=active]:text-emerald-400">
            Partners ({partners.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Sponsors tab ── */}
        <TabsContent value="sponsors" className="mt-4 space-y-2">
          {/* Master select-all row */}
          {!loadingS && filteredSponsors.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-crm-surface border border-crm-border rounded-xl">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <span className="text-[11px] text-crm-text-dim">Select all ({filteredSponsors.length})</span>
            </div>
          )}
          {loadingS && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}
          {!loadingS && filteredSponsors.map(s => (
            <div key={s.id} className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-center gap-4 hover:border-crm-border-hover transition-colors">
              <Checkbox checked={selectedIds.has(s.id)} onCheckedChange={() => toggleSelect(s.id)} />
              {s.logo_url
                ? <img src={s.logo_url} alt="" className="w-12 h-12 object-contain rounded" width={48} height={48} loading="lazy" decoding="async" />
                : <div className="w-12 h-12 bg-crm-surface rounded flex items-center justify-center text-crm-text-dim"><Users size={16} /></div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-semibold text-crm-text">{s.name}</p>
                  {/* Published pill toggle */}
                  {canEdit("sponsors") && (
                    <button
                      onClick={() => toggleSponsorPublish.mutate({ id: s.id, published: !s.is_published })}
                      title={s.is_published ? "Click to unpublish" : "Click to publish"}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                        s.is_published
                          ? "bg-emerald-950 border-emerald-700 text-emerald-400 hover:bg-emerald-900"
                          : "bg-red-950/60 border-red-800 text-red-400 hover:bg-red-950"
                      }`}
                    >
                      {s.is_published ? "● Live" : "● Draft"}
                    </button>
                  )}
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-crm-surface text-crm-text-dim border-crm-border capitalize">{s.tier}</span>
                </div>
                {s.programmes && s.programmes.length > 0 && (
                  <p className="text-[10px] text-crm-text-dim mt-0.5">{s.programmes.join(", ")}</p>
                )}
              </div>
              <div className="flex gap-1">
                {/* Preview link */}
                <a
                  href={`/sponsors/${s.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Preview sponsor page"
                  className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-blue-400 transition-colors"
                >
                  <Eye size={12} />
                </a>
                {canEdit("sponsors") && (
                  <button onClick={() => setEditSponsor(s)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors"><Pencil size={12} /></button>
                )}
                {canDelete("sponsors") && (
                  confirmDelete === s.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deleteSponsor.mutate(s.id)} className="text-[10px] text-red-400 bg-red-950 border border-red-800 rounded px-2 py-1">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-2 py-1">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(s.id)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  )
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ── Partners tab ── */}
        <TabsContent value="partners" className="mt-4 space-y-2">
          {/* Master select-all row */}
          {!loadingP && filteredPartners.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-crm-surface border border-crm-border rounded-xl">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <span className="text-[11px] text-crm-text-dim">Select all ({filteredPartners.length})</span>
            </div>
          )}
          {loadingP && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}
          {!loadingP && filteredPartners.map(p => (
            <div key={p.id} className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-center gap-4 hover:border-crm-border-hover transition-colors">
              <Checkbox checked={selectedIds.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
              {p.logo_url
                ? <img src={p.logo_url} alt="" className="w-12 h-12 object-contain rounded" width={48} height={48} loading="lazy" decoding="async" />
                : <div className="w-12 h-12 bg-crm-surface rounded flex items-center justify-center text-crm-text-dim"><Users size={16} /></div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-semibold text-crm-text">{p.name}</p>
                  {/* Published pill toggle */}
                  {canEdit("sponsors") && (
                    <button
                      onClick={() => togglePartnerPublish.mutate({ id: p.id, published: !p.is_published })}
                      title={p.is_published ? "Click to unpublish" : "Click to publish"}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                        p.is_published
                          ? "bg-emerald-950 border-emerald-700 text-emerald-400 hover:bg-emerald-900"
                          : "bg-red-950/60 border-red-800 text-red-400 hover:bg-red-950"
                      }`}
                    >
                      {p.is_published ? "● Live" : "● Draft"}
                    </button>
                  )}
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-crm-surface text-crm-text-dim border-crm-border capitalize">{p.partner_type}</span>
                </div>
                {p.lead_name && <p className="text-[10px] text-crm-text-dim mt-0.5">{p.lead_name} — {p.lead_role}</p>}
              </div>
              <div className="flex gap-1">
                {/* Preview link */}
                <a
                  href={`/partners/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Preview partner page"
                  className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-blue-400 transition-colors"
                >
                  <Eye size={12} />
                </a>
                {canEdit("sponsors") && (
                  <button onClick={() => setEditPartner(p)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors"><Pencil size={12} /></button>
                )}
                {canDelete("sponsors") && (
                  confirmDelete === p.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deletePartner.mutate(p.id)} className="text-[10px] text-red-400 bg-red-950 border border-red-800 rounded px-2 py-1">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-2 py-1">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(p.id)} className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  )
                )}
              </div>
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
