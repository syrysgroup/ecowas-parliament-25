import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { inquirySchema, ECOWAS_COUNTRIES } from "@/lib/validation/marketplace";
import { Loader2, MessageSquare, ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";

export default function InquiryDialog({ listingId, listingTitle, trigger }: {
  listingId: string; listingTitle: string; trigger?: React.ReactNode;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ token: string } | null>(null);
  const [form, setForm] = useState({
    buyer_name: "", buyer_email: "", buyer_phone: "", buyer_country: "",
    buyer_company: "", subject: `Enquiry about ${listingTitle}`, message: "",
  });
  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Please review the form", description: parsed.error.issues[0]?.message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = { listing_id: listingId, ...parsed.data };
    const { data, error } = await supabase.from("marketplace_inquiries")
      .insert(payload as never)
      .select("id, access_token")
      .single();
    if (error || !data) {
      setSubmitting(false);
      toast({ title: "Couldn't send", description: error?.message ?? "Unknown error", variant: "destructive" });
      return;
    }
    const inquiry = data as { id: string; access_token: string };
    await supabase.from("marketplace_inquiry_messages").insert({
      inquiry_id: inquiry.id,
      sender_type: "buyer",
      sender_name: parsed.data.buyer_name,
      sender_email: parsed.data.buyer_email,
      body: parsed.data.message,
      is_internal: false,
    } as never);
    setSubmitting(false);
    setDone({ token: inquiry.access_token });
    toast({ title: "Message sent securely", description: "ECOWAS will route your enquiry to the verified seller." });
  };

  const threadUrl = done ? `${window.location.origin}/marketplace/inquiries/${done.token}` : "";

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setDone(null); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />Secure message to seller
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />Secure buyer–seller message
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="space-y-4 py-2 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-bold">Message sent</h3>
            <p className="text-sm text-muted-foreground">
              ECOWAS will forward your enquiry to the verified seller and reply to you on the email provided.
              Bookmark your private thread:
            </p>
            <a href={threadUrl} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-1 text-sm text-primary underline break-all">
              <ExternalLink className="h-3 w-3" />{threadUrl}
            </a>
            <Button onClick={() => setOpen(false)} className="w-full">Done</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5 leading-relaxed">
              <ShieldCheck className="h-3.5 w-3.5 inline -mt-0.5 mr-1 text-primary" />
              Your contact details stay private. <strong>ECOWAS Parliament Initiatives</strong> acts as a trusted
              distributor &amp; guarantor between you and the seller.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input required value={form.buyer_name} onChange={e => update("buyer_name", e.target.value)} /></div>
              <div><Label>Email *</Label><Input type="email" required value={form.buyer_email} onChange={e => update("buyer_email", e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={form.buyer_phone} onChange={e => update("buyer_phone", e.target.value)} /></div>
              <div>
                <Label>Country</Label>
                <Select value={form.buyer_country} onValueChange={v => update("buyer_country", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Company</Label><Input value={form.buyer_company} onChange={e => update("buyer_company", e.target.value)} /></div>
              <div className="col-span-2"><Label>Subject *</Label><Input required value={form.subject} onChange={e => update("subject", e.target.value)} /></div>
              <div className="col-span-2"><Label>Message *</Label><Textarea required rows={5} value={form.message} onChange={e => update("message", e.target.value)} placeholder="Quantity needed, specs, delivery timeline…" /></div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
              Send secure message
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}