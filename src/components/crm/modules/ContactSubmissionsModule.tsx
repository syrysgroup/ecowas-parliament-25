import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { Mail, Phone, Globe, MessageSquare } from "lucide-react";

interface Submission {
  id: string; name: string | null; email: string | null; phone: string | null;
  message: string | null; source_page: string | null; created_at: string;
}

export default function ContactSubmissionsModule() {
  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("contact_submissions")
        .select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-crm-text">Contact Submissions</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">{submissions.length} submissions received</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      <div className="space-y-2">
        {submissions.map(s => (
          <div key={s.id} className="bg-crm-card border border-crm-border rounded-xl p-4 hover:border-crm-border-hover transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-crm-surface flex items-center justify-center flex-shrink-0">
                <MessageSquare size={14} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-[13px] font-semibold text-crm-text">{s.name || "Anonymous"}</p>
                  <span className="text-[10px] text-crm-text-dim">{format(parseISO(s.created_at), "d MMM yyyy, HH:mm")}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-[10px] text-crm-text-dim mb-2">
                  {s.email && <span className="flex items-center gap-1"><Mail size={10} /> {s.email}</span>}
                  {s.phone && <span className="flex items-center gap-1"><Phone size={10} /> {s.phone}</span>}
                  {s.source_page && <span className="flex items-center gap-1"><Globe size={10} /> {s.source_page}</span>}
                </div>
                {s.message && <p className="text-[11px] text-crm-text-secondary leading-relaxed">{s.message}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && submissions.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-6 w-6 text-crm-text-dim mb-2" />
          <p className="text-sm text-crm-text-muted">No contact submissions yet.</p>
        </div>
      )}
    </div>
  );
}
