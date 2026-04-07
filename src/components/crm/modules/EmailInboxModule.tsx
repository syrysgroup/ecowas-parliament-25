import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Inbox, Send, FileText, Star, Trash2, RefreshCw, Pencil,
  Reply, Forward, Search, X, Paperclip, ChevronLeft, ChevronRight,
  Loader2, MailOpen, Mail, AlertOctagon, Tag, Folder,
  MoreVertical, Circle, Info, Minus, Bold, Italic, Underline,
  List, ListOrdered, Link, Image, Save,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

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

type Folder = "inbox" | "sent" | "drafts" | "starred" | "spam" | "trash";

const FOLDERS: { id: Folder; label: string; icon: React.ElementType }[] = [
  { id: "inbox",   label: "Inbox",   icon: Mail         },
  { id: "sent",    label: "Sent",    icon: Send         },
  { id: "drafts",  label: "Draft",   icon: FileText     },
  { id: "starred", label: "Starred", icon: Star         },
  { id: "spam",    label: "Spam",    icon: AlertOctagon },
  { id: "trash",   label: "Trash",   icon: Trash2       },
];

const LABELS = [
  { key: "personal",  label: "Personal",  color: "bg-emerald-500" },
  { key: "company",   label: "Company",   color: "bg-primary"     },
  { key: "important", label: "Important", color: "bg-amber-500"   },
  { key: "private",   label: "Private",   color: "bg-red-500"     },
];

const AVATAR_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-purple-600", "bg-amber-600",
  "bg-red-600", "bg-teal-600", "bg-pink-600", "bg-indigo-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Compose Modal (Bottom-right, Vuexy-style) ───────────────────────────────
interface ComposeProps {
  account: EmailAccount;
  replyTo?: Email;
  forwardOf?: Email;
  onClose: () => void;
  onSent: () => void;
}

