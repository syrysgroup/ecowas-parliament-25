import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Inbox, Send, FileText, Star, Trash2, RefreshCw, Pencil,
  Reply, Forward, Search, X, Paperclip, ChevronRight,
  Loader2, MailOpen, Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Email {
  id: string;
  account_id: string;
  zoho_message_id: string | null;
  from_address: string;
  from_name: string;
  to_address: string;
  cc_address: string | null;
  subject: string;
  body_html: string;
  body_text: string;
  is_read: boolean;
  is_starred: boolean;
  folder: string;
  has_attachments: boolean;
  sent_at: string;
}

interface EmailAccount {
  id: string;
  email_address: string;
  display_name: string | null;
}

type Folder = "inbox" | "sent" | "drafts" | "starred" | "trash";

const FOLDERS: { id: Folder; label: string; icon: React.ElementType }[] = [
  { id: "inbox",   label: "Inbox",   icon: Inbox    },
  { id: "sent",    label: "Sent",    icon: Send     },
  { id: "drafts",  label: "Drafts",  icon: FileText },
  { id: "starred", label: "Starred", icon: Star     },
  { id: "trash",   label: "Trash",   icon: Trash2   },
];

// ─── Compose Modal ────────────────────────────────────────────────────────────
interface ComposeProps {
  account: EmailAccount;
  replyTo?: Email;
  forwardOf?: Email;
  onClose: () => void;
  onSent: () => void;
}

