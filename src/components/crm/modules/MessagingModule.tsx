import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import {
  Send, MessageSquare, Search, Phone, Video, MoreVertical,
  CheckSquare, Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileRow { id: string; full_name: string; email: string; avatar_url?: string | null; }

interface ChannelMessage {
  id: string; channel_id: string; sender_id: string; body: string;
  sent_at: string; deleted_at: string | null; task_id: string | null;
  sender?: { full_name: string; email: string };
}
interface DirectMessage {
  id: string; sender_id: string; recipient_id: string; body: string;
  sent_at: string; deleted_at: string | null;
  sender?: { full_name: string; email: string };
}
interface Channel {
  id: string; name: string; description: string | null;
  type: "public" | "private"; created_by: string; is_archived: boolean;
}
interface DmConversation {
  peer_id: string; peer_name: string; last_message: string; last_at: string;
}
type ActiveView = { type: "channel"; id: string } | { type: "dm"; peerId: string; peerName: string };

// ─── Create Channel Dialog ────────────────────────────────────────────────────
function CreateChannelDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (ch: Channel) => void;
}) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<"public" | "private">("public");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !user?.id) return;
    setSaving(true);
    try {
      const { data: ch, error } = await (supabase as any)
        .from("channels").insert({
          name: name.trim().toLowerCase().replace(/\s+/g, "-"),
          type, created_by: user.id,
        }).select().single();
      if (error) throw error;
      await (supabase as any).from("channel_members").insert({ channel_id: ch.id, user_id: user.id });
      qc.invalidateQueries({ queryKey: ["channels"] });
      toast({ title: `#${ch.name} created` });
      onCreated(ch);
      onClose();
      setName("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">Create Channel</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Channel name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. announcements"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Type</Label>
            <Select value={type} onValueChange={v => setType(v as "public" | "private")}>
              <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-crm-card border-crm-border text-crm-text">
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" onClick={handleCreate} disabled={saving || !name.trim()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {saving ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ body, senderName, time, isOwn, avatarUrl }: {
  body: string; senderName: string; time: string; isOwn: boolean; avatarUrl?: string | null;
}) {
  const initials = senderName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={`flex gap-2.5 mb-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden
        ${isOwn ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-crm-border text-crm-text-muted"}`}>
        {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : initials}
      </div>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`px-3 py-2 rounded-xl text-[12.5px] leading-relaxed
          ${isOwn
            ? "bg-emerald-950 border border-emerald-800 text-emerald-100 rounded-br-sm"
            : "bg-crm-surface border border-crm-border text-crm-text-secondary rounded-bl-sm"
          }`}>
          {body}
        </div>
        <span className="text-[9px] text-crm-text-faint mt-1">{time}</span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MessagingModule() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<ActiveView | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [search, setSearch] = useState("");

  // ── Channels ────────────────────────────────────────────────────────────
  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("channels").select("*")
        .eq("is_archived", false).order("name");
      return data ?? [];
    },
  });

  // ── DM conversations ───────────────────────────────────────────────────
  const { data: dmConversations = [] } = useQuery<DmConversation[]>({
    queryKey: ["dm-conversations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: sent } = await (supabase as any).from("direct_messages")
        .select("recipient_id, body, sent_at, recipient:profiles!direct_messages_recipient_id_fkey(full_name)")
        .eq("sender_id", user.id).is("deleted_at", null).order("sent_at", { ascending: false });
      const { data: received } = await (supabase as any).from("direct_messages")
        .select("sender_id, body, sent_at, sender:profiles!direct_messages_sender_id_fkey(full_name)")
        .eq("recipient_id", user.id).is("deleted_at", null).order("sent_at", { ascending: false });
      const map = new Map<string, DmConversation>();
      for (const m of [...(sent ?? []), ...(received ?? [])]) {
        const peerId = m.recipient_id ?? m.sender_id;
        const peerName = m.recipient?.full_name ?? m.sender?.full_name ?? "Unknown";
        if (!map.has(peerId) || new Date(m.sent_at) > new Date(map.get(peerId)!.last_at)) {
          map.set(peerId, { peer_id: peerId, peer_name: peerName, last_message: m.body, last_at: m.sent_at });
        }
      }
      return Array.from(map.values()).sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime());
    },
    enabled: !!user?.id,
  });

  // ── Contacts ────────────────────────────────────────────────────────────
  const { data: contacts = [] } = useQuery<ProfileRow[]>({
    queryKey: ["chat-contacts"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("profiles")
        .select("id, full_name, email, avatar_url").order("full_name");
      return (data ?? []).filter((p: ProfileRow) => p.id !== user?.id);
    },
    enabled: !!user?.id,
  });

  // ── Active messages ─────────────────────────────────────────────────────
  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", view?.type, view?.type === "channel" ? view.id : view?.type === "dm" ? view.peerId : null],
    queryFn: async () => {
      if (!view) return [];
      if (view.type === "channel") {
        const { data } = await (supabase as any).from("channel_messages")
          .select("*, sender:profiles!channel_messages_sender_id_fkey(full_name, email)")
          .eq("channel_id", view.id).is("deleted_at", null).order("sent_at", { ascending: true }).limit(100);
        return data ?? [];
      } else {
        const { data } = await (supabase as any).from("direct_messages")
          .select("*, sender:profiles!direct_messages_sender_id_fkey(full_name, email)")
          .or(`and(sender_id.eq.${user!.id},recipient_id.eq.${view.peerId}),and(sender_id.eq.${view.peerId},recipient_id.eq.${user!.id})`)
          .is("deleted_at", null).order("sent_at", { ascending: true }).limit(100);
        return data ?? [];
      }
    },
    enabled: !!view,
    refetchInterval: 5000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!body.trim() || !user?.id || !view) return;
    setSending(true);
    try {
      if (view.type === "channel") {
        await (supabase as any).from("channel_messages").insert({
          channel_id: view.id, sender_id: user.id, body: body.trim(),
        });
        qc.invalidateQueries({ queryKey: ["chat-messages", "channel", view.id] });
      } else {
        await (supabase as any).from("direct_messages").insert({
          sender_id: user.id, recipient_id: view.peerId, body: body.trim(),
        });
        qc.invalidateQueries({ queryKey: ["chat-messages", "dm", view.peerId] });
        qc.invalidateQueries({ queryKey: ["dm-conversations"] });
      }
      setBody("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    !search || c.full_name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeLabel = view?.type === "channel"
    ? `# ${channels.find(c => c.id === view.id)?.name ?? "channel"}`
    : view?.type === "dm" ? view.peerName : "";

  return (
    <div className="flex h-[calc(100vh-140px)] bg-crm-card border border-crm-border rounded-xl overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-72 border-r border-crm-border flex flex-col flex-shrink-0">
        {/* Current user header */}
        <div className="p-4 border-b border-crm-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-[11px] font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-crm-text truncate">Chat</p>
            </div>
            <button onClick={() => setShowCreateChannel(true)}
              className="p-1.5 text-crm-text-dim hover:text-emerald-400 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-text-faint" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 pl-8" />
          </div>
        </div>

        {/* Chats section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <p className="text-[10px] font-semibold text-crm-text-dim uppercase tracking-wider">Chats</p>
          </div>
          {/* Channels as chats */}
          {channels.filter(c => !search || c.name.includes(search.toLowerCase())).map(ch => (
            <button key={ch.id}
              onClick={() => setView({ type: "channel", id: ch.id })}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-crm-surface transition-colors text-left
                ${view?.type === "channel" && view.id === ch.id ? "bg-crm-surface" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-crm-border flex items-center justify-center text-crm-text-muted text-[10px] font-bold">
                #
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-crm-text truncate">#{ch.name}</p>
                <p className="text-[10px] text-crm-text-faint truncate">{ch.description || "Channel"}</p>
              </div>
            </button>
          ))}
          {/* DM conversations */}
          {dmConversations.filter(c => !search || c.peer_name.toLowerCase().includes(search.toLowerCase())).map(dm => (
            <button key={dm.peer_id}
              onClick={() => setView({ type: "dm", peerId: dm.peer_id, peerName: dm.peer_name })}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-crm-surface transition-colors text-left
                ${view?.type === "dm" && view.peerId === dm.peer_id ? "bg-crm-surface" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-crm-border flex items-center justify-center text-crm-text-muted text-[10px] font-bold uppercase">
                {dm.peer_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-crm-text truncate">{dm.peer_name}</p>
                  <span className="text-[9px] text-crm-text-faint flex-shrink-0">{format(parseISO(dm.last_at), "h:mm a")}</span>
                </div>
                <p className="text-[10px] text-crm-text-faint truncate">{dm.last_message}</p>
              </div>
            </button>
          ))}

          {/* Contacts */}
          <div className="px-4 py-2 mt-2">
            <p className="text-[10px] font-semibold text-crm-text-dim uppercase tracking-wider">Contacts</p>
          </div>
          {filteredContacts.map(c => {
            const initials = c.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
            return (
              <button key={c.id}
                onClick={() => setView({ type: "dm", peerId: c.id, peerName: c.full_name })}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-crm-surface transition-colors text-left
                  ${view?.type === "dm" && view.peerId === c.id ? "bg-crm-surface" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-crm-border flex items-center justify-center text-crm-text-muted text-[10px] font-bold uppercase overflow-hidden">
                  {c.avatar_url ? <img src={c.avatar_url} className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-crm-text truncate">{c.full_name}</p>
                  <p className="text-[10px] text-crm-text-faint truncate">{c.email}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!view ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-crm-surface mx-auto flex items-center justify-center">
                <MessageSquare size={28} className="text-crm-text-faint" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-crm-text">Select a contact</p>
                <p className="text-[11px] text-crm-text-muted mt-1">Choose a contact or channel to start a conversation</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-crm-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-crm-border flex items-center justify-center text-crm-text-muted text-[10px] font-bold uppercase">
                  {view.type === "channel" ? "#" : activeLabel.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-crm-text">{activeLabel}</p>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[Phone, Video, Search, MoreVertical].map((Icon, i) => (
                  <button key={i} className="p-2 text-crm-text-dim hover:text-crm-text-secondary transition-colors rounded">
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.map((msg: any) => (
                <MessageBubble
                  key={msg.id}
                  body={msg.body}
                  senderName={msg.sender?.full_name || msg.sender?.email?.split("@")[0] || "Unknown"}
                  time={format(parseISO(msg.sent_at), "h:mm a")}
                  isOwn={msg.sender_id === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-crm-border">
              <div className="flex gap-2">
                <Input value={body} onChange={e => setBody(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type your message..."
                  className="bg-crm-surface border-crm-border text-crm-text text-sm flex-1" />
                <Button size="sm" onClick={handleSend} disabled={!body.trim() || sending}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white">
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create channel dialog */}
      <CreateChannelDialog
        open={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onCreated={(ch) => setView({ type: "channel", id: ch.id })}
      />
    </div>
  );
}
