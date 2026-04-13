import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Inbox, Send, FileText, Star, Trash2, RefreshCw, Pencil,
  Reply, Forward, Search, X, Paperclip, ChevronLeft, ChevronRight,
  Loader2, MailOpen, Mail, AlertOctagon, Folder,
  MoreVertical, Bold, Italic, Underline, List, ListOrdered,
  Link, Save, Archive, Tag, Check, ChevronDown, Menu,
  ReplyAll, Filter, Clock, Zap, Plus, Eye, EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO, formatDistanceToNowStrict } from "date-fns";
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
  thread_id: string | null;
  is_archived: boolean;
  labels?: EmailLabel[];
}

interface EmailAccount {
  id: string;
  email_address: string;
  display_name: string | null;
}

interface EmailContact {
  id: string;
  email_address: string;
  display_name: string | null;
  contact_count: number;
}

interface EmailLabel {
  id: string;
  name: string;
  color: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
}

interface ZohoFolder {
  folderId: string;
  folderName: string;
  unreadCount: number;
  messageCount: number;
  isSystemFolder: boolean;
}

interface SearchFilters {
  from?: string;
  to?: string;
  subject?: string;
  hasAttachment?: boolean;
  isStarred?: boolean;
  isUnread?: boolean;
  freetext?: string;
}

const SYSTEM_FOLDERS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: "inbox",   label: "Inbox",   icon: Inbox     },
  { id: "sent",    label: "Sent",    icon: Send      },
  { id: "drafts",  label: "Drafts",  icon: FileText  },
  { id: "starred", label: "Starred", icon: Star      },
  { id: "archive", label: "Archive", icon: Archive   },
  { id: "spam",    label: "Spam",    icon: AlertOctagon },
  { id: "trash",   label: "Trash",   icon: Trash2    },
];

const AVATAR_COLORS = [
  "bg-emerald-600","bg-blue-600","bg-purple-600","bg-amber-600",
  "bg-red-600","bg-teal-600","bg-pink-600","bg-indigo-600",
];

