import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, IdCard, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSiteContent } from "@/hooks/useSiteContent";

const OUTLET_TYPES = [
 { value: "tv",        label: "TV / Broadcast" },
 { value: "radio",     label: "Radio" },
 { value: "print",     label: "Print" },
 { value: "online",    label: "Online / Digital" },
 { value: "freelance", label: "Freelance / Independent" },
];

interface EventOption { id: string; title: string; start_date: string; }

export default function MediaAccreditation() {
 const { toast } = useToast();
 const { data: cms } = useSiteContent("media-portal");
 const [submitted, setSubmitted] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [form, setForm] = useState({
 full_name: "", outlet: "", outlet_type: "", country: "",
 email: "", phone: "", bio: "", coverage_event_id: "",
 id_document_url: "",
 });

 const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

 const { data: events = [] } = useQuery<EventOption[]>({
 queryKey: ["upcoming-events-media"],
 queryFn: async () => {
 const { data } = await supabase
 .from("events")
 .select("id, title, start_date")
 .eq("is_published", true)
 .gte("start_date", new Date().toISOString())
 .order("start_date", { ascending: true })
 .limit(20);
 return data ?? [];
 },
 });

 const handleUpload = async (file: File) => {
 setUploading(true);
 try {
 const ext = file.name.split(".").pop();
 const path = `accreditation/${Date.now()}.${ext}`;
 const { error } = await supabase.storage.from("cms-media").upload(path, file);
 if (error) throw error;
 const { data: { publicUrl } } = supabase.storage.from("cms-media").getPublicUrl(path);
 setForm(f => ({ ...f, id_document_url: publicUrl }));
 } catch {
 toast({ title: "Upload failed", description: "Could not upload the document. Try again.", variant: "destructive" });
 } finally {
 setUploading(false);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!form.full_name || !form.outlet || !form.outlet_type || !form.email) {
 toast({ title: "Please fill in all required fields", variant: "destructive" });
 return;
 }
 setSubmitting(true);
 try {
 const { error } = await supabase.from("media_accreditations").insert({
 full_name: form.full_name,
 outlet: form.outlet,
 outlet_type: form.outlet_type,
 country: form.country || null,
 email: form.email,
 phone: form.phone || null,
 bio: form.bio || null,
 coverage_event_id: form.coverage_event_id || null,
 id_document_url: form.id_document_url || null,
 status: "pending",
 });
 if (error) throw error;
 setSubmitted(true);
 window.scrollTo({ top: 0, behavior: "smooth" });
 } catch (err: any) {
 toast({ title: "Submission failed", description: err.message ?? "Please try again.", variant: "destructive" });
 } finally {
 setSubmitting(false);
 }
 };

 const get = (k: string, fb = "") => (cms?.[k] as string) || fb;

 if (submitted) {
 return (
 <Layout>
 <section className="min-h-[60vh] flex items-center justify-center py-24">
 <AnimatedSection className="text-center max-w-lg mx-auto px-4">
 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
 <CheckCircle2 className="h-8 w-8 text-primary" />
 </div>
 <h2 className="text-2xl font-black mb-3">Application Received</h2>
 <p className="text-muted-foreground">
 Thank you for applying for media accreditation. Our communications team will review your application
 and respond to <strong>{form.email}</strong> within 5 working days.
 </p>
 </AnimatedSection>
 </section>
 </Layout>
 );
 }

 return (
 <Layout>
 <section className="bg-gradient-hero text-primary-foreground py-16">
 <div className="container">
 <AnimatedSection>
 <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-4">
 Media Accreditation
 </Badge>
 <h1 className="text-3xl md:text-4xl font-black">
 {get("accreditation_form_title", "Apply for Press Accreditation")}
 </h1>
 <p className="mt-3 text-primary-foreground/70 max-w-2xl">
 {get("accreditation_form_desc",
 "Apply for accreditation to cover ECOWAS Parliament 25th Anniversary events. Accredited media receive a press pass, access to briefings, and exclusive photo opportunities.")}
 </p>
 </AnimatedSection>
 </div>
 </section>

 <section className="py-16">
 <div className="container max-w-2xl">
 <form onSubmit={handleSubmit} className="space-y-6">
 <AnimatedSection>
 <div className="grid sm:grid-cols-2 gap-4">
 <div className="sm:col-span-2 space-y-1.5">
 <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
 <Input id="full_name" value={form.full_name} onChange={e => set("full_name")(e.target.value)} required />
 </div>
 <div className="space-y-1.5">
 <Label htmlFor="outlet">Media Outlet / Organisation <span className="text-destructive">*</span></Label>
 <Input id="outlet" value={form.outlet} onChange={e => set("outlet")(e.target.value)} required placeholder="e.g. Reuters, BBC, Daily Nation" />
 </div>
 <div className="space-y-1.5">
 <Label htmlFor="outlet_type">Outlet Type <span className="text-destructive">*</span></Label>
 <Select value={form.outlet_type} onValueChange={set("outlet_type")}>
 <SelectTrigger id="outlet_type"><SelectValue placeholder="Select type…" /></SelectTrigger>
 <SelectContent>
 {OUTLET_TYPES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-1.5">
 <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
 <Input id="email" type="email" value={form.email} onChange={e => set("email")(e.target.value)} required />
 </div>
 <div className="space-y-1.5">
 <Label htmlFor="phone">Phone Number</Label>
 <Input id="phone" type="tel" value={form.phone} onChange={e => set("phone")(e.target.value)} placeholder="+234 xxx xxxx" />
 </div>
 <div className="space-y-1.5">
 <Label htmlFor="country">Country</Label>
 <Input id="country" value={form.country} onChange={e => set("country")(e.target.value)} placeholder="Country of residence" />
 </div>
 {events.length > 0 && (
 <div className="space-y-1.5">
 <Label htmlFor="coverage_event_id">Event to Cover</Label>
 <Select value={form.coverage_event_id} onValueChange={set("coverage_event_id")}>
 <SelectTrigger id="coverage_event_id"><SelectValue placeholder="Select event (optional)…" /></SelectTrigger>
 <SelectContent>
 {events.map(ev => (
 <SelectItem key={ev.id} value={ev.id}>
 {ev.title} · {new Date(ev.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}
 <div className="sm:col-span-2 space-y-1.5">
 <Label htmlFor="bio">Professional Bio / Coverage Intentions</Label>
 <Textarea id="bio" value={form.bio} onChange={e => set("bio")(e.target.value)}
 rows={4} placeholder="Briefly describe your role and what you intend to cover…" />
 </div>
 <div className="sm:col-span-2 space-y-1.5">
 <Label>Press ID / ID Document</Label>
 <div className="flex items-center gap-3">
 <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors text-sm">
 {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
 {uploading ? "Uploading…" : form.id_document_url ? "Replace file" : "Upload file"}
 <input type="file" className="hidden" accept="image/*,.pdf"
 onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
 </label>
 {form.id_document_url && (
 <a href={form.id_document_url} target="_blank" rel="noreferrer"
 className="text-sm text-primary underline underline-offset-2 flex items-center gap-1">
 <IdCard className="h-3.5 w-3.5" /> View uploaded
 </a>
 )}
 </div>
 <p className="text-xs text-muted-foreground">Press ID, journalist card, or government-issued ID. Max 10 MB.</p>
 </div>
 </div>
 </AnimatedSection>

 <AnimatedSection delay={100}>
 <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting || uploading}>
 {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <IdCard className="h-4 w-4" />}
 {submitting ? "Submitting…" : "Submit Application"}
 </Button>
 <p className="text-xs text-muted-foreground text-center mt-3">
 Applications are reviewed within 5 working days. You will receive a confirmation email.
 </p>
 </AnimatedSection>
 </form>
 </div>
 </section>
 </Layout>
 );
}
