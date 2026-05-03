import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ECOWAS_COUNTRIES } from "@/lib/validation/marketplace";
import { CheckCircle2, Loader2, Plus, Upload } from "lucide-react";

interface Cat { id: string; name: string }

export default function SellerListingDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [cats, setCats] = useState<Cat[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    business_name: "", country: "", category_id: "", product_title: "",
    product_description: "", seller_email: "", seller_phone: "",
  });

  useEffect(() => {
    if (!open) return;
    supabase.from("marketplace_categories").select("id, name").order("sort_order")
      .then(({ data }) => setCats((data as Cat[]) || []));
  }, [open]);

  const u = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const required: (keyof typeof form)[] = ["business_name", "country", "category_id", "product_title", "product_description", "seller_email"];
  const missing = (k: keyof typeof form) => !form[k]?.toString().trim();
  const emailBad = !/.+@.+\..+/.test(form.seller_email);

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setDone(false); setTouched(false); setImageFile(null);
      setForm({ business_name: "", country: "", category_id: "", product_title: "", product_description: "", seller_email: "", seller_phone: "" });
    }
  };

  const submit = async () => {
    setTouched(true);
    if (required.some(missing) || emailBad) {
      toast({ title: "Please complete required fields", variant: "destructive" });
      return;
    }
    if (form.product_description.length > 300) {
      toast({ title: "Description too long", description: "Maximum 300 characters.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    let image_url: string | null = null;
    if (imageFile) {
      const path = `seller-requests/${crypto.randomUUID()}-${imageFile.name}`;
      const { error: upErr } = await supabase.storage.from("marketplace-media").upload(path, imageFile);
      if (!upErr) {
        const { data } = supabase.storage.from("marketplace-media").getPublicUrl(path);
        image_url = data.publicUrl;
      }
    }
    const { error } = await supabase.from("marketplace_seller_requests").insert({
      seller_company: form.business_name.trim(),
      seller_name: form.business_name.trim(),
      country: form.country,
      category_id: form.category_id,
      product_title: form.product_title.trim(),
      product_description: form.product_description.trim(),
      seller_email: form.seller_email.trim(),
      seller_phone: form.seller_phone.trim() || null,
      image_url,
      status: "pending",
    } as never);
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't submit listing", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: "Listing received", description: "ECOWAS Trade Network will review and publish shortly." });
  };

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />List your product</SheetTitle></SheetHeader>
        {done ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-bold">Listing received</h3>
            <p className="text-sm text-muted-foreground">The ECOWAS Trade Network team will review and publish your listing shortly. You'll receive a confirmation email at <strong>{form.seller_email}</strong>.</p>
            <Button className="w-full" onClick={() => close(false)}>Done</Button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div>
              <Label>Business name *</Label>
              <Input value={form.business_name} onChange={e => u("business_name", e.target.value)}
                className={touched && missing("business_name") ? "border-destructive" : ""} />
            </div>
            <div>
              <Label>ECOWAS member state *</Label>
              <Select value={form.country} onValueChange={v => u("country", v)}>
                <SelectTrigger className={touched && missing("country") ? "border-destructive" : ""}><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>{ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category_id} onValueChange={v => u("category_id", v)}>
                <SelectTrigger className={touched && missing("category_id") ? "border-destructive" : ""}><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product / service name *</Label>
              <Input value={form.product_title} onChange={e => u("product_title", e.target.value)}
                className={touched && missing("product_title") ? "border-destructive" : ""} />
            </div>
            <div>
              <Label>Description * <span className="text-xs text-muted-foreground">({form.product_description.length}/300)</span></Label>
              <Textarea rows={4} maxLength={300} value={form.product_description} onChange={e => u("product_description", e.target.value)}
                className={touched && missing("product_description") ? "border-destructive" : ""} />
            </div>
            <div>
              <Label>Contact email *</Label>
              <Input type="email" value={form.seller_email} onChange={e => u("seller_email", e.target.value)}
                className={touched && (missing("seller_email") || emailBad) ? "border-destructive" : ""} />
            </div>
            <div>
              <Label>WhatsApp number</Label>
              <Input value={form.seller_phone} onChange={e => u("seller_phone", e.target.value)} placeholder="+234..." />
            </div>
            <div>
              <Label>Product image</Label>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
              <Button type="button" variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />{imageFile ? imageFile.name : "Upload image"}
              </Button>
            </div>
            <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Submit listing
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
