import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sellerSchema, ECOWAS_COUNTRIES, slugify } from "@/lib/validation/marketplace";
import { ArrowLeft, Loader2, Upload, CheckCircle2 } from "lucide-react";

export default function SellForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category_id: "", country: "",
    seller_name: "", seller_email: "", seller_phone: "", seller_company: "",
    unit: "units", moq: "", available_quantity: "",
    price_min: "", price_max: "", currency: "USD", image_url: "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.from("marketplace_categories").select("id, name").order("sort_order")
      .then(({ data }) => setCats((data as never) || []));
  }, []);

  const onUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("marketplace-media").upload(path, file, { upsert: false });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("marketplace-media").getPublicUrl(path);
      update("image_url", data.publicUrl);
    }
    setUploading(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = sellerSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Please review the form", description: parsed.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload: Record<string, unknown> = { slug: slugify(parsed.data.title), status: "pending" };
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v === "" || (typeof v === "number" && Number.isNaN(v))) continue;
      payload[k] = v;
    }
    const { error } = await supabase.from("marketplace_listings").insert(payload as never);
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't submit", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <Layout>
        <div className="container py-24 max-w-xl text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3">Submission received</h1>
          <p className="text-muted-foreground mb-6">Our trade team will review your listing and publish it shortly. We may contact you to verify details.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/marketplace")}>Back to marketplace</Button>
            <Button variant="outline" onClick={() => { setDone(false); setForm(f => ({ ...f, title: "", description: "" })); }}>List another</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout seoTitle="List your goods — West Africa Marketplace">
      <div className="container py-10 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/marketplace"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <AnimatedSection>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">List your goods</h1>
          <p className="text-muted-foreground mb-8">SMEs across the 15 ECOWAS nations can post here. Submissions are reviewed before going live.</p>
        </AnimatedSection>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label>Product title *</Label>
            <Input required value={form.title} onChange={e => update("title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea required rows={5} value={form.description} onChange={e => update("description", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={v => update("category_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Country of origin *</Label>
              <Select value={form.country} onValueChange={v => update("country", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Seller / contact name *</Label>
              <Input required value={form.seller_name} onChange={e => update("seller_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Seller email *</Label>
              <Input type="email" required value={form.seller_email} onChange={e => update("seller_email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone / WhatsApp</Label>
              <Input value={form.seller_phone} onChange={e => update("seller_phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={form.seller_company} onChange={e => update("seller_company", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit *</Label>
              <Input required value={form.unit} onChange={e => update("unit", e.target.value)} placeholder="tonnes / kg / units" />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input value={form.currency} onChange={e => update("currency", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>MOQ</Label>
              <Input type="number" min="0" step="any" value={form.moq} onChange={e => update("moq", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Available quantity</Label>
              <Input type="number" min="0" step="any" value={form.available_quantity} onChange={e => update("available_quantity", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Price (min)</Label>
              <Input type="number" min="0" step="any" value={form.price_min} onChange={e => update("price_min", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Price (max)</Label>
              <Input type="number" min="0" step="any" value={form.price_max} onChange={e => update("price_max", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Product image</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" disabled={uploading} onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {form.image_url && <img src={form.image_url} alt="preview" className="h-12 w-12 object-cover rounded" />}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Submit for review
          </Button>
        </form>
      </div>
    </Layout>
  );
}