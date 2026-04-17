import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Mail, Phone, Globe, MessageSquare, Check, Trash2, Inbox } from "lucide-react";

interface Submission {
  id: string; name: string | null; email: string | null; phone: string | null;
  message: string | null; source_page: string | null; created_at: string;
  is_read: boolean;
}

export default function ContactSubmissionsModule() {
  const { isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("unread");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("contact_submissions")
        .select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  const markRead = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await (supabase as any)
        .from("contact_submissions")
        .update({ is_read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-submissions"] }),
  });

  const deleteSubmission = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("contact_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-submissions"] });
      setConfirmDeleteId(null);
    },
  });

  const unread = submissions.filter(s => !s.is_read);
  const read   = submissions.filter(s => s.is_read);

  const displayed = filter === "unread"
    ? unread
    : filter === "read"
    ? read
    : submissions;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Contact Submissions</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            {unread.length} unread · {submissions.length} total
          </p>
        </div>
        {isAdmin && unread.length > 0 && (
          <button
            onClick={() => unread.forEach(s => markRead.mutate({ id: s.id, is_read: true }))}
            className="text-[10px] font-mono px-2.5 py-1 rounded-lg border bg-crm-surface text-crm-text-muted border-crm-border hover:border-crm-border-hover transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([["unread", "Unread", unread.length], ["all", "All", submissions.length], ["read", "Read", read.length]] as [string, string, number][]).map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFilter(val as typeof filter)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
              filter === val
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : "bg-crm-surface text-crm-text-muted border-crm-border hover:border-crm-border-hover"
            }`}
          >
            {label}: {count}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      <div className="space-y-2">
        {displayed.map(s => (
          <div
            key={s.id}
            className={`bg-crm-card border rounded-xl p-4 transition-colors ${
              !s.is_read ? "border-emerald-800/50 bg-emerald-950/10" : "border-crm-border"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                !s.is_read ? "bg-emerald-900/40" : "bg-crm-surface"
              }`}>
                <MessageSquare size={14} className={!s.is_read ? "text-emerald-400" : "text-crm-text-dim"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-[13px] font-semibold text-crm-text">{s.name || "Anonymous"}</p>
                  {!s.is_read && (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 rounded px-1.5 py-0.5">New</span>
                  )}
                  <span className="text-[10px] text-crm-text-dim ml-auto">{format(parseISO(s.created_at), "d MMM yyyy, HH:mm")}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-[10px] text-crm-text-dim mb-2">
                  {s.email && <span className="flex items-center gap-1"><Mail size={10} /> {s.email}</span>}
                  {s.phone && <span className="flex items-center gap-1"><Phone size={10} /> {s.phone}</span>}
                  {s.source_page && <span className="flex items-center gap-1"><Globe size={10} /> {s.source_page}</span>}
                </div>
                {s.message && <p className="text-[11px] text-crm-text-secondary leading-relaxed">{s.message}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-1 shrink-0 flex-col">
                  <button
                    title={s.is_read ? "Mark as unread" : "Mark as read"}
                    onClick={() => markRead.mutate({ id: s.id, is_read: !s.is_read })}
                    className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                      s.is_read
                        ? "bg-crm-surface border-crm-border text-crm-text-dim hover:text-crm-text"
                        : "bg-emerald-950 border-emerald-800 text-emerald-400 hover:bg-crm-surface"
                    }`}
                  >
                    {s.is_read ? <Inbox size={11} /> : <Check size={11} />}
                  </button>
                  {confirmDeleteId === s.id ? (
                    <div className="flex flex-col gap-1">
                      <button onClick={() => deleteSubmission.mutate(s.id)} className="text-[9px] text-red-400 bg-red-950 border border-red-800 rounded px-1.5 py-1">Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-[9px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-1.5 py-1">No</button>
                    </div>
                  ) : (
                    <button
                      title="Delete submission"
                      onClick={() => setConfirmDeleteId(s.id)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && displayed.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-6 w-6 text-crm-text-dim mb-2" />
          <p className="text-sm text-crm-text-muted">
            {filter === "unread" ? "No unread submissions." : "No contact submissions yet."}
          </p>
        </div>
      )}
    </div>
  );
}