function ComposeModal({ account, replyTo, forwardOf, onClose, onSent }: ComposeProps) {
  const { toast } = useToast();
  const [to, setTo] = useState(replyTo?.from_address ?? "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [subject, setSubject] = useState(() => {
    if (replyTo) return `Re: ${replyTo.subject}`;
    if (forwardOf) return `Fwd: ${forwardOf.subject}`;
    return "";
  });
  const [body, setBody] = useState(() => {
    if (replyTo) return `\n\n---\nOn ${replyTo.sent_at ? format(parseISO(replyTo.sent_at), "d MMM yyyy") : ""}, ${replyTo.from_name || replyTo.from_address} wrote:\n${replyTo.body_text || ""}`;
    if (forwardOf) return `\n\n---\nForwarded message:\nFrom: ${forwardOf.from_name || forwardOf.from_address}\nSubject: ${forwardOf.subject}\n\n${forwardOf.body_text || ""}`;
    return "";
  });
  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) return;
    setSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const res = await supabase.functions.invoke("send-email", {
        body: {
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject,
          bodyHtml: body.replace(/\n/g, "<br>"),
          replyToId: replyTo?.id,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.error) throw new Error(res.error.message);
      // If this was a draft, delete it now that it's been sent
      if (draftId) {
        await (supabase as any).from("emails").delete().eq("id", draftId);
      }
      toast({ title: "Email sent" });
      onSent();
      onClose();
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!to && !subject && !body.trim()) return;
    setSavingDraft(true);
    try {
      const row: Record<string, any> = {
        account_id: account.id,
        folder: "drafts",
        from_address: account.email_address,
        to_address: to || null,
        cc_address: cc || null,
        subject: subject || "(No subject)",
        body_html: body.replace(/\n/g, "<br>"),
        body_text: body,
        is_read: true,
        sent_at: new Date().toISOString(),
      };
      if (draftId) {
        const { error } = await (supabase as any).from("emails").update(row).eq("id", draftId);
        if (error) throw error;
      } else {
        const newId = crypto.randomUUID();
        const { error } = await (supabase as any).from("emails").insert({ id: newId, ...row });
        if (error) throw error;
        setDraftId(newId);
      }
      toast({ title: "Draft saved" });
    } catch (err: any) {
      toast({ title: "Failed to save draft", description: err.message, variant: "destructive" });
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-6 z-50 w-full max-w-[36rem] shadow-2xl rounded-t-xl overflow-hidden border border-crm-border bg-crm-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-crm-surface">
        <h5 className="text-[15px] font-medium text-crm-text">
          {replyTo ? "Reply" : forwardOf ? "Forward" : "Compose Mail"}
        </h5>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-full hover:bg-crm-border text-crm-text-muted transition-colors">
            <Minus size={16} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-crm-border text-crm-text-muted transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Fields */}
          <div className="px-5 py-2">
            {/* To */}
            <div className="flex items-center gap-2 py-2">
              <label className="text-[13px] text-crm-text-muted font-medium w-8">To:</label>
              <input value={to} onChange={e => setTo(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-crm-text outline-none placeholder-crm-text-faint"
                placeholder="recipient@example.com" />
              <div className="flex items-center gap-1 text-[13px]">
                <button onClick={() => setShowCc(!showCc)} className="text-crm-text-muted hover:text-crm-text transition-colors">Cc</button>
                <span className="text-crm-text-faint">|</span>
                <button onClick={() => setShowBcc(!showBcc)} className="text-crm-text-muted hover:text-crm-text transition-colors">Bcc</button>
              </div>
            </div>
            {showCc && (
              <>
                <hr className="border-crm-border -mx-5 my-0" />
                <div className="flex items-center gap-2 py-2">
                  <label className="text-[13px] text-crm-text-muted font-medium w-8">Cc:</label>
                  <input value={cc} onChange={e => setCc(e.target.value)}
                    className="flex-1 bg-transparent text-[13px] text-crm-text outline-none placeholder-crm-text-faint"
                    placeholder="someone@email.com" />
                </div>
              </>
            )}
            {showBcc && (
              <>
                <hr className="border-crm-border -mx-5 my-0" />
                <div className="flex items-center gap-2 py-2">
                  <label className="text-[13px] text-crm-text-muted font-medium w-8">Bcc:</label>
                  <input value={bcc} onChange={e => setBcc(e.target.value)}
                    className="flex-1 bg-transparent text-[13px] text-crm-text outline-none placeholder-crm-text-faint"
                    placeholder="someone@email.com" />
                </div>
              </>
            )}
            <hr className="border-crm-border -mx-5 my-0" />
            <div className="flex items-center gap-2 py-2">
              <label className="text-[13px] text-crm-text-muted font-medium w-16">Subject:</label>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-crm-text outline-none placeholder-crm-text-faint"
                placeholder="Subject" />
            </div>
            <hr className="border-crm-border -mx-5 my-0" />
          </div>

          {/* Body */}
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            className="w-full bg-transparent text-crm-text text-[13px] outline-none px-5 py-3 resize-none placeholder-crm-text-faint min-h-[180px]"
            placeholder="Write your message…"
          />

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-crm-border">
            <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-crm-text-muted hover:text-crm-text transition-colors">
              <Paperclip size={14} />
              <span>Attachments</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={savingDraft || (!to && !subject && !body.trim())}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-crm-border text-crm-text-muted hover:text-crm-text text-[13px] transition-colors disabled:opacity-40"
              >
                {savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{savingDraft ? "Saving…" : "Save Draft"}</span>
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !to.trim() || !subject.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-[13px] font-medium transition-colors disabled:opacity-50"
              >
                <span>{sending ? "Sending…" : "Send"}</span>
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Email Detail Panel (Vuexy thread card layout) ────────────────────────────
interface DetailPanelProps {
  email: Email;
  onBack: () => void;
  onReply: (e: Email) => void;
  onForward: (e: Email) => void;
  onStar: (id: string, starred: boolean) => void;
  onTrash: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function EmailDetailPanel({ email, onBack, onReply, onForward, onStar, onTrash, onPrev, onNext, hasPrev, hasNext }: DetailPanelProps) {
  const safeHtml = email.body_html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");

  const senderInitials = getInitials(email.from_name || email.from_address);
  const senderColor = getAvatarColor(email.from_name || email.from_address);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: back + subject + actions */}
      <div className="px-5 py-3 border-b border-crm-border flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-[15px] font-semibold text-crm-text flex-1 truncate">{email.subject}</h2>
      </div>

      {/* Action bar */}
      <div className="px-5 py-2 border-b border-crm-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => onTrash(email.id)} className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors" title="Delete">
            <Trash2 size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors" title="Move to folder">
            <Folder size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors" title="Label">
            <Tag size={18} />
          </button>
          <button onClick={() => onStar(email.id, !email.is_starred)} className={`p-2 rounded-full hover:bg-crm-surface transition-colors ${email.is_starred ? "text-amber-400" : "text-crm-text-muted"}`} title="Star">
            <Star size={18} fill={email.is_starred ? "currentColor" : "none"} />
          </button>
          <button className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors" title="More">
            <MoreVertical size={18} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onPrev} disabled={!hasPrev} className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors disabled:opacity-30" title="Previous">
            <ChevronLeft size={18} />
          </button>
          <button onClick={onNext} disabled={!hasNext} className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors disabled:opacity-30" title="Next">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Email content (thread card layout) */}
      <div className="flex-1 overflow-y-auto py-5 px-4 sm:px-6">
        {/* Email card */}
        <div className="border border-crm-border rounded-xl bg-crm-card shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-crm-border">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${senderColor} flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0`}>
                {senderInitials}
              </div>
              <div>
                <h6 className="text-[14px] font-medium text-crm-text">{email.from_name || email.from_address}</h6>
                <span className="text-[12px] text-crm-text-muted">{email.from_address}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-crm-text-muted">
                {email.sent_at ? format(parseISO(email.sent_at), "MMMM do yyyy, hh:mm a") : "—"}
              </span>
              {email.has_attachments && (
                <button className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors">
                  <Paperclip size={18} />
                </button>
              )}
              <button onClick={() => onStar(email.id, !email.is_starred)} className={`p-1.5 rounded-full hover:bg-crm-surface transition-colors ${email.is_starred ? "text-amber-400" : "text-crm-text-muted"}`}>
                <Star size={18} fill={email.is_starred ? "currentColor" : "none"} />
              </button>
              <button className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Card body */}
          <div className="px-5 py-5">
            {email.body_html ? (
              <div
                className="text-[13px] text-crm-text-secondary leading-relaxed prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: safeHtml }}
              />
            ) : (
              <p className="text-[13px] text-crm-text-secondary leading-relaxed whitespace-pre-wrap">
                {email.body_text || "(No content)"}
              </p>
            )}

            {email.has_attachments && (
              <>
                <hr className="border-crm-border my-4" />
                <p className="text-[12px] text-crm-text-muted mb-2">Attachments</p>
                <div className="flex items-center gap-1.5 text-[13px] text-crm-text-secondary cursor-pointer hover:text-crm-text">
                  <FileText size={14} />
                  <span>attachment.file</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reply card */}
        <div className="border border-crm-border rounded-xl bg-crm-card shadow-sm mt-4">
          <h6 className="px-5 py-3 text-[14px] font-normal text-crm-text">
            Reply to {email.from_name || email.from_address}
          </h6>
          <div className="px-5 pb-4">
            {/* Mini toolbar */}
            <div className="flex items-center gap-0.5 pb-3 border-b border-crm-border mb-3">
              {[Bold, Italic, Underline, ListOrdered, List, Link, Image].map((Icon, i) => (
                <button key={i} className="p-1.5 rounded hover:bg-crm-surface text-crm-text-muted transition-colors">
                  <Icon size={15} />
                </button>
              ))}
            </div>
            <div className="min-h-[80px] text-[13px] text-crm-text-faint italic">
              Click to write your reply…
            </div>
            <div className="flex items-center justify-end gap-3 mt-4">
              <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-crm-text-muted hover:text-crm-text transition-colors">
                <Paperclip size={14} />
                <span>Attachments</span>
              </button>
              <button
                onClick={() => onReply(email)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-[13px] font-medium transition-colors"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────
export default function EmailInboxModule() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Email | null>(null);
  const [forwardTarget, setForwardTarget] = useState<Email | null>(null);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
      qc.invalidateQueries({ queryKey: ["emails"], refetchType: "all" });
      qc.invalidateQueries({ queryKey: ["email-unread-counts"], refetchType: "all" });
      qc.invalidateQueries({ queryKey: ["email-inbox-unread"], refetchType: "all" });
    } finally {
      setSyncing(false);
    }
  }, [user, qc]);

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

  const currentIdx = selectedEmail ? filteredEmails.findIndex(e => e.id === selectedEmail.id) : -1;

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEmails.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmails.map(e => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  // ── Connect Email Dialog state ──
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectEmail, setConnectEmail] = useState("");
  const [connectPassword, setConnectPassword] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

  // ── Re-auth Dialog state (triggered when stored credentials fail) ──
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthEmail, setReauthEmail] = useState("");
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const [reauthSaving, setReauthSaving] = useState(false);

  // Track whether we've validated this browser session (avoid re-checking every render)
  const sessionValidatedKey = `email_validated_${user?.id}`;

  const callValidate = async (email: string, password: string, checkStored = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("validate-email-credentials", {
      body: checkStored ? { checkStored: true } : { email, password },
      headers: { Authorization: `Bearer ${session?.session?.access_token}` },
    });
    if (res.error) throw new Error(res.error.message);
    const data = res.data as { valid: boolean; error?: string };
    return data;
  };

  // On mount: if account exists and not yet validated this session, silently check stored credentials
  useEffect(() => {
    if (!account || !user) return;
    if (sessionStorage.getItem(sessionValidatedKey) === "ok") return;

    (async () => {
      try {
        const result = await callValidate("", "", true);
        if (result.valid) {
          sessionStorage.setItem(sessionValidatedKey, "ok");
        } else {
          // Stored credentials are invalid — prompt re-auth
          setReauthEmail(account.email_address ?? "");
          setReauthError(result.error ?? "Your email credentials have expired or changed. Please log in again.");
          setReauthOpen(true);
        }
      } catch {
        // Network/function error — skip silently, don't block the UI
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id]);

  const handleConnectEmail = async () => {
    if (!connectEmail.trim() || !connectPassword.trim() || !user) return;
    setConnecting(true);
    setConnectError("");
    try {
      const result = await callValidate(connectEmail.trim(), connectPassword);
      if (!result.valid) {
        setConnectError(result.error ?? "Invalid credentials. Please check your email and password.");
        return;
      }
      // Credentials valid — edge function already saved to DB
      sessionStorage.setItem(sessionValidatedKey, "ok");
      qc.invalidateQueries({ queryKey: ["email-account"] });
      setConnectOpen(false);
      setConnectEmail("");
      setConnectPassword("");
    } catch (err: any) {
      setConnectError(err.message ?? "Connection failed. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleReauth = async () => {
    if (!reauthPassword.trim() || !user) return;
    setReauthSaving(true);
    setReauthError("");
    try {
      const result = await callValidate(reauthEmail.trim(), reauthPassword);
      if (!result.valid) {
        setReauthError(result.error ?? "Invalid credentials. Please check your password.");
        return;
      }
      sessionStorage.setItem(sessionValidatedKey, "ok");
      qc.invalidateQueries({ queryKey: ["email-account"] });
      setReauthOpen(false);
      setReauthPassword("");
      toast({ title: "Email reconnected successfully" });
    } catch (err: any) {
      setReauthError(err.message ?? "Connection failed. Please try again.");
    } finally {
      setReauthSaving(false);
    }
  };

  // No email account
  if (!account && !isLoading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-crm-surface border border-crm-border flex items-center justify-center">
            <Mail className="h-7 w-7 text-crm-text-dim" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-crm-text">No email account connected</h2>
            <p className="text-sm text-crm-text-muted mt-1 max-w-sm">
              Connect your email to start sending and receiving messages directly from the CRM.
            </p>
          </div>
          <button
            onClick={() => setConnectOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[14px] font-medium transition-colors"
          >
            <Mail size={16} />
            Login to Email
          </button>
        </div>

        {/* Connect Email Dialog */}
        {connectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-crm-card border border-crm-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-crm-text">Connect Your Email</h3>
                <button onClick={() => setConnectOpen(false)} className="text-crm-text-dim hover:text-crm-text transition-colors">
                  <X size={16} />
                </button>
              </div>
              <p className="text-[12px] text-crm-text-muted">
                Enter your email address and password. Server settings are managed by your administrator.
              </p>
              {connectError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/50">
                  <AlertOctagon size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-300 leading-relaxed">{connectError}</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-crm-text-dim font-medium">Email Address</label>
                  <input
                    type="email"
                    value={connectEmail}
                    onChange={e => { setConnectEmail(e.target.value); setConnectError(""); }}
                    placeholder="you@example.com"
                    className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:border-primary placeholder:text-crm-text-faint"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-crm-text-dim font-medium">Password</label>
                  <input
                    type="password"
                    value={connectPassword}
                    onChange={e => { setConnectPassword(e.target.value); setConnectError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleConnectEmail()}
                    placeholder="••••••••"
                    className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:border-primary placeholder:text-crm-text-faint"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => { setConnectOpen(false); setConnectError(""); }}
                  className="flex-1 px-4 py-2 text-[13px] text-crm-text-muted border border-crm-border rounded-lg hover:bg-crm-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnectEmail}
                  disabled={connecting || !connectEmail.trim() || !connectPassword.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-[13px] font-medium transition-colors disabled:opacity-50"
                >
                  {connecting ? (
                    <><Loader2 size={14} className="animate-spin" /> Verifying…</>
                  ) : (
                    <><Mail size={14} /> Connect</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Re-auth Dialog (triggered when stored credentials are invalid) */}
        {reauthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-crm-card border border-crm-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center flex-shrink-0">
                  <AlertOctagon size={16} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-crm-text">Email Re-authentication Required</h3>
                  <p className="text-[11px] text-crm-text-muted mt-0.5">Your email credentials need to be verified.</p>
                </div>
              </div>
              {reauthError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/50">
                  <AlertOctagon size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-300 leading-relaxed">{reauthError}</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-crm-text-dim font-medium">Email Address</label>
                  <input
                    type="email"
                    value={reauthEmail}
                    onChange={e => { setReauthEmail(e.target.value); setReauthError(""); }}
                    placeholder="you@example.com"
                    className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:border-primary placeholder:text-crm-text-faint"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-crm-text-dim font-medium">Password</label>
                  <input
                    type="password"
                    value={reauthPassword}
                    onChange={e => { setReauthPassword(e.target.value); setReauthError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleReauth()}
                    placeholder="Enter your email password"
                    className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:border-primary placeholder:text-crm-text-faint"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => { setReauthOpen(false); setReauthPassword(""); setReauthError(""); }}
                  className="flex-1 px-4 py-2 text-[13px] text-crm-text-muted border border-crm-border rounded-lg hover:bg-crm-surface transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={handleReauth}
                  disabled={reauthSaving || !reauthPassword.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-[13px] font-medium transition-colors disabled:opacity-50"
                >
                  {reauthSaving ? (
                    <><Loader2 size={14} className="animate-spin" /> Verifying…</>
                  ) : (
                    <><Mail size={14} /> Reconnect</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6 overflow-hidden rounded-xl border border-crm-border bg-crm-card shadow-sm">
      {/* ── Sidebar ── */}
      <div className="w-[220px] flex-shrink-0 border-r border-crm-border flex flex-col">
        {/* Compose button */}
        <div className="p-5 pb-2">
          <button
            onClick={() => { setReplyTarget(null); setForwardTarget(null); setComposeOpen(true); }}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[14px] font-medium transition-colors"
          >
            Compose
          </button>
        </div>

        {/* Folder list */}
        <nav className="flex-1 px-4 pt-4 pb-2 space-y-0.5">
          {FOLDERS.map(f => {
            const Icon = f.icon;
            const count = f.id === "starred" ? undefined : unreadMap[f.id];
            const isActive = activeFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => { setActiveFolder(f.id); setSelectedEmail(null); setSelectedIds(new Set()); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-crm-text-muted hover:text-crm-text hover:bg-crm-surface"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="text-[14px]">{f.label}</span>
                </div>
                {count != null && count > 0 && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    f.id === "inbox" ? "bg-primary/15 text-primary" :
                    f.id === "drafts" ? "bg-amber-500/15 text-amber-500" :
                    "bg-red-500/15 text-red-500"
                  }`}>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Labels section */}
          <div className="pt-5">
            <p className="text-[11px] font-medium uppercase text-crm-text-faint tracking-wider px-3 mb-2">Labels</p>
            {LABELS.map(l => (
              <button key={l.key} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-crm-text-muted hover:text-crm-text hover:bg-crm-surface transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span className="text-[14px]">{l.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {account && (
          <div className="px-5 py-3 border-t border-crm-border">
            <p className="text-[10px] text-crm-text-faint font-mono leading-tight break-all">{account.email_address}</p>
          </div>
        )}
      </div>

      {/* ── Email List ── */}
      <div className={`flex flex-col border-r border-crm-border ${selectedEmail ? "w-[340px] flex-shrink-0" : "flex-1"}`}>
        {/* Search bar */}
        <div className="px-5 pt-4 pb-2 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <Search size={18} className="text-crm-text-muted flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search mail"
              className="w-full bg-transparent text-[14px] text-crm-text placeholder-crm-text-faint outline-none"
            />
          </div>
        </div>
        <hr className="border-crm-border mx-3" />

        {/* Action toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-0.5">
            <div className="px-2">
              <Checkbox
                checked={filteredEmails.length > 0 && selectedIds.size === filteredEmails.length}
                onCheckedChange={toggleSelectAll}
                className="border-crm-border"
              />
            </div>
            <button className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors" title="Delete">
              <Trash2 size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors" title="Mark as read">
              <MailOpen size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors" title="Move to folder">
              <Folder size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors" title="Label">
              <Tag size={18} />
            </button>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={syncEmails}
              disabled={syncing}
              className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
            </button>
            <button className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors" title="More options">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
        <hr className="border-crm-border" />

        {/* Email items */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <MailOpen size={28} className="text-crm-text-faint" />
              <p className="text-[13px] text-crm-text-faint">{search ? "No results" : "No emails"}</p>
            </div>
          ) : (
            filteredEmails.map(email => {
              const isUnread = !email.is_read;
              const senderName = email.from_name || email.from_address;
              const initials = getInitials(senderName);
              const avatarColor = getAvatarColor(senderName);
              const isChecked = selectedIds.has(email.id);

              return (
                <div
                  key={email.id}
                  className={`group flex items-center gap-2 px-3 py-3 border-b border-crm-border/50 cursor-pointer transition-colors hover:bg-crm-surface/60 ${
                    selectedEmail?.id === email.id ? "bg-crm-surface" : ""
                  } ${isUnread ? "bg-crm-card" : ""}`}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0 px-1">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleSelect(email.id)}
                      className="border-crm-border"
                    />
                  </div>

                  {/* Star */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStar.mutate({ id: email.id, starred: !email.is_starred }); }}
                    className={`flex-shrink-0 p-0.5 ${email.is_starred ? "text-amber-400" : "text-crm-text-faint hover:text-amber-400"} transition-colors`}
                  >
                    <Star size={16} fill={email.is_starred ? "currentColor" : "none"} />
                  </button>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                    {initials}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0" onClick={() => handleSelectEmail(email)}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] truncate ${isUnread ? "font-semibold text-crm-text" : "text-crm-text-muted"}`}>
                        {senderName}
                      </span>
                      <span className={`text-[13px] truncate flex-1 ${isUnread ? "text-crm-text-secondary" : "text-crm-text-dim"}`}>
                        {email.subject}
                      </span>
                    </div>
                  </div>

                  {/* Meta (time + label dot + hover actions) */}
                  <div className="flex items-center gap-2 flex-shrink-0 relative">
                    {/* Normal state: label dot + time */}
                    <div className="flex items-center gap-2 group-hover:invisible">
                      {email.has_attachments && <Paperclip size={13} className="text-crm-text-faint" />}
                      <small className="text-[12px] text-crm-text-muted whitespace-nowrap">
                        {email.sent_at ? format(parseISO(email.sent_at), "h:mm a") : ""}
                      </small>
                    </div>
                    {/* Hover state: action icons */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-crm-surface rounded-lg px-1">
                      <button onClick={(e) => { e.stopPropagation(); markRead.mutate(email.id); }} className="p-1.5 rounded-full hover:bg-crm-border text-crm-text-muted transition-colors" title="Mark as read">
                        <Mail size={15} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveToTrash.mutate(email.id); }} className="p-1.5 rounded-full hover:bg-crm-border text-crm-text-muted transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                      <button className="p-1.5 rounded-full hover:bg-crm-border text-crm-text-muted transition-colors" title="Info">
                        <Info size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Detail Panel ── */}
      <div className="flex-1 overflow-hidden bg-crm">
        {selectedEmail ? (
          <EmailDetailPanel
            email={selectedEmail}
            onBack={() => setSelectedEmail(null)}
            onReply={e => { setReplyTarget(e); setForwardTarget(null); setComposeOpen(true); }}
            onForward={e => { setForwardTarget(e); setReplyTarget(null); setComposeOpen(true); }}
            onStar={(id, starred) => toggleStar.mutate({ id, starred })}
            onTrash={id => moveToTrash.mutate(id)}
            onPrev={() => { if (currentIdx > 0) handleSelectEmail(filteredEmails[currentIdx - 1]); }}
            onNext={() => { if (currentIdx < filteredEmails.length - 1) handleSelectEmail(filteredEmails[currentIdx + 1]); }}
            hasPrev={currentIdx > 0}
            hasNext={currentIdx < filteredEmails.length - 1}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="h-14 w-14 rounded-2xl bg-crm-surface border border-crm-border flex items-center justify-center">
              <Mail className="h-6 w-6 text-crm-text-faint" />
            </div>
            <p className="text-[14px] text-crm-text-dim">Select an email to read</p>
          </div>
        )}
      </div>

      {/* ── Compose Modal (bottom-right) ── */}
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