function ComposeModal({ account, replyTo, forwardOf, onClose, onSent }: ComposeProps) {
  const [to, setTo]         = useState(replyTo?.from_address ?? "");
  const [cc, setCc]         = useState("");
  const [subject, setSubject] = useState(() => {
    if (replyTo) return `Re: ${replyTo.subject}`;
    if (forwardOf) return `Fwd: ${forwardOf.subject}`;
    return "";
  });
  const [body, setBody]     = useState(() => {
    if (replyTo) return `\n\n---\nOn ${replyTo.sent_at ? format(parseISO(replyTo.sent_at), "d MMM yyyy") : ""}, ${replyTo.from_name || replyTo.from_address} wrote:\n${replyTo.body_text || ""}`;
    if (forwardOf) return `\n\n---\nForwarded message:\nFrom: ${forwardOf.from_name || forwardOf.from_address}\nSubject: ${forwardOf.subject}\n\n${forwardOf.body_text || ""}`;
    return "";
  });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) return;
    setSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const res = await supabase.functions.invoke("send-email", {
        body: { to, cc: cc || undefined, subject, bodyHtml: body.replace(/\n/g, "<br>"), replyToId: replyTo?.id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.error) throw new Error(res.error.message);
      onSent();
      onClose();
    } catch (err: any) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-xl bg-crm-card border border-crm-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-crm-border">
          <span className="text-[13px] font-semibold text-crm-text">
            {replyTo ? "Reply" : forwardOf ? "Forward" : "New Message"}
          </span>
          <button onClick={onClose} className="text-crm-text-dim hover:text-crm-text transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-4 pt-3 space-y-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-[12px] text-crm-text-dim border-b border-crm-border pb-2">
            <span className="w-8 flex-shrink-0">To:</span>
            <input value={to} onChange={e => setTo(e.target.value)}
              className="flex-1 bg-transparent text-crm-text outline-none placeholder-crm-text-faint"
              placeholder="recipient@example.com" />
          </div>
          <div className="flex items-center gap-2 text-[12px] text-crm-text-dim border-b border-crm-border pb-2">
            <span className="w-8 flex-shrink-0">CC:</span>
            <input value={cc} onChange={e => setCc(e.target.value)}
              className="flex-1 bg-transparent text-crm-text outline-none placeholder-crm-text-faint"
              placeholder="Optional CC" />
          </div>
          <div className="flex items-center gap-2 text-[12px] text-crm-text-dim border-b border-crm-border pb-2">
            <span className="w-8 flex-shrink-0">Re:</span>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              className="flex-1 bg-transparent text-crm-text outline-none placeholder-crm-text-faint"
              placeholder="Subject" />
          </div>
        </div>

        {/* Body */}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          className="flex-1 bg-transparent text-crm-text text-[12.5px] outline-none px-4 pt-3 pb-2 resize-none placeholder-crm-text-faint min-h-[160px]"
          placeholder="Write your message…"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-crm-border">
          <span className="text-[10px] text-crm-text-dim font-mono">From: {account.email_address}</span>
          <button
            onClick={handleSend}
            disabled={sending || !to.trim() || !subject.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email Detail Panel ───────────────────────────────────────────────────────
interface DetailPanelProps {
  email: Email;
  onReply: (e: Email) => void;
  onForward: (e: Email) => void;
  onStar: (id: string, starred: boolean) => void;
  onTrash: (id: string) => void;
}

function EmailDetailPanel({ email, onReply, onForward, onStar, onTrash }: DetailPanelProps) {
  const safeHtml = email.body_html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-crm-border flex-shrink-0">
        <h2 className="text-[14px] font-bold text-crm-text mb-3 leading-snug">{email.subject}</h2>
        <div className="space-y-1 text-[11px] text-crm-text-muted">
          <div className="flex gap-2">
            <span className="text-crm-text-dim w-6">From</span>
            <span className="text-crm-text-secondary">{email.from_name || email.from_address} {email.from_name && <span className="text-crm-text-dim">&lt;{email.from_address}&gt;</span>}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-crm-text-dim w-6">To</span>
            <span>{email.to_address}</span>
          </div>
          {email.cc_address && (
            <div className="flex gap-2">
              <span className="text-crm-text-dim w-6">CC</span>
              <span>{email.cc_address}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-crm-text-dim w-6">Date</span>
            <span>{email.sent_at ? format(parseISO(email.sent_at), "d MMM yyyy · h:mm a") : "—"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {[
            { label: "Reply",   icon: Reply,   action: () => onReply(email)                    },
            { label: "Forward", icon: Forward, action: () => onForward(email)                  },
            { label: email.is_starred ? "Unstar" : "Star", icon: Star, action: () => onStar(email.id, !email.is_starred) },
            { label: "Trash",   icon: Trash2,  action: () => onTrash(email.id)                 },
          ].map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              onClick={action}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                label === "Trash"
                  ? "border-red-900 text-crm-text-dim hover:text-red-400 hover:bg-red-950"
                  : label.includes("Star") && email.is_starred
                  ? "border-amber-700 text-amber-400 bg-amber-950"
                  : "border-crm-border text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface"
              }`}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
          {email.has_attachments && (
            <span className="flex items-center gap-1 text-[10px] text-crm-text-dim ml-auto">
              <Paperclip size={10} /> Attachments
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {email.body_html ? (
          <div
            className="text-[12.5px] text-crm-text-secondary leading-relaxed prose-sm max-w-none [&_a]:text-emerald-400 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <p className="text-[12.5px] text-crm-text-secondary leading-relaxed whitespace-pre-wrap">
            {email.body_text || "(No content)"}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────
export default function EmailInboxModule() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Email | null>(null);
  const [forwardTarget, setForwardTarget] = useState<Email | null>(null);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load email account
  const { data: account } = useQuery<EmailAccount | null>({
    queryKey: ["email-account", user?.id],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("email_accounts")
        .select("id, email_address, display_name")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .single();
      return res.data ?? null;
    },
    enabled: !!user?.id,
  });

  // Load emails
  const { data: emails = [], isLoading } = useQuery<Email[]>({
    queryKey: ["emails", account?.id, activeFolder],
    queryFn: async () => {
      if (!account) return [];
      let q = (supabase as any)
        .from("emails")
        .select("*")
        .eq("account_id", account.id)
        .order("sent_at", { ascending: false })
        .limit(100);

      if (activeFolder === "starred") {
        q = q.eq("is_starred", true);
      } else {
        q = q.eq("folder", activeFolder);
      }

      const res = await q;
      return (res.data ?? []).map((e: any) => ({
        id: e.id,
        account_id: e.account_id,
        zoho_message_id: e.zoho_message_id,
        from_address: e.from_address ?? "",
        from_name: e.from_name ?? "",
        to_address: e.to_address ?? "",
        cc_address: e.cc_address,
        subject: e.subject ?? "(No subject)",
        body_html: e.body_html ?? "",
        body_text: e.body_text ?? "",
        is_read: e.is_read ?? false,
        is_starred: e.is_starred ?? false,
        folder: e.folder ?? "inbox",
        has_attachments: e.has_attachments ?? false,
        sent_at: e.sent_at ?? e.synced_at,
      }));
    },
    enabled: !!account,
  });

  // Unread counts per folder
  const { data: unreadMap = {} } = useQuery<Record<string, number>>({
    queryKey: ["email-unread-counts", account?.id],
    queryFn: async () => {
      if (!account) return {};
      const res = await (supabase as any)
        .from("emails")
        .select("folder")
        .eq("account_id", account.id)
        .eq("is_read", false)
        .neq("folder", "sent")
        .neq("folder", "trash");
      const map: Record<string, number> = {};
      for (const row of (res.data ?? [])) {
        map[row.folder] = (map[row.folder] ?? 0) + 1;
      }
      return map;
    },
    enabled: !!account,
    refetchInterval: 60_000,
  });

  const syncEmails = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      await supabase.functions.invoke("sync-emails", {
        headers: { Authorization: `Bearer ${session?.session?.access_token}` },
      });
      qc.invalidateQueries({ queryKey: ["emails"] });
      qc.invalidateQueries({ queryKey: ["email-unread-counts"] });
    } finally {
      setSyncing(false);
    }
  }, [user, qc]);

  // Auto-sync on mount + every 5 minutes
  useEffect(() => {
    if (!account) return;
    syncEmails();
    syncInterval.current = setInterval(syncEmails, 5 * 60 * 1000);
    return () => { if (syncInterval.current) clearInterval(syncInterval.current); };
  }, [account?.id]);

  const markRead = useMutation({
    mutationFn: async (emailId: string) => {
      await (supabase as any).from("emails").update({ is_read: true }).eq("id", emailId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emails"] });
      qc.invalidateQueries({ queryKey: ["email-unread-counts"] });
      qc.invalidateQueries({ queryKey: ["email-inbox-unread"] });
    },
  });

  const toggleStar = useMutation({
    mutationFn: async ({ id, starred }: { id: string; starred: boolean }) => {
      await (supabase as any).from("emails").update({ is_starred: starred }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emails"] }),
  });

  const moveToTrash = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("emails").update({ folder: "trash" }).eq("id", id);
    },
    onSuccess: () => {
      setSelectedEmail(null);
      qc.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    if (!email.is_read) markRead.mutate(email.id);
  };

  const filteredEmails = emails.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.subject.toLowerCase().includes(q) ||
      e.from_address.toLowerCase().includes(q) ||
      e.from_name.toLowerCase().includes(q) ||
      e.body_text.toLowerCase().includes(q)
    );
  });

  // No email account
  if (!account && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-crm-surface border border-crm-border flex items-center justify-center">
          <Mail className="h-7 w-7 text-crm-text-dim" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-crm-text">No email account assigned</h2>
          <p className="text-sm text-crm-text-muted mt-1 max-w-sm">
            Contact your admin to have a <span className="font-mono text-emerald-500">@ecowasparliamentinitiatives.org</span> email address assigned to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6 overflow-hidden">
      {/* Folder sidebar */}
      <div className="w-[160px] flex-shrink-0 border-r border-crm-border bg-crm-card flex flex-col py-3">
        <div className="px-3 mb-3">
          <button
            onClick={() => { setReplyTarget(null); setForwardTarget(null); setComposeOpen(true); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-[12px] font-semibold transition-colors"
          >
            <Pencil size={12} /> Compose
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {FOLDERS.map(f => {
            const Icon = f.icon;
            const count = f.id === "starred" ? undefined : unreadMap[f.id];
            return (
              <button
                key={f.id}
                onClick={() => { setActiveFolder(f.id); setSelectedEmail(null); }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                  activeFolder === f.id
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface border border-transparent"
                }`}
              >
                <Icon size={13} className="flex-shrink-0" />
                <span className="text-[12px] font-medium flex-1 truncate">{f.label}</span>
                {count != null && count > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400 flex-shrink-0">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {account && (
          <div className="px-3 mt-3 border-t border-crm-border pt-3">
            <p className="text-[9px] text-crm-text-faint font-mono leading-tight break-all">{account.email_address}</p>
          </div>
        )}
      </div>

      {/* Email list */}
      <div className="w-[280px] flex-shrink-0 border-r border-crm-border flex flex-col bg-crm">
        {/* List header */}
        <div className="px-3 py-2.5 border-b border-crm-border flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-crm-text-dim" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search emails…"
              className="w-full bg-crm-surface border border-crm-border rounded-md text-[11px] text-crm-text placeholder-crm-text-faint pl-6 pr-2 py-1.5 outline-none focus:border-emerald-700"
            />
          </div>
          <button
            onClick={syncEmails}
            disabled={syncing}
            className="p-1.5 rounded text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface transition-colors"
            title="Sync emails"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Email items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#0f1a12]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <MailOpen size={24} className="text-crm-text-faint" />
              <p className="text-[11px] text-crm-text-faint">{search ? "No results" : "No emails"}</p>
            </div>
          ) : (
            filteredEmails.map(email => (
              <button
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className={`w-full text-left px-3 py-3 transition-colors hover:bg-crm-surface ${
                  selectedEmail?.id === email.id ? "bg-crm-surface border-l-2 border-emerald-600" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!email.is_read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                  )}
                  <div className={`flex-1 min-w-0 ${!email.is_read ? "" : "pl-3.5"}`}>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-[11.5px] truncate ${!email.is_read ? "font-bold text-crm-text" : "font-medium text-crm-text-muted"}`}>
                        {email.from_name || email.from_address}
                      </p>
                      <span className="text-[9px] text-crm-text-faint flex-shrink-0">
                        {email.sent_at ? format(parseISO(email.sent_at), "d MMM") : ""}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate ${!email.is_read ? "text-crm-text-secondary" : "text-crm-text-muted"}`}>
                      {email.subject}
                    </p>
                    <p className="text-[10px] text-crm-text-dim truncate mt-0.5">
                      {(email.body_text || "").slice(0, 80)}
                    </p>
                  </div>
                  {email.is_starred && (
                    <Star size={10} className="text-[#e4ca00] flex-shrink-0 fill-[#e4ca00] mt-1" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden bg-crm-card">
        {selectedEmail ? (
          <EmailDetailPanel
            email={selectedEmail}
            onReply={e => { setReplyTarget(e); setForwardTarget(null); setComposeOpen(true); }}
            onForward={e => { setForwardTarget(e); setReplyTarget(null); setComposeOpen(true); }}
            onStar={(id, starred) => toggleStar.mutate({ id, starred })}
            onTrash={id => moveToTrash.mutate(id)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="h-14 w-14 rounded-2xl bg-crm-surface border border-crm-border flex items-center justify-center">
              <Mail className="h-6 w-6 text-crm-text-faint" />
            </div>
            <p className="text-sm text-crm-text-dim">Select an email to read</p>
          </div>
        )}
      </div>

      {/* Compose modal */}
      {composeOpen && account && (
        <ComposeModal
          account={account}
          replyTo={replyTarget ?? undefined}
          forwardOf={forwardTarget ?? undefined}
          onClose={() => { setComposeOpen(false); setReplyTarget(null); setForwardTarget(null); }}
          onSent={() => { qc.invalidateQueries({ queryKey: ["emails"] }); }}
        />
      )}
    </div>
  );
}
