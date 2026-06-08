import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Mail, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ImageUploadOrUrl from "@/components/shared/ImageUploadOrUrl";

interface MA {
  id: string; full_name: string; outlet: string; outlet_type: string | null;
  country: string | null; email: string; phone: string | null; bio: string | null;
  status: string; badge_number: string | null; badge_issued_at: string | null;
  expires_at: string | null; review_notes: string | null; created_at: string;
  id_document_url: string | null;
}

const STATUS = ["pending", "approved", "rejected", "revoked"] as const;

const OUTLET_TYPES = ["TV", "Radio", "Print", "Online", "Freelance"] as const;

function Queue() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [outletFilter, setOutletFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sel, setSel] = useState<MA | undefined>();

  const { data: items = [], isLoading } = useQuery<MA[]>({
    queryKey: ["media-accreditations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("media_accreditations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<MA> }) => {
      const { error } = await supabase.from("media_accreditations").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media-accreditations"] });
      toast({ title: "Updated" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const issueBadge = async (m: MA) => {
    const { data: badge } = await supabase.rpc("next_badge_number" as any);
    const expires = new Date(); expires.setFullYear(expires.getFullYear() + 1);
    update.mutate({
      id: m.id,
      payload: {
        status: "approved",
        badge_number: (badge as string) ?? `BADGE-${Date.now()}`,
        badge_issued_at: new Date().toISOString(),
        expires_at: expires.toISOString(),
      },
    });
  };

  const exportCsv = () => {
    const rows = items.map(m => [m.full_name, m.email, m.outlet, m.country, m.status, m.badge_number ?? ""].map(v => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = "Name,Email,Outlet,Country,Status,Badge\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "media-accreditations.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media_accreditations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["media-accreditations"] }); setSel(undefined); toast({ title: "Deleted" }); },
  });

  const distinctCountries = [...new Set(items.map(i => i.country).filter(Boolean))].sort() as string[];
  const statusFiltered = filter === "all" ? items : items.filter(i => i.status === filter);
  const outletFiltered = outletFilter === "all" ? statusFiltered : statusFiltered.filter(i => (i.outlet_type ?? "").toLowerCase() === outletFilter.toLowerCase());
  const filtered = countryFilter === "all" ? outletFiltered : outletFiltered.filter(i => i.country === countryFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} className="text-xs h-7">All ({items.length})</Button>
          {STATUS.map(s => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="text-xs h-7 capitalize">
              {s} ({items.filter(i => i.status === s).length})
            </Button>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv} className="text-xs h-7 gap-1"><Download size={11} /> CSV</Button>
      </div>

      {/* Outlet type + country filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...OUTLET_TYPES] as const).map(t => (
            <button key={t} onClick={() => setOutletFilter(t)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                outletFilter === t
                  ? "bg-blue-950 text-blue-400 border-blue-800"
                  : "bg-crm-surface text-crm-text-dim border-crm-border hover:border-crm-border-hover"
              }`}>
              {t === "all" ? "All outlets" : t}
            </button>
          ))}
        </div>
        {distinctCountries.length > 0 && (
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-7 w-40">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent className="bg-crm-card border-crm-border">
              <SelectItem value="all" className="text-xs">All countries</SelectItem>
              {distinctCountries.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : filtered.length === 0 ? (
        <p className="text-sm text-crm-text-muted text-center py-10">No requests.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} onClick={() => setSel(m)}
              className="bg-crm-card border border-crm-border rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-500/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-crm-text">{m.full_name}</span>
                    <Badge variant="outline" className="text-[10px] capitalize border-crm-border">{m.status}</Badge>
                    {m.badge_number && <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-0">{m.badge_number}</Badge>}
                  </div>
                  <p className="text-[11px] text-crm-text-muted">{m.outlet} · {m.country} · {m.email}</p>
                </div>
                <p className="text-[10px] text-crm-text-dim flex-shrink-0">{new Date(m.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!sel} onOpenChange={o => !o && setSel(undefined)}>
        <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-sm">{sel?.full_name}</DialogTitle></DialogHeader>
          {sel && (
            <div className="space-y-3 text-xs">
              <div><span className="text-crm-text-dim">Outlet:</span> {sel.outlet} ({sel.outlet_type})</div>
              <div><span className="text-crm-text-dim">Email:</span> <a href={`mailto:${sel.email}`} className="text-emerald-400">{sel.email}</a></div>
              {sel.phone && <div><span className="text-crm-text-dim">Phone:</span> {sel.phone}</div>}
              {sel.country && <div><span className="text-crm-text-dim">Country:</span> {sel.country}</div>}
              {sel.bio && <div><p className="text-crm-text-dim mb-1">Bio:</p><p className="bg-crm-surface border border-crm-border rounded-lg p-2">{sel.bio}</p></div>}
              {sel.id_document_url && <a href={sel.id_document_url} target="_blank" rel="noreferrer" className="text-emerald-400 underline">View ID document</a>}
              {sel.badge_number && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                  <p className="font-bold text-emerald-400">Badge: {sel.badge_number}</p>
                  <p className="text-[10px] text-crm-text-dim">Issued {sel.badge_issued_at && new Date(sel.badge_issued_at).toLocaleDateString()} · Expires {sel.expires_at && new Date(sel.expires_at).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <Label className="text-[11px] text-crm-text-dim">Status</Label>
                <Select value={sel.status} onValueChange={v => update.mutate({ id: sel.id, payload: { status: v } })}>
                  <SelectTrigger className="bg-crm-surface border-crm-border text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-crm-card border-crm-border">
                    {STATUS.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-crm-text-dim">Review notes</Label>
                <Textarea defaultValue={sel.review_notes ?? ""} rows={3}
                  onBlur={e => e.target.value !== (sel.review_notes ?? "") && update.mutate({ id: sel.id, payload: { review_notes: e.target.value } })}
                  className="bg-crm-surface border-crm-border text-xs mt-1" />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {sel && !sel.badge_number && sel.status !== "rejected" && (
              <Button size="sm" onClick={() => issueBadge(sel)} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">Approve & Issue Badge</Button>
            )}
            {sel?.badge_number && (
              <Button size="sm" variant="outline" onClick={() => update.mutate({ id: sel.id, payload: { status: "revoked", badge_number: null } })} className="text-xs">Revoke Badge</Button>
            )}
            <Button size="sm" variant="ghost" asChild className="text-xs"><a href={`mailto:${sel?.email}`}><Mail className="h-3 w-3 mr-1" />Reply</a></Button>
            <Button size="sm" variant="ghost" onClick={() => sel && del.mutate(sel.id)} className="text-red-400 text-xs"><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PageEditor() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: row, isLoading } = useQuery({
    queryKey: ["site-content", "media-portal"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("content").eq("section_key", "media-portal").maybeSingle();
      return (data?.content as Record<string, any>) ?? {};
    },
  });
  const [draft, setDraft] = useState<Record<string, any>>({});
  const v = (k: string, fb = "") => (k in draft ? draft[k] : row?.[k] ?? fb);

  const save = useMutation({
    mutationFn: async () => {
      const merged = { ...(row ?? {}), ...draft };
      const { error } = await supabase.from("site_content").upsert(
        { section_key: "media-portal", content: merged } as any, { onConflict: "section_key" }
      );
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site-content", "media-portal"] }); setDraft({}); toast({ title: "Saved" }); },
  });

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin mx-auto" />;

  return (
    <div className="space-y-3 text-xs max-w-2xl">
      <p className="text-[11px] text-crm-text-muted">Controls the /media-portal page widgets and copy.</p>
      {[
        { k: "title", l: "Hero title" }, { k: "subtitle", l: "Hero subtitle" },
        { k: "press_releases_title", l: "Press Releases — title" }, { k: "press_releases_desc", l: "Press Releases — description" },
        { k: "photos_title", l: "Photo Gallery — title" }, { k: "photos_desc", l: "Photo Gallery — description" },
        { k: "briefings_title", l: "Briefings — title" }, { k: "briefings_desc", l: "Briefings — description" },
        { k: "interviews_title", l: "Interviews — title" }, { k: "interviews_desc", l: "Interviews — description" },
        { k: "calendar_title", l: "Calendar — title" }, { k: "calendar_desc", l: "Calendar — description" },
        { k: "liaison_title", l: "Media Liaison — title" }, { k: "liaison_desc", l: "Media Liaison — description" },
        { k: "liaison_email", l: "Media Liaison email" },
      ].map(f => (
        <div key={f.k}>
          <Label className="text-[11px] text-crm-text-dim">{f.l}</Label>
          {f.k.endsWith("desc") ? (
            <Textarea rows={2} value={v(f.k)} onChange={e => setDraft(d => ({ ...d, [f.k]: e.target.value }))} className="bg-crm-surface border-crm-border text-xs mt-1" />
          ) : (
            <Input value={v(f.k)} onChange={e => setDraft(d => ({ ...d, [f.k]: e.target.value }))} className="bg-crm-surface border-crm-border text-xs h-8 mt-1" />
          )}
        </div>
      ))}
      <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending || !Object.keys(draft).length} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
        {save.isPending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

export default function MediaAccreditationModule() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Media Accreditation</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">Review press-pass requests, issue/revoke badges, edit /media-portal copy.</p>
        </div>
        <a href="/media-portal" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-crm-text-dim hover:text-emerald-400"><ExternalLink size={11} /> Open portal</a>
      </div>
      <Tabs defaultValue="queue">
        <TabsList className="bg-crm-surface border border-crm-border h-8">
          <TabsTrigger value="queue" className="text-xs h-7">Request Queue</TabsTrigger>
          <TabsTrigger value="page"  className="text-xs h-7">Page Content</TabsTrigger>
        </TabsList>
        <TabsContent value="queue" className="mt-4"><Queue /></TabsContent>
        <TabsContent value="page"  className="mt-4"><PageEditor /></TabsContent>
      </Tabs>
    </div>
  );
}