function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function relTime(ts: string) {
  try {
    const d = parseISO(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return formatDistanceToNowStrict(d, { addSuffix: false }).replace(" minutes","m").replace(" minute","m");
    if (diff < 86_400_000) return format(d, "h:mm a");
    if (diff < 604_800_000) return format(d, "EEE");
    return format(d, "MMM d");
  } catch { return ""; }
}

function parseSearchQuery(q: string): SearchFilters {
  const filters: SearchFilters = {};
  let rest = q;
  const extract = (key: string) => {
    const re = new RegExp(`${key}:(\\S+)`, "i");
    const m = rest.match(re);
    if (m) { rest = rest.replace(m[0], "").trim(); return m[1]; }
    return undefined;
  };
  filters.from = extract("from");
  filters.to = extract("to");
  filters.subject = extract("subject");
  if (/has:attachment/i.test(rest)) { filters.hasAttachment = true; rest = rest.replace(/has:attachment/i, "").trim(); }
  if (/is:starred/i.test(rest)) { filters.isStarred = true; rest = rest.replace(/is:starred/i, "").trim(); }
  if (/is:unread/i.test(rest)) { filters.isUnread = true; rest = rest.replace(/is:unread/i, "").trim(); }
  filters.freetext = rest.trim() || undefined;
  return filters;
}

// ─── Contact autocomplete hook ────────────────────────────────────────────────
function useContactSearch(query: string, userId: string | undefined) {
  return useQuery<EmailContact[]>({
    queryKey: ["email-contacts-search", query, userId],
    queryFn: async () => {
      if (!userId || !query) return [];
      const { data } = await (supabase as any)
        .from("email_contacts")
        .select("id, email_address, display_name, contact_count")
        .eq("user_id", userId)
        .or(`email_address.ilike.%${query}%,display_name.ilike.%${query}%`)
        .order("contact_count", { ascending: false })
        .limit(8);
      return (data ?? []) as EmailContact[];
    },
    enabled: !!userId && query.length >= 1,
  });
}

// ─── Recipient chip field ─────────────────────────────────────────────────────
interface RecipientFieldProps {
  label: string;
  chips: string[];
  onChange: (chips: string[]) => void;
  userId?: string;
}

function RecipientField({ label, chips, onChange, userId }: RecipientFieldProps) {
  const [inputVal, setInputVal] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { data: suggestions = [] } = useContactSearch(inputVal, userId);

  const confirm = (addr: string) => {
    const clean = addr.trim().replace(/,$/, "");
    if (!clean || chips.includes(clean)) { setInputVal(""); setOpen(false); return; }
    onChange([...chips, clean]);
    setInputVal("");
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-crm-border/60 relative" ref={wrapRef}>
      <span className="text-[11px] font-semibold text-crm-text-muted w-7 pt-0.5 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1 flex-1 min-w-0">
        {chips.map(c => (
          <span key={c} className="flex items-center gap-1 bg-primary/15 text-primary text-[11px] rounded-full px-2 py-0.5 font-medium">
            {c}
            <button type="button" onClick={() => onChange(chips.filter(x => x !== c))} className="hover:text-red-400 transition-colors">
              <X size={9} />
            </button>
          </span>
        ))}
        <input
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); setOpen(true); }}
          onFocus={() => inputVal && setOpen(true)}
          onKeyDown={e => {
            if ((e.key === "Enter" || e.key === "," || e.key === "Tab") && inputVal.includes("@")) {
              e.preventDefault(); confirm(inputVal);
            }
            if (e.key === "Backspace" && !inputVal && chips.length > 0) {
              onChange(chips.slice(0, -1));
            }
          }}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-[12px] text-crm-text placeholder-crm-text-faint"
          placeholder={chips.length === 0 ? "Add recipients…" : ""}
          autoCapitalize="none" autoCorrect="off"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 top-full mt-0.5 z-[200] w-full max-w-xs bg-crm-card border border-crm-border rounded-xl shadow-2xl overflow-hidden">
          {suggestions.map(c => (
            <button
              key={c.id}
              type="button"
              onMouseDown={e => { e.preventDefault(); confirm(c.email_address); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-crm-surface text-left transition-colors"
            >
              <div className={`w-7 h-7 rounded-full ${getAvatarColor(c.display_name || c.email_address)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                {getInitials(c.display_name || c.email_address)}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-crm-text truncate">{c.display_name ?? c.email_address}</div>
                {c.display_name && <div className="text-[11px] text-crm-text-muted truncate">{c.email_address}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Compose Window ───────────────────────────────────────────────────────────
interface ComposeProps {
  account: EmailAccount;
  replyTo?: Email;
  replyToAll?: Email;
  forwardOf?: Email;
  onClose: () => void;
  onSent: () => void;
  userId?: string;
}

interface ComposeAttachment { name: string; base64: string; contentType: string; size: number; }

function ComposeModal({ account, replyTo, replyToAll, forwardOf, onClose, onSent, userId }: ComposeProps) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const initTo = (): string[] => {
    if (replyTo) return [replyTo.from_address];
    if (replyToAll) {
      const addrs = [replyToAll.from_address];
      if (replyToAll.cc_address) addrs.push(...replyToAll.cc_address.split(",").map(s => s.trim()).filter(Boolean));
      return [...new Set(addrs)];
    }
    return [];
  };

  const [toChips, setToChips] = useState<string[]>(initTo);
  const [ccChips, setCcChips] = useState<string[]>(replyToAll ? [replyToAll.to_address] : []);
  const [bccChips, setBccChips] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [subject, setSubject] = useState(() => {
    if (replyTo) return `Re: ${replyTo.subject.replace(/^re:\s*/i, "")}`;
    if (replyToAll) return `Re: ${replyToAll.subject.replace(/^re:\s*/i, "")}`;
    if (forwardOf) return `Fwd: ${forwardOf.subject}`;
    return "";
  });
  const bodyRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [zohoDraftId, setZohoDraftId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [undoCountdown, setUndoCountdown] = useState(0);
  const undoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveTemplateMode, setSaveTemplateMode] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const { data: templates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ["email-templates", userId],
    queryFn: async () => {
      const { data } = await (supabase as any).from("email_templates").select("id,name,subject,body_html").eq("user_id", userId).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!userId,
  });

  // Build initial body with full branded HTML signature
  useEffect(() => {
    if (!userId) return;
    (supabase as any).from("email_signatures").select("title,full_name,department,mobile,email,website,tagline,is_active").eq("user_id", userId).maybeSingle()
      .then(({ data }: any) => {
        let sig = "";
        if (data?.is_active) {
          const sigName = [data.title, data.full_name].filter(Boolean).join(" ");
          const logoUrl = "https://xahuyraommtfopnxrjvz.supabase.co/storage/v1/object/public/branding/logos/sing.png";
          const websiteRaw = (data.website || "www.ecowasparliamentinitiatives.org").replace(/^https?:\/\//, "");
          const parts: string[] = [];
          parts.push('<div style="font-family:Arial,sans-serif;font-size:13px;color:#222;margin-top:20px;padding-top:12px;border-top:2px solid #006633">');
          parts.push('<strong style="font-size:14px;color:#111">' + sigName + "</strong><br>");
          parts.push('<span style="color:#006633;font-weight:600">ECOWAS Parliament Initiatives</span><br>');
          if (data.department) parts.push(data.department + "<br>");
          if (data.mobile) parts.push("Mobile Number: <strong>" + data.mobile + "</strong><br>");
          if (data.email) parts.push('Email: <a href="mailto:' + data.email + '" style="color:#006633;text-decoration:none">' + data.email + "</a><br>");
          parts.push('Website: <a href="https://' + websiteRaw + '" style="color:#006633;text-decoration:none">' + websiteRaw + "</a><br>");
          if (data.tagline) parts.push('<br><em style="color:#006633">' + data.tagline + "</em>");
          parts.push('<br><img src="' + logoUrl + '" alt="ECOWAS Parliament Initiatives" style="height:70px;display:block;margin-top:8px" />');
          parts.push("</div>");
          sig = "<br><br>" + parts.join("\n");
        }
        let quoted = "";
        if (replyTo || replyToAll) {
          const orig = replyTo || replyToAll!;
          const dateStr = orig.sent_at ? format(parseISO(orig.sent_at), "d MMM yyyy") : "";
          const fromStr = orig.from_name || orig.from_address;
          quoted = '<br><hr style="border-top:1px solid #ccc;margin:12px 0"><div style="color:#777;font-size:12px">On ' + dateStr + ", " + fromStr + ' wrote:</div><blockquote style="border-left:3px solid #ccc;padding-left:10px;margin:8px 0;color:#555">' + (orig.body_html || orig.body_text) + "</blockquote>";
        } else if (forwardOf) {
          quoted = '<br><hr style="border-top:1px solid #ccc;margin:12px 0"><div style="color:#777;font-size:12px">---------- Forwarded message ----------<br>From: ' + (forwardOf.from_name || forwardOf.from_address) + "<br>Subject: " + forwardOf.subject + '</div><blockquote style="border-left:3px solid #ccc;padding-left:10px;margin:8px 0;color:#555">' + (forwardOf.body_html || forwardOf.body_text) + "</blockquote>";
        }
        if (bodyRef.current) {
          bodyRef.current.innerHTML = sig + quoted;
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const getBodyHtml = () => bodyRef.current?.innerHTML ?? "";

  const execFmt = (cmd: string, val?: string) => {
    bodyRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) execFmt("createLink", url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: `${file.name} exceeds 5 MB`, variant: "destructive" }); return; }
      const r = new FileReader();
      r.onload = () => {
        const b64 = (r.result as string).split(",")[1] ?? "";
        setAttachments(p => [...p, { name: file.name, base64: b64, contentType: file.type || "application/octet-stream", size: file.size }]);
      };
      r.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const executeSend = async () => {
    setSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const bodyHtml = getBodyHtml();
      const res = await supabase.functions.invoke("send-email", {
        body: {
          to: toChips.join(", "),
          cc: ccChips.join(", ") || undefined,
          bcc: bccChips.join(", ") || undefined,
          subject,
          bodyHtml,
          replyToId: replyTo?.id ?? replyToAll?.id,
          attachments: attachments.length > 0 ? attachments : undefined,
          clientSignatureIncluded: true,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      if (draftId) {
        if (zohoDraftId) {
          await supabase.functions.invoke("update-email", { body: { action: "delete", email_id: draftId }, headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        } else {
          await (supabase as any).from("emails").delete().eq("id", draftId);
        }
      }
      toast({ title: "Email sent" });
      qc.invalidateQueries({ queryKey: ["emails"] });
      qc.invalidateQueries({ queryKey: ["email-contacts-search"] });
      onSent();
      onClose();
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally { setSending(false); }
  };

  const handleSend = () => {
    if (toChips.length === 0 || !subject.trim()) { toast({ title: "Please add a recipient and subject", variant: "destructive" }); return; }
    setUndoCountdown(5);
    undoTimer.current = setInterval(() => {
      setUndoCountdown(prev => {
        if (prev <= 1) { if (undoTimer.current) clearInterval(undoTimer.current); executeSend(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUndo = () => {
    if (undoTimer.current) clearInterval(undoTimer.current);
    setUndoCountdown(0);
  };

  useEffect(() => () => { if (undoTimer.current) clearInterval(undoTimer.current); }, []);

  const handleSaveDraft = async () => {
    const bodyHtml = getBodyHtml();
    if (toChips.length === 0 && !subject && !bodyHtml.trim()) return;
    setSavingDraft(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const row: Record<string, any> = {
        account_id: account.id, folder: "drafts",
        from_address: account.email_address, to_address: toChips.join(", ") || null,
        cc_address: ccChips.join(", ") || null,
        subject: subject || "(No subject)", body_html: bodyHtml, body_text: "",
        is_read: true, sent_at: new Date().toISOString(),
      };
      let cid = draftId;
      if (cid) {
        await (supabase as any).from("emails").update(row).eq("id", cid);
      } else {
        cid = crypto.randomUUID();
        await (supabase as any).from("emails").insert({ id: cid, ...row });
        setDraftId(cid);
      }
      const dr = await supabase.functions.invoke("save-draft", {
        body: { to: toChips.join(", "), cc: ccChips.join(", ") || undefined, subject: subject || "(No subject)", bodyHtml, zoho_draft_message_id: zohoDraftId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (dr.data?.zoho_draft_message_id) {
        const nid = dr.data.zoho_draft_message_id;
        setZohoDraftId(nid);
        await (supabase as any).from("emails").update({ zoho_message_id: nid }).eq("id", cid);
      }
      toast({ title: "Draft saved" });
      qc.invalidateQueries({ queryKey: ["emails"] });
    } catch (err: any) {
      toast({ title: "Failed to save draft", description: err.message, variant: "destructive" });
    } finally { setSavingDraft(false); }
  };

  const applyTemplate = (t: EmailTemplate) => {
    setSubject(t.subject);
    if (bodyRef.current) bodyRef.current.innerHTML = t.body_html;
    setShowTemplates(false);
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim() || !userId) return;
    await (supabase as any).from("email_templates").insert({ user_id: userId, name: templateName.trim(), subject, body_html: getBodyHtml() });
    qc.invalidateQueries({ queryKey: ["email-templates"] });
    setSaveTemplateMode(false);
    setTemplateName("");
    toast({ title: "Template saved" });
  };

  const title = replyTo || replyToAll ? "Reply" : forwardOf ? "Forward" : "New Message";

  const windowCls = expanded
    ? "fixed inset-4 md:inset-8 z-[150] rounded-2xl flex flex-col bg-crm-card border border-crm-border shadow-2xl"
    : "fixed bottom-0 right-4 md:bottom-4 md:right-6 z-[150] w-full md:w-[480px] max-h-[90vh] md:max-h-[560px] rounded-t-2xl md:rounded-2xl flex flex-col bg-crm-card border border-crm-border shadow-2xl";

  return (
    <div className={windowCls}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-crm-surface/80 rounded-t-2xl border-b border-crm-border shrink-0 cursor-pointer select-none" onClick={() => minimized && setMinimized(false)}>
        <span className="text-[13px] font-semibold text-crm-text truncate">{title}</span>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => setMinimized(v => !v)} className="p-1 rounded hover:bg-crm-border transition-colors text-crm-text-muted" title="Minimise">
            {minimized ? <ChevronDown size={14} /> : <ChevronLeft size={14} className="rotate-90" />}
          </button>
          <button onClick={() => setExpanded(v => !v)} className="p-1 rounded hover:bg-crm-border transition-colors text-crm-text-muted" title={expanded ? "Restore" : "Expand"}>
            <Zap size={14} />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-red-500/20 transition-colors text-crm-text-muted hover:text-red-400" title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Recipients */}
          <div className="px-3 pt-2 pb-1 border-b border-crm-border shrink-0">
            <RecipientField label="To" chips={toChips} onChange={setToChips} userId={userId} />
            {showCc && <RecipientField label="Cc" chips={ccChips} onChange={setCcChips} userId={userId} />}
            {showBcc && <RecipientField label="Bcc" chips={bccChips} onChange={setBccChips} userId={userId} />}
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowCc(v => !v)} className={`text-[11px] font-medium transition-colors ${showCc ? "text-primary" : "text-crm-text-muted hover:text-crm-text"}`}>Cc</button>
              <button type="button" onClick={() => setShowBcc(v => !v)} className={`text-[11px] font-medium transition-colors ${showBcc ? "text-primary" : "text-crm-text-muted hover:text-crm-text"}`}>Bcc</button>
            </div>
          </div>

          {/* Subject */}
          <div className="px-3 py-2 border-b border-crm-border shrink-0">
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full bg-transparent text-[13px] text-crm-text outline-none placeholder-crm-text-faint font-medium"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-0.5 px-2 py-1 border-b border-crm-border/50 shrink-0 flex-wrap">
            {([["Bold","bold",Bold],["Italic","italic",Italic],["Underline","underline",Underline]] as [string,string,React.ElementType][]).map(([t,cmd,Icon]) => (
              <button key={cmd} type="button" onMouseDown={e => { e.preventDefault(); execFmt(cmd); }} title={t}
                className="p-1.5 rounded hover:bg-crm-surface text-crm-text-muted hover:text-crm-text transition-colors">
                <Icon size={13} />
              </button>
            ))}
            <span className="w-px h-4 bg-crm-border mx-0.5" />
            <button type="button" onMouseDown={e => { e.preventDefault(); execFmt("insertUnorderedList"); }} title="Bullet list" className="p-1.5 rounded hover:bg-crm-surface text-crm-text-muted hover:text-crm-text transition-colors"><List size={13} /></button>
            <button type="button" onMouseDown={e => { e.preventDefault(); execFmt("insertOrderedList"); }} title="Numbered list" className="p-1.5 rounded hover:bg-crm-surface text-crm-text-muted hover:text-crm-text transition-colors"><ListOrdered size={13} /></button>
            <button type="button" onMouseDown={e => { e.preventDefault(); insertLink(); }} title="Insert link" className="p-1.5 rounded hover:bg-crm-surface text-crm-text-muted hover:text-crm-text transition-colors"><Link size={13} /></button>
            <span className="w-px h-4 bg-crm-border mx-0.5" />
            {/* Templates */}
            <div className="relative">
              <button type="button" onClick={() => setShowTemplates(v => !v)} title="Templates" className="p-1.5 rounded hover:bg-crm-surface text-crm-text-muted hover:text-crm-text transition-colors flex items-center gap-1 text-[11px]">
                <Zap size={12} /> Templates
              </button>
              {showTemplates && (
                <div className="absolute left-0 top-full mt-1 z-[250] w-52 bg-crm-card border border-crm-border rounded-xl shadow-2xl py-1" onClick={() => setShowTemplates(false)}>
                  {templates.length === 0 && <p className="px-3 py-2 text-[11px] text-crm-text-muted">No templates saved</p>}
                  {templates.map(t => (
                    <button key={t.id} type="button" onClick={() => applyTemplate(t)} className="w-full text-left px-3 py-2 text-[12px] text-crm-text hover:bg-crm-surface transition-colors truncate">{t.name}</button>
                  ))}
                  <hr className="border-crm-border my-1" />
                  {saveTemplateMode ? (
                    <div className="px-2 py-1 flex items-center gap-1">
                      <input autoFocus value={templateName} onChange={e => setTemplateName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveAsTemplate()} placeholder="Template name" className="flex-1 text-[11px] bg-crm-surface border border-crm-border rounded px-2 py-1 outline-none text-crm-text" />
                      <button type="button" onClick={saveAsTemplate} className="p-1 text-primary hover:bg-primary/10 rounded"><Check size={12} /></button>
                      <button type="button" onClick={() => setSaveTemplateMode(false)} className="p-1 text-crm-text-faint hover:text-crm-text rounded"><X size={12} /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setSaveTemplateMode(true)} className="w-full text-left px-3 py-2 text-[11px] text-crm-text-muted hover:text-crm-text hover:bg-crm-surface transition-colors flex items-center gap-2">
                      <Plus size={11} /> Save current as template
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            className="flex-1 px-4 py-3 text-[13px] text-crm-text overflow-y-auto outline-none min-h-[120px] [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-crm-border [&_blockquote]:pl-3 [&_blockquote]:text-crm-text-muted"
          />

          {/* Attachments strip */}
          {attachments.length > 0 && (
            <div className="px-3 pb-1 flex flex-wrap gap-1.5 border-t border-crm-border/50 pt-1.5 shrink-0">
              {attachments.map((a, i) => (
                <span key={i} className="flex items-center gap-1 bg-crm-surface border border-crm-border rounded-full px-2 py-0.5 text-[11px] text-crm-text-muted">
                  <Paperclip size={10} /> {a.name} <button type="button" onClick={() => setAttachments(p => p.filter((_, j) => j !== i))}><X size={9} className="hover:text-red-400" /></button>
                </span>
              ))}
            </div>
          )}

          {/* Undo countdown overlay */}
          {undoCountdown > 0 && (
            <div className="px-3 py-2 bg-crm-surface/90 border-t border-crm-border flex items-center gap-3 shrink-0">
              <Loader2 size={12} className="animate-spin text-crm-text-muted" />
              <span className="text-[12px] text-crm-text-muted flex-1">Sending in {undoCountdown}s…</span>
              <button type="button" onClick={handleUndo} className="text-[12px] text-primary font-semibold hover:underline">Undo</button>
            </div>
          )}

          {/* Bottom toolbar */}
          {undoCountdown === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 border-t border-crm-border shrink-0">
              <button
                type="button" onClick={handleSend}
                disabled={sending || toChips.length === 0}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-full text-[13px] font-semibold transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Send
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
              <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach file" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted hover:text-crm-text transition-colors"><Paperclip size={15} /></button>
              <button type="button" onClick={handleSaveDraft} title="Save draft" disabled={savingDraft} className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted hover:text-crm-text transition-colors disabled:opacity-50">
                {savingDraft ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              </button>
              <div className="flex-1" />
              <button type="button" onClick={onClose} title="Discard" className="p-1.5 rounded-full hover:bg-red-500/15 text-crm-text-muted hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Detail Pane ──────────────────────────────────────────────────────────────
interface DetailPaneProps {
  email: Email;
  onBack: () => void;
  onReply: (e: Email) => void;
  onReplyAll: (e: Email) => void;
  onForward: (e: Email) => void;
  onStar: (id: string, starred: boolean) => void;
  onTrash: (id: string) => void;
  onArchive: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onMove: (id: string, folderId: string, folderName: string) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  folders: ZohoFolder[];
  labels: EmailLabel[];
  allEmails: Email[];
}

function EmailDetailPane({ email, onBack, onReply, onReplyAll, onForward, onStar, onTrash, onArchive, onMarkUnread, onMove, onPrev, onNext, hasPrev, hasNext, folders, labels, allEmails }: DetailPaneProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [bodyHtml, setBodyHtml] = useState(email.body_html);
  const [fetchingBody, setFetchingBody] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [assignedLabelIds, setAssignedLabelIds] = useState<string[]>([]);
  const [showThread, setShowThread] = useState(false);
  const [showImages, setShowImages] = useState(false);

  // Thread emails (same thread_id, excluding current)
  const threadEmails = email.thread_id
    ? allEmails.filter(e => e.thread_id === email.thread_id && e.id !== email.id).sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime())
    : [];

  useEffect(() => {
    setBodyHtml(email.body_html);
    if (email.body_html || !email.id) return;
    let cancelled = false;
    setFetchingBody(true);
    supabase.auth.getSession().then(({ data: { session } }) =>
      supabase.functions.invoke("fetch-email-body", { body: { email_id: email.id }, headers: { Authorization: `Bearer ${session?.access_token}` } })
    ).then(({ data }) => {
      if (!cancelled && data?.body_html) setBodyHtml(data.body_html);
    }).finally(() => { if (!cancelled) setFetchingBody(false); });
    return () => { cancelled = true; };
  }, [email.id, email.body_html]);

  // Load label assignments
  useEffect(() => {
    (supabase as any).from("email_label_assignments").select("label_id").eq("email_id", email.id)
      .then(({ data }: any) => setAssignedLabelIds((data ?? []).map((r: any) => r.label_id)));
  }, [email.id]);

  const { data: attachments = [] } = useQuery<{ attachmentId: string; fileName: string; fileSize: number; contentType: string }[]>({
    queryKey: ["attachments", email.id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("get-attachments", { body: { email_id: email.id }, headers: { Authorization: `Bearer ${session?.access_token}` } });
      return res.data?.attachments ?? [];
    },
    enabled: email.has_attachments,
    staleTime: 10 * 60 * 1000,
  });

  const handleDownload = async (a: { attachmentId: string; fileName: string; contentType: string }) => {
    setDownloadingId(a.attachmentId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("download-attachment", { body: { email_id: email.id, attachment_id: a.attachmentId, file_name: a.fileName }, headers: { Authorization: `Bearer ${session?.access_token}` } });
      if (res.data?.error) throw new Error(res.data.error);
      const link = document.createElement("a");
      link.href = `data:${res.data.contentType};base64,${res.data.base64}`;
      link.download = res.data.fileName;
      link.click();
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    } finally { setDownloadingId(null); }
  };

  const toggleLabel = async (labelId: string) => {
    const has = assignedLabelIds.includes(labelId);
    if (has) {
      await (supabase as any).from("email_label_assignments").delete().eq("email_id", email.id).eq("label_id", labelId);
      setAssignedLabelIds(p => p.filter(id => id !== labelId));
    } else {
      await (supabase as any).from("email_label_assignments").insert({ email_id: email.id, label_id: labelId });
      setAssignedLabelIds(p => [...p, labelId]);
    }
    qc.invalidateQueries({ queryKey: ["email-label-assignments"] });
  };

  const safeHtml = (() => {
    let h = bodyHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "").replace(/on\w+='[^']*'/gi, "");
    if (!showImages) h = h.replace(/<img[^>]*src="[^"]*"[^>]*>/gi, `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;background:#eee;color:#666;font-size:11px;border-radius:4px;cursor:pointer" data-img-placeholder>[image]</span>`);
    return h;
  })();

  const initials = getInitials(email.from_name || email.from_address);
  const color = getAvatarColor(email.from_name || email.from_address);
  const assignedLabels = labels.filter(l => assignedLabelIds.includes(l.id));
  const movableFolders = folders.filter(f => f.folderName.toLowerCase() !== email.folder.toLowerCase());

  return (
    <div className="flex flex-col h-full overflow-hidden" onClick={() => { setShowMoveMenu(false); setShowMoreMenu(false); setShowLabelMenu(false); }}>
      {/* Header: subject + actions */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-crm-border shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors shrink-0 md:hidden">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-semibold text-crm-text leading-tight">{email.subject}</h2>
          {assignedLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {assignedLabels.map(l => (
                <span key={l.id} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ color: l.color, borderColor: l.color + "60", background: l.color + "18" }}>
                  {l.name}
                  <button type="button" onClick={e => { e.stopPropagation(); toggleLabel(l.id); }} className="hover:opacity-60"><X size={8} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => onArchive(email.id)} title="Archive" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors"><Archive size={16} /></button>
          <button onClick={() => onTrash(email.id)} title="Delete" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors"><Trash2 size={16} /></button>
          <button onClick={() => onStar(email.id, !email.is_starred)} title="Star" className={`p-1.5 rounded-full hover:bg-crm-surface transition-colors ${email.is_starred ? "text-amber-400" : "text-crm-text-muted"}`}>
            <Star size={16} fill={email.is_starred ? "currentColor" : "none"} />
          </button>
          {/* Label dropdown */}
          <div className="relative">
            <button onClick={() => setShowLabelMenu(v => !v)} title="Labels" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors"><Tag size={16} /></button>
            {showLabelMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-crm-card border border-crm-border rounded-xl shadow-2xl py-1 max-h-56 overflow-y-auto">
                {labels.length === 0 ? <p className="px-3 py-2 text-[11px] text-crm-text-muted">No labels yet</p> : labels.map(l => (
                  <button key={l.id} onClick={() => toggleLabel(l.id)} className="w-full text-left px-3 py-2 text-[12px] text-crm-text hover:bg-crm-surface transition-colors flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
                    {l.name}
                    {assignedLabelIds.includes(l.id) && <Check size={11} className="ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Move to folder */}
          <div className="relative">
            <button onClick={() => setShowMoveMenu(v => !v)} title="Move" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors"><Folder size={16} /></button>
            {showMoveMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-crm-card border border-crm-border rounded-xl shadow-2xl py-1 max-h-56 overflow-y-auto">
                {movableFolders.map(f => (
                  <button key={f.folderId} onClick={() => { onMove(email.id, f.folderId, f.folderName); setShowMoveMenu(false); }} className="w-full text-left px-3 py-2 text-[12px] text-crm-text hover:bg-crm-surface transition-colors">{f.folderName}</button>
                ))}
              </div>
            )}
          </div>
          {/* More */}
          <div className="relative">
            <button onClick={() => setShowMoreMenu(v => !v)} className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors"><MoreVertical size={16} /></button>
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-crm-card border border-crm-border rounded-xl shadow-2xl py-1">
                <button onClick={() => { onMarkUnread(email.id); setShowMoreMenu(false); }} className="w-full text-left px-3 py-2 text-[12px] text-crm-text hover:bg-crm-surface transition-colors flex items-center gap-2"><Mail size={13} /> Mark as unread</button>
                <button onClick={() => { setShowImages(v => !v); setShowMoreMenu(false); }} className="w-full text-left px-3 py-2 text-[12px] text-crm-text hover:bg-crm-surface transition-colors flex items-center gap-2">
                  {showImages ? <EyeOff size={13} /> : <Eye size={13} />} {showImages ? "Hide images" : "Show images"}
                </button>
              </div>
            )}
          </div>
          {/* Prev/Next */}
          <button onClick={onPrev} disabled={!hasPrev} className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
          <button onClick={onNext} disabled={!hasNext} className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Sender info */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-crm-border shrink-0">
        <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-[12px] font-bold shrink-0`}>{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-semibold text-crm-text truncate">{email.from_name || email.from_address}</span>
            <span className="text-[11px] text-crm-text-faint shrink-0">{email.sent_at ? format(parseISO(email.sent_at), "d MMM yyyy, h:mm a") : ""}</span>
          </div>
          <div className="text-[11px] text-crm-text-muted leading-tight mt-0.5">
            <span>{email.from_address}</span>
            {email.to_address && <span> → {email.to_address}</span>}
            {email.cc_address && <span> · Cc: {email.cc_address}</span>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {fetchingBody ? (
            <div className="flex items-center gap-2 text-crm-text-muted text-[13px]"><Loader2 size={14} className="animate-spin" /> Loading…</div>
          ) : bodyHtml ? (
            <div className="text-[13px] leading-relaxed text-crm-text-secondary [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:rounded [&_table]:w-full [&_table]:border-collapse" dangerouslySetInnerHTML={{ __html: safeHtml }} />
          ) : (
            <p className="text-[13px] text-crm-text-secondary whitespace-pre-wrap">{email.body_text || "(No content)"}</p>
          )}

          {/* Attachments */}
          {email.has_attachments && attachments.length > 0 && (
            <div className="mt-5 border-t border-crm-border pt-4">
              <p className="text-[12px] font-semibold text-crm-text-muted mb-2 flex items-center gap-1.5"><Paperclip size={13} /> {attachments.length} attachment{attachments.length > 1 ? "s" : ""}</p>
              <div className="space-y-1.5">
                {attachments.map(a => (
                  <div key={a.attachmentId} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-crm-surface border border-crm-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={13} className="text-crm-text-muted shrink-0" />
                      <span className="text-[12px] text-crm-text truncate">{a.fileName}</span>
                      {a.fileSize > 0 && <span className="text-[10px] text-crm-text-faint shrink-0">({(a.fileSize / 1024).toFixed(0)} KB)</span>}
                    </div>
                    <button onClick={() => handleDownload(a)} disabled={downloadingId === a.attachmentId} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors shrink-0">
                      {downloadingId === a.attachmentId ? <Loader2 size={11} className="animate-spin" /> : null} Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thread history */}
          {threadEmails.length > 0 && (
            <div className="mt-5 border-t border-crm-border pt-3">
              <button onClick={() => setShowThread(v => !v)} className="flex items-center gap-2 text-[12px] text-crm-text-muted hover:text-crm-text transition-colors mb-2">
                <ChevronDown size={13} className={`transition-transform ${showThread ? "rotate-180" : ""}`} />
                {threadEmails.length} more message{threadEmails.length > 1 ? "s" : ""} in this thread
              </button>
              {showThread && threadEmails.map(te => (
                <div key={te.id} className="mb-3 rounded-xl border border-crm-border bg-crm-surface/50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full ${getAvatarColor(te.from_name || te.from_address)} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>{getInitials(te.from_name || te.from_address)}</div>
                    <span className="text-[12px] font-semibold text-crm-text">{te.from_name || te.from_address}</span>
                    <span className="ml-auto text-[10px] text-crm-text-faint">{te.sent_at ? format(parseISO(te.sent_at), "d MMM, h:mm a") : ""}</span>
                  </div>
                  <div className="text-[12px] text-crm-text-muted line-clamp-3">{te.body_text || "(No preview)"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply/Forward bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-crm-border shrink-0">
        <button onClick={() => onReply(email)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[12px] font-semibold transition-colors"><Reply size={13} /> Reply</button>
        <button onClick={() => onReplyAll(email)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-crm-border hover:bg-crm-surface text-crm-text-muted hover:text-crm-text text-[12px] transition-colors"><ReplyAll size={13} /> Reply All</button>
        <button onClick={() => onForward(email)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-crm-border hover:bg-crm-surface text-crm-text-muted hover:text-crm-text text-[12px] transition-colors"><Forward size={13} /> Forward</button>
      </div>
    </div>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────
export default function EmailInboxModule() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [activeFolder, setActiveFolder] = useState("inbox");
  const [activeLabelId, setActiveLabelId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeProps, setComposeProps] = useState<Omit<ComposeProps,"account"|"onClose"|"onSent"|"userId"> | null>(null);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOperating, setBulkOperating] = useState(false);
  const [showBulkMoveMenu, setShowBulkMoveMenu] = useState(false);
  const [newFolderInput, setNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creatingLabel, setCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#6366f1");
  const [threadView, setThreadView] = useState(false);
  const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Connect/reauth dialogs
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectEmail, setConnectEmail] = useState("");
  const [connectPassword, setConnectPassword] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthEmail, setReauthEmail] = useState("");
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const [reauthSaving, setReauthSaving] = useState(false);
  const sessionValidatedKey = `email_validated_${user?.id}`;

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: account } = useQuery<EmailAccount | null>({
    queryKey: ["email-account", user?.id],
    queryFn: async () => {
      const res = await (supabase as any).from("email_accounts").select("id,email_address,display_name").eq("user_id", user!.id).eq("is_active", true).single();
      return res.data ?? null;
    },
    enabled: !!user?.id,
  });

  const { data: zohoFolders = [] } = useQuery<ZohoFolder[]>({
    queryKey: ["email-folders", account?.id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("manage-folders", { body: { action: "list" }, headers: { Authorization: `Bearer ${session?.access_token}` } });
      return res.data?.folders ?? [];
    },
    enabled: !!account,
    staleTime: 5 * 60_000,
  });

  const { data: emails = [], isLoading } = useQuery<Email[]>({
    queryKey: ["emails", account?.id, activeFolder, activeLabelId],
    queryFn: async () => {
      if (!account) return [];
      let q = (supabase as any).from("emails").select("*").eq("account_id", account.id).order("sent_at", { ascending: false }).limit(150);
      if (activeLabelId) {
        const { data: assignments } = await (supabase as any).from("email_label_assignments").select("email_id").eq("label_id", activeLabelId);
        const ids = (assignments ?? []).map((r: any) => r.email_id);
        if (ids.length === 0) return [];
        q = q.in("id", ids);
      } else if (activeFolder === "starred") {
        q = q.eq("is_starred", true);
      } else if (activeFolder === "archive") {
        q = q.eq("is_archived", true);
      } else {
        q = q.eq("folder", activeFolder).eq("is_archived", false);
      }
      const res = await q;
      return (res.data ?? []).map((e: any) => ({
        id: e.id, account_id: e.account_id, zoho_message_id: e.zoho_message_id,
        from_address: e.from_address ?? "", from_name: e.from_name ?? "",
        to_address: e.to_address ?? "", cc_address: e.cc_address,
        subject: e.subject ?? "(No subject)", body_html: e.body_html ?? "",
        body_text: e.body_text ?? "", is_read: e.is_read ?? false,
        is_starred: e.is_starred ?? false, folder: e.folder ?? "inbox",
        has_attachments: e.has_attachments ?? false, sent_at: e.sent_at ?? e.created_at,
        thread_id: e.thread_id ?? null, is_archived: e.is_archived ?? false,
      } as Email));
    },
    enabled: !!account,
  });

  const { data: unreadMap = {} } = useQuery<Record<string, number>>({
    queryKey: ["email-unread-counts", account?.id],
    queryFn: async () => {
      if (!account) return {};
      const res = await (supabase as any).from("emails").select("folder").eq("account_id", account.id).eq("is_read", false).neq("folder", "sent").neq("folder", "trash");
      const map: Record<string, number> = {};
      for (const row of (res.data ?? [])) map[row.folder] = (map[row.folder] ?? 0) + 1;
      return map;
    },
    enabled: !!account,
    refetchInterval: 60_000,
  });

  const { data: labels = [] } = useQuery<EmailLabel[]>({
    queryKey: ["email-labels", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any).from("email_labels").select("id,name,color").eq("user_id", user!.id).order("created_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const invokeUpdateEmail = async (action: string, emailId: string, extra?: Record<string, string>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("update-email", { body: { action, email_id: emailId, ...extra }, headers: { Authorization: `Bearer ${session?.access_token}` } });
    if (error || data?.error) throw new Error(error?.message ?? data?.error ?? "Update failed");
  };

  const invalidateEmails = () => {
    qc.invalidateQueries({ queryKey: ["emails"] });
    qc.invalidateQueries({ queryKey: ["email-unread-counts"] });
    qc.invalidateQueries({ queryKey: ["email-inbox-unread"] });
  };

  // ── Mutations ──────────────────────────────────────────────────────────────
  const markRead    = useMutation({ mutationFn: (id: string) => invokeUpdateEmail("mark_read", id), onSuccess: invalidateEmails });
  const markUnread  = useMutation({ mutationFn: (id: string) => invokeUpdateEmail("mark_unread", id), onSuccess: invalidateEmails });
  const toggleStar  = useMutation({ mutationFn: ({ id, starred }: { id: string; starred: boolean }) => invokeUpdateEmail(starred ? "star" : "unstar", id), onSuccess: () => qc.invalidateQueries({ queryKey: ["emails"] }) });
  const moveToTrash = useMutation({
    mutationFn: async ({ id, folder }: { id: string; folder?: string }) => {
      if (folder === "trash") {
        if (!confirm("Permanently delete this email?")) throw new Error("cancelled");
        return invokeUpdateEmail("delete", id);
      }
      return invokeUpdateEmail("trash", id);
    },
    onSuccess: () => { setSelectedEmail(null); invalidateEmails(); },
  });
  const moveEmail   = useMutation({ mutationFn: ({ id, folderId, folderName }: { id: string; folderId: string; folderName: string }) => invokeUpdateEmail("move", id, { folder_id: folderId, folder_name: folderName }), onSuccess: () => { setSelectedEmail(null); qc.invalidateQueries({ queryKey: ["emails"] }); } });

  const archiveEmail = async (id: string) => {
    await (supabase as any).from("emails").update({ is_archived: true, folder: "archive" }).eq("id", id);
    setSelectedEmail(null);
    invalidateEmails();
    toast({ title: "Archived" });
  };

  // ── Sync ───────────────────────────────────────────────────────────────────
  const syncEmails = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("sync-emails", { headers: { Authorization: `Bearer ${session?.access_token}` } });
      if (error || data?.error) { toast({ title: "Sync failed", description: error?.message ?? data?.error, variant: "destructive" }); return; }
      const count = data?.newEmailCount ?? 0;
      if (count > 0) toast({ title: `${count} new email${count > 1 ? "s" : ""} received` });
      invalidateEmails();
    } catch (err: any) { toast({ title: "Sync failed", description: err.message, variant: "destructive" }); }
    finally { setSyncing(false); }
  }, [user, qc, toast]);

  useEffect(() => {
    if (!account) return;
    syncEmails();
    syncInterval.current = setInterval(syncEmails, 2 * 60_000);
    return () => { if (syncInterval.current) clearInterval(syncInterval.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!account?.id) return;
    const ch = supabase.channel(`emails-${account.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "emails", filter: `account_id=eq.${account.id}` }, (payload) => {
        const e = payload.new as any;
        if (e.folder === "sent") return;
        toast({ title: "New email", description: `From: ${e.from_name || e.from_address || "Unknown"}` });
        invalidateEmails();
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id]);

  // ── Credential validation ──────────────────────────────────────────────────
  const callValidate = async (email: string, password: string, checkStored = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("validate-email-credentials", { body: checkStored ? { checkStored: true } : { email, password }, headers: { Authorization: `Bearer ${session?.access_token}` } });
    if (res.error) throw new Error(res.error.message);
    return res.data as { valid: boolean; error?: string };
  };

  useEffect(() => {
    if (!account || !user) return;
    if (sessionStorage.getItem(sessionValidatedKey) === "ok") return;
    (async () => {
      try {
        const r = await callValidate("", "", true);
        if (r.valid) { sessionStorage.setItem(sessionValidatedKey, "ok"); }
        else { setReauthEmail(account.email_address ?? ""); setReauthError(r.error ?? "Credentials expired. Please log in again."); setReauthOpen(true); }
      } catch { /* silent */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id]);

  const handleConnectEmail = async () => {
    if (!connectEmail.trim() || !connectPassword.trim()) return;
    setConnecting(true); setConnectError("");
    try {
      const r = await callValidate(connectEmail.trim(), connectPassword);
      if (!r.valid) { setConnectError(r.error ?? "Invalid credentials."); return; }
      sessionStorage.setItem(sessionValidatedKey, "ok");
      qc.invalidateQueries({ queryKey: ["email-account"] });
      setConnectOpen(false); setConnectEmail(""); setConnectPassword("");
    } catch (err: any) { setConnectError(err.message); }
    finally { setConnecting(false); }
  };

  const handleReauth = async () => {
    if (!reauthPassword.trim()) return;
    setReauthSaving(true); setReauthError("");
    try {
      const r = await callValidate(reauthEmail.trim(), reauthPassword);
      if (!r.valid) { setReauthError(r.error ?? "Invalid credentials."); return; }
      sessionStorage.setItem(sessionValidatedKey, "ok");
      qc.invalidateQueries({ queryKey: ["email-account"] });
      setReauthOpen(false); setReauthPassword("");
      toast({ title: "Email reconnected" });
    } catch (err: any) { setReauthError(err.message); }
    finally { setReauthSaving(false); }
  };

  // ── Label CRUD ─────────────────────────────────────────────────────────────
  const createLabel = async () => {
    if (!newLabelName.trim() || !user) return;
    await (supabase as any).from("email_labels").insert({ user_id: user.id, name: newLabelName.trim(), color: newLabelColor });
    qc.invalidateQueries({ queryKey: ["email-labels"] });
    setNewLabelName(""); setCreatingLabel(false);
    toast({ title: "Label created" });
  };

  const deleteLabel = async (id: string) => {
    await (supabase as any).from("email_labels").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["email-labels"] });
    if (activeLabelId === id) setActiveLabelId(null);
  };

  // ── Folder CRUD ────────────────────────────────────────────────────────────
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("manage-folders", { body: { action: "create", folder_name: newFolderName.trim() }, headers: { Authorization: `Bearer ${session?.access_token}` } });
      if (res.data?.error) throw new Error(res.data.error);
      setNewFolderName(""); setNewFolderInput(false);
      qc.invalidateQueries({ queryKey: ["email-folders"] });
      toast({ title: `Folder "${newFolderName.trim()}" created` });
    } catch (err: any) { toast({ title: "Failed", description: err.message, variant: "destructive" }); }
    finally { setCreatingFolder(false); }
  };

  const handleDeleteFolder = async (folder: ZohoFolder) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("manage-folders", { body: { action: "delete", folder_id: folder.folderId }, headers: { Authorization: `Bearer ${session?.access_token}` } });
      if (res.data?.error) throw new Error(res.data.error);
      if (activeFolder === folder.folderName) setActiveFolder("inbox");
      qc.invalidateQueries({ queryKey: ["email-folders"] });
    } catch (err: any) { toast({ title: "Failed", description: err.message, variant: "destructive" }); }
  };

  // ── Bulk ops ───────────────────────────────────────────────────────────────
  const handleBulkTrash = async () => {
    if (activeFolder === "trash") {
      if (!confirm("This will permanently delete the selected emails. Continue?")) return;
    }
    setBulkOperating(true);
    try {
      const action = activeFolder === "trash" ? "delete" : "trash";
      for (const id of selectedIds) await invokeUpdateEmail(action, id);
      setSelectedIds(new Set()); invalidateEmails();
    }
    catch (err: any) { toast({ title: "Failed", description: err.message, variant: "destructive" }); }
    finally { setBulkOperating(false); }
  };

  const handleBulkMarkRead = async () => {
    setBulkOperating(true);
    try { for (const id of selectedIds) await invokeUpdateEmail("mark_read", id); setSelectedIds(new Set()); invalidateEmails(); }
    catch (err: any) { toast({ title: "Failed", description: err.message, variant: "destructive" }); }
    finally { setBulkOperating(false); }
  };

  const handleBulkArchive = async () => {
    setBulkOperating(true);
    try {
      await (supabase as any).from("emails").update({ is_archived: true, folder: "archive" }).in("id", Array.from(selectedIds));
      setSelectedIds(new Set()); invalidateEmails();
      toast({ title: `${selectedIds.size} email${selectedIds.size > 1 ? "s" : ""} archived` });
    } catch (err: any) { toast({ title: "Failed", description: err.message, variant: "destructive" }); }
    finally { setBulkOperating(false); }
  };

  const handleBulkMove = async (folderId: string, folderName: string) => {
    setBulkOperating(true); setShowBulkMoveMenu(false);
    try { for (const id of selectedIds) await invokeUpdateEmail("move", id, { folder_id: folderId, folder_name: folderName }); setSelectedIds(new Set()); invalidateEmails(); }
    catch (err: any) { toast({ title: "Failed", description: err.message, variant: "destructive" }); }
    finally { setBulkOperating(false); }
  };

  // ── Search / filter ────────────────────────────────────────────────────────
  const filters = parseSearchQuery(search);
  const filteredEmails = emails.filter(e => {
    if (filters.from && !e.from_address.toLowerCase().includes(filters.from.toLowerCase()) && !e.from_name.toLowerCase().includes(filters.from.toLowerCase())) return false;
    if (filters.to && !e.to_address.toLowerCase().includes(filters.to.toLowerCase())) return false;
    if (filters.subject && !e.subject.toLowerCase().includes(filters.subject.toLowerCase())) return false;
    if (filters.hasAttachment && !e.has_attachments) return false;
    if (filters.isStarred && !e.is_starred) return false;
    if (filters.isUnread && e.is_read) return false;
    if (filters.freetext) {
      const q = filters.freetext.toLowerCase();
      if (!e.subject.toLowerCase().includes(q) && !e.from_name.toLowerCase().includes(q) && !e.from_address.toLowerCase().includes(q) && !e.body_text.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Thread grouping
  const displayEmails = threadView
    ? Object.values(filteredEmails.reduce<Record<string, Email>>((acc, e) => {
        const key = e.thread_id || e.id;
        if (!acc[key] || new Date(e.sent_at) > new Date(acc[key].sent_at)) acc[key] = e;
        return acc;
      }, {})).sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
    : filteredEmails;

  const currentIdx = selectedEmail ? displayEmails.findIndex(e => e.id === selectedEmail.id) : -1;

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    if (!email.is_read) markRead.mutate(email.id);
  };

  const activeFilterChips = [
    filters.from && { key: "from", label: `from: ${filters.from}` },
    filters.to && { key: "to", label: `to: ${filters.to}` },
    filters.subject && { key: "subject", label: `subject: ${filters.subject}` },
    filters.hasAttachment && { key: "attachment", label: "has: attachment" },
    filters.isStarred && { key: "starred", label: "is: starred" },
    filters.isUnread && { key: "unread", label: "is: unread" },
  ].filter(Boolean) as { key: string; label: string }[];

  const removeFilter = (key: string) => {
    const ops: Record<string, RegExp> = {
      from: /from:\S+/i, to: /to:\S+/i, subject: /subject:\S+/i,
      attachment: /has:attachment/i, starred: /is:starred/i, unread: /is:unread/i,
    };
    if (ops[key]) setSearch(s => s.replace(ops[key], "").trim());
  };

  // ── No account state ───────────────────────────────────────────────────────
  if (!account && !isLoading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
          <div className="h-20 w-20 rounded-3xl bg-crm-surface border border-crm-border flex items-center justify-center shadow-inner">
            <Mail className="h-9 w-9 text-crm-text-faint" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-crm-text">No email account connected</h2>
            <p className="text-sm text-crm-text-muted mt-1.5 max-w-md">Connect your Zoho email to send, receive, and manage messages directly from the CRM.</p>
          </div>
          <button onClick={() => setConnectOpen(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-lg shadow-primary/25 transition-colors">
            <Mail size={16} /> Connect Email
          </button>
        </div>

        {/* Connect dialog */}
        {connectOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-crm-card border border-crm-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-crm-text">Connect Email</h3>
                <button onClick={() => setConnectOpen(false)} className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-dim transition-colors"><X size={15} /></button>
              </div>
              <p className="text-[12px] text-crm-text-muted">Enter your Zoho email address and app password.</p>
              {connectError && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/50"><AlertOctagon size={13} className="text-red-400 shrink-0 mt-0.5" /><p className="text-[11px] text-red-300">{connectError}</p></div>}
              <div className="space-y-3">
                <div className="space-y-1"><label className="text-[11px] font-medium text-crm-text-dim">Email Address</label>
                  <input type="email" value={connectEmail} onChange={e => { setConnectEmail(e.target.value); setConnectError(""); }} placeholder="you@example.com" className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-xl px-3 py-2 focus:outline-none focus:border-primary placeholder:text-crm-text-faint" />
                </div>
                <div className="space-y-1"><label className="text-[11px] font-medium text-crm-text-dim">Password</label>
                  <input type="password" value={connectPassword} onChange={e => { setConnectPassword(e.target.value); setConnectError(""); }} onKeyDown={e => e.key === "Enter" && handleConnectEmail()} placeholder="••••••••" className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-xl px-3 py-2 focus:outline-none focus:border-primary placeholder:text-crm-text-faint" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setConnectOpen(false)} className="flex-1 py-2 text-[13px] text-crm-text-muted border border-crm-border rounded-xl hover:bg-crm-surface transition-colors">Cancel</button>
                <button onClick={handleConnectEmail} disabled={connecting || !connectEmail.trim() || !connectPassword.trim()} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold transition-colors disabled:opacity-50">
                  {connecting ? <><Loader2 size={13} className="animate-spin" /> Verifying…</> : <><Mail size={13} /> Connect</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reauth dialog */}
        {reauthOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-crm-card border border-crm-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center shrink-0"><AlertOctagon size={16} className="text-amber-400" /></div>
                <div><h3 className="text-[14px] font-semibold text-crm-text">Re-authentication Required</h3><p className="text-[11px] text-crm-text-muted">Your credentials need to be verified.</p></div>
              </div>
              {reauthError && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/50"><AlertOctagon size={13} className="text-red-400 shrink-0 mt-0.5" /><p className="text-[11px] text-red-300">{reauthError}</p></div>}
              <div className="space-y-3">
                <div className="space-y-1"><label className="text-[11px] font-medium text-crm-text-dim">Email</label>
                  <input type="email" value={reauthEmail} onChange={e => setReauthEmail(e.target.value)} className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-xl px-3 py-2 focus:outline-none focus:border-primary" />
                </div>
                <div className="space-y-1"><label className="text-[11px] font-medium text-crm-text-dim">Password</label>
                  <input type="password" value={reauthPassword} onChange={e => { setReauthPassword(e.target.value); setReauthError(""); }} onKeyDown={e => e.key === "Enter" && handleReauth()} autoFocus placeholder="••••••••" className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-xl px-3 py-2 focus:outline-none focus:border-primary placeholder:text-crm-text-faint" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setReauthOpen(false); setReauthPassword(""); setReauthError(""); }} className="flex-1 py-2 text-[13px] text-crm-text-muted border border-crm-border rounded-xl hover:bg-crm-surface transition-colors">Later</button>
                <button onClick={handleReauth} disabled={reauthSaving || !reauthPassword.trim()} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold transition-colors disabled:opacity-50">
                  {reauthSaving ? <><Loader2 size={13} className="animate-spin" /> Verifying…</> : <><Mail size={13} /> Reconnect</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Sidebar content ────────────────────────────────────────────────────────
  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compose */}
      <div className="p-3 shrink-0">
        <button
          onClick={() => { setComposeProps({}); setSidebarOpen(false); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/30"
        >
          <Pencil size={14} /> Compose
        </button>
      </div>

      <nav className="flex-1 px-2 overflow-y-auto space-y-0.5 pb-2">
        {SYSTEM_FOLDERS.map(f => {
          const Icon = f.icon;
          const count = f.id === "starred" || f.id === "archive" ? undefined : unreadMap[f.id];
          const isActive = !activeLabelId && activeFolder === f.id;
          return (
            <button key={f.id} onClick={() => { setActiveFolder(f.id); setActiveLabelId(null); setSelectedEmail(null); setSelectedIds(new Set()); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${isActive ? "bg-primary/12 text-primary font-semibold" : "text-crm-text-muted hover:text-crm-text hover:bg-crm-surface"}`}>
              <div className="flex items-center gap-2.5"><Icon size={16} className="shrink-0" /><span className="text-[13px]">{f.label}</span></div>
              {count != null && count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${f.id === "inbox" ? "bg-primary/15 text-primary" : f.id === "spam" ? "bg-red-500/15 text-red-400" : "bg-crm-surface text-crm-text-muted"}`}>{count > 99 ? "99+" : count}</span>
              )}
            </button>
          );
        })}

        {/* Custom Zoho folders */}
        {zohoFolders.filter(f => !f.isSystemFolder).length > 0 && (
          <div className="pt-3">
            <p className="text-[10px] font-semibold uppercase text-crm-text-faint tracking-wider px-3 mb-1.5">Folders</p>
            {zohoFolders.filter(f => !f.isSystemFolder).map(f => (
              <div key={f.folderId} className="group flex items-center">
                <button onClick={() => { setActiveFolder(f.folderName); setActiveLabelId(null); setSelectedEmail(null); setSelectedIds(new Set()); setSidebarOpen(false); }}
                  className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${activeFolder === f.folderName && !activeLabelId ? "bg-primary/12 text-primary font-semibold" : "text-crm-text-muted hover:text-crm-text hover:bg-crm-surface"}`}>
                  <div className="flex items-center gap-2.5"><Folder size={16} /><span className="text-[13px] truncate">{f.folderName}</span></div>
                  {f.unreadCount > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-crm-surface text-crm-text-muted">{f.unreadCount}</span>}
                </button>
                <button onClick={() => handleDeleteFolder(f)} className="hidden group-hover:flex p-1 mr-1 rounded text-crm-text-faint hover:text-red-400 transition-colors"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}

        {/* New folder */}
        <div className="pt-1">
          {newFolderInput ? (
            <div className="flex items-center gap-1 px-2 py-1">
              <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") { setNewFolderInput(false); setNewFolderName(""); } }} placeholder="Folder name" className="flex-1 bg-crm-surface border border-crm-border rounded-lg text-[12px] text-crm-text px-2 py-1 outline-none focus:border-primary" />
              <button onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName.trim()} className="p-1 text-primary hover:bg-primary/10 rounded disabled:opacity-40">{creatingFolder ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}</button>
              <button onClick={() => { setNewFolderInput(false); setNewFolderName(""); }} className="p-1 text-crm-text-faint hover:text-crm-text rounded"><X size={12} /></button>
            </div>
          ) : (
            <button onClick={() => setNewFolderInput(true)} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-crm-text-faint hover:text-crm-text-muted transition-colors">
              <Plus size={13} /> New Folder
            </button>
          )}
        </div>

        {/* Labels */}
        <div className="pt-3">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <p className="text-[10px] font-semibold uppercase text-crm-text-faint tracking-wider">Labels</p>
            <button onClick={() => setCreatingLabel(v => !v)} className="text-crm-text-faint hover:text-crm-text transition-colors"><Plus size={12} /></button>
          </div>
          {creatingLabel && (
            <div className="flex items-center gap-1 px-2 py-1 mb-1">
              <input autoFocus value={newLabelName} onChange={e => setNewLabelName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") createLabel(); if (e.key === "Escape") setCreatingLabel(false); }} placeholder="Label name" className="flex-1 bg-crm-surface border border-crm-border rounded-lg text-[12px] text-crm-text px-2 py-1 outline-none focus:border-primary" />
              <input type="color" value={newLabelColor} onChange={e => setNewLabelColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" title="Label colour" />
              <button onClick={createLabel} className="p-1 text-primary hover:bg-primary/10 rounded"><Check size={12} /></button>
              <button onClick={() => setCreatingLabel(false)} className="p-1 text-crm-text-faint hover:text-crm-text rounded"><X size={12} /></button>
            </div>
          )}
          {labels.map(l => (
            <div key={l.id} className="group flex items-center">
              <button onClick={() => { setActiveLabelId(l.id); setSelectedEmail(null); setSelectedIds(new Set()); setSidebarOpen(false); }}
                className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${activeLabelId === l.id ? "bg-primary/10 font-semibold" : "hover:bg-crm-surface"}`}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="text-[13px] text-crm-text truncate">{l.name}</span>
              </button>
              <button onClick={() => deleteLabel(l.id)} className="hidden group-hover:flex p-1 mr-1 rounded text-crm-text-faint hover:text-red-400 transition-colors"><X size={12} /></button>
            </div>
          ))}
        </div>
      </nav>

      {/* Account footer */}
      {account && (
        <div className="px-4 py-3 border-t border-crm-border shrink-0">
          <p className="text-[10px] text-crm-text-faint font-mono break-all leading-tight">{account.email_address}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {sessionStorage.getItem(sessionValidatedKey) === "ok"
              ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[10px] text-emerald-400 font-medium">Connected</span></>
              : <button onClick={() => { setReauthEmail(account.email_address); setReauthOpen(true); }} className="flex items-center gap-1.5 group"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /><span className="text-[10px] text-amber-400 group-hover:underline">Revalidate</span></button>
            }
          </div>
        </div>
      )}
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6 overflow-hidden bg-crm-card border border-crm-border rounded-xl shadow-sm">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-crm-card border-r border-crm-border shadow-2xl z-50" onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] lg:w-[240px] shrink-0 border-r border-crm-border flex-col">
        {sidebarContent}
      </aside>

      {/* Email list */}
      <div className={`flex flex-col border-r border-crm-border overflow-hidden transition-all
        ${selectedEmail ? "hidden md:flex md:w-[320px] lg:w-[360px] shrink-0" : "flex-1"}`}>

        {/* Top search bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-crm-border shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors md:hidden"><Menu size={18} /></button>
          <div className="flex-1 flex items-center gap-2 bg-crm-surface/60 rounded-full px-3 py-1.5 border border-crm-border/60 focus-within:border-primary/50 transition-colors">
            <Search size={14} className="text-crm-text-faint shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search mail… (try "from:alice")' className="flex-1 bg-transparent text-[13px] text-crm-text placeholder-crm-text-faint outline-none min-w-0" />
            {search && <button onClick={() => setSearch("")} className="text-crm-text-faint hover:text-crm-text"><X size={13} /></button>}
          </div>
          <button onClick={syncEmails} disabled={syncing} title="Sync" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors">
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap gap-1 px-3 py-1.5 border-b border-crm-border/60 shrink-0">
            {activeFilterChips.map(c => (
              <span key={c.key} className="flex items-center gap-1 text-[11px] bg-primary/10 text-primary rounded-full px-2 py-0.5 border border-primary/20">
                <Filter size={9} /> {c.label}
                <button onClick={() => removeFilter(c.key)} className="hover:text-red-400"><X size={9} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-crm-border shrink-0" onClick={() => setShowBulkMoveMenu(false)}>
          <div className="flex items-center gap-0.5 flex-1">
            <div className="px-1">
              <Checkbox checked={filteredEmails.length > 0 && selectedIds.size === filteredEmails.length} onCheckedChange={() => { if (selectedIds.size === filteredEmails.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredEmails.map(e => e.id))); }} className="border-crm-border" />
            </div>
            {selectedIds.size > 0 && (
              <>
                <span className="text-[11px] text-crm-text-muted px-1">{selectedIds.size} selected</span>
                <button onClick={handleBulkMarkRead} disabled={bulkOperating} title="Mark read" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors disabled:opacity-40"><MailOpen size={15} /></button>
                <button onClick={handleBulkArchive} disabled={bulkOperating} title="Archive" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors disabled:opacity-40"><Archive size={15} /></button>
                <button onClick={handleBulkTrash} disabled={bulkOperating} title="Delete" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors disabled:opacity-40">
                  {bulkOperating ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowBulkMoveMenu(v => !v)} disabled={bulkOperating} title="Move" className="p-1.5 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors disabled:opacity-40 flex items-center gap-0.5">
                    <Folder size={15} /><ChevronDown size={11} />
                  </button>
                  {showBulkMoveMenu && (
                    <div className="absolute left-0 top-full mt-1 z-50 w-44 bg-crm-card border border-crm-border rounded-xl shadow-xl py-1 max-h-48 overflow-y-auto">
                      {zohoFolders.map(f => <button key={f.folderId} onClick={() => handleBulkMove(f.folderId, f.folderName)} className="w-full text-left px-3 py-2 text-[12px] text-crm-text hover:bg-crm-surface transition-colors">{f.folderName}</button>)}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <button onClick={() => setThreadView(v => !v)} title={threadView ? "Disable thread view" : "Enable thread view"} className={`p-1.5 rounded-full hover:bg-crm-surface transition-colors text-[10px] flex items-center gap-1 ${threadView ? "text-primary bg-primary/10" : "text-crm-text-muted"}`}>
            <Clock size={13} /> <span className="hidden sm:inline">Threads</span>
          </button>
        </div>

        {/* Email rows */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : displayEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2.5 px-4 text-center">
              <MailOpen size={28} className="text-crm-text-faint" />
              <p className="text-[13px] text-crm-text-faint">{search ? "No results for your search" : `No emails in ${activeLabelId ? "this label" : activeFolder}`}</p>
            </div>
          ) : displayEmails.map(email => {
            const isUnread = !email.is_read;
            const name = email.from_name || email.from_address;
            const initials = getInitials(name);
            const color = getAvatarColor(name);
            const isSelected = selectedEmail?.id === email.id;
            const isChecked = selectedIds.has(email.id);
            const threadCount = threadView && email.thread_id ? filteredEmails.filter(e => e.thread_id === email.thread_id).length : 0;

            return (
              <div
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className={`group relative flex items-start gap-2.5 px-3 py-2.5 cursor-pointer border-b border-crm-border/40 transition-colors
                  ${isSelected ? "bg-primary/8 border-l-2 border-l-primary" : isUnread ? "bg-crm-surface/30 hover:bg-crm-surface/60" : "hover:bg-crm-surface/40"}`}
              >
                {/* Checkbox */}
                <div className={`shrink-0 mt-0.5 transition-opacity ${isChecked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} onClick={e => { e.stopPropagation(); const n = new Set(selectedIds); if (n.has(email.id)) n.delete(email.id); else n.add(email.id); setSelectedIds(n); }}>
                  <Checkbox checked={isChecked} className="border-crm-border" />
                </div>

                {/* Star */}
                <button type="button" onClick={e => { e.stopPropagation(); toggleStar.mutate({ id: email.id, starred: !email.is_starred }); }}
                  className={`shrink-0 mt-0.5 transition-colors ${email.is_starred ? "text-amber-400" : "text-crm-text-faint hover:text-amber-400 opacity-0 group-hover:opacity-100"}`}>
                  <Star size={13} fill={email.is_starred ? "currentColor" : "none"} />
                </button>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{initials}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className={`text-[13px] truncate ${isUnread ? "font-semibold text-crm-text" : "text-crm-text-muted font-medium"}`}>{name}</span>
                    <span className="text-[10px] text-crm-text-faint shrink-0">{relTime(email.sent_at)}</span>
                  </div>
                  <div className={`text-[12px] truncate leading-tight ${isUnread ? "text-crm-text font-medium" : "text-crm-text-muted"}`}>
                    {email.subject}
                    {threadCount > 1 && <span className="ml-1 text-[10px] text-crm-text-faint bg-crm-surface rounded-full px-1.5">{threadCount}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {email.has_attachments && <Paperclip size={10} className="text-crm-text-faint shrink-0" />}
                    <span className="text-[11px] text-crm-text-faint truncate">{email.body_text?.slice(0, 80)}</span>
                  </div>
                </div>

                {/* Hover quick actions */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-crm-card/95 border border-crm-border rounded-lg shadow-md px-1 py-0.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => archiveEmail(email.id)} title="Archive" className="p-1 rounded hover:bg-crm-surface text-crm-text-faint hover:text-crm-text transition-colors"><Archive size={12} /></button>
                  <button onClick={() => moveToTrash.mutate({ id: email.id, folder: activeFolder })} title={activeFolder === "trash" ? "Delete permanently" : "Delete"} className="p-1 rounded hover:bg-crm-surface text-crm-text-faint hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  <button onClick={() => markUnread.mutate(email.id)} title="Mark unread" className="p-1 rounded hover:bg-crm-surface text-crm-text-faint hover:text-crm-text transition-colors"><Mail size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail pane */}
      {selectedEmail ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <EmailDetailPane
            email={selectedEmail}
            onBack={() => setSelectedEmail(null)}
            onReply={e => setComposeProps({ replyTo: e })}
            onReplyAll={e => setComposeProps({ replyToAll: e })}
            onForward={e => setComposeProps({ forwardOf: e })}
            onStar={(id, starred) => toggleStar.mutate({ id, starred })}
            onTrash={id => moveToTrash.mutate({ id, folder: activeFolder })}
            onArchive={archiveEmail}
            onMarkUnread={id => markUnread.mutate(id)}
            onMove={(id, fid, fn) => moveEmail.mutate({ id, folderId: fid, folderName: fn })}
            onPrev={() => { if (currentIdx > 0) handleSelectEmail(displayEmails[currentIdx - 1]); }}
            onNext={() => { if (currentIdx < displayEmails.length - 1) handleSelectEmail(displayEmails[currentIdx + 1]); }}
            hasPrev={currentIdx > 0}
            hasNext={currentIdx < displayEmails.length - 1}
            folders={zohoFolders}
            labels={labels}
            allEmails={emails}
          />
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center px-8 gap-3 text-crm-text-faint">
          <Mail size={40} className="opacity-20" />
          <p className="text-[13px] opacity-50">Select an email to read</p>
        </div>
      )}

      {/* Compose window */}
      {composeProps !== null && account && (
        <ComposeModal
          account={account}
          {...composeProps}
          onClose={() => setComposeProps(null)}
          onSent={() => { invalidateEmails(); setComposeProps(null); }}
          userId={user?.id}
        />
      )}

      {/* Reauth dialog (shown even when account exists) */}
      {reauthOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-crm-card border border-crm-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center shrink-0"><AlertOctagon size={16} className="text-amber-400" /></div>
              <div><h3 className="text-[14px] font-semibold text-crm-text">Re-authentication Required</h3><p className="text-[11px] text-crm-text-muted">Your email credentials need to be verified.</p></div>
            </div>
            {reauthError && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/50"><AlertOctagon size={13} className="text-red-400 shrink-0 mt-0.5" /><p className="text-[11px] text-red-300">{reauthError}</p></div>}
            <div className="space-y-3">
              <div className="space-y-1"><label className="text-[11px] font-medium text-crm-text-dim">Email</label>
                <input type="email" value={reauthEmail} onChange={e => setReauthEmail(e.target.value)} className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-xl px-3 py-2 focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-1"><label className="text-[11px] font-medium text-crm-text-dim">Password</label>
                <input type="password" value={reauthPassword} onChange={e => { setReauthPassword(e.target.value); setReauthError(""); }} onKeyDown={e => e.key === "Enter" && handleReauth()} autoFocus placeholder="••••••••" className="w-full bg-crm-surface border border-crm-border text-crm-text text-[13px] rounded-xl px-3 py-2 focus:outline-none focus:border-primary placeholder:text-crm-text-faint" />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setReauthOpen(false); setReauthPassword(""); setReauthError(""); }} className="flex-1 py-2 text-[13px] text-crm-text-muted border border-crm-border rounded-xl hover:bg-crm-surface transition-colors">Later</button>
              <button onClick={handleReauth} disabled={reauthSaving || !reauthPassword.trim()} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold disabled:opacity-50 transition-colors">
                {reauthSaving ? <><Loader2 size={13} className="animate-spin" /> Verifying…</> : <><Mail size={13} /> Reconnect</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
