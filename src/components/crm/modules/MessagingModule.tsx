import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import {
  Hash, Lock, Plus, Send, CheckSquare, MessageSquare,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: "public" | "private";
  created_by: string;
  is_archived: boolean;
  created_at: string;
}

interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  body: string;
  sent_at: string;
  deleted_at: string | null;
  task_id: string | null;
  sender?: { full_name: string; email: string };
}

interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  sent_at: string;
  deleted_at: string | null;
  sender?: { full_name: string; email: string };
}

interface DmConversation {
  peer_id: string;
  peer_name: string;
  last_message: string;
  last_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
}

type ActiveView =
  | { type: "channel"; id: string }
  | { type: "dm"; peerId: string; peerName: string };

// ─── Create Channel Dialog ────────────────────────────────────────────────────
function CreateChannelDialog({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: (ch: Channel) => void;
}) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "private">("public");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: profiles = [] } = useQuery<ProfileRow[]>({
    queryKey: ["profiles-for-channels"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("profiles")
        .select("id, full_name, email").order("full_name");
      return (data ?? []).filter((p: ProfileRow) => p.id !== user?.id);
    },
    enabled: open,
  });

  const handleCreate = async () => {
    if (!name.trim() || !user?.id) return;
    setSaving(true);
    try {
      const { data: ch, error } = await (supabase as any)
        .from("channels")
        .insert({
          name: name.trim().toLowerCase().replace(/\s+/g, "-"),
          description: description.trim() || null,
          type,
          created_by: user.id,
        })
        .select().single();
      if (error) throw error;

      const memberIds = [user.id, ...selectedMembers];
      await (supabase as any).from("channel_members").insert(
        memberIds.map(uid => ({ channel_id: ch.id, user_id: uid }))
      );

      qc.invalidateQueries({ queryKey: ["channels"] });
      toast({ title: `#${ch.name} created` });
      onCreated(ch);
      onClose();
      setName(""); setDescription(""); setSelectedMembers([]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">Create Channel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">Channel name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. announcements"
                className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
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
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Description (optional)</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this channel about?"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Add members (optional)</Label>
            <div className="max-h-36 overflow-y-auto space-y-1 bg-crm-surface rounded-lg border border-crm-border p-2">
              {profiles.map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                  <input type="checkbox" checked={selectedMembers.includes(p.id)}
                    onChange={e => setSelectedMembers(prev =>
                      e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id)
                    )}
                    className="accent-emerald-500" />
                  <span className="text-[11px] text-crm-text-secondary">{p.full_name || p.email}</span>
                </label>
              ))}
              {profiles.length === 0 && <p className="text-[10px] text-crm-text-faint">No other users found</p>}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}
            className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" onClick={handleCreate} disabled={saving || !name.trim()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {saving ? "Creating…" : "Create Channel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Task Dialog ───────────────────────────────────────────────────────
