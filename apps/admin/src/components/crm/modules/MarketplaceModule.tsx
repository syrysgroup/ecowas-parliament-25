import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingBag, Inbox, MessageSquare, Building2, BarChart3, CheckCircle2, XCircle,
  Pencil, Trash2, Loader2, Star, Plus, Send, Download, Tag,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

// ───────────────── Types ─────────────────
interface Listing {
  id: string; slug: string; title: string; description: string | null;
  country: string | null; status: string; is_featured: boolean;
  seller_name: string; seller_email: string; seller_company: string | null;
  unit: string; price_min: number | null; price_max: number | null; currency: string;
  category_id: string | null; image_url: string | null;
  moq: number | null; available_quantity: number | null;
  spec_tags: string[] | null;
  created_at: string;
}
interface Interest {
  id: string; listing_id: string; buyer_name: string; buyer_email: string;
  buyer_phone: string | null; buyer_country: string | null; buyer_company: string | null;
  quantity: number | null; unit: string | null; size_spec: string | null;
  target_price: number | null; delivery_timeline: string | null;
  message: string | null; status: string; notes: string | null; created_at: string;
  listing?: { title: string; country: string | null } | null;
}
interface Inquiry {
  id: string; listing_id: string; buyer_name: string; buyer_email: string;
  buyer_phone: string | null; buyer_country: string | null; buyer_company: string | null;
  subject: string; status: string; access_token: string; created_at: string;
  listing?: { title: string } | null;
}
interface InquiryMsg {
  id: string; sender_type: string; sender_name: string | null;
  body: string; created_at: string; is_internal: boolean;
}
interface SellerReq {
  id: string; seller_name: string; seller_email: string; seller_phone: string | null;
  seller_company: string | null; country: string | null;
  product_title: string; product_description: string | null;
  unit: string | null; available_quantity: number | null;
  price_min: number | null; price_max: number | null; currency: string | null;
  image_url: string | null; status: string; notes: string | null; created_at: string;
}

const COLORS = ["#006633", "#FFD700", "#CE1126", "#3b82f6", "#8b5cf6", "#f59e0b"];

// ───────────────── CSV ─────────────────
function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const csv = [headers, ...rows].map(r =>
    r.map(c => `"${String(c ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`).join(",")
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ───────────────── Module ─────────────────
export default function MarketplaceModule() {
  const [tab, setTab] = useState("listings");
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />Marketplace
        </h1>
        <p className="text-sm text-muted-foreground">
          ECOWAS Parliament Initiatives is the distributor & guarantor for all marketplace transactions.
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="listings"><ShoppingBag className="h-4 w-4 mr-1.5" />Listings</TabsTrigger>
          <TabsTrigger value="interests"><Inbox className="h-4 w-4 mr-1.5" />Buyer Interests</TabsTrigger>
          <TabsTrigger value="inquiries"><MessageSquare className="h-4 w-4 mr-1.5" />Inquiries</TabsTrigger>
          <TabsTrigger value="sellers"><Building2 className="h-4 w-4 mr-1.5" />Seller Requests</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1.5" />Analytics</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="h-4 w-4 mr-1.5" />Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="listings"><ListingsTab /></TabsContent>
        <TabsContent value="interests"><InterestsTab /></TabsContent>
        <TabsContent value="inquiries"><InquiriesTab /></TabsContent>
        <TabsContent value="sellers"><SellerRequestsTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
        <TabsContent value="categories"><CategoriesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ───────────────── Listings Tab ─────────────────
function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80)
    + "-" + Math.random().toString(36).slice(2, 7);
}

function ListingsTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("marketplace_listings").select("*").order("created_at", { ascending: false });
    setItems((data as never) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("marketplace_listings").update({ status }).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else { toast({ title: `Listing ${status}` }); load(); }
  };
  const toggleFeatured = async (l: Listing) => {
    await supabase.from("marketplace_listings").update({ is_featured: !l.is_featured }).eq("id", l.id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    await supabase.from("marketplace_listings").delete().eq("id", id);
    load();
  };
  const exportCsv = () => {
    downloadCsv("marketplace-listings.csv",
      ["Created", "Title", "Country", "Status", "Featured", "Price min", "Price max", "Currency", "Unit", "MOQ", "Seller", "Seller email"],
      items.map(l => [new Date(l.created_at).toISOString(), l.title, l.country, l.status, l.is_featured ? "yes" : "no",
        l.price_min, l.price_max, l.currency, l.unit, l.moq, l.seller_company || l.seller_name, l.seller_email]));
  };

  const filtered = items.filter(i => filter === "all" || i.status === filter);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({items.length})</SelectItem>
              <SelectItem value="pending">Pending ({items.filter(i => i.status === "pending").length})</SelectItem>
              <SelectItem value="approved">Approved ({items.filter(i => i.status === "approved").length})</SelectItem>
              <SelectItem value="rejected">Rejected ({items.filter(i => i.status === "rejected").length})</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" />New listing</Button>
          <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
        </div>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr><th className="py-2">Title</th><th>Seller (internal)</th><th>Country</th><th>Price</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 font-medium">{l.title}</td>
                    <td>{l.seller_company || l.seller_name}<div className="text-xs text-muted-foreground">{l.seller_email}</div></td>
                    <td>{l.country}</td>
                    <td>{l.price_min ? `${l.currency} ${l.price_min}–${l.price_max ?? l.price_min}` : "—"}</td>
                    <td><Badge variant={l.status === "approved" ? "default" : l.status === "pending" ? "secondary" : "destructive"}>{l.status}</Badge></td>
                    <td className="flex gap-1 py-2">
                      {l.status !== "approved" && <Button size="sm" variant="ghost" onClick={() => setStatus(l.id, "approved")} title="Approve"><CheckCircle2 className="h-4 w-4 text-green-600" /></Button>}
                      {l.status !== "rejected" && <Button size="sm" variant="ghost" onClick={() => setStatus(l.id, "rejected")} title="Reject"><XCircle className="h-4 w-4 text-destructive" /></Button>}
                      <Button size="sm" variant="ghost" onClick={() => toggleFeatured(l)} title="Feature"><Star className={`h-4 w-4 ${l.is_featured ? "fill-yellow-400 text-yellow-500" : ""}`} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(l)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No listings</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {editing && <ListingDialog listing={editing} onClose={() => { setEditing(null); load(); }} />}
      {creating && <ListingDialog onClose={() => { setCreating(false); load(); }} />}
    </Card>
  );
}

