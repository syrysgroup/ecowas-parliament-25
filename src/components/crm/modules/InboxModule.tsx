import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Send, Archive, Plus, ArrowLeft, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Folder = "inbox" | "sent" | "archived";

// ─── Compose Dialog ────────────────────────────────────────────────────────────
function ComposeDialog({ open, onClose, profiles, replyTo }: {
  open: boolean;
  onClose: () => void;
  profiles: any[];
  replyTo?: any;
}) {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [toUserId, setToUserId] = useState(replyTo?.from_user_id ?? "");
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject.replace(/^Re: /, "")}` : "");
  const [body, setBody] = useState("");

  const send = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("crm_messages").insert({
        from_user_id: user!.id,
        to_user_id: toUserId || null,
        subject,
        body,
        thread_id: replyTo?.thread_id ?? replyTo?.id ?? null,
        is_read: false,
        is_archived: false,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-inbox"] });
      qc.invalidateQueries({ queryKey: ["crm-sent"] });
      setToUserId(""); setSubject(""); setBody("");
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1610] border-[#1e2d22] text-[#c8e0cc] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-[#c8e0cc]">
            {replyTo ? "Reply" : "New Message"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">To</Label>
            <Select value={toUserId} onValueChange={setToUserId}>
              <SelectTrigger className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1610] border-[#1e2d22]">
                {profiles.filter(p => p.id !== user?.id).map((p: any) => (
                  <SelectItem key={p.id} value={p.id} className="text-[#c8e0cc] text-xs">
                    {p.full_name} — {p.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)}
              className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8"
              placeholder="Message subject" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Message</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)}
              className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs resize-none"
              rows={5} placeholder="Write your message…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-[#1e2d22] text-[#6b8f72] text-xs">
            Discard
          </Button>
          <Button size="sm"
            disabled={!toUserId || !subject.trim() || !body.trim() || send.isPending}
            onClick={() => send.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Send size={12} /> {send.isPending ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Thread View ───────────────────────────────────────────────────────────────
function ThreadView({ message, profiles, onBack, onReply }: {
  message: any;
  profiles: any[];
  onBack: () => void;
  onReply: (msg: any) => void;
}) {
  const qc = useQueryClient();
  const { user } = useAuthContext();

  // Fetch full thread
  const threadId = message.thread_id ?? message.id;
  const { data: thread = [] } = useQuery({
    queryKey: ["crm-thread", threadId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("crm_messages")
        .select("*")
        .or(`id.eq.${threadId},thread_id.eq.${threadId}`)
        .order("sent_at", { ascending: true });
      return data ?? [];
    },
  });

  const archive = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("crm_messages").update({ is_archived: true }).eq("id", message.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-inbox"] });
      onBack();
    },
  });

  const getProfile = (id: string) => profiles.find(p => p.id === id);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2d22]">
        <button onClick={onBack} className="text-[#4a6650] hover:text-[#a0c4a8] transition-colors">
          <ArrowLeft size={14} />
        </button>
        <h3 className="text-[13px] font-semibold text-[#c8e0cc] flex-1 truncate">{message.subject}</h3>
        <button
          onClick={() => archive.mutate()}
          title="Archive"
          className="text-[#4a6650] hover:text-[#a0c4a8] transition-colors"
        >
          <Archive size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-[#111a14]">
        {thread.map((msg: any) => {
          const from = getProfile(msg.from_user_id);
          const isOwn = msg.from_user_id === user?.id;
          return (
            <div key={msg.id} className="px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1e2d22] flex items-center justify-center text-[10px] font-bold text-emerald-400 uppercase flex-shrink-0">
                  {from?.full_name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-semibold text-[#c8e0cc]">
                      {isOwn ? "You" : (from?.full_name ?? "Unknown")}
                    </span>
                    <span className="text-[10px] text-[#4a6650]">
                      {format(parseISO(msg.sent_at), "d MMM · h:mm a")}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#a0c4a8] whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-[#1e2d22]">
        <Button size="sm" onClick={() => onReply(message)}
          className="bg-[#111a14] border border-[#1e2d22] hover:bg-[#1e2d22] text-[#c8e0cc] text-xs gap-1.5">
          Reply
        </Button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InboxModule() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [folder, setFolder] = useState<Folder>("inbox");
  const [selected, setSelected] = useState<any>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyMsg, setReplyMsg] = useState<any>(null);

  // Per-user email settings (set by super_admin in PeopleModule)
  const { data: emailSettings } = useQuery({
    queryKey: ["user-email-settings", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("user_email_settings")
        .select("smtp_user, auto_connect")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data ?? null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
  });

  // Profiles for compose
  const { data: profiles = [] } = useQuery({
    queryKey: ["crm-profiles-inbox"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  // Inbox messages
  const { data: inboxMsgs = [], isLoading: inboxLoading } = useQuery({
    queryKey: ["crm-inbox", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("crm_messages")
        .select("*")
        .eq("to_user_id", user!.id)
        .eq("is_archived", false)
        .order("sent_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  // Sent messages
  const { data: sentMsgs = [], isLoading: sentLoading } = useQuery({
    queryKey: ["crm-sent", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("crm_messages")
        .select("*")
        .eq("from_user_id", user!.id)
        .order("sent_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id && folder === "sent",
  });

  // Archived
  const { data: archivedMsgs = [], isLoading: archivedLoading } = useQuery({
    queryKey: ["crm-archived", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("crm_messages")
        .select("*")
        .eq("to_user_id", user!.id)
        .eq("is_archived", true)
        .order("sent_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id && folder === "archived",
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("crm_messages").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm-inbox"] }),
  });

  const openMessage = (msg: any) => {
    setSelected(msg);
    if (!msg.is_read && msg.to_user_id === user?.id) markRead.mutate(msg.id);
  };

  const currentMsgs = folder === "inbox" ? inboxMsgs : folder === "sent" ? sentMsgs : archivedMsgs;
  const isLoading = folder === "inbox" ? inboxLoading : folder === "sent" ? sentLoading : archivedLoading;
  const unreadCount = inboxMsgs.filter((m: any) => !m.is_read).length;

  const getProfile = (id: string) => profiles.find((p: any) => p.id === id);

  const FOLDERS: { id: Folder; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "inbox",    label: "Inbox",    icon: <Mail size={13} />,    count: unreadCount || undefined },
    { id: "sent",     label: "Sent",     icon: <Send size={13} /> },
    { id: "archived", label: "Archived", icon: <Archive size={13} /> },
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#0a0f0d] border border-[#1e2d22] rounded-xl overflow-hidden">
      {/* Folder pane */}
      <div className="w-[140px] border-r border-[#1e2d22] flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#1e2d22] space-y-2">
          <Button size="sm" onClick={() => { setComposeOpen(true); setReplyMsg(null); }}
            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={12} /> Compose
          </Button>
          {emailSettings?.auto_connect ? (
            <div className="flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-[9px] text-emerald-500 truncate" title={emailSettings.smtp_user}>
                {emailSettings.smtp_user}
              </span>
            </div>
          ) : (
            <p className="text-[9px] text-[#3a5040] px-1 text-center">No email configured</p>
          )}
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {FOLDERS.map(f => (
            <button key={f.id} onClick={() => { setFolder(f.id); setSelected(null); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[11.5px] transition-colors
                ${folder === f.id
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "text-[#6b8f72] hover:text-[#a0c4a8] hover:bg-[#111a14]"
                }`}
            >
              {f.icon}
              <span className="flex-1">{f.label}</span>
              {f.count !== undefined && f.count > 0 && (
                <span className="text-[9px] font-mono bg-emerald-800 text-emerald-300 rounded-full px-1.5 py-0.5">{f.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Thread list */}
      <div className={`flex flex-col border-r border-[#1e2d22] ${selected ? "w-[280px] flex-shrink-0" : "flex-1"}`}>
        <div className="px-4 py-3 border-b border-[#1e2d22]">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#4a6650]">
            {folder === "inbox" ? "Inbox" : folder === "sent" ? "Sent" : "Archived"}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[#111a14]">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-3 space-y-2">
                <div className="h-3 bg-[#1e2d22] rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-[#1e2d22] rounded animate-pulse" />
              </div>
            ))
          ) : currentMsgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4 py-8">
              <Mail size={24} className="text-[#2a3d2d]" />
              <p className="text-[11px] text-[#4a6650]">No messages</p>
            </div>
          ) : (
            currentMsgs.map((msg: any) => {
              const isUnread = !msg.is_read && msg.to_user_id === user?.id;
              const contactId = folder === "sent" ? msg.to_user_id : msg.from_user_id;
              const contact = getProfile(contactId);
              return (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-[#111a14]
                    ${selected?.id === msg.id ? "bg-[#111a14]" : ""}
                  `}
                >
                  <div className="flex items-start gap-2">
                    {isUnread && <Circle size={6} className="text-emerald-500 mt-1.5 flex-shrink-0 fill-emerald-500" />}
                    {!isUnread && <span className="w-[6px] flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[11.5px] truncate ${isUnread ? "font-semibold text-[#c8e0cc]" : "text-[#a0c4a8]"}`}>
                          {contact?.full_name ?? (folder === "sent" ? "Unknown" : "Unknown")}
                        </span>
                        <span className="text-[9px] text-[#4a6650] flex-shrink-0">
                          {format(parseISO(msg.sent_at), "d MMM")}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate ${isUnread ? "text-[#6b8f72]" : "text-[#4a6650]"}`}>
                        {msg.subject}
                      </p>
                      <p className="text-[10px] text-[#2a3d2d] truncate mt-0.5">
                        {msg.body.slice(0, 60)}…
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Thread view */}
      {selected && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <ThreadView
            message={selected}
            profiles={profiles}
            onBack={() => setSelected(null)}
            onReply={msg => { setReplyMsg(msg); setComposeOpen(true); }}
          />
        </div>
      )}

      <ComposeDialog
        open={composeOpen}
        onClose={() => { setComposeOpen(false); setReplyMsg(null); }}
        profiles={profiles}
        replyTo={replyMsg}
      />
    </div>
  );
}
