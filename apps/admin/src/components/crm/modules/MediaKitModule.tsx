import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, FileText, Mic, ImageIcon, Calendar, Star } from "lucide-react";
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
  { value: "press_release",   label: "Press Release",   icon: FileText },
  { value: "spokesperson",    label: "Spokesperson",    icon: Mic },
  { value: "asset_pack",      label: "Asset Pack",      icon: ImageIcon },
  { value: "event_calendar",  label: "Event Calendar",  icon: Calendar },
  { value: "key_fact",        label: "Key Fact",        icon: Star },
];

function typeIcon(type: string) {
  const found = ITEM_TYPES.find(t => t.value === type);
  const Icon = found?.icon ?? FileText;
  return <Icon size={14} />;
}

function MediaKitDialog({ open, onClose, item }: { open: boolean; onClose: () => void; item?: MediaKitRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!item;

  const [type, setType] = useState(item?.type ?? "press_release");
  const [title, setTitle] = useState(item?.title ?? "");
  const [subtitle, setSubtitle] = useState(item?.subtitle ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [metaRaw, setMetaRaw] = useState(item?.metadata ? JSON.stringify(item.metadata, null, 2) : "{}");
  const [displayOrder, setDisplayOrder] = useState(item?.display_order?.toString() ?? "0");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const [metaError, setMetaError] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      let metadata: Record<string, any> = {};
      try {
        metadata = JSON.parse(metaRaw);
        setMetaError("");
      } catch {
        setMetaError("Invalid JSON in metadata");
        throw new Error("Invalid JSON");
      }
      const payload = {
        type,
        title: title || null,
        subtitle: subtitle || null,
        description: description || null,
        url: url || null,
        metadata,
        display_order: parseInt(displayOrder) || 0,
        is_active: isActive,
      };
      if (isEdit) {
        const { error } = await (supabase as any).from("media_kit_items").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("media_kit_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media-kit-items"] });
      toast({ title: isEdit ? "Item updated" : "Item created" });
      onClose();
    },
    onError: (err: any) => {
      if (err.message !== "Invalid JSON") {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? "Edit Media Kit Item" : "Add Media Kit Item"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label className="text-[11px] text-crm-text-dim">Type *</Label>
              <Select value={type} onValueChange={setType}>
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
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">
              {type === "event_calendar" ? "Month (e.g. March 2026)" : "Subtitle / Date"}
            </Label>
            <Input value={subtitle} onChange={e => setSubtitle(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">
              {type === "event_calendar" ? "Location / City" : "Description"}
            </Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">URL (download / view link)</Label>
            <Input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://…" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">
              Metadata (JSON — e.g. {"{"}"language": "EN", "size": "4.2 MB"{"}"})</Label>
            <Textarea value={metaRaw} onChange={e => setMetaRaw(e.target.value)}
              rows={3} className={`bg-crm-surface border-crm-border text-crm-text text-xs resize-none font-mono ${metaError ? "border-red-500" : ""}`} />
            {metaError && <p className="text-[10px] text-red-400">{metaError}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Display Order</Label>
              <Input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label className="text-[11px] text-crm-text-dim">Active</Label>
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

function ItemList({ type, label }: { type: string; label: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MediaKitRow | undefined>();
  const [deleting, setDeleting] = useState<MediaKitRow | undefined>();

  const { data: items = [], isLoading } = useQuery<MediaKitRow[]>({
    queryKey: ["media-kit-items", type],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("media_kit_items")
        .select("*")
        .eq("type", type)
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("media_kit_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media-kit-items", type] });
      toast({ title: "Item deleted" });
      setDeleting(undefined);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditing(undefined); setDialogOpen(true); };
  const openEdit = (item: MediaKitRow) => { setEditing(item); setDialogOpen(true); };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-crm-text-dim">{label} ({items.length})</p>
        <Button size="sm" variant="outline" onClick={openCreate}
          className="border-crm-border text-crm-text-muted text-xs gap-1 h-7">
          <Plus size={11} /> Add
        </Button>
      </div>

      {isLoading ? (
        <div className="h-16 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-crm-surface border border-crm-border rounded-lg px-3 py-2">
              <span className="text-crm-text-dim flex-shrink-0">{typeIcon(type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-crm-text truncate">{item.title || "(no title)"}</p>
                {item.subtitle && <p className="text-[10px] text-crm-text-muted">{item.subtitle}</p>}
              </div>
              {!item.is_active && <Badge variant="outline" className="text-[9px] border-crm-border text-crm-text-dim">Hidden</Badge>}
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-crm-text-muted hover:text-crm-text" onClick={() => openEdit(item)}>
                  <Pencil size={11} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-crm-text-muted hover:text-red-400" onClick={() => setDeleting(item)}>
                  <Trash2 size={11} />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-[11px] text-crm-text-dim py-3 text-center">No {label.toLowerCase()} yet</p>
          )}
        </div>
      )}

      <MediaKitDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(undefined); }}
        item={editing ? { ...editing, type } : undefined}
      />

      <AlertDialog open={!!deleting} onOpenChange={o => !o && setDeleting(undefined)}>
        <AlertDialogContent className="bg-crm-card border-crm-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-crm-text text-sm">Delete item?</AlertDialogTitle>
            <AlertDialogDescription className="text-crm-text-muted text-xs">
              This will permanently remove "{deleting?.title}" from the Media Kit page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-crm-border text-crm-text text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && deleteMutation.mutate(deleting.id)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function MediaKitModule() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-crm-text">Media Kit Manager</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">
          Manage press releases, spokespeople, asset packs, and the event calendar shown on the Media Kit page.
        </p>
      </div>

      <Tabs defaultValue="press_release">
        <TabsList className="bg-crm-surface border border-crm-border">
          {ITEM_TYPES.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs data-[state=active]:bg-crm-card">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ITEM_TYPES.map(t => (
          <TabsContent key={t.value} value={t.value} className="mt-4">
            <ItemList type={t.value} label={t.label} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
