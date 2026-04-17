import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Image, ExternalLink, FormInput, Ban, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { generateId } from "@/utils/id";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "@/components/ui/sonner";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  location: string | null;
  country: string | null;
  programme: string | null;
  capacity: number | null;
  is_published: boolean;
  cover_image_url: string | null;
  registration_url: string | null;
  registration_type: string;
  tag: string | null;
  tag_color: string | null;
  created_at: string;
}

const TAG_COLORS = [
  { id: "primary", label: "Green", cls: "border-emerald-500/40 text-emerald-400 bg-emerald-500/5" },
  { id: "blue", label: "Blue", cls: "border-blue-500/40 text-blue-400 bg-blue-500/5" },
  { id: "amber", label: "Amber", cls: "border-amber-500/40 text-amber-400 bg-amber-500/5" },
  { id: "red", label: "Red", cls: "border-red-500/40 text-red-400 bg-red-500/5" },
  { id: "violet", label: "Violet", cls: "border-violet-500/40 text-violet-400 bg-violet-500/5" },
];

function getTagClasses(color: string | null) {
  return TAG_COLORS.find(c => c.id === color)?.cls ?? TAG_COLORS[0].cls;
}

const PAGE_SIZE = 20;

function EventDialog({ open, onClose, event }: { open: boolean; onClose: () => void; event?: EventRow }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!event;

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [date, setDate] = useState(event?.date?.slice(0, 16) ?? "");
  const [endDate, setEndDate] = useState(event?.end_date?.slice(0, 16) ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [country, setCountry] = useState(event?.country ?? "");
  const [programme, setProgramme] = useState(event?.programme ?? "");
  const [capacity, setCapacity] = useState(event?.capacity?.toString() ?? "");
  const [isPublished, setIsPublished] = useState(event?.is_published ?? false);
  const [coverUrl, setCoverUrl] = useState(event?.cover_image_url ?? "");
  const [regType, setRegType] = useState(event?.registration_type ?? "none");
  const [regUrl, setRegUrl] = useState(event?.registration_url ?? "");
  const [tag, setTag] = useState(event?.tag ?? "");
  const [tagColor, setTagColor] = useState(event?.tag_color ?? "primary");
  const [uploading, setUploading] = useState(false);
  const [externalLinks, setExternalLinks] = useState<{ title: string; url: string }[]>(() => {
    try {
      const links = (event as any)?.external_links;
      if (Array.isArray(links)) return links;
      return [];
    } catch { return []; }
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${generateId()}.${ext}`;
      const { error } = await supabase.storage.from("event-images").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("event-images").getPublicUrl(path);
      setCoverUrl(publicUrl);
    } finally {
      setUploading(false);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title, description: description || null, date, end_date: endDate || null,
        location: location || null, country: country || null, programme: programme || null,
        capacity: capacity ? parseInt(capacity) : null, is_published: isPublished,
        cover_image_url: coverUrl || null, registration_url: regUrl || null,
        registration_type: regType, tag: tag || null, tag_color: tagColor || null,
        external_links: externalLinks.filter(l => l.url.trim()),
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        await (supabase as any).from("events").update(payload).eq("id", event.id);

        // Sync title/date change to any matching global calendar event
        await (supabase as any).from("crm_calendar_events")
          .update({
            title,
            description: description || null,
            start_time: date,
            end_time: endDate || null,
          })
          .eq("is_global", true)
          .eq("start_time", event.date ?? date)
          .like("title", `%${event.title ?? title}%`);

      } else {
        await (supabase as any).from("events").insert(payload);

        // Auto-add to the global CRM calendar so every user sees it immediately
        if (isPublished) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await (supabase as any).from("crm_calendar_events").insert({
              title,
              description: description
                ? description
                : location
                  ? `📍 ${location}`
                  : null,
              start_time: date,
              end_time: endDate || null,
              all_day: true,
              colour: "blue",
              is_global: true,
              created_by: authUser.id,
            });
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events-manager"] });
      qc.invalidateQueries({ queryKey: ["crm-calendar"] });
      qc.invalidateQueries({ queryKey: ["crm-upcoming-events"] });
      toast("Event saved");
      onClose();
    },
    onError: (err: any) => toast(err.message || "Failed to save"),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? "Edit Event" : "Create Public Event"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label className="text-[11px] text-crm-text-dim">Cover / Design Image</Label>
            {coverUrl && (
              <img src={coverUrl} alt="Cover" className="w-full h-40 object-cover rounded-lg border border-crm-border" />
            )}
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="border-crm-border text-crm-text-muted text-xs gap-1">
                <Image size={12} /> {uploading ? "Uploading…" : "Upload Image"}
              </Button>
              {coverUrl && (
                <Button type="button" variant="outline" size="sm" onClick={() => setCoverUrl("")}
                  className="border-crm-border text-red-400 text-xs">Remove</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Start Date *</Label>
              <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">End Date</Label>
              <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Country</Label>
              <Input value={country} onChange={e => setCountry(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Programme</Label>
              <Input value={programme} onChange={e => setProgramme(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="e.g. Trade, Youth" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Capacity</Label>
              <Input type="number" value={capacity} onChange={e => setCapacity(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Tag Label</Label>
              <Input value={tag} onChange={e => setTag(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" placeholder="e.g. Finance, Trade" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-crm-text-dim">Tag Color</Label>
              <div className="flex gap-1.5 pt-1">
                {TAG_COLORS.map(c => (
                  <button key={c.id} type="button" onClick={() => setTagColor(c.id)}
                    className={`text-[9px] font-mono px-2 py-1 rounded border ${c.cls} ${tagColor === c.id ? "ring-1 ring-white" : "opacity-50"}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={3} />
          </div>

          <div className="space-y-3 bg-crm-surface border border-crm-border rounded-lg p-3">
            <Label className="text-[11px] text-crm-text-dim font-semibold">Registration Type</Label>
            <div className="flex gap-2">
              {[
                { id: "none", label: "No Registration", icon: Ban },
                { id: "external", label: "External URL", icon: ExternalLink },
                { id: "form", label: "Built-in Form", icon: FormInput },
              ].map(rt => (
                <button key={rt.id} type="button" onClick={() => setRegType(rt.id)}
                  className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded border transition-colors ${
                    regType === rt.id
                      ? "bg-emerald-950 text-emerald-400 border-emerald-700"
                      : "bg-crm-card text-crm-text-dim border-crm-border hover:border-crm-border-hover"
                  }`}>
                  <rt.icon size={11} /> {rt.label}
                </button>
              ))}
            </div>
            {regType === "external" && (
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Registration URL</Label>
                <Input value={regUrl} onChange={e => setRegUrl(e.target.value)}
                  className="bg-crm-card border-crm-border text-crm-text text-xs h-8" placeholder="https://..." />
              </div>
            )}
            {regType === "form" && (
              <p className="text-[10px] text-crm-text-dim">Users will register through the built-in event registration form on the website.</p>
            )}
          </div>

          {/* External Links / Media Coverage */}
          <div className="space-y-2 bg-crm-surface border border-crm-border rounded-lg p-3">
            <Label className="text-[11px] text-crm-text-dim font-semibold">External Links / Media Coverage</Label>
            {externalLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input value={link.title} onChange={e => {
                  const next = [...externalLinks];
                  next[i] = { ...next[i], title: e.target.value };
                  setExternalLinks(next);
                }} placeholder="Title" className="bg-crm-card border-crm-border text-crm-text text-xs h-7 flex-1" />
                <Input value={link.url} onChange={e => {
                  const next = [...externalLinks];
                  next[i] = { ...next[i], url: e.target.value };
                  setExternalLinks(next);
                }} placeholder="https://..." className="bg-crm-card border-crm-border text-crm-text text-xs h-7 flex-1" />
                <Button type="button" variant="outline" size="sm" className="border-crm-border text-red-400 text-[10px] h-7 px-2"
                  onClick={() => setExternalLinks(externalLinks.filter((_, j) => j !== i))}>✕</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setExternalLinks([...externalLinks, { title: "", url: "" }])}
              className="border-crm-border text-crm-text-muted text-[10px] h-6 px-2 gap-1">
              <Plus size={10} /> Add Link
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-crm-text-dim">Published on website</Label>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" disabled={!title.trim() || !date || save.isPending} onClick={() => save.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Save" : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EventsManagerModule() {
  const { isAdmin } = useAuthContext();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EventRow | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const { data: events = [], isLoading } = useQuery<EventRow[]>({
    queryKey: ["events-manager"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("events").select("*").order("date", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = events.filter(ev => {
    if (statusFilter === "published" && !ev.is_published) return false;
    if (statusFilter === "draft" && ev.is_published) return false;
    if (search && !ev.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => { await (supabase as any).from("events").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events-manager"] }); setConfirmDeleteId(null); toast("Event deleted"); },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      await (supabase as any).from("events").update({ is_published: published }).eq("id", id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events-manager"] }); toast("Updated"); },
  });

  const bulkDelete = useMutation({
    mutationFn: async () => {
      await Promise.all([...selectedIds].map(id => (supabase as any).from("events").delete().eq("id", id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events-manager"] });
      setSelectedIds(new Set());
      toast("Deleted selected events");
    },
  });

  const bulkPublish = useMutation({
    mutationFn: async (publish: boolean) => {
      await Promise.all([...selectedIds].map(id => (supabase as any).from("events").update({ is_published: publish }).eq("id", id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events-manager"] });
      setSelectedIds(new Set());
      toast("Updated selected events");
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleAll = () => {
    if (selectedIds.size === paged.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paged.map(e => e.id)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Events Manager</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Manage public-facing events with cover images and registration</p>
        </div>
        {canCreate("events") && (
          <Button size="sm" onClick={() => setAddOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> New Event
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-text-dim" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 pl-8" placeholder="Search events..." />
        </div>
        {["all", "published", "draft"].map(f => (
          <button key={f} onClick={() => { setStatusFilter(f as any); setPage(0); }}
            className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-colors ${
              statusFilter === f ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-crm-surface text-crm-text-muted border-crm-border"
            }`}>{f.charAt(0).toUpperCase() + f.slice(1)} ({f === "all" ? events.length : events.filter(e => f === "published" ? e.is_published : !e.is_published).length})</button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 bg-crm-surface border border-crm-border rounded-lg px-3 py-2">
          <span className="text-[11px] text-crm-text-muted">{selectedIds.size} selected</span>
          {canDelete("events") && (
            <Button size="sm" variant="outline" onClick={() => bulkDelete.mutate()}
              className="border-red-800 text-red-400 text-[10px] h-6 px-2">Delete</Button>
          )}
          <Button size="sm" variant="outline" onClick={() => bulkPublish.mutate(true)}
            className="border-emerald-800 text-emerald-400 text-[10px] h-6 px-2">Publish</Button>
          <Button size="sm" variant="outline" onClick={() => bulkPublish.mutate(false)}
            className="border-crm-border text-crm-text-muted text-[10px] h-6 px-2">Unpublish</Button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      <div className="space-y-2">
        {paged.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <Checkbox checked={selectedIds.size === paged.length && paged.length > 0} onCheckedChange={toggleAll} />
            <span className="text-[10px] text-crm-text-dim">Select all</span>
          </div>
        )}
        {paged.map(ev => (
          <div key={ev.id} className="bg-crm-card border border-crm-border rounded-xl overflow-hidden hover:border-crm-border-hover transition-colors">
            <div className="flex items-center">
              <div className="px-3">
                <Checkbox checked={selectedIds.has(ev.id)} onCheckedChange={() => toggleSelect(ev.id)} />
              </div>
              {ev.cover_image_url && (
                <img src={ev.cover_image_url} alt="" className="w-24 h-24 object-cover flex-shrink-0" width={96} height={96} loading="lazy" decoding="async" />
              )}
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-[13px] font-semibold text-crm-text">{ev.title}</p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${ev.is_published ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-crm-surface text-crm-text-muted border-crm-border"}`}>
                    {ev.is_published ? "Published" : "Draft"}
                  </span>
                  {ev.tag && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getTagClasses(ev.tag_color)}`}>{ev.tag}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-crm-text-dim flex-wrap">
                  <span>{format(parseISO(ev.date), "d MMM yyyy, HH:mm")}</span>
                  {ev.location && <span>📍 {ev.location}</span>}
                  {ev.registration_type !== "none" && (
                    <span className="text-emerald-500">
                      {ev.registration_type === "external" ? "🔗 External reg" : "📝 Form reg"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 p-3 flex-shrink-0">
                {canEdit("events") && (
                  <button onClick={() => togglePublish.mutate({ id: ev.id, published: !ev.is_published })}
                    className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors"
                    title={ev.is_published ? "Unpublish" : "Publish"}>
                    {ev.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                )}
                {canEdit("events") && (
                  <button onClick={() => setEditTarget(ev)}
                    className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text-secondary transition-colors">
                    <Pencil size={12} />
                  </button>
                )}
                {canDelete("events") && (
                  confirmDeleteId === ev.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deleteEvent.mutate(ev.id)}
                        className="text-[10px] font-semibold text-red-400 bg-red-950 border border-red-800 rounded px-2 py-1">Delete</button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-2 py-1">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(ev.id)}
                      className="w-7 h-7 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="text-[10px] text-crm-text-muted px-2 py-1 rounded border border-crm-border disabled:opacity-30">Prev</button>
          <span className="text-[10px] text-crm-text-dim">Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="text-[10px] text-crm-text-muted px-2 py-1 rounded border border-crm-border disabled:opacity-30">Next</button>
        </div>
      )}

      {addOpen && <EventDialog open={addOpen} onClose={() => setAddOpen(false)} />}
      {editTarget && <EventDialog open={!!editTarget} onClose={() => setEditTarget(null)} event={editTarget} />}
    </div>
  );
}