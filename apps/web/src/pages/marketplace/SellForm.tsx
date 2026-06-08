import { useState } from "react";
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
import { sellerRequestSchema, ECOWAS_COUNTRIES } from "@/lib/validation/marketplace";
import { ArrowLeft, Loader2, Send, CheckCircle2, ShieldCheck, Globe2, Handshake } from "lucide-react";

export default function SellForm() {
 const { toast } = useToast();
 const navigate = useNavigate();
 const [submitting, setSubmitting] = useState(false);
 const [done, setDone] = useState(false);
 const [form, setForm] = useState({
 seller_name: "", seller_email: "", seller_phone: "", seller_company: "", country: "",
 product_title: "", product_description: "",
 unit: "units", available_quantity: "", price_min: "", price_max: "", currency: "USD",
 image_url: "", notes: "",
 });
 const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

 const onSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 const parsed = sellerRequestSchema.safeParse(form);
 if (!parsed.success) {
 toast({ title: "Please review the form", description: parsed.error.issues[0]?.message, variant: "destructive" });
 return;
 }
 setSubmitting(true);
 const payload: Record<string, unknown> = {};
 for (const [k, v] of Object.entries(parsed.data)) {
 if (v === "" || (typeof v === "number" && Number.isNaN(v))) continue;
 payload[k] = v;
 }
 const { error } = await supabase.from("marketplace_seller_requests").insert(payload as never);
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
 <h1 className="text-3xl font-bold mb-3">Request received</h1>
 <p className="text-muted-foreground mb-6">
 ECOWAS Parliament Initiatives will review your goods and contact you to verify details before listing
 and distributing on your behalf.
 </p>
 <div className="flex gap-3 justify-center">
 <Button onClick={() => navigate("/marketplace")}>Back to marketplace</Button>
 <Button variant="outline" onClick={() => { setDone(false); setForm(f => ({ ...f, product_title: "", product_description: "" })); }}>
 Submit another
 </Button>
 </div>
 </div>
 </Layout>
 );
 }

 return (
 <Layout seoTitle="List your goods with ECOWAS, West Africa Marketplace">
 <div className="container py-10 max-w-3xl">
 <Button asChild variant="ghost" size="sm" className="mb-4">
 <Link to="/marketplace"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
 </Button>
 <AnimatedSection>
 <h1 className="text-3xl md:text-4xl font-extrabold mb-2">List your goods with ECOWAS</h1>
 <p className="text-muted-foreground mb-6 max-w-2xl">
 ECOWAS Parliament Initiatives acts as the trusted distributor and guarantor for SMEs across the 15
 member states. Submit your product below, our trade desk will verify, list, and broker buyer
 enquiries on your behalf.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
 {[
 { icon: ShieldCheck, label: "Verified & guaranteed", sub: "ECOWAS-vetted" },
 { icon: Globe2, label: "15-nation reach", sub: "All ECOWAS buyers" },
 { icon: Handshake, label: "Brokered deals", sub: "We connect you" },
 ].map((s, i) => (
 <div key={i} className="rounded-xl border border-border/60 p-3 bg-muted/30">
 <s.icon className="h-5 w-5 text-primary mb-1.5" />
 <div className="font-bold text-sm">{s.label}</div>
 <div className="text-[10px] text-muted-foreground">{s.sub}</div>
 </div>
 ))}
 </div>
 </AnimatedSection>

 <form onSubmit={onSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5"><Label>Your name *</Label><Input required value={form.seller_name} onChange={e => update("seller_name", e.target.value)} /></div>
 <div className="space-y-1.5"><Label>Email *</Label><Input type="email" required value={form.seller_email} onChange={e => update("seller_email", e.target.value)} /></div>
 <div className="space-y-1.5"><Label>Phone / WhatsApp</Label><Input value={form.seller_phone} onChange={e => update("seller_phone", e.target.value)} /></div>
 <div className="space-y-1.5"><Label>Company / cooperative</Label><Input value={form.seller_company} onChange={e => update("seller_company", e.target.value)} /></div>
 <div className="space-y-1.5">
 <Label>Country of origin *</Label>
 <Select value={form.country} onValueChange={v => update("country", v)}>
 <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
 <SelectContent>
 {ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-1.5"><Label>Unit</Label><Input value={form.unit} onChange={e => update("unit", e.target.value)} placeholder="tonnes / kg / units" /></div>
 </div>

 <div className="space-y-1.5">
 <Label>Product title *</Label>
 <Input required value={form.product_title} onChange={e => update("product_title", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <Label>Product description *</Label>
 <Textarea required rows={5} value={form.product_description} onChange={e => update("product_description", e.target.value)} placeholder="Quality, packaging, certifications, capacity, lead times…" />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="space-y-1.5"><Label>Available qty</Label><Input type="number" min="0" step="any" value={form.available_quantity} onChange={e => update("available_quantity", e.target.value)} /></div>
 <div className="space-y-1.5"><Label>Price min</Label><Input type="number" min="0" step="any" value={form.price_min} onChange={e => update("price_min", e.target.value)} /></div>
 <div className="space-y-1.5"><Label>Price max</Label><Input type="number" min="0" step="any" value={form.price_max} onChange={e => update("price_max", e.target.value)} /></div>
 <div className="space-y-1.5 md:col-span-3"><Label>Currency</Label><Input value={form.currency} onChange={e => update("currency", e.target.value)} className="md:w-32" /></div>
 </div>

 <div className="space-y-1.5">
 <Label>Anything else we should know?</Label>
 <Textarea rows={3} value={form.notes} onChange={e => update("notes", e.target.value)} />
 </div>

 <Button type="submit" size="lg" className="w-full" disabled={submitting}>
 {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
 Submit to ECOWAS Trade Desk
 </Button>
 </form>
 </div>
 </Layout>
 );
}