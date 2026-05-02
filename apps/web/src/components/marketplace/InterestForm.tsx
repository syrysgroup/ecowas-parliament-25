import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { interestSchema, ECOWAS_COUNTRIES } from "@/lib/validation/marketplace";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export default function InterestForm({ listingId, listingUnit }: { listingId: string; listingUnit: string }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    buyer_country: "",
    buyer_company: "",
    quantity: "",
    unit: listingUnit,
    size_spec: "",
    target_price: "",
    delivery_timeline: "",
    message: "",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = interestSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Please review the form", description: parsed.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload: Record<string, unknown> = { listing_id: listingId };
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v === "" || (typeof v === "number" && Number.isNaN(v))) continue;
      payload[k] = v;
    }
    const { error } = await supabase.from("marketplace_interests").insert(payload as never);
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't send", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: "Interest sent", description: "The seller and our team will reach out shortly." });
  };

  if (done) {
    return (
      <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 text-center space-y-3">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
        <h3 className="text-xl font-bold">Thank you!</h3>
        <p className="text-sm text-muted-foreground">Your enquiry has been received. The seller and our trade team will contact you on the email you provided.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full name *</Label>
          <Input required value={form.buyer_name} onChange={e => update("buyer_name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Email *</Label>
          <Input type="email" required value={form.buyer_email} onChange={e => update("buyer_email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone / WhatsApp</Label>
          <Input value={form.buyer_phone} onChange={e => update("buyer_phone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Country</Label>
          <Select value={form.buyer_country} onValueChange={v => update("buyer_country", v)}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent>
              {ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Company / Organisation</Label>
          <Input value={form.buyer_company} onChange={e => update("buyer_company", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Quantity wanted</Label>
          <Input type="number" min="0" step="any" value={form.quantity} onChange={e => update("quantity", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Unit</Label>
          <Input value={form.unit} onChange={e => update("unit", e.target.value)} placeholder="e.g. tonnes, kg, units" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Size / specification</Label>
          <Input value={form.size_spec} onChange={e => update("size_spec", e.target.value)} placeholder="e.g. grade A, 25kg bags, packaging" />
        </div>
        <div className="space-y-1.5">
          <Label>Target price (optional)</Label>
          <Input type="number" min="0" step="any" value={form.target_price} onChange={e => update("target_price", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Delivery timeline</Label>
          <Input value={form.delivery_timeline} onChange={e => update("delivery_timeline", e.target.value)} placeholder="e.g. within 30 days" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Additional notes</Label>
        <Textarea rows={4} value={form.message} onChange={e => update("message", e.target.value)} />
      </div>
      <Button type="submit" disabled={submitting} size="lg" className="w-full">
        {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
        Send enquiry
      </Button>
    </form>
  );
}