function ListingDialog({ listing, onClose, prefill }: { listing?: Listing; onClose: () => void; prefill?: Partial<Listing> }) {
  const { toast } = useToast();
  const isNew = !listing;
  const [f, setF] = useState<Partial<Listing>>(listing ?? {
    title: "", description: "", country: "", status: "approved", is_featured: false,
    seller_name: "", seller_email: "", seller_company: "",
    unit: "units", currency: "USD", spec_tags: [],
    ...prefill,
  });
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `crm/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const { error } = await supabase.storage.from("marketplace-media").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("marketplace-media").getPublicUrl(path);
      setF(p => ({ ...p, image_url: data.publicUrl }));
    }
    setUploading(false);
  };

  const save = async () => {
    if (!f.title || !f.seller_name || !f.seller_email) {
      toast({ title: "Missing fields", description: "Title, seller name, and seller email are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...f };
    if (isNew && !payload.slug) payload.slug = slugify(f.title!);
    const op = isNew
      ? supabase.from("marketplace_listings").insert(payload as never)
      : supabase.from("marketplace_listings").update(payload as never).eq("id", listing!.id);
    const { error } = await op;
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else { toast({ title: isNew ? "Listing created" : "Saved" }); onClose(); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? "New listing" : "Edit listing"}</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          Internal seller details stay private — buyers only see ECOWAS as the distributor.
        </p>
        <div className="space-y-3">
          <div><Label>Title *</Label><Input value={f.title ?? ""} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={4} value={f.description ?? ""} onChange={e => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Country</Label><Input value={f.country ?? ""} onChange={e => setF({ ...f, country: e.target.value })} /></div>
            <div><Label>Status</Label>
              <Select value={f.status ?? "approved"} onValueChange={v => setF({ ...f, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 border-t pt-3"><h4 className="text-xs uppercase font-bold text-muted-foreground">Internal seller (private)</h4></div>
            <div><Label>Seller name *</Label><Input value={f.seller_name ?? ""} onChange={e => setF({ ...f, seller_name: e.target.value })} /></div>
            <div><Label>Seller email *</Label><Input value={f.seller_email ?? ""} onChange={e => setF({ ...f, seller_email: e.target.value })} /></div>
            <div className="col-span-2"><Label>Seller company</Label><Input value={f.seller_company ?? ""} onChange={e => setF({ ...f, seller_company: e.target.value })} /></div>
            <div className="col-span-2 border-t pt-3"><h4 className="text-xs uppercase font-bold text-muted-foreground">Product details</h4></div>
            <div><Label>Unit</Label><Input value={f.unit ?? ""} onChange={e => setF({ ...f, unit: e.target.value })} /></div>
            <div><Label>Currency</Label><Input value={f.currency ?? "USD"} onChange={e => setF({ ...f, currency: e.target.value })} /></div>
            <div><Label>MOQ</Label><Input type="number" value={f.moq ?? ""} onChange={e => setF({ ...f, moq: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>Available qty</Label><Input type="number" value={f.available_quantity ?? ""} onChange={e => setF({ ...f, available_quantity: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>Price min</Label><Input type="number" value={f.price_min ?? ""} onChange={e => setF({ ...f, price_min: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>Price max</Label><Input type="number" value={f.price_max ?? ""} onChange={e => setF({ ...f, price_max: e.target.value ? Number(e.target.value) : null })} /></div>
          </div>
          <div>
            <Label>Spec tags</Label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); setF({ ...f, spec_tags: [...(f.spec_tags ?? []), tagInput.trim()] }); setTagInput(""); }}}
                placeholder="grade A, 25kg, organic…" />
              <Button type="button" variant="outline" onClick={() => { if (tagInput.trim()) { setF({ ...f, spec_tags: [...(f.spec_tags ?? []), tagInput.trim()] }); setTagInput(""); }}}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {(f.spec_tags ?? []).map((t, i) => (
                <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setF({ ...f, spec_tags: f.spec_tags!.filter((_, j) => j !== i) })}>
                  {t} ×
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Image</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" disabled={uploading} onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {f.image_url && <img src={f.image_url} className="h-12 w-12 object-cover rounded" alt="" />}
            </div>
            <Input className="mt-2" placeholder="or paste image URL" value={f.image_url ?? ""} onChange={e => setF({ ...f, image_url: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────── Interests Tab ─────────────────
function InterestsTab() {
  const [items, setItems] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<Interest | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("marketplace_interests")
      .select("*, listing:marketplace_listings(title, country)")
      .order("created_at", { ascending: false });
    setItems((data as never) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("marketplace_interests").update({ status }).eq("id", id);
    load();
  };
  const filtered = items.filter(i => filter === "all" || i.status === filter);

  const exportCsv = () => downloadCsv("marketplace-interests.csv",
    ["Created", "Listing", "Buyer", "Email", "Phone", "Country", "Company", "Quantity", "Unit", "Size", "Target Price", "Timeline", "Status", "Message"],
    filtered.map(i => [new Date(i.created_at).toISOString(), i.listing?.title, i.buyer_name, i.buyer_email,
      i.buyer_phone, i.buyer_country, i.buyer_company, i.quantity, i.unit, i.size_spec, i.target_price, i.delivery_timeline, i.status, i.message]));

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({items.length})</SelectItem>
              <SelectItem value="new">New ({items.filter(i => i.status === "new").length})</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
        </div>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr><th className="py-2">Date</th><th>Listing</th><th>Buyer</th><th>Quantity</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setActive(i)}>
                    <td className="py-3 text-xs">{new Date(i.created_at).toLocaleDateString()}</td>
                    <td>{i.listing?.title}</td>
                    <td>{i.buyer_name}<div className="text-xs text-muted-foreground">{i.buyer_email}</div></td>
                    <td>{i.quantity ? `${i.quantity} ${i.unit ?? ""}` : "—"}</td>
                    <td><Badge variant={i.status === "new" ? "default" : "secondary"}>{i.status}</Badge></td>
                    <td onClick={e => e.stopPropagation()} className="flex gap-1 py-2">
                      {i.status !== "contacted" && <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "contacted")}>Mark contacted</Button>}
                      {i.status !== "closed" && <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "closed")}>Close</Button>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No enquiries yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {active && (
        <Dialog open onOpenChange={() => setActive(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{active.buyer_name}</DialogTitle></DialogHeader>
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <dt className="text-muted-foreground">Listing</dt><dd className="col-span-2">{active.listing?.title}</dd>
              <dt className="text-muted-foreground">Email</dt><dd className="col-span-2">{active.buyer_email}</dd>
              <dt className="text-muted-foreground">Phone</dt><dd className="col-span-2">{active.buyer_phone || "—"}</dd>
              <dt className="text-muted-foreground">Country</dt><dd className="col-span-2">{active.buyer_country || "—"}</dd>
              <dt className="text-muted-foreground">Company</dt><dd className="col-span-2">{active.buyer_company || "—"}</dd>
              <dt className="text-muted-foreground">Quantity</dt><dd className="col-span-2">{active.quantity ? `${active.quantity} ${active.unit ?? ""}` : "—"}</dd>
              <dt className="text-muted-foreground">Size/spec</dt><dd className="col-span-2">{active.size_spec || "—"}</dd>
              <dt className="text-muted-foreground">Target price</dt><dd className="col-span-2">{active.target_price ?? "—"}</dd>
              <dt className="text-muted-foreground">Timeline</dt><dd className="col-span-2">{active.delivery_timeline || "—"}</dd>
              <dt className="text-muted-foreground">Message</dt><dd className="col-span-2 whitespace-pre-line">{active.message || "—"}</dd>
            </dl>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

// ───────────────── Inquiries Tab ─────────────────
function InquiriesTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<Inquiry | null>(null);
  const [messages, setMessages] = useState<InquiryMsg[]>([]);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("marketplace_inquiries")
      .select("*, listing:marketplace_listings(title)")
      .order("created_at", { ascending: false });
    setItems((data as never) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openThread = async (inq: Inquiry) => {
    setActive(inq);
    const { data } = await supabase.from("marketplace_inquiry_messages")
      .select("*").eq("inquiry_id", inq.id).order("created_at", { ascending: true });
    setMessages((data as never) || []);
  };

  const send = async () => {
    if (!active || !reply.trim()) return;
    setSending(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("marketplace_inquiry_messages").insert({
      inquiry_id: active.id, sender_type: "crm",
      sender_name: u.user?.email ?? "ECOWAS Trade Desk",
      sender_email: u.user?.email ?? null,
      body: reply.trim(), is_internal: internal,
    } as never);
    setSending(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    setReply("");
    openThread(active);
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("marketplace_inquiries").update({ status }).eq("id", id);
    load();
    if (active?.id === id) setActive({ ...active, status });
  };

  const filtered = items.filter(i => filter === "all" || i.status === filter);

  const exportCsv = () => downloadCsv("marketplace-inquiries.csv",
    ["Created", "Listing", "Subject", "Buyer", "Email", "Phone", "Country", "Status"],
    filtered.map(i => [new Date(i.created_at).toISOString(), i.listing?.title, i.subject,
      i.buyer_name, i.buyer_email, i.buyer_phone, i.buyer_country, i.status]));

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({items.length})</SelectItem>
              <SelectItem value="open">Open ({items.filter(i => i.status === "open").length})</SelectItem>
              <SelectItem value="in_review">In review</SelectItem>
              <SelectItem value="forwarded">Forwarded to seller</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
        </div>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr><th className="py-2">Date</th><th>Subject</th><th>Listing</th><th>Buyer</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => openThread(i)}>
                    <td className="py-3 text-xs">{new Date(i.created_at).toLocaleDateString()}</td>
                    <td className="font-medium">{i.subject}</td>
                    <td>{i.listing?.title}</td>
                    <td>{i.buyer_name}<div className="text-xs text-muted-foreground">{i.buyer_email}</div></td>
                    <td><Badge variant={i.status === "open" ? "default" : "secondary"}>{i.status}</Badge></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No inquiries yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {active && (
        <Dialog open onOpenChange={() => setActive(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{active.subject}</DialogTitle>
            </DialogHeader>
            <div className="text-xs text-muted-foreground">
              {active.buyer_name} · {active.buyer_email} · {active.buyer_phone || "no phone"} · {active.buyer_country || "—"}
              {active.listing && <> · Listing: <strong>{active.listing.title}</strong></>}
            </div>
            <div className="flex gap-2">
              {["open", "in_review", "forwarded", "closed"].map(s => (
                <Button key={s} size="sm" variant={active.status === s ? "default" : "outline"} onClick={() => setStatus(active.id, s)}>{s}</Button>
              ))}
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto border rounded-lg p-3">
              {messages.map(m => (
                <div key={m.id} className={`rounded p-2 ${m.is_internal ? "bg-yellow-50 border border-yellow-300" : m.sender_type === "buyer" ? "bg-muted/40" : "bg-primary/5"}`}>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">
                    {m.sender_type} {m.is_internal && "(internal)"} · {new Date(m.created_at).toLocaleString()}
                  </div>
                  <p className="text-sm whitespace-pre-line">{m.body}</p>
                </div>
              ))}
              {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No messages</p>}
            </div>
            <Textarea rows={4} value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply to buyer (or add internal note)…" />
            <div className="flex items-center justify-between">
              <label className="text-xs flex items-center gap-1.5">
                <input type="checkbox" checked={internal} onChange={e => setInternal(e.target.checked)} />
                Internal note (hidden from buyer)
              </label>
              <Button onClick={send} disabled={sending || !reply.trim()}>
                {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Send
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

// ───────────────── Seller Requests Tab ─────────────────
function SellerRequestsTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<SellerReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertFrom, setConvertFrom] = useState<SellerReq | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("marketplace_seller_requests").select("*").order("created_at", { ascending: false });
    setItems((data as never) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("marketplace_seller_requests").update({ status }).eq("id", id);
    load();
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr><th className="py-2">Date</th><th>Seller</th><th>Country</th><th>Product</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>{r.seller_company || r.seller_name}<div className="text-xs text-muted-foreground">{r.seller_email}</div></td>
                    <td>{r.country}</td>
                    <td>{r.product_title}</td>
                    <td><Badge variant={r.status === "pending" ? "secondary" : "default"}>{r.status}</Badge></td>
                    <td className="flex gap-1 py-2">
                      <Button size="sm" variant="outline" onClick={() => setConvertFrom(r)}>Convert to listing</Button>
                      {r.status !== "rejected" && <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "rejected")}><XCircle className="h-4 w-4 text-destructive" /></Button>}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No seller requests yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {convertFrom && (
        <ListingDialog
          prefill={{
            title: convertFrom.product_title, description: convertFrom.product_description,
            country: convertFrom.country, seller_name: convertFrom.seller_name,
            seller_email: convertFrom.seller_email, seller_company: convertFrom.seller_company,
            unit: convertFrom.unit ?? "units", currency: convertFrom.currency ?? "USD",
            available_quantity: convertFrom.available_quantity, price_min: convertFrom.price_min,
            price_max: convertFrom.price_max, image_url: convertFrom.image_url, status: "approved",
          } as Partial<Listing>}
          onClose={async () => {
            await supabase.from("marketplace_seller_requests").update({ status: "approved" }).eq("id", convertFrom.id);
            setConvertFrom(null); load();
            toast({ title: "Request approved" });
          }}
        />
      )}
    </Card>
  );
}

// ───────────────── Analytics Tab ─────────────────
function AnalyticsTab() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<{ views: { created_at: string; listing_id: string; country: string | null }[];
    interests: Interest[]; inquiries: Inquiry[]; listings: Listing[] }>({ views: [], interests: [], inquiries: [], listings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const [v, i, q, l] = await Promise.all([
        supabase.from("marketplace_listing_views").select("created_at, listing_id, country").gte("created_at", since),
        supabase.from("marketplace_interests").select("*, listing:marketplace_listings(title, country)").gte("created_at", since),
        supabase.from("marketplace_inquiries").select("*, listing:marketplace_listings(title)").gte("created_at", since),
        supabase.from("marketplace_listings").select("*"),
      ]);
      setData({
        views: (v.data as never) || [], interests: (i.data as never) || [],
        inquiries: (q.data as never) || [], listings: (l.data as never) || [],
      });
      setLoading(false);
    })();
  }, [days]);

  const kpis = useMemo(() => {
    const v = data.views.length, i = data.interests.length, q = data.inquiries.length;
    const approved = data.listings.filter(l => l.status === "approved").length;
    return {
      views: v, interests: i, inquiries: q, approved,
      v2i: v ? ((i / v) * 100).toFixed(1) : "0",
      i2c: i ? ((data.interests.filter(x => x.status === "closed").length / i) * 100).toFixed(1) : "0",
    };
  }, [data]);

  const timeSeries = useMemo(() => {
    const map = new Map<string, { date: string; views: number; interests: number }>();
    for (let d = days - 1; d >= 0; d--) {
      const k = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
      map.set(k, { date: k, views: 0, interests: 0 });
    }
    data.views.forEach(v => { const k = v.created_at.slice(0,10); const e = map.get(k); if (e) e.views++; });
    data.interests.forEach(i => { const k = i.created_at.slice(0,10); const e = map.get(k); if (e) e.interests++; });
    return Array.from(map.values());
  }, [data, days]);

  const byCountry = useMemo(() => {
    const map = new Map<string, number>();
    data.listings.filter(l => l.status === "approved").forEach(l => {
      const c = l.country ?? "Unknown"; map.set(c, (map.get(c) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([country, count]) => ({ country, count })).sort((a,b) => b.count - a.count);
  }, [data]);

  const interestStatus = useMemo(() => {
    const map = new Map<string, number>();
    data.interests.forEach(i => map.set(i.status, (map.get(i.status) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (loading) return <Card><CardContent className="p-6"><Loader2 className="h-5 w-5 animate-spin" /></CardContent></Card>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={String(days)} onValueChange={v => setDays(Number(v))}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => downloadCsv("marketplace-analytics.csv",
          ["Date","Views","Interests"], timeSeries.map(t => [t.date, t.views, t.interests]))}>
          <Download className="h-4 w-4 mr-1" />Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Views", value: kpis.views },
          { label: "Interests", value: kpis.interests },
          { label: "Inquiries", value: kpis.inquiries },
          { label: "Approved listings", value: kpis.approved },
          { label: "View → Interest", value: `${kpis.v2i}%` },
          { label: "Interest → Closed", value: `${kpis.i2c}%` },
        ].map((k, idx) => (
          <Card key={idx}><CardContent className="p-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">{k.label}</div>
            <div className="text-2xl font-extrabold mt-1">{k.value}</div>
          </CardContent></Card>
        ))}
      </div>

      <Card><CardContent className="p-4">
        <h3 className="font-bold mb-3">Views & interests over time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={timeSeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#006633" strokeWidth={2} />
            <Line type="monotone" dataKey="interests" stroke="#CE1126" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent></Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-4">
          <h3 className="font-bold mb-3">Approved listings by country</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCountry}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#006633" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <h3 className="font-bold mb-3">Interest status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={interestStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {interestStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>
    </div>
  );
}

// ───────────────── Categories Tab ─────────────────
interface Category { id: string; name: string; slug: string; sort_order: number; created_at: string; }

function slugifySimple(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

function CategoriesTab() {
  const { toast } = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", sort_order: "0" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("marketplace_categories").select("*").order("sort_order").order("name");
    setCats(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ name: "", slug: "", sort_order: String(cats.length) });
    setEditing(null);
    setShowAdd(true);
  };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, slug: c.slug, sort_order: String(c.sort_order) });
    setEditing(c);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugifySimple(form.name),
      sort_order: parseInt(form.sort_order, 10) || 0,
    };
    const { error } = editing
      ? await supabase.from("marketplace_categories").update(payload).eq("id", editing.id)
      : await supabase.from("marketplace_categories").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Category updated" : "Category added" });
    setShowAdd(false);
    load();
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"? Listings in this category will become uncategorised.`)) return;
    const { error } = await supabase.from("marketplace_categories").delete().eq("id", c.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Category deleted" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Categories appear as filters on the public marketplace page. Deleting a category un-categorises its listings.
        </p>
        <Button size="sm" className="gap-1" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {cats.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{c.slug}</p>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">#{c.sort_order}</Badge>
              <div className="flex gap-1 flex-shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(c)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {cats.length === 0 && (
            <p className="text-center text-muted-foreground py-10 text-sm">No categories yet. Add one to get started.</p>
          )}
        </div>
      )}
      <Dialog open={showAdd} onOpenChange={v => !v && setShowAdd(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => {
                const name = e.target.value;
                setForm(f => ({ ...f, name, slug: editing ? f.slug : slugifySimple(name) }));
              }} placeholder="e.g. Agriculture & Food" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="agriculture-food" />
              <p className="text-xs text-muted-foreground">URL-safe identifier. Auto-filled from name.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} min="0" />
              <p className="text-xs text-muted-foreground">Lower number = appears first in filter list.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="gap-1">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