function CreateTaskDialog({ open, prefill, messageId, onClose }: {
  open: boolean;
  prefill: string;
  messageId: string;
  onClose: () => void;
}) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [title, setTitle] = useState(prefill);
  const [assigneeId, setAssigneeId] = useState("unassigned");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: profiles = [] } = useQuery<ProfileRow[]>({
    queryKey: ["profiles-for-tasks"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("profiles").select("id, full_name, email").order("full_name");
      return data ?? [];
    },
    enabled: open,
  });

  const handleSave = async () => {
    if (!title.trim() || !user?.id) return;
    setSaving(true);
    try {
      const { data: task, error: taskErr } = await (supabase as any)
        .from("tasks")
        .insert({
          title: title.trim(),
          assignee_id: assigneeId === "unassigned" ? null : assigneeId,
          priority,
          due_date: dueDate || null,
          created_by: user.id,
          status: "todo",
        })
        .select().single();
      if (taskErr) throw taskErr;

      await (supabase as any).from("channel_messages").update({ task_id: task.id }).eq("id", messageId);

      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["channel-messages"] });
      toast({ title: "Task created", description: title.trim() });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">Create Task from Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Task title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border text-crm-text">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border text-crm-text">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Due date (optional)</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}
            className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {saving ? "Creating…" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Message bubble (channel) ─────────────────────────────────────────────────
function ChannelBubble({ msg, currentUserId, onCreateTask }: {
  msg: ChannelMessage;
  currentUserId: string;
  onCreateTask: (m: ChannelMessage) => void;
}) {
  const isOwn = msg.sender_id === currentUserId;
  const senderName = msg.sender?.full_name || msg.sender?.email?.split("@")[0] || "Unknown";
  const initials = senderName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  if (msg.deleted_at) {
    return (
      <div className="flex gap-2.5 px-1 py-0.5 opacity-40">
        <div className="w-7 h-7 rounded-full bg-crm-border flex-shrink-0" />
        <p className="text-[11px] text-crm-text-faint italic pt-1.5">This message was deleted</p>
      </div>
    );
  }

  return (
    <div className="group flex gap-2.5 px-1 py-1 hover:bg-crm-surface/40 rounded-lg transition-colors">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 uppercase mt-0.5 ${isOwn ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-crm-border text-crm-text-muted"}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] font-semibold text-crm-text">{senderName}</span>
          <span className="text-[10px] text-crm-text-faint">{format(parseISO(msg.sent_at), "h:mm a")}</span>
        </div>
        <p className="text-[12.5px] text-crm-text-secondary leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
        {msg.task_id && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-950 border border-emerald-800 rounded px-2 py-0.5">
            <CheckSquare size={10} /> Task linked
          </div>
        )}
      </div>
      {!msg.task_id && (
        <button onClick={() => onCreateTask(msg)} title="Create task from message"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-crm-text-dim hover:text-emerald-400 flex-shrink-0">
          <CheckSquare size={13} />
        </button>
      )}
    </div>
  );
}

// ─── DM bubble ────────────────────────────────────────────────────────────────
function DmBubble({ msg, currentUserId }: { msg: DirectMessage; currentUserId: string }) {
  const isOwn = msg.sender_id === currentUserId;
  const senderName = msg.sender?.full_name || msg.sender?.email?.split("@")[0] || "Unknown";
  const initials = senderName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  if (msg.deleted_at) {
    return (
      <div className="flex gap-2.5 px-1 py-0.5 opacity-40">
        <div className="w-7 h-7 rounded-full bg-crm-border flex-shrink-0" />
        <p className="text-[11px] text-crm-text-faint italic pt-1.5">This message was deleted</p>
      </div>
    );
  }

  return (
    <div className={`flex gap-2.5 px-1 py-1 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 uppercase mt-0.5 ${isOwn ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-crm-border text-crm-text-muted"}`}>
        {initials}
      </div>
      <div className={`flex-1 min-w-0 ${isOwn ? "flex flex-col items-end" : ""}`}>
        <div className={`flex items-baseline gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[12px] font-semibold text-crm-text">{isOwn ? "You" : senderName}</span>
          <span className="text-[10px] text-crm-text-faint">{format(parseISO(msg.sent_at), "h:mm a")}</span>
        </div>
        <div className={`mt-0.5 px-3 py-2 rounded-xl text-[12.5px] leading-relaxed max-w-xs ${isOwn ? "bg-emerald-950 border border-emerald-800 text-emerald-100" : "bg-crm-surface border border-crm-border text-crm-text-secondary"}`}>
          {msg.body}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MessagingModule() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<ActiveView | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const [taskTarget, setTaskTarget] = useState<ChannelMessage | null>(null);
  const [search, setSearch] = useState("");

  // ── Channels ──────────────────────────────────────────────────────────────
  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("channels")
        .select("*").eq("is_archived", false).order("name");
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  // Auto-select #general on first load
  useEffect(() => {
    if (!view && channels.length > 0) {
      const general = channels.find(c => c.name === "general") ?? channels[0];
      setView({ type: "channel", id: general.id });
    }
  }, [channels, view]);

  // ── Channel messages ──────────────────────────────────────────────────────
  const activeChannelId = view?.type === "channel" ? view.id : null;
  const { data: channelMessages = [] } = useQuery<ChannelMessage[]>({
    queryKey: ["channel-messages", activeChannelId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("channel_messages")
        .select("*, sender:sender_id(full_name, email)")
        .eq("channel_id", activeChannelId!)
        .order("sent_at", { ascending: true })
        .limit(200);
      return data ?? [];
    },
    enabled: !!activeChannelId,
    refetchInterval: 8_000,
  });

  // ── Realtime for channel messages ─────────────────────────────────────────
  useEffect(() => {
    if (!activeChannelId) return;
    const sub = supabase
      .channel(`ch-msgs-${activeChannelId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "channel_messages",
        filter: `channel_id=eq.${activeChannelId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["channel-messages", activeChannelId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [activeChannelId, qc]);

  // ── DM conversations ──────────────────────────────────────────────────────
  const { data: dmConversations = [] } = useQuery<DmConversation[]>({
    queryKey: ["dm-conversations", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("chat_messages")
        .select("sender_id, recipient_id, body, sent_at")
        .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
        .is("deleted_at", null)
        .order("sent_at", { ascending: false });

      if (!data) return [];
      const peersMap = new Map<string, { last_message: string; last_at: string }>();
      (data as any[]).forEach(m => {
        const peerId = m.sender_id === user!.id ? m.recipient_id : m.sender_id;
        if (!peersMap.has(peerId)) peersMap.set(peerId, { last_message: m.body, last_at: m.sent_at });
      });
      if (peersMap.size === 0) return [];

      const peerIds = Array.from(peersMap.keys());
      const { data: profs } = await (supabase as any).from("profiles")
        .select("id, full_name, email").in("id", peerIds);

      return peerIds.map(pid => {
        const prof = (profs ?? []).find((p: any) => p.id === pid);
        const c = peersMap.get(pid)!;
        return {
          peer_id: pid,
          peer_name: prof?.full_name || prof?.email?.split("@")[0] || "Unknown",
          last_message: c.last_message,
          last_at: c.last_at,
        };
      });
    },
    enabled: !!user?.id,
    refetchInterval: 30_000,
  });

  // ── DM messages ───────────────────────────────────────────────────────────
  const activePeerId = view?.type === "dm" ? view.peerId : null;
  const { data: dmMessages = [] } = useQuery<DirectMessage[]>({
    queryKey: ["dm-messages", user?.id, activePeerId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("chat_messages")
        .select("*, sender:sender_id(full_name, email)")
        .or(
          `and(sender_id.eq.${user!.id},recipient_id.eq.${activePeerId}),` +
          `and(sender_id.eq.${activePeerId},recipient_id.eq.${user!.id})`
        )
        .is("deleted_at", null)
        .order("sent_at", { ascending: true })
        .limit(200);
      return data ?? [];
    },
    enabled: !!activePeerId,
    refetchInterval: 5_000,
  });

  // Realtime for DMs
  useEffect(() => {
    if (!activePeerId || !user?.id) return;
    const sub = supabase
      .channel(`dm-${user.id}-${activePeerId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
      }, () => {
        qc.invalidateQueries({ queryKey: ["dm-messages", user.id, activePeerId] });
        qc.invalidateQueries({ queryKey: ["dm-conversations", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [activePeerId, user?.id, qc]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages.length, dmMessages.length]);

  // ── People search for new DM ──────────────────────────────────────────────
  const { data: allProfiles = [] } = useQuery<ProfileRow[]>({
    queryKey: ["profiles-list"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("profiles")
        .select("id, full_name, email").order("full_name");
      return (data ?? []).filter((p: ProfileRow) => p.id !== user?.id);
    },
    enabled: !!user?.id,
  });
  const filteredProfiles = search.length > 1
    ? allProfiles.filter(p =>
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!body.trim() || !user?.id || !view) return;
    setSending(true);
    try {
      if (view.type === "channel") {
        const { error } = await (supabase as any).from("channel_messages").insert({
          channel_id: view.id, sender_id: user.id, body: body.trim(),
        });
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["channel-messages", view.id] });
      } else {
        const { error } = await (supabase as any).from("chat_messages").insert({
          sender_id: user.id, recipient_id: view.peerId, body: body.trim(),
        });
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["dm-messages", user.id, view.peerId] });
        qc.invalidateQueries({ queryKey: ["dm-conversations", user.id] });
      }
      setBody("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const activeChannel = view?.type === "channel" ? channels.find(c => c.id === view.id) : null;

  return (
    <div className="flex h-[calc(100vh-120px)] -mx-6 -mt-4 overflow-hidden rounded-xl border border-crm-border bg-crm">

      {/* ── Left panel ────────────────────────────────────────────────────── */}
      <div className="w-56 flex-shrink-0 flex flex-col border-r border-crm-border bg-crm-card">
        <div className="px-3 pt-4 pb-2">
          <p className="text-[10px] font-bold text-crm-text-faint uppercase tracking-widest mb-2">Workspace</p>
          <div className="relative mb-2">
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people…"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-[11px] h-7 focus:border-emerald-700"
            />
            {search.length > 1 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-crm-card border border-crm-border rounded-lg shadow-xl mt-0.5 overflow-hidden">
                {filteredProfiles.length === 0 ? (
                  <p className="text-[10px] text-crm-text-faint px-2 py-2">No results</p>
                ) : filteredProfiles.slice(0, 6).map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setView({ type: "dm", peerId: p.id, peerName: p.full_name || p.email }); setSearch(""); }}
                    className="w-full text-left px-2 py-1.5 text-[11px] text-crm-text-secondary hover:bg-crm-surface transition-colors"
                  >
                    {p.full_name || p.email}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5 scrollbar-hide">
          {/* Channels */}
          <button
            onClick={() => setChannelsOpen(v => !v)}
            className="w-full flex items-center gap-1 px-1 py-1 text-[10px] font-bold text-crm-text-faint uppercase tracking-wider hover:text-crm-text-muted transition-colors"
          >
            {channelsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            <span className="flex-1 text-left">Channels</span>
            <button
              onClick={e => { e.stopPropagation(); setShowCreateChannel(true); }}
              className="text-crm-text-dim hover:text-emerald-400 transition-colors"
              title="Create channel"
            >
              <Plus size={12} />
            </button>
          </button>

          {channelsOpen && channels.map(ch => {
            const isActive = view?.type === "channel" && view.id === ch.id;
            return (
              <button key={ch.id} onClick={() => setView({ type: "channel", id: ch.id })}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${isActive ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface"}`}
              >
                {ch.type === "private" ? <Lock size={11} className="flex-shrink-0" /> : <Hash size={11} className="flex-shrink-0" />}
                <span className="text-[12px] truncate">{ch.name}</span>
              </button>
            );
          })}

          {/* Direct Messages */}
          <button
            onClick={() => setDmsOpen(v => !v)}
            className="w-full flex items-center gap-1 px-1 py-1 text-[10px] font-bold text-crm-text-faint uppercase tracking-wider hover:text-crm-text-muted transition-colors mt-2"
          >
            {dmsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            Direct Messages
          </button>

          {dmsOpen && dmConversations.map(conv => {
            const isActive = view?.type === "dm" && view.peerId === conv.peer_id;
            return (
              <button key={conv.peer_id}
                onClick={() => setView({ type: "dm", peerId: conv.peer_id, peerName: conv.peer_name })}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${isActive ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface"}`}
              >
                <div className="w-4 h-4 rounded-full bg-crm-border flex items-center justify-center text-[9px] font-bold uppercase flex-shrink-0 text-crm-text-muted">
                  {conv.peer_name.charAt(0)}
                </div>
                <span className="text-[12px] truncate">{conv.peer_name}</span>
              </button>
            );
          })}

          {dmConversations.length === 0 && dmsOpen && (
            <p className="text-[10px] text-crm-text-faint px-2 py-1">Search above to start a DM</p>
          )}
        </div>
      </div>

      {/* ── Right panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!view ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-crm-text-faint">
            <MessageSquare size={36} className="opacity-20" />
            <p className="text-sm">Select a channel or start a conversation</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-12 border-b border-crm-border flex items-center px-4 gap-2 flex-shrink-0 bg-crm-card">
              {view.type === "channel" ? (
                <>
                  {activeChannel?.type === "private" ? <Lock size={13} className="text-crm-text-muted" /> : <Hash size={13} className="text-crm-text-muted" />}
                  <span className="text-[13px] font-semibold text-crm-text">{activeChannel?.name}</span>
                  {activeChannel?.description && (
                    <span className="text-[11px] text-crm-text-faint hidden sm:block ml-1">— {activeChannel.description}</span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-crm-border flex items-center justify-center text-[9px] font-bold text-crm-text-muted uppercase">
                    {(view as any).peerName?.charAt(0)}
                  </div>
                  <span className="text-[13px] font-semibold text-crm-text">{(view as any).peerName}</span>
                </>
              )}
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
              {view.type === "channel"
                ? channelMessages.map(msg => (
                    <ChannelBubble key={msg.id} msg={msg} currentUserId={user!.id} onCreateTask={setTaskTarget} />
                  ))
                : dmMessages.map(msg => (
                    <DmBubble key={msg.id} msg={msg} currentUserId={user!.id} />
                  ))
              }
              {(view.type === "channel" ? channelMessages : dmMessages).length === 0 && (
                <p className="text-center text-[11px] text-crm-text-faint py-10">
                  {view.type === "channel" ? `No messages in #${activeChannel?.name ?? ""} yet — say something!` : "No messages yet — say hello!"}
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-crm-border p-3 flex-shrink-0 bg-crm-card">
              <div className="flex items-end gap-2">
                <Textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    view.type === "channel"
                      ? `Message #${activeChannel?.name ?? "channel"}`
                      : `Message ${(view as any).peerName}`
                  }
                  rows={1}
                  className="flex-1 bg-crm-surface border-crm-border text-crm-text-secondary text-sm focus:border-emerald-700 resize-none min-h-[36px] max-h-[120px]"
                />
                <Button onClick={handleSend} disabled={sending || !body.trim()} size="sm"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white flex-shrink-0">
                  <Send size={13} />
                </Button>
              </div>
              <p className="text-[9px] text-crm-text-faint mt-1">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>

      {/* Dialogs */}
      <CreateChannelDialog
        open={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onCreated={ch => setView({ type: "channel", id: ch.id })}
      />
      {taskTarget && (
        <CreateTaskDialog
          open
          prefill={taskTarget.body.slice(0, 100)}
          messageId={taskTarget.id}
          onClose={() => setTaskTarget(null)}
        />
      )}
    </div>
  );
}
