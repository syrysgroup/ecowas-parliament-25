import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { Mail, Users } from "lucide-react";

interface Subscriber {
  id: string; email: string; subscribed_at: string; unsubscribed_at: string | null;
}

export default function NewsletterModule() {
  const { data: subscribers = [], isLoading } = useQuery<Subscriber[]>({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("newsletter_subscribers")
        .select("*").order("subscribed_at", { ascending: false });
      return data ?? [];
    },
  });

  const active = subscribers.filter(s => !s.unsubscribed_at);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-crm-text">Newsletter Subscribers</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">{active.length} active subscribers</p>
      </div>

      <div className="flex gap-3">
        <div className="text-[10px] font-mono px-2.5 py-1 rounded-lg border bg-emerald-950 text-emerald-400 border-emerald-800">
          Active: {active.length}
        </div>
        <div className="text-[10px] font-mono px-2.5 py-1 rounded-lg border bg-crm-surface text-crm-text-muted border-crm-border">
          Unsubscribed: {subscribers.length - active.length}
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}

      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-6 w-6 text-crm-text-dim mb-2" />
            <p className="text-sm text-crm-text-muted">No subscribers yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-crm-border">
            {subscribers.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <Mail size={13} className={s.unsubscribed_at ? "text-crm-text-faint" : "text-emerald-400"} />
                <span className={`text-[12px] flex-1 ${s.unsubscribed_at ? "text-crm-text-faint line-through" : "text-crm-text"}`}>
                  {s.email}
                </span>
                <span className="text-[10px] text-crm-text-dim">{format(parseISO(s.subscribed_at), "d MMM yyyy")}</span>
                {s.unsubscribed_at && (
                  <span className="text-[9px] font-mono text-red-400 bg-red-950 border border-red-800 rounded px-1.5 py-0.5">Unsubscribed</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
