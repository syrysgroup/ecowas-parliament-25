import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface StakeholderRow {
  id: string;
  name: string;
  title: string | null;
  image_url: string | null;
  category: string;
  display_order: number;
  is_active: boolean;
}

const CATEGORIES = ["leadership", "team", "advisory"];

function StakeholderDialog({ open, onClose, stakeholder }: { open: boolean; onClose: () => void; stakeholder?: StakeholderRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!stakeholder;

  const [name, setName] = useState(stakeholder?.name ?? "");
  const [title, setTitle] = useState(stakeholder?.title ?? "");
  const [imageUrl, setImageUrl] = useState(stakeholder?.image_url ?? "");
  const [category, setCategory] = useState(stakeholder?.category ?? "leadership");
  const [displayOrder, setDisplayOrder] = useState(stakeholder?.display_order?.toString() ?? "0");
  const [isActive, setIsActive] = useState(stakeholder?.is_active ?? true);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `stakeholders/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("team-avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("team-avatars").getPublicUrl(path);
      setImageUrl(publicUrl);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        title: title || null,
        image_url: imageUrl || null,
        category,
        display_order: parseInt(displayOrder) || 0,
        is_active: isActive,
      };
      if (isEdit) {
        const { error } = await (supabase as any).from("stakeholder_profiles").update(payload).eq("id", stakeholder.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("stakeholder_profiles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stakeholder-profiles"] });
      toast({ title: isEdit ? "Stakeholder updated" : "Stakeholder created" });
      onClose();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? "Edit Stakeholder" : "Add Stakeholder"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          {/* Photo */}
          <div className="space-y-2">
            <Label className="text-[11px] text-crm-text-dim">Photo</Label>
            {imageUrl && (
              <img src={imageUrl} alt="" className="h-20 w-16 object-cover rounded-lg border border-crm-border" loading="lazy" decoding="async" />
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="border-crm-border text-crm-text-muted text-xs gap-1">
              <ImageIcon size={12} /> {uploading ? "Uploading…" : "Upload Photo"}
            </Button>
            <p className="text-[10px] text-crm-text-dim">Or paste a URL:</p>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="https://…" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Full Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Title / Role</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Speaker of the ECOWAS Parliament"
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="text-crm-text text-xs capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Display Order</Label>
              <Input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-[11px] text-crm-text-dim">Active (visible on public site)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-crm-text-muted">Cancel</Button>
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending || !name}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Stakeholder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StakeholdersModule() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StakeholderRow | undefined>();
  const [deleting, setDeleting] = useState<StakeholderRow | undefined>();

  const { data: stakeholders = [], isLoading } = useQuery<StakeholderRow[]>({
    queryKey: ["stakeholder-profiles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("stakeholder_profiles")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("stakeholder_profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stakeholder-profiles"] });
      toast({ title: "Stakeholder deleted" });
      setDeleting(undefined);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditing(undefined); setDialogOpen(true); };
  const openEdit = (s: StakeholderRow) => { setEditing(s); setDialogOpen(true); };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = stakeholders.filter(s => s.category === cat);
    return acc;
  }, {} as Record<string, StakeholderRow[]>);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Stakeholder Profiles</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            Manage ECOWAS leadership, team, and advisory profiles displayed on the Stakeholders page.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1">
          <Plus size={13} /> Add Profile
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map(cat => {
            const items = grouped[cat] ?? [];
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-crm-text-dim mb-2 capitalize">{cat}</p>
                <div className="space-y-2">
                  {items.map(s => (
                    <div key={s.id} className="flex items-center gap-3 bg-crm-card border border-crm-border rounded-xl px-4 py-3">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          loading="lazy" width={40} height={40} decoding="async" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-crm-surface border border-crm-border flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-crm-text-dim">{s.name.charAt(0) || "?"}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-crm-text">{s.name || "(no name)"}</span>
                          {!s.is_active && <Badge variant="outline" className="text-[10px] text-crm-text-dim border-crm-border">Hidden</Badge>}
                        </div>
                        <p className="text-[11px] text-crm-text-muted">{s.title}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted hover:text-crm-text" onClick={() => openEdit(s)}>
                          <Pencil size={12} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-crm-text-muted hover:text-red-400" onClick={() => setDeleting(s)}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {stakeholders.length === 0 && (
            <p className="text-sm text-crm-text-muted text-center py-10">No profiles yet. Click "Add Profile" to get started.</p>
          )}
        </div>
      )}

      <StakeholderDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(undefined); }}
        stakeholder={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={o => !o && setDeleting(undefined)}>
        <AlertDialogContent className="bg-crm-card border-crm-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-crm-text text-sm">Delete profile?</AlertDialogTitle>
            <AlertDialogDescription className="text-crm-text-muted text-xs">
              This will permanently remove "{deleting?.name}" from the public site.
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
