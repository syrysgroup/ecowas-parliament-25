import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";

const MODULE = "programme-pillars";

interface PillarRow {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  emoji: string | null;
  color: string | null;
  icon_bg: string | null;
  route: string | null;
  progress_percent: number;
  lead_name: string | null;
  sponsors: string[];
  display_order: number;
  is_active: boolean;
}

interface PageContent {
  id?: string;
  pillar_slug: string;
  page_title: string | null;
  tagline: string | null;
  description: string | null;
  hero_image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
}

interface SectionRow {
  id: string;
  pillar_slug: string;
  title: string;
  content: string | null;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
}

// ─── Pillar Dialog ────────────────────────────────────────────────────────────

function PillarDialog({ open, onClose, pillar }: { open: boolean; onClose: () => void; pillar?: PillarRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!pillar;

  const [slug, setSlug] = useState(pillar?.slug ?? "");
  const [title, setTitle] = useState(pillar?.title ?? "");
  const [description, setDescription] = useState(pillar?.description ?? "");
  const [emoji, setEmoji] = useState(pillar?.emoji ?? "");
  const [color, setColor] = useState(pillar?.color ?? "hsl(152 100% 26%)");
  const [iconBg, setIconBg] = useState(pillar?.icon_bg ?? "bg-primary/10");
  const [route, setRoute] = useState(pillar?.route ?? "");
  const [progress, setProgress] = useState(pillar?.progress_percent?.toString() ?? "0");
  const [displayOrder, setDisplayOrder] = useState(pillar?.display_order?.toString() ?? "0");
  const [leadName, setLeadName] = useState(pillar?.lead_name ?? "");
  const [sponsors, setSponsors] = useState(pillar?.sponsors?.join(", ") ?? "");
  const [isActive, setIsActive] = useState(pillar?.is_active ?? true);
  const [errors, setErrors] = useState<{ slug?: string; title?: string }>({});

  const validate = useCallback(() => {
    const errs: { slug?: string; title?: string } = {};
    if (!slug.trim()) errs.slug = "Slug is required";
    if (!title.trim()) errs.title = "Title is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [slug, title]);

  const save = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error("Validation failed");
      const payload = {
        slug: slug.toLowerCase().replace(/\s+/g, "-").trim(),
        title: title.trim() || null,
        description: description.trim() || null,
        emoji: emoji || null,
        color: color || null,
        icon_bg: iconBg || null,
        route: route.trim() || null,
        progress_percent: Math.min(100, Math.max(0, parseInt(progress) || 0)),
        display_order: parseInt(displayOrder) || 0,
        lead_name: leadName.trim() || null,
        sponsors: sponsors ? sponsors.split(",").map(s => s.trim()).filter(Boolean) : [],
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };
      if (isEdit) {
        const { error } = await supabase.from("programme_pillars").update(payload).eq("id", pillar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("programme_pillars").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programme_pillars"] });
      toast({ title: isEdit ? "Pillar updated" : "Pillar created" });
      onClose();
    },
    onError: (err: any) => {
      if (err.message !== "Validation failed") {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? "Edit Programme Pillar" : "Add Programme Pillar"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Slug * <span className="text-crm-text-muted font-normal">(URL-safe)</span></Label>
              <Input value={slug} onChange={e => { setSlug(e.target.value); setErrors(p => ({ ...p, slug: undefined })); }}
                placeholder="youth" className={`bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono ${errors.slug ? "border-red-500" : ""}`} />
              {errors.slug && <p className="text-[10px] text-red-400">{errors.slug}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Emoji</Label>
              <Input value={emoji} onChange={e => setEmoji(e.target.value)}
                placeholder="🚀" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Title *</Label>
            <Input value={title} onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })); }}
              placeholder="Youth Parliament" className={`bg-crm-surface border-crm-border text-crm-text text-xs h-8 ${errors.title ? "border-red-500" : ""}`} />
            {errors.title && <p className="text-[10px] text-red-400">{errors.title}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Short Description <span className="text-crm-text-muted font-normal">(homepage card)</span></Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Empowering the next generation of ECOWAS leaders…"
              rows={2} className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Route <span className="text-crm-text-muted font-normal">(e.g. /programmes/youth)</span></Label>
            <Input value={route} onChange={e => setRoute(e.target.value)}
              placeholder="/programmes/youth" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Accent Colour <span className="text-crm-text-muted font-normal">(CSS)</span></Label>
              <Input value={color} onChange={e => setColor(e.target.value)}
                placeholder="hsl(152 100% 26%)" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Icon Background <span className="text-crm-text-muted font-normal">(Tailwind)</span></Label>
              <Input value={iconBg} onChange={e => setIconBg(e.target.value)}
                placeholder="bg-primary/10" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Progress % (0–100)</Label>
              <Input type="number" min={0} max={100} value={progress} onChange={e => setProgress(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Display Order</Label>
              <Input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Lead Name</Label>
            <Input value={leadName} onChange={e => setLeadName(e.target.value)}
              placeholder="K. Asante" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Sponsors <span className="text-crm-text-muted font-normal">(comma-separated)</span></Label>
            <Input value={sponsors} onChange={e => setSponsors(e.target.value)}
              placeholder="AfDB, UNDP" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-[11px] text-crm-text-dim">Active (visible on public site)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-crm-text-muted">Cancel</Button>
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Pillar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Section Dialog ───────────────────────────────────────────────────────────

function SectionDialog({
  open, onClose, pillarSlug, section,
}: { open: boolean; onClose: () => void; pillarSlug: string; section?: SectionRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!section;

  const [title, setTitle] = useState(section?.title ?? "");
  const [content, setContent] = useState(section?.content ?? "");
  const [imageUrl, setImageUrl] = useState(section?.image_url ?? "");
  const [displayOrder, setDisplayOrder] = useState(section?.display_order?.toString() ?? "0");
  const [isVisible, setIsVisible] = useState(section?.is_visible ?? true);
  const [titleError, setTitleError] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      if (!title.trim()) { setTitleError("Title is required"); throw new Error("Validation failed"); }
      const payload = {
        pillar_slug: pillarSlug,
        title: title.trim(),
        content: content.trim() || null,
        image_url: imageUrl.trim() || null,
        display_order: parseInt(displayOrder) || 0,
        is_visible: isVisible,
        updated_at: new Date().toISOString(),
      };
      if (isEdit) {
        const { error } = await (supabase.from("pillar_sections" as any) as any).update(payload).eq("id", section.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("pillar_sections" as any) as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pillar_sections", pillarSlug] });
      toast({ title: isEdit ? "Section updated" : "Section added" });
      onClose();
    },
    onError: (err: any) => {
      if (err.message !== "Validation failed") {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? "Edit Section" : "Add Section"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Title *</Label>
            <Input value={title} onChange={e => { setTitle(e.target.value); setTitleError(""); }}
              placeholder="Overview" className={`bg-crm-surface border-crm-border text-crm-text text-xs h-8 ${titleError ? "border-red-500" : ""}`} />
            {titleError && <p className="text-[10px] text-red-400">{titleError}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Content</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Describe this section…" rows={6}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Image URL</Label>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="https://…" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Display Order</Label>
              <Input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Switch checked={isVisible} onCheckedChange={setIsVisible} />
              <Label className="text-[11px] text-crm-text-dim">Visible</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-crm-text-muted">Cancel</Button>
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Pillars Tab ──────────────────────────────────────────────────────────────

function PillarsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PillarRow | undefined>();
  const [deleting, setDeleting] = useState<PillarRow | undefined>();

  const { data: pillars = [], isLoading } = useQuery<PillarRow[]>({
    queryKey: ["programme_pillars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programme_pillars")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("programme_pillars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programme_pillars"] });
      toast({ title: "Pillar deleted" });
      setDeleting(undefined);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const sorted = [...pillars].sort((a, b) => a.display_order - b.display_order);
      const idx = sorted.findIndex(p => p.id === id);
      if (direction === "up" && idx === 0) return;
      if (direction === "down" && idx === sorted.length - 1) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      const a = sorted[idx];
      const b = sorted[swapIdx];
      await Promise.all([
        supabase.from("programme_pillars").update({ display_order: b.display_order }).eq("id", a.id),
        supabase.from("programme_pillars").update({ display_order: a.display_order }).eq("id", b.id),
      ]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["programme_pillars"] }),
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditing(undefined); setDialogOpen(true); };
  const openEdit = (p: PillarRow) => { setEditing(p); setDialogOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-crm-text-muted">
          Manage programme pillars displayed on the public homepage. Changes reflect immediately.
        </p>
        {canCreate(MODULE) && (
          <Button size="sm" onClick={openCreate}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
            <Plus size={13} /> Add Pillar
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {pillars.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-3 bg-crm-card border border-crm-border rounded-xl px-4 py-3">
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5 text-crm-text-dim hover:text-crm-text"
                  disabled={idx === 0 || reorderMutation.isPending}
                  onClick={() => reorderMutation.mutate({ id: p.id, direction: "up" })}>
                  <ChevronUp size={11} />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-crm-text-dim hover:text-crm-text"
                  disabled={idx === pillars.length - 1 || reorderMutation.isPending}
                  onClick={() => reorderMutation.mutate({ id: p.id, direction: "down" })}>
                  <ChevronDown size={11} />
                </Button>
              </div>

              <span className="text-xl w-7 text-center flex-shrink-0">{p.emoji}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-crm-text">{p.title || p.slug}</span>
                  <Badge variant="outline" className="text-[10px] text-crm-text-dim border-crm-border font-mono px-1.5">{p.slug}</Badge>
                  {!p.is_active && <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30 px-1.5">Hidden</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-20 bg-crm-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.progress_percent}%` }} />
                    </div>
                    <span className="text-[10px] text-crm-text-muted">{p.progress_percent}%</span>
                  </div>
                  {p.lead_name && <span className="text-[10px] text-crm-text-muted">Lead: {p.lead_name}</span>}
                  {p.sponsors?.length > 0 && (
                    <span className="text-[10px] text-emerald-500">{p.sponsors.join(" · ")}</span>
                  )}
                </div>
                {p.description && (
                  <p className="text-[10px] text-crm-text-dim mt-0.5 line-clamp-1">{p.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {canEdit(MODULE) && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted hover:text-crm-text"
                    onClick={() => openEdit(p)}>
                    <Pencil size={12} />
                  </Button>
                )}
                {canDelete(MODULE) && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted hover:text-red-400"
                    onClick={() => setDeleting(p)}>
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {pillars.length === 0 && (
            <p className="text-sm text-crm-text-muted text-center py-10">
              No pillars yet.{canCreate(MODULE) ? " Click "Add Pillar" to create the first one." : ""}
            </p>
          )}
        </div>
      )}

      {/* Dialogs */}
      <PillarDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(undefined); }}
        pillar={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={o => !o && setDeleting(undefined)}>
        <AlertDialogContent className="bg-crm-card border-crm-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-crm-text text-sm">Delete pillar?</AlertDialogTitle>
            <AlertDialogDescription className="text-crm-text-muted text-xs">
              This will permanently remove the "{deleting?.title || deleting?.slug}" pillar and all its page content from the public site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-crm-border text-crm-text text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && deleteMutation.mutate(deleting.id)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Page Content Tab ─────────────────────────────────────────────────────────

function PageContentTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { canEdit } = usePermissions();

  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionRow | undefined>();
  const [deletingSection, setDeletingSection] = useState<SectionRow | undefined>();

  // Hero form state
  const [pageTitle, setPageTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [heroSaving, setHeroSaving] = useState(false);

  const { data: pillars = [] } = useQuery<PillarRow[]>({
    queryKey: ["programme_pillars"],
    queryFn: async () => {
      const { data, error } = await supabase.from("programme_pillars").select("id,slug,title,emoji").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: pageContent, isLoading: contentLoading } = useQuery<PageContent | null>({
    queryKey: ["pillar_page_content", selectedSlug],
    queryFn: async () => {
      const { data } = await (supabase.from("pillar_page_content" as any) as any)
        .select("*")
        .eq("pillar_slug", selectedSlug)
        .maybeSingle();
      return data ?? null;
    },
    enabled: !!selectedSlug,
    staleTime: 0,
  });

  // Sync hero form whenever fetched content changes (new slug selected or refetch after save)
  useEffect(() => {
    setPageTitle(pageContent?.page_title ?? "");
    setTagline(pageContent?.tagline ?? "");
    setHeroDesc(pageContent?.description ?? "");
    setHeroImageUrl(pageContent?.hero_image_url ?? "");
    setCtaLabel(pageContent?.cta_label ?? "");
    setCtaUrl(pageContent?.cta_url ?? "");
  }, [pageContent]);

  const handleSlugChange = (slug: string) => {
    setSelectedSlug(slug);
    // Reset form immediately; useEffect above will repopulate when query resolves
    setPageTitle(""); setTagline(""); setHeroDesc(""); setHeroImageUrl(""); setCtaLabel(""); setCtaUrl("");
  };

  const { data: sections = [], isLoading: sectionsLoading } = useQuery<SectionRow[]>({
    queryKey: ["pillar_sections", selectedSlug],
    queryFn: async () => {
      const { data } = await (supabase.from("pillar_sections" as any) as any)
        .select("*")
        .eq("pillar_slug", selectedSlug)
        .order("display_order");
      return data ?? [];
    },
    enabled: !!selectedSlug,
    staleTime: 0,
  });

  const saveHero = async () => {
    if (!selectedSlug) return;
    setHeroSaving(true);
    try {
      const { error } = await (supabase.from("pillar_page_content" as any) as any).upsert(
        {
          pillar_slug: selectedSlug,
          page_title: pageTitle.trim() || null,
          tagline: tagline.trim() || null,
          description: heroDesc.trim() || null,
          hero_image_url: heroImageUrl.trim() || null,
          cta_label: ctaLabel.trim() || null,
          cta_url: ctaUrl.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "pillar_slug" }
      );
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["pillar_page_content", selectedSlug] });
      toast({ title: "Page content saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setHeroSaving(false);
    }
  };

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("pillar_sections" as any) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pillar_sections", selectedSlug] });
      toast({ title: "Section deleted" });
      setDeletingSection(undefined);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleSectionVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await (supabase.from("pillar_sections" as any) as any)
        .update({ is_visible, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pillar_sections", selectedSlug] }),
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const reorderSection = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = sections.findIndex(s => s.id === id);
      if (direction === "up" && idx === 0) return;
      if (direction === "down" && idx === sections.length - 1) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      const a = sections[idx];
      const b = sections[swapIdx];
      await Promise.all([
        (supabase.from("pillar_sections" as any) as any).update({ display_order: b.display_order }).eq("id", a.id),
        (supabase.from("pillar_sections" as any) as any).update({ display_order: a.display_order }).eq("id", b.id),
      ]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pillar_sections", selectedSlug] }),
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const canEditModule = canEdit(MODULE);

  return (
    <div className="space-y-5">
      {/* Pillar selector */}
      <div className="space-y-1">
        <Label className="text-[11px] text-crm-text-dim">Select Pillar</Label>
        <Select value={selectedSlug} onValueChange={handleSlugChange}>
          <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 w-64">
            <SelectValue placeholder="Choose a pillar…" />
          </SelectTrigger>
          <SelectContent className="bg-crm-card border-crm-border">
            {pillars.map(p => (
              <SelectItem key={p.slug} value={p.slug} className="text-crm-text text-xs">
                {p.emoji} {p.title || p.slug}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedSlug && (
        <p className="text-sm text-crm-text-muted text-center py-10">
          Select a pillar above to edit its public page content.
        </p>
      )}

      {selectedSlug && (
        <>
          {/* Hero / page metadata */}
          <div className="bg-crm-card border border-crm-border rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-crm-text">Hero Block</h3>
            {contentLoading ? (
              <div className="h-8 w-32 bg-crm-surface rounded animate-pulse" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-crm-text-dim">Page Title <span className="text-crm-text-muted font-normal">(H1)</span></Label>
                    <Input value={pageTitle} onChange={e => setPageTitle(e.target.value)} disabled={!canEditModule}
                      placeholder="Youth Parliament Programme"
                      className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-crm-text-dim">Tagline</Label>
                    <Input value={tagline} onChange={e => setTagline(e.target.value)} disabled={!canEditModule}
                      placeholder="Empowering the next generation"
                      className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-crm-text-dim">Hero Description</Label>
                  <Textarea value={heroDesc} onChange={e => setHeroDesc(e.target.value)} disabled={!canEditModule}
                    placeholder="Overview paragraph for the top of the page…"
                    rows={3} className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-crm-text-dim">Hero Image URL</Label>
                  <Input value={heroImageUrl} onChange={e => setHeroImageUrl(e.target.value)} disabled={!canEditModule}
                    placeholder="https://…" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-crm-text-dim">CTA Label</Label>
                    <Input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} disabled={!canEditModule}
                      placeholder="Learn More" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-crm-text-dim">CTA URL</Label>
                    <Input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} disabled={!canEditModule}
                      placeholder="/programmes/youth" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
                  </div>
                </div>
                {canEditModule && (
                  <div className="flex justify-end">
                    <Button size="sm" onClick={saveHero} disabled={heroSaving}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
                      {heroSaving ? "Saving…" : "Save Hero Content"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-crm-text">Content Sections</h3>
              {canEditModule && (
                <Button size="sm" variant="outline"
                  onClick={() => { setEditingSection(undefined); setSectionDialogOpen(true); }}
                  className="border-crm-border text-crm-text text-xs h-7 gap-1 hover:bg-crm-surface">
                  <Plus size={11} /> Add Section
                </Button>
              )}
            </div>

            {sectionsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : sections.length === 0 ? (
              <p className="text-xs text-crm-text-muted text-center py-6">
                No sections yet.{canEditModule ? " Click "Add Section" to build out the page." : ""}
              </p>
            ) : (
              <div className="space-y-2">
                {sections.map((s, idx) => (
                  <div key={s.id} className={`flex items-start gap-3 bg-crm-card border rounded-xl px-4 py-3 ${!s.is_visible ? "border-crm-border opacity-60" : "border-crm-border"}`}>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-crm-text-dim hover:text-crm-text"
                        disabled={idx === 0 || reorderSection.isPending}
                        onClick={() => reorderSection.mutate({ id: s.id, direction: "up" })}>
                        <ChevronUp size={11} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-crm-text-dim hover:text-crm-text"
                        disabled={idx === sections.length - 1 || reorderSection.isPending}
                        onClick={() => reorderSection.mutate({ id: s.id, direction: "down" })}>
                        <ChevronDown size={11} />
                      </Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-crm-text">{s.title}</p>
                      {s.content && <p className="text-[11px] text-crm-text-muted mt-0.5 line-clamp-2">{s.content}</p>}
                      {s.image_url && <p className="text-[10px] text-crm-text-dim mt-0.5 font-mono truncate">{s.image_url}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {canEditModule && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted hover:text-crm-text"
                            onClick={() => toggleSectionVisibility.mutate({ id: s.id, is_visible: !s.is_visible })}>
                            {s.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted hover:text-crm-text"
                            onClick={() => { setEditingSection(s); setSectionDialogOpen(true); }}>
                            <Pencil size={12} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted hover:text-red-400"
                            onClick={() => setDeletingSection(s)}>
                            <Trash2 size={12} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Section dialog */}
      {selectedSlug && (
        <SectionDialog
          key={editingSection?.id ?? "new-section"}
          open={sectionDialogOpen}
          onClose={() => { setSectionDialogOpen(false); setEditingSection(undefined); }}
          pillarSlug={selectedSlug}
          section={editingSection}
        />
      )}

      {/* Delete section confirm */}
      <AlertDialog open={!!deletingSection} onOpenChange={o => !o && setDeletingSection(undefined)}>
        <AlertDialogContent className="bg-crm-card border-crm-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-crm-text text-sm">Delete section?</AlertDialogTitle>
            <AlertDialogDescription className="text-crm-text-muted text-xs">
              "{deletingSection?.title}" will be permanently removed from the public page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-crm-border text-crm-text text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingSection && deleteSectionMutation.mutate(deletingSection.id)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Root Module ──────────────────────────────────────────────────────────────

export default function ProgrammePillarsModule() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-crm-text">Programme Pillars</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">
          Manage pillar metadata and the public detail page content for each programme.
        </p>
      </div>

      <Tabs defaultValue="pillars" className="space-y-4">
        <TabsList className="bg-crm-surface border border-crm-border h-8">
          <TabsTrigger value="pillars" className="text-xs h-6 data-[state=active]:bg-crm-card data-[state=active]:text-crm-text">
            Pillars
          </TabsTrigger>
          <TabsTrigger value="page-content" className="text-xs h-6 data-[state=active]:bg-crm-card data-[state=active]:text-crm-text">
            Page Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pillars" className="mt-0">
          <PillarsTab />
        </TabsContent>

        <TabsContent value="page-content" className="mt-0">
          <PageContentTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
