import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import {
  Mail, Phone, Globe, MessageSquare, Check, Trash2, Inbox,
  ExternalLink, ChevronDown, ChevronUp, User, Pencil, X,
} from "lucide-react";

interface Profile { id: string; full_name: string | null; email: string | null; }

interface Submission {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  source_page: string | null;
  created_at: string;
  is_read: boolean;
  assigned_to: string | null;
  status: "open" | "in_progress" | "resolved";
  notes: string | null;
  assignee?: Profile | null;
}

const STATUS_STYLES: Record<string, string> = {
  open:        "bg-amber-950 text-amber-400 border-amber-800",
  in_progress: "bg-blue-950 text-blue-400 border-blue-800",
  resolved:    "bg-emerald-950 text-emerald-400 border-emerald-800",
};
const STATUS_LABELS: Record<string, string> = {
  open: "Open", in_progress: "In Progress", resolved: "Resolved",
};

function buildMailtoLink(s: Submission): string {
  if (!s.email) return "";
  // Message format from Contact.tsx: "[enquiryType] Subject\nMessage body"
  const prefixMatch = s.message?.match(/^\[([^\]]+)\]\s*/);
  const enquiryType = prefixMatch?.[1] ?? "Enquiry";
  const subjectLine = `Re: Your ${enquiryType} Enquiry – ECOWAS Parliament Initiatives`;
  const date = format(parseISO(s.created_at), "d MMMM yyyy 'at' HH:mm");
  const body = [
    `Dear ${s.name ?? "Sir/Madam"},`,
    "",
    "",
    "",
    "─────────────────────────────────────────",
    `From: ${s.name ?? "Anonymous"} <${s.email}>`,
    `Date: ${date}`,
    "",
    s.message ?? "",
  ].join("\n");
  return `mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
}

export default function ContactSubmissionsModule() {
  const { isSuperAdmin, isAdmin, user } = useAuthContext();
  const qc = useQueryClient();

  const [filter, setFilter]             = useState<"all" | "unread" | "read" | "mine">("unread");
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes]   = useState<Record<string, boolean>>({});

  // Fetch submissions — admins get all, assigned users get only theirs (via RLS)
  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_submissions")
        .select("*, assignee:profiles!assigned_to(id, full_name, email)")
        .order("created_at", { ascending: false })
        .limit(300);
      return (data ?? []).map((r: any) => ({
        ...r,
        status: r.status ?? "open",
      }));
    },
  });

  // Fetch all profiles for the assignment dropdown (super_admin only)
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["all-profiles-brief"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      return data ?? [];
    },
    enabled: isSuperAdmin,
  });

  const patchSubmission = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("contact_submissions")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-submissions"] }),
  });

  const deleteSubmission = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-submissions"] });
      setConfirmDeleteId(null);
    },
  });

  async function saveNotes(s: Submission) {
    const notes = editingNotes[s.id] ?? s.notes ?? "";
    setSavingNotes(p => ({ ...p, [s.id]: true }));
    try {
      await patchSubmission.mutateAsync({ id: s.id, patch: { notes } });
      setEditingNotes(p => { const n = { ...p }; delete n[s.id]; return n; });
    } finally {
      setSavingNotes(p => ({ ...p, [s.id]: false }));
    }
  }

  const unread = submissions.filter(s => !s.is_read);
  const read   = submissions.filter(s => s.is_read);
  const mine   = submissions.filter(s => s.assigned_to === user?.id);

  const displayed =
    filter === "unread" ? unread :
    filter === "read"   ? read :
    filter === "mine"   ? mine :
    submissions;

  const canEdit = (s: Submission) => isAdmin || s.assigned_to === user?.id;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Contact Submissions</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            {unread.length} unread · {submissions.length} total
          </p>
        </div>
        {isAdmin && unread.length > 0 && (
          <button
            onClick={() => unread.forEach(s => patchSubmission.mutate({ id: s.id, patch: { is_read: true } }))}
            className="text-[10px] font-mono px-2.5 py-1 rounded-lg border bg-crm-surface text-crm-text-muted border-crm-border hover:border-crm-border-hover transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          ["unread", "Unread",   unread.length],
          ["all",    "All",      submissions.length],
          ["read",   "Read",     read.length],
          ["mine",   "Assigned to me", mine.length],
        ] as [string, string, number][]).map(([val, label, count]) => (
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
        {displayed.map(s => {
          const isExpanded = expandedId === s.id;
          const editingNote = editingNotes[s.id] !== undefined;

          return (
            <div
              key={s.id}
              className={`bg-crm-card border rounded-xl transition-colors ${
                !s.is_read ? "border-emerald-800/50 bg-emerald-950/10" : "border-crm-border"
              }`}
            >
              {/* ── Card header (always visible) ── */}
              <div className="flex items-start gap-3 p-4">
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
                    {/* Status badge */}
                    <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${STATUS_STYLES[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                    {/* Assignee badge */}
                    {s.assignee && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-crm-text-dim bg-crm-surface border border-crm-border rounded px-1.5 py-0.5">
                        <User size={9} />
                        {s.assignee.full_name ?? s.assignee.email ?? "Assigned"}
                      </span>
                    )}
                    <span className="text-[10px] text-crm-text-dim ml-auto">{format(parseISO(s.created_at), "d MMM yyyy, HH:mm")}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-[10px] text-crm-text-dim mb-1">
                    {s.email && <span className="flex items-center gap-1"><Mail size={10} /> {s.email}</span>}
                    {s.phone && <span className="flex items-center gap-1"><Phone size={10} /> {s.phone}</span>}
                    {s.source_page && <span className="flex items-center gap-1"><Globe size={10} /> {s.source_page}</span>}
                  </div>
                  {/* Message preview (collapsed) */}
                  {!isExpanded && s.message && (
                    <p className="text-[11px] text-crm-text-secondary leading-relaxed line-clamp-2">{s.message}</p>
                  )}
                </div>

                {/* Right-side actions */}
                <div className="flex gap-1 shrink-0 flex-col">
                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="w-6 h-6 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text transition-colors"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                  {/* Mark read/unread (admin only) */}
                  {isAdmin && (
                    <button
                      title={s.is_read ? "Mark as unread" : "Mark as read"}
                      onClick={() => patchSubmission.mutate({ id: s.id, patch: { is_read: !s.is_read } })}
                      className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                        s.is_read
                          ? "bg-crm-surface border-crm-border text-crm-text-dim hover:text-crm-text"
                          : "bg-emerald-950 border-emerald-800 text-emerald-400 hover:bg-crm-surface"
                      }`}
                    >
                      {s.is_read ? <Inbox size={11} /> : <Check size={11} />}
                    </button>
                  )}
                  {/* Delete (admin only) */}
                  {isAdmin && (
                    confirmDeleteId === s.id ? (
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
                    )
                  )}
                </div>
              </div>

              {/* ── Expanded panel ── */}
              {isExpanded && (
                <div className="border-t border-crm-border px-4 pb-4 pt-3 space-y-4">
                  {/* Full message */}
                  {s.message && (
                    <div>
                      <p className="text-[9px] font-mono text-crm-text-dim uppercase tracking-wider mb-1">Message</p>
                      <p className="text-[12px] text-crm-text-secondary leading-relaxed whitespace-pre-wrap">{s.message}</p>
                    </div>
                  )}

                  {/* Assignment (super_admin only) */}
                  {isSuperAdmin && (
                    <div>
                      <p className="text-[9px] font-mono text-crm-text-dim uppercase tracking-wider mb-1">Assign to</p>
                      <select
                        value={s.assigned_to ?? ""}
                        onChange={e => patchSubmission.mutate({
                          id: s.id,
                          patch: { assigned_to: e.target.value || null },
                        })}
                        className="w-full text-[11px] bg-crm-surface border border-crm-border rounded-lg px-2.5 py-1.5 text-crm-text focus:outline-none focus:border-emerald-700"
                      >
                        <option value="">— Unassigned —</option>
                        {profiles.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.full_name ?? p.email ?? p.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Status (admin or assigned user) */}
                  {canEdit(s) && (
                    <div>
                      <p className="text-[9px] font-mono text-crm-text-dim uppercase tracking-wider mb-1">Status</p>
                      <div className="flex gap-1.5">
                        {(["open", "in_progress", "resolved"] as const).map(st => (
                          <button
                            key={st}
                            onClick={() => patchSubmission.mutate({ id: s.id, patch: { status: st } })}
                            className={`text-[9px] font-mono border rounded px-2 py-1 transition-colors ${
                              s.status === st
                                ? STATUS_STYLES[st]
                                : "bg-crm-surface border-crm-border text-crm-text-dim hover:border-crm-border-hover"
                            }`}
                          >
                            {STATUS_LABELS[st]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes (admin or assigned user) */}
                  {canEdit(s) && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[9px] font-mono text-crm-text-dim uppercase tracking-wider">Internal Notes</p>
                        {!editingNote && (
                          <button
                            onClick={() => setEditingNotes(p => ({ ...p, [s.id]: s.notes ?? "" }))}
                            className="flex items-center gap-1 text-[9px] font-mono text-crm-text-dim hover:text-crm-text transition-colors"
                          >
                            <Pencil size={9} /> Edit
                          </button>
                        )}
                      </div>
                      {editingNote ? (
                        <div className="space-y-1.5">
                          <textarea
                            value={editingNotes[s.id]}
                            onChange={e => setEditingNotes(p => ({ ...p, [s.id]: e.target.value }))}
                            rows={3}
                            placeholder="Add internal notes…"
                            className="w-full text-[11px] bg-crm-surface border border-crm-border rounded-lg px-2.5 py-1.5 text-crm-text placeholder:text-crm-text-dim focus:outline-none focus:border-emerald-700 resize-none"
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => saveNotes(s)}
                              disabled={savingNotes[s.id]}
                              className="text-[9px] font-mono px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 transition-colors disabled:opacity-50"
                            >
                              {savingNotes[s.id] ? "Saving…" : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingNotes(p => { const n = { ...p }; delete n[s.id]; return n; })}
                              className="text-[9px] font-mono px-2 py-1 rounded-lg bg-crm-surface border border-crm-border text-crm-text-dim hover:text-crm-text transition-colors"
                            >
                              <X size={9} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-[11px] leading-relaxed whitespace-pre-wrap ${s.notes ? "text-crm-text-secondary" : "text-crm-text-dim italic"}`}>
                          {s.notes || "No notes yet."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Respond button */}
                  {s.email && (canEdit(s) || isSuperAdmin) && (
                    <div className="pt-1">
                      <a
                        href={buildMailtoLink(s)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 transition-colors"
                      >
                        <ExternalLink size={10} />
                        Respond to Query
                      </a>
                      <p className="text-[9px] text-crm-text-dim mt-1">
                        Opens your email client with the original message quoted.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isLoading && displayed.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-6 w-6 text-crm-text-dim mb-2" />
          <p className="text-sm text-crm-text-muted">
            {filter === "unread" ? "No unread submissions." :
             filter === "mine"   ? "No submissions assigned to you." :
             "No contact submissions yet."}
          </p>
        </div>
      )}
    </div>
  );
}
