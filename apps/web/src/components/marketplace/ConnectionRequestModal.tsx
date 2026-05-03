import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FlagImg from "@/components/shared/FlagImg";
import { CheckCircle2, Loader2, Mail, MessageCircle, Send, ShieldCheck } from "lucide-react";

export interface ConnectionListing {
  id: string;
  title: string;
  description?: string | null;
  country?: string | null;
  seller_company?: string | null;
  seller_email?: string | null;
  seller_phone?: string | null;
}

export default function ConnectionRequestModal({
  listing, open, onOpenChange,
}: { listing: ConnectionListing | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const [form, setForm] = useState({ buyer_name: "", buyer_email: "", message: "" });

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) { setDone(false); setTouched(false); setForm({ buyer_name: "", buyer_email: "", message: "" }); }
  };

  const u = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const missingName = !form.buyer_name.trim();
  const missingEmail = !/.+@.+\..+/.test(form.buyer_email);

  const submit = async () => {
    setTouched(true);
    if (!listing) return;
    if (missingName || missingEmail) {
      toast({ title: "Required fields missing", description: "Please add your name and a valid email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("marketplace_connections").insert({
      listing_id: listing.id,
      seller_email: listing.seller_email ?? null,
      seller_company: listing.seller_company ?? null,
      product_name: listing.title,
      buyer_name: form.buyer_name.trim(),
      buyer_email: form.buyer_email.trim(),
      message: form.message.trim() || null,
      status: "new",
    } as never);
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't send request", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: "Request sent", description: "ECOWAS Trade Network will connect you with the seller." });
  };

  if (!listing) return null;
  const wa = listing.seller_phone ? `https://wa.me/${listing.seller_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, I'm interested in your listing on the ECOWAS Trade Network: ${listing.title}.`)}` : null;
  const mailto = listing.seller_email ? `mailto:${listing.seller_email}?subject=${encodeURIComponent(`ECOWAS Marketplace enquiry — ${listing.title}`)}` : null;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto sm:rounded-2xl rounded-none sm:h-auto h-full sm:max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />Connect with seller
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-bold">Request sent</h3>
            <p className="text-sm text-muted-foreground">The seller has been notified. The ECOWAS Trade Network team may also reach out via the email you provided.</p>
            <Button onClick={() => close(false)} className="w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground">Listing</div>
              <div className="font-bold">{listing.title}</div>
              {listing.seller_company && <div className="text-sm">{listing.seller_company}</div>}
              {listing.country && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <FlagImg country={listing.country} className="h-3 w-4" /> {listing.country}
                </div>
              )}
              {listing.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{listing.description}</p>}
            </div>

            {(wa || mailto) && (
              <div className="grid grid-cols-2 gap-2">
                {wa && (
                  <Button asChild variant="outline" size="sm">
                    <a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 mr-1.5" />WhatsApp</a>
                  </Button>
                )}
                {mailto && (
                  <Button asChild variant="outline" size="sm">
                    <a href={mailto}><Mail className="h-4 w-4 mr-1.5" />Email</a>
                  </Button>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground">— or send through the platform —</div>

            <div className="space-y-3">
              <div>
                <Label>Your name *</Label>
                <Input value={form.buyer_name} onChange={e => u("buyer_name", e.target.value)}
                  className={touched && missingName ? "border-destructive" : ""} />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.buyer_email} onChange={e => u("buyer_email", e.target.value)}
                  className={touched && missingEmail ? "border-destructive" : ""} />
              </div>
              <div>
                <Label>Message to seller</Label>
                <Textarea rows={3} value={form.message} onChange={e => u("message", e.target.value)}
                  placeholder="Quantity, delivery timeline, questions…" />
              </div>
            </div>
            <Button onClick={submit} disabled={submitting} className="w-full" size="lg">
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send connection request
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
