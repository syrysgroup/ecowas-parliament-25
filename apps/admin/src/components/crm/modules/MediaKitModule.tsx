import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Pencil, Trash2, FileText, Mic, ImageIcon,
  Calendar, Star, ChevronUp, ChevronDown, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";

const MODULE = "media-kit-mgmt";

interface MediaKitRow {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  url: string | null;
  metadata: Record<string, any>;
  display_order: number;
  is_active: boolean;
}

const ITEM_TYPES = [
  { value: "press_release",  label: "Press Releases",   icon: FileText  },
  { value: "spokesperson",   label: "Spokespeople",     icon: Mic       },
  { value: "asset_pack",     label: "Asset Packs",      icon: ImageIcon },
  { value: "event_calendar", label: "Event Calendar",   icon: Calendar  },
  { value: "key_fact",       label: "Key Facts",        icon: Star      },
];

// ─── Type-specific metadata fields rendered inside the dialog ─────────────────

function MetaFields({
  type, meta, onChange,
}: { type: string; meta: Record<string, any>; onChange: (key: string, val: any) => void }) {
  if (type === "press_release") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Language <span className="text-crm-text-muted font-normal">(e.g. EN)</span></Label>
            <Input value={meta.language ?? ""} onChange={e => onChange("language", e.target.value)}
              placeholder="EN" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Release Type</Label>
            <Input value={meta.release_type ?? ""} onChange={e => onChange("release_type", e.target.value)}
              placeholder="Official Statement" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={!!meta.highlight} onCheckedChange={v => onChange("highlight", v)} />
          <Label className="text-[11px] text-crm-text-dim">Mark as Latest (highlighted badge)</Label>
        </div>
      </div>
    );
  }
  if (type === "spokesperson") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Initials <span className="text-crm-text-muted font-normal">(2 chars)</span></Label>
          <Input value={meta.initials ?? ""} onChange={e => onChange("initials", e.target.value.slice(0, 2).toUpperCase())}
            placeholder="AK" maxLength={2} className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Avatar Colour <span className="text-crm-text-muted font-normal">(Tailwind)</span></Label>
          <Input value={meta.colour ?? ""} onChange={e => onChange("colour", e.target.value)}
            placeholder="bg-primary/10 text-primary" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
        </div>
      </div>
    );
  }
  if (type === "asset_pack") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">File Size</Label>
          <Input value={meta.size ?? ""} onChange={e => onChange("size", e.target.value)}
            placeholder="4.2 MB" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Icon Style</Label>
          <Select value={meta.icon ?? "file"} onValueChange={v => onChange("icon", v)}>
            <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-crm-card border-crm-border">
              <SelectItem value="file"  className="text-crm-text text-xs">Document / File</SelectItem>
              <SelectItem value="image" className="text-crm-text text-xs">Image / Photo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  if (type === "key_fact") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Value / Number</Label>
          <Input value={meta.value ?? ""} onChange={e => onChange("value", e.target.value)}
            placeholder="25" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Unit</Label>
          <Input value={meta.unit ?? ""} onChange={e => onChange("unit", e.target.value)}
            placeholder="years" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
        </div>
      </div>
    );
  }
  // event_calendar — no metadata fields needed
  return null;
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

function MediaKitDialog({
  open, onClose, defaultType, item,
}: { open: boolean; onClose: () => void; defaultType: string; item?: MediaKitRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!item;

  const [type, setType]             = useState(item?.type ?? defaultType);
  const [title, setTitle]           = useState(item?.title ?? "");
  const [subtitle, setSubtitle]     = useState(item?.subtitle ?? "");
  const [description, setDesc]      = useState(item?.description ?? "");
  const [url, setUrl]               = useState(item?.url ?? "");
  const [displayOrder, setOrder]    = useState(item?.display_order?.toString() ?? "0");
  const [isActive, setIsActive]     = useState(item?.is_active ?? true);
  const [meta, setMeta]             = useState<Record<string, any>>(item?.metadata ?? {});

  const setMetaKey = (key: string, val: any) => setMeta(m => ({ ...m, [key]: val }));

  const contextLabels: Record<string, { subtitle: string; description: string }> = {
    press_release:  { subtitle: "Date / Issue",           description: "Summary"      },
    spokesperson:   { subtitle: "Role / Title",           description: "Bio"          },
    asset_pack:     { subtitle: "Category / Pack Name",   description: "Contents"     },
    event_calendar: { subtitle: "Month (e.g. March 2026)",description: "Location / City" },
    key_fact:       { subtitle: "Short Label",            description: "Context"      },
  };
  const ctx = contextLabels[type] ?? { subtitle: "Subtitle", description: "Description" };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        type,
        title:         title.trim() || null,
        subtitle:      subtitle.trim() || null,
        description:   description.trim() || null,
        url:           url.trim() || null,
        metadata:      meta,
        display_order: parseInt(displayOrder) || 0,
        is_active:     isActive,
        updated_at:    new Date().toISOString(),
      };
      if (isEdit) {
        const { error } = await supabase.from("media_kit_items").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("media_kit_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media-kit-items"] });
      toast({ title: isEdit ? "Item updated" : "Item created" });
      onClose();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? "Edit Media Kit Item" : "Add Media Kit Item"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          {/* Type selector — only shown when creating */}
          {!isEdit && (
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Type *</Label>
              <Select value={type} onValueChange={v => { setType(v); setMeta({}); }}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  {ITEM_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-crm-text text-xs">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">{ctx.subtitle}</Label>
            <Input value={subtitle} onChange={e => setSubtitle(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">{ctx.description}</Label>
            <Textarea value={description} onChange={e => setDesc(e.target.value)}
              rows={2} className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">URL <span className="text-crm-text-muted font-normal">(download / link / profile)</span></Label>
            <Input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://…" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
          </div>

          {/* Type-specific structured metadata */}
          <MetaFields type={type} meta={meta} onChange={setMetaKey} />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Display Order</Label>
              <Input type="number" value={displayOrder} onChange={e => setOrder(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label className="text-[11px] text-crm-text-dim">Active / visible</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-crm-text-muted">Cancel</Button>
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Item list per tab ────────────────────────────────────────────────────────

function ItemList({ type, label }: { type: string; label: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<MediaKitRow | undefined>();
  const [deleting, setDeleting]     = useState<MediaKitRow | undefined>();

  const { data: items = [], isLoading } = useQuery<MediaKitRow[]>({
    queryKey: ["media-kit-items", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_kit_items")
        .select("*")
        .eq("type", type)
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as MediaKitRow[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media_kit_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media-kit-items", type] });
      toast({ title: "Item deleted" });
      setDeleting(undefined);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("media_kit_items")
        .update({ is_active, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media-kit-items", type] }),
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = items.findIndex(i => i.id === id);
      if (direction === "up" && idx === 0) return;
      if (direction === "down" && idx === items.length - 1) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      const a = items[idx];
      const b = items[swapIdx];
      await Promise.all([
        supabase.from("media_kit_items").update({ display_order: b.display_order }).eq("id", a.id),
        supabase.from("media_kit_items").update({ display_order: a.display_order }).eq("id", b.id),
      ]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media-kit-items", type] }),
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditing(undefined); setDialogOpen(true); };
  const openEdit   = (item: MediaKitRow) => { setEditing(item); setDialogOpen(true); };

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-crm-text-dim">
          {label} <span className="text-crm-text-dim/60 font-normal normal-case tracking-normal">({items.length})</span>
        </p>
        {canCreate(MODULE) && (
          <Button size="sm" variant="outline" onClick={openCreate}
            className="border-crm-border text-crm-text text-xs gap-1 h-7 hover:bg-crm-surface">
            <Plus size={11} /> Add
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="h-16 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 transition-colors ${
                item.is_active ? "bg-crm-surface border-crm-border" : "bg-crm-surface/50 border-crm-border opacity-60"
              }`}
            >
              {/* Reorder */}
              {canEdit(MODULE) && (
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-4 w-4 text-crm-text-dim hover:text-crm-text"
                    disabled={idx === 0 || reorderMutation.isPending}
                    onClick={() => reorderMutation.mutate({ id: item.id, direction: "up" })}>
                    <ChevronUp size={10} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-4 w-4 text-crm-text-dim hover:text-crm-text"
                    disabled={idx === items.length - 1 || reorderMutation.isPending}
                    onClick={() => reorderMutation.mutate({ id: item.id, direction: "down" })}>
                    <ChevronDown size={10} />
                  </Button>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-crm-text truncate">{item.title || "(no title)"}</p>
                {item.subtitle && (
                  <p className="text-[10px] text-crm-text-muted truncate">{item.subtitle}</p>
                )}
                {/* Type-specific quick summary */}
                {type === "press_release" && item.metadata?.release_type && (
                  <Badge variant="outline" className="text-[9px] border-crm-border text-crm-text-dim mt-0.5">{item.metadata.release_type}</Badge>
                )}
                {type === "key_fact" && item.metadata?.value && (
                  <span className="text-[10px] text-emerald-500 font-mono ml-1">{item.metadata.value} {item.metadata.unit}</span>
                )}
                {type === "asset_pack" && item.metadata?.size && (
                  <span className="text-[10px] text-crm-text-dim ml-1">{item.metadata.size}</span>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {canEdit(MODULE) && (
                  <>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-crm-text-muted hover:text-crm-text"
                      onClick={() => toggleMutation.mutate({ id: item.id, is_active: !item.is_active })}>
                      {item.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-crm-text-muted hover:text-crm-text"
                      onClick={() => openEdit(item)}>
                      <Pencil size={11} />
                    </Button>
                  </>
                )}
                {canDelete(MODULE) && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-crm-text-muted hover:text-red-400"
                    onClick={() => setDeleting(item)}>
                    <Trash2 size={11} />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-[11px] text-crm-text-dim py-4 text-center">
              No {label.toLowerCase()} yet.{canCreate(MODULE) ? " Click "Add" to create one." : ""}
            </p>
          )}
        </div>
      )}

      {/* Dialogs */}
      <MediaKitDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(undefined); }}
        defaultType={type}
        item={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={o => !o && setDeleting(undefined)}>
        <AlertDialogContent className="bg-crm-card border-crm-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-crm-text text-sm">Delete item?</AlertDialogTitle>
            <AlertDialogDescription className="text-crm-text-muted text-xs">
              "{deleting?.title}" will be permanently removed from the public Media Kit page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-crm-border text-crm-text text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Root module ──────────────────────────────────────────────────────────────

export default function MediaKitModule() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-crm-text">Media Kit Manager</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">
          Manage press releases, spokespeople, asset packs, event calendar, and key facts shown on the public Media Kit page.
          Use the <strong className="text-crm-text">Site Content</strong> module to edit the hero text and media contact card.
        </p>
      </div>

      <Tabs defaultValue="press_release" className="space-y-1">
        <TabsList className="bg-crm-surface border border-crm-border h-auto flex-wrap gap-0.5 p-1">
          {ITEM_TYPES.map(t => {
            const Icon = t.icon;
            return (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="text-xs h-7 gap-1.5 data-[state=active]:bg-crm-card data-[state=active]:text-crm-text"
              >
                <Icon size={11} /> {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ITEM_TYPES.map(t => (
          <TabsContent key={t.value} value={t.value} className="mt-0">
            <ItemList type={t.value} label={t.label} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
