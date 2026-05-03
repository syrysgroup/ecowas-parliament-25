import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, ShieldCheck, ArrowLeft } from "lucide-react";

interface Inquiry {
  id: string; subject: string; status: string; buyer_name: string;
  buyer_email: string; created_at: string;
  listing?: { title: string; slug: string } | null;
}
interface Msg {
  id: string; sender_type: string; sender_name: string | null;
  body: string; created_at: string; is_internal: boolean;
}

export default function InquiryThread() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    if (!token) return;
    const { data: inq } = await supabase.from("marketplace_inquiries")
      .select("id, subject, status, buyer_name, buyer_email, created_at, listing:marketplace_listings(title, slug)")
      .eq("access_token", token).maybeSingle();
    if (!inq) { setNotFound(true); setLoading(false); return; }
    setInquiry(inq as never);
    const { data: msgs } = await supabase.from("marketplace_inquiry_messages")
      .select("id, sender_type, sender_name, body, created_at, is_internal")
      .eq("inquiry_id", (inq as { id: string }).id)
      .eq("is_internal", false)
      .order("created_at", { ascending: true });
    setMessages((msgs as never) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [token]);

  const send = async () => {
    if (!inquiry || !reply.trim()) return;
    setSending(true);
    const { error } = await supabase.from("marketplace_inquiry_messages").insert({
      inquiry_id: inquiry.id, sender_type: "buyer",
      sender_name: inquiry.buyer_name, sender_email: inquiry.buyer_email,
      body: reply.trim(), is_internal: false,
    } as never);
    setSending(false);
    if (error) { toast({ title: "Couldn't send", description: error.message, variant: "destructive" }); return; }
    setReply(""); load();
    toast({ title: "Reply sent" });
  };

  if (loading) return <Layout><div className="container py-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (notFound || !inquiry) return <Layout><div className="container py-32 text-center"><h1 className="text-2xl font-bold">Thread not found</h1><Button asChild className="mt-4"><Link to="/marketplace">Back to marketplace</Link></Button></div></Layout>;

  return (
    <Layout seoTitle={`Enquiry — ${inquiry.subject}`}>
      <div className="container py-8 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/marketplace"><ArrowLeft className="h-4 w-4 mr-1" />Marketplace</Link>
        </Button>
        <div className="rounded-3xl border-2 border-primary/15 bg-card p-6 shadow-lg space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />Brokered by ECOWAS Parliament Initiatives
            </div>
            <h1 className="text-2xl font-extrabold">{inquiry.subject}</h1>
            {inquiry.listing && (
              <Link to={`/marketplace/listings/${inquiry.listing.slug}`} className="text-sm text-primary underline">
                {inquiry.listing.title}
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`rounded-2xl p-4 border ${m.sender_type === "buyer" ? "bg-muted/40" : "bg-primary/5 border-primary/20"}`}>
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                  {m.sender_type === "buyer" ? "You" : m.sender_type === "crm" ? "ECOWAS Trade Desk" : "Seller (via ECOWAS)"} ·{" "}
                  {new Date(m.created_at).toLocaleString()}
                </div>
                <p className="text-sm whitespace-pre-line">{m.body}</p>
              </div>
            ))}
            {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
          </div>

          <div className="space-y-2 border-t pt-4">
            <Textarea rows={4} placeholder="Reply…" value={reply} onChange={e => setReply(e.target.value)} />
            <Button onClick={send} disabled={sending || !reply.trim()} className="w-full">
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Send reply
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}