import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, Users } from "lucide-react";

interface Cat { id: string; name: string }

export default function BuyerRegistrationDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [cats, setCats] = useState<Cat[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [form, setForm] = useState({
    full_name: "", organisation: "", country: "", email: "", whatsapp: "", sourcing_intent: "",
  });

  useEffect(() => {
    if (!open) return;
    supabase.from("marketplace_categories").select("id, name").order("sort_order")
      .then(({ data }) => setCats((data as Cat[]) || []));
  }, [open]);

  const u = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const required: (keyof typeof form)[] = ["full_name", "organisation", "country", "email"];
  const missing = (k: keyof typeof form) => !form[k]?.toString().trim();
  const emailBad = !/.+@.+\..+/.test(form.email);

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setDone(false); setTouched(false); setSelectedCats([]);
      setForm({ full_name: "", organisation: "", country: "", email: "", whatsapp: "", sourcing_intent: "" });
    }
  };

  const toggleCat = (name: string) =>
    setSelectedCats(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);

  const submit = async () => {
    setTouched(true);
    if (required.some(missing) || emailBad || selectedCats.length === 0) {
      toast({ title: "Please complete required fields", description: "Including at least one category of interest.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("marketplace_buyers").insert({
      full_name: form.full_name.trim(),
      organisation: form.organisation.trim(),
      country: form.country.trim(),
      email: form.email.trim(),
      whatsapp: form.whatsapp.trim() || null,
      sourcing_intent: form.sourcing_intent.trim() || null,
      categories_of_interest: selectedCats,
      status: "active",
    } as never);
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't register", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: "Welcome to the ECOWAS Trade Network", description: "You can now connect with verified sellers." });
  };

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader><SheetTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Register as buyer</SheetTitle></SheetHeader>
        {done ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-bold">Welcome aboard</h3>
            <p className="text-sm text-muted-foreground">You can now connect with sellers across the 12 ECOWAS member states. A confirmation email is on its way to <strong>{form.email}</strong>.</p>
            <Button className="w-full" onClick={() => close(false)}>Done</Button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div>
              <Label>Full name *</Label>
              <Input value={form.full_name} onChange={e => u("full_name", e.target.value)}
                className={touched && missing("full_name") ? "border-destructive" : ""} />
            </div>
            <div>
              <Label>Organisation / company *</Label>
              <Input value={form.organisation} onChange={e => u("organisation", e.target.value)}
                className={touched && missing("organisation") ? "border-destructive" : ""} />
            </div>
            <div>
              <Label>Country *</Label>
              <Input value={form.country} onChange={e => u("country", e.target.value)} placeholder="Any country"
                className={touched && missing("country") ? "border-destructive" : ""} />
            </div>
            <div>
              <Label>Categories of interest *</Label>
              <div className={`flex flex-wrap gap-1.5 mt-1.5 p-2 rounded-md border ${touched && selectedCats.length === 0 ? "border-destructive" : "border-border"}`}>
                {cats.map(c => (
                  <button key={c.id} type="button" onClick={() => toggleCat(c.name)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${selectedCats.includes(c.name) ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary"}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Contact email *</Label>
              <Input type="email" value={form.email} onChange={e => u("email", e.target.value)}
                className={touched && (missing("email") || emailBad) ? "border-destructive" : ""} />
            </div>
            <div>
              <Label>WhatsApp number</Label>
              <Input value={form.whatsapp} onChange={e => u("whatsapp", e.target.value)} placeholder="+234..." />
            </div>
            <div>
              <Label>What are you looking to source?</Label>
              <Textarea rows={3} value={form.sourcing_intent} onChange={e => u("sourcing_intent", e.target.value)} />
            </div>
            <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
              Register
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
