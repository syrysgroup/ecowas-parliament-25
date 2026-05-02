import { useEffect, useState } from "react";
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
import { ShoppingBag, Inbox, CheckCircle2, XCircle, Pencil, Trash2, Loader2, Star } from "lucide-react";

interface Listing {
  id: string; slug: string; title: string; description: string | null;
  country: string | null; status: string; is_featured: boolean;
  seller_name: string; seller_email: string; seller_company: string | null;
  unit: string; price_min: number | null; price_max: number | null; currency: string;
  category_id: string | null; image_url: string | null;
  moq: number | null; available_quantity: number | null;
  created_at: string;
}

interface Interest {
  id: string; listing_id: string; buyer_name: string; buyer_email: string;
  buyer_phone: string | null; buyer_country: string | null; buyer_company: string | null;
  quantity: number | null; unit: string | null; size_spec: string | null;
  target_price: number | null; delivery_timeline: string | null;
  message: string | null; status: string; notes: string | null; created_at: string;
  listing?: { title: string } | null;
}

export default function MarketplaceModule() {
  const [tab, setTab] = useState("listings");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary" />Marketplace</h1>
        <p className="text-sm text-muted-foreground">Manage SME listings and buyer enquiries from the West Africa marketplace.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="listings"><ShoppingBag className="h-4 w-4 mr-1.5" />Listings</TabsTrigger>
          <TabsTrigger value="interests"><Inbox className="h-4 w-4 mr-1.5" />Buyer Interests</TabsTrigger>
        </TabsList>
        <TabsContent value="listings"><ListingsTab /></TabsContent>
        <TabsContent value="interests"><InterestsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ListingsTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Listing | null>(null);
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

  const filtered = items.filter(i => filter === "all" || i.status === filter);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({items.length})</SelectItem>
              <SelectItem value="pending">Pending ({items.filter(i => i.status === "pending").length})</SelectItem>
              <SelectItem value="approved">Approved ({items.filter(i => i.status === "approved").length})</SelectItem>
              <SelectItem value="rejected">Rejected ({items.filter(i => i.status === "rejected").length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr><th className="py-2">Title</th><th>Seller</th><th>Country</th><th>Price</th><th>Status</th><th></th></tr>
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
      {editing && <EditDialog listing={editing} onClose={() => { setEditing(null); load(); }} />}
    </Card>
  );
}

function EditDialog({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { toast } = useToast();
  const [f, setF] = useState(listing);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("marketplace_listings").update({
      title: f.title, description: f.description, country: f.country,
      seller_name: f.seller_name, seller_email: f.seller_email, seller_company: f.seller_company,
      unit: f.unit, moq: f.moq, available_quantity: f.available_quantity,
      price_min: f.price_min, price_max: f.price_max, currency: f.currency,
      image_url: f.image_url,
    }).eq("id", listing.id);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Saved" }); onClose(); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit listing</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={4} value={f.description ?? ""} onChange={e => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Country</Label><Input value={f.country ?? ""} onChange={e => setF({ ...f, country: e.target.value })} /></div>
            <div><Label>Unit</Label><Input value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })} /></div>
            <div><Label>Seller name</Label><Input value={f.seller_name} onChange={e => setF({ ...f, seller_name: e.target.value })} /></div>
            <div><Label>Seller email</Label><Input value={f.seller_email} onChange={e => setF({ ...f, seller_email: e.target.value })} /></div>
            <div><Label>Seller company</Label><Input value={f.seller_company ?? ""} onChange={e => setF({ ...f, seller_company: e.target.value })} /></div>
            <div><Label>Currency</Label><Input value={f.currency} onChange={e => setF({ ...f, currency: e.target.value })} /></div>
            <div><Label>MOQ</Label><Input type="number" value={f.moq ?? ""} onChange={e => setF({ ...f, moq: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>Available</Label><Input type="number" value={f.available_quantity ?? ""} onChange={e => setF({ ...f, available_quantity: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>Price min</Label><Input type="number" value={f.price_min ?? ""} onChange={e => setF({ ...f, price_min: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>Price max</Label><Input type="number" value={f.price_max ?? ""} onChange={e => setF({ ...f, price_max: e.target.value ? Number(e.target.value) : null })} /></div>
          </div>
          <div><Label>Image URL</Label><Input value={f.image_url ?? ""} onChange={e => setF({ ...f, image_url: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InterestsTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<Interest | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("marketplace_interests")
      .select("*, listing:marketplace_listings(title)")
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

  const exportCsv = () => {
    const headers = ["Created", "Listing", "Buyer", "Email", "Phone", "Country", "Company", "Quantity", "Unit", "Size", "Target Price", "Timeline", "Status", "Message"];
    const rows = filtered.map(i => [
      new Date(i.created_at).toISOString(), i.listing?.title ?? "", i.buyer_name, i.buyer_email,
      i.buyer_phone ?? "", i.buyer_country ?? "", i.buyer_company ?? "", i.quantity ?? "", i.unit ?? "",
      i.size_spec ?? "", i.target_price ?? "", i.delivery_timeline ?? "", i.status, (i.message ?? "").replace(/\n/g, " "),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `marketplace-interests-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported" });
  };

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
          <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
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