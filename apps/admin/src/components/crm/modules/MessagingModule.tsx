import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isYesterday, formatDistanceToNowStrict } from "date-fns";
import { DEFAULT_AVATAR } from "@/lib/constants";
import { sendNotification } from "@/lib/sendNotification";
import {
  Send, Search, Plus, Users, MoreVertical, ArrowLeft,
  CheckCheck, Check, UserPlus, Trash2, LogOut,
  ChevronDown, X, ClipboardList, ListTodo,
  Loader2, MessageSquare, ShieldCheck, UserMinus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CRM_ROLE_META } from "../crmRoles";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  title?: string | null;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  type: "public" | "private";
  created_by: string;
  is_archived: boolean;
  emoji: string;
  avatar_url?: string | null;
  member_count?: number;
}

interface GroupMember {
  user_id: string;
  role: "admin" | "member";
  profile: Profile;
}

interface Message {
  id: string;
  sender_id: string;
  body: string;
  sent_at: string;
  sender?: Profile;
  // DM extras
  read_at?: string | null;
  delivered_at?: string | null;
  recipient_id?: string;
  // Group task attachment
  task_id?: string | null;
  task?: GroupTask | null;
}

interface GroupTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assignee_id?: string | null;
  assignee?: Profile | null;
  channel_id?: string | null;
}

interface DmConversation {
  peer_id: string;
  peer_name: string;
  peer_avatar?: string | null;
  last_message: string;
  last_at: string;
  unread: number;
  online?: boolean;
}

type ChatView =
  | { type: "group"; id: string }
  | { type: "dm"; peerId: string; peerName: string; peerAvatar?: string | null };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function relTime(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "dd/MM/yy");
}

function formatPresence(info: { online: boolean; last_seen_at: string } | undefined): string {
  if (!info) return "Offline";
  if (info.online) return "Online";
  const d = parseISO(info.last_seen_at);
  if (isToday(d))     return `Last seen today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Last seen yesterday at ${format(d, "h:mm a")}`;
  return `Last seen ${format(d, "d MMM 'at' h:mm a")}`;
}

function dayLabel(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

const AVATAR_COLORS = [
  "#16a34a", "#2563eb", "#7c3aed", "#d97706",
  "#dc2626", "#0891b2", "#be185d", "#4338ca",
];
function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Av({ name, url, size = 40, emoji }: { name: string; url?: string | null; size?: number; emoji?: string }) {
  const sz = `${size}px`;
  if (emoji) return (
    <div className="rounded-full flex items-center justify-center shrink-0 text-lg" style={{ width: sz, height: sz, background: "#1a2e1a" }}>
      {emoji}
    </div>
  );
  return (
    <img
      src={url || "/images/logo/logo.png"}
      alt={name || "avatar"}
      className="rounded-full object-cover shrink-0"
      style={{ width: sz, height: sz }}
      onError={e => { (e.target as HTMLImageElement).src = "/images/logo/logo.png"; }}
    />
  );
}

// ─── Online presence ──────────────────────────────────────────────────────────
function usePresence() {
  const { user } = useAuthContext();
  const { data: raw = [] } = useQuery({
    queryKey: ["presence-map"],
    queryFn: async () => {
      const { data } = await supabase.from("user_presence").select("user_id, is_online, last_seen_at");
      return data ?? [];
    },
    refetchInterval: 30_000,
  });
  // Update own presence
  useEffect(() => {
    if (!user?.id) return;
    const upsert = () => supabase.from("user_presence").upsert({ user_id: user.id, is_online: true, last_seen_at: new Date().toISOString() }, { onConflict: "user_id" });
    upsert();
    const t = setInterval(upsert, 60_000);
    return () => clearInterval(t);
  }, [user?.id]);
  const map: Record<string, { online: boolean; last_seen_at: string }> = {};
  for (const r of raw) {
    const mins2ago = Date.now() - 2 * 60 * 1000;
    map[r.user_id] = { online: r.is_online && new Date(r.last_seen_at).getTime() > mins2ago, last_seen_at: r.last_seen_at };
  }
  return map;
}

// ─── Message bubble ───────────────────────────────────────────────────────────
// Highlight @all and @mentions in message bodies
function renderMentions(body: string): React.ReactNode {
  const parts = body.split(/(@all|@\S+)/gi);
  return parts.map((part, i) => {
    if (!part) return null;
    if (/^@all$/i.test(part)) {
      return <span key={i} className="font-bold bg-emerald-600/20 text-emerald-400 rounded px-0.5">{part}</span>;
    }
    if (part.startsWith("@")) {
      return <span key={i} className="font-semibold bg-blue-600/15 text-blue-400 rounded px-0.5">{part}</span>;
    }
    return part;
  });
}

function Bubble({ msg, isOwn, showSender, onAvatarClick, isSending = false }: {
  msg: Message; isOwn: boolean; showSender: boolean; onAvatarClick?: () => void; isSending?: boolean;
}) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""} group`}>
      {!isOwn && (
        <button onClick={onAvatarClick} className="mb-0.5 shrink-0">
          <Av name={msg.sender?.full_name ?? "?"} url={msg.sender?.avatar_url} size={28} />
        </button>
      )}
      <div className={`flex flex-col max-w-[72%] md:max-w-[60%] ${isOwn ? "items-end" : "items-start"}`}>
        {showSender && !isOwn && (
          <span className="text-[10px] font-semibold text-emerald-400 mb-0.5 px-1">
            {msg.sender?.full_name ?? "Unknown"}
          </span>
        )}
        {/* Task card */}
        {msg.task && (
          <div className={`mb-1 px-3 py-2 rounded-xl border text-[11px] max-w-full ${isOwn ? "bg-emerald-900/60 border-emerald-700" : "bg-crm-surface border-crm-border"}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <ListTodo size={11} className="text-emerald-400 shrink-0" />
              <span className="font-semibold text-crm-text">Task</span>
            </div>
            <p className="text-crm-text font-medium">{msg.task.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={msg.task.status} />
              <PriorityBadge priority={msg.task.priority} />
            </div>
            {msg.task.assignee && (
              <p className="text-crm-text-faint mt-1">
                Assigned to {msg.task.assignee.full_name}
              </p>
            )}
          </div>
        )}
        <div className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed break-words ${
          isOwn
            ? "bg-emerald-700 text-white rounded-br-md"
            : "bg-crm-surface text-crm-text rounded-bl-md border border-crm-border/60"
        }`}>
          {renderMentions(msg.body)}
        </div>
        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[9px] text-crm-text-faint">{format(parseISO(msg.sent_at), "h:mm a")}</span>
          {isOwn && (
            isSending
              ? <Check size={11} className="text-crm-text-faint" title="Sending…" />
              : msg.read_at
                ? <CheckCheck size={11} className="text-blue-400" title="Seen" />
                : msg.delivered_at
                  ? <CheckCheck size={11} className="text-crm-text-faint" title="Delivered" />
                  : <Check size={11} className="text-crm-text-faint" title="Sent" />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: GroupTask["status"] }) {
  const map = { todo: ["bg-crm-surface text-crm-text-muted", "To Do"], in_progress: ["bg-blue-950 text-blue-400", "In Progress"], done: ["bg-emerald-950 text-emerald-400", "Done"] };
  const [cls, label] = map[status] || map.todo;
  return <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${cls}`}>{label}</span>;
}

function PriorityBadge({ priority }: { priority: GroupTask["priority"] }) {
  const map = { low: "text-crm-text-faint", medium: "text-amber-400", high: "text-red-400" };
  return <span className={`text-[9px] capitalize ${map[priority] || ""}`}>{priority}</span>;
}

// ─── Day separator ────────────────────────────────────────────────────────────
function DaySep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-crm-border/40" />
      <span className="text-[10px] text-crm-text-faint bg-crm-card px-2">{label}</span>
      <div className="flex-1 h-px bg-crm-border/40" />
    </div>
  );
}

// ─── Group Info Panel ─────────────────────────────────────────────────────────
function GroupInfoPanel({
  group,
  members,
  tasks,
  isAdmin,
  currentUserId,
  onAddMember,
  onRemoveMember,
  onLeaveGroup,
  onCreateTask,
  onUpdateTaskStatus,
  onClose,
}: {
  group: Group;
  members: GroupMember[];
  tasks: GroupTask[];
  isAdmin: boolean;
  currentUserId: string;
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
  onLeaveGroup: () => void;
  onCreateTask: () => void;
  onUpdateTaskStatus: (taskId: string, status: GroupTask["status"]) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"members" | "tasks">("members");

  return (
    <div className="w-full md:w-[300px] shrink-0 border-l border-crm-border flex flex-col bg-crm-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-crm-border">
        <button onClick={onClose} className="p-1 rounded hover:bg-crm-surface text-crm-text-muted transition-colors">
          <X size={15} />
        </button>
        <span className="text-[13px] font-semibold text-crm-text flex-1">Group Info</span>
      </div>

      {/* Group identity */}
      <div className="flex flex-col items-center gap-2 py-5 px-4 border-b border-crm-border">
        <Av name={group.name} url={group.avatar_url} emoji={group.emoji} size={64} />
        <p className="text-[15px] font-bold text-crm-text">{group.name}</p>
        <p className="text-[11px] text-crm-text-faint">
          {group.type === "public" ? "Public group" : "Private group"} · {members.length} members
        </p>
        {group.description && (
          <p className="text-[11px] text-crm-text-muted text-center">{group.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-crm-border">
        {(["members", "tasks"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[11px] font-medium capitalize transition-colors ${
              tab === t ? "text-emerald-400 border-b-2 border-emerald-500" : "text-crm-text-muted hover:text-crm-text"
            }`}>
            {t === "members" ? `Members (${members.length})` : `Tasks (${tasks.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "members" && (
          <div className="py-1">
            {isAdmin && (
              <button onClick={onAddMember}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-crm-surface transition-colors text-left">
                <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center">
                  <UserPlus size={14} className="text-emerald-400" />
                </div>
                <span className="text-[12px] text-emerald-400 font-medium">Add member</span>
              </button>
            )}
            {members.map(m => (
              <div key={m.user_id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-crm-surface/40 group">
                <Av name={m.profile.full_name} url={m.profile.avatar_url} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-medium text-crm-text truncate">{m.profile.full_name}</p>
                    {m.user_id === group.created_by && (
                      <span className="text-[8px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 rounded px-1">Admin</span>
                    )}
                  </div>
                  <p className="text-[10px] text-crm-text-faint truncate">{m.profile.title || m.profile.email}</p>
                </div>
                {isAdmin && m.user_id !== currentUserId && (
                  <button onClick={() => onRemoveMember(m.user_id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-950 text-crm-text-faint hover:text-red-400 transition-all"
                    title="Remove from group">
                    <UserMinus size={13} />
                  </button>
                )}
              </div>
            ))}
            {!isAdmin && (
              <button onClick={onLeaveGroup}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-950/20 text-red-400 transition-colors mt-2 border-t border-crm-border">
                <LogOut size={14} />
                <span className="text-[12px]">Leave group</span>
              </button>
            )}
          </div>
        )}

        {tab === "tasks" && (
          <div className="py-1">
            <button onClick={onCreateTask}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-crm-surface transition-colors text-left">
              <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center">
                <Plus size={14} className="text-emerald-400" />
              </div>
              <span className="text-[12px] text-emerald-400 font-medium">New task</span>
            </button>

            {tasks.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <ClipboardList size={24} className="text-crm-text-faint mx-auto mb-2" />
                <p className="text-[11px] text-crm-text-faint">No tasks yet. Create one to track group progress.</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="px-4 py-2.5 border-b border-crm-border/40 hover:bg-crm-surface/40">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-medium text-crm-text flex-1">{task.title}</p>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  {task.assignee && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Av name={task.assignee.full_name} url={task.assignee.avatar_url} size={16} />
                      <span className="text-[10px] text-crm-text-faint">{task.assignee.full_name}</span>
                    </div>
                  )}
                  {/* Status selector */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {(["todo", "in_progress", "done"] as const).map(s => (
                      <button key={s} onClick={() => onUpdateTaskStatus(task.id, s)}
                        className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${
                          task.status === s
                            ? s === "done" ? "bg-emerald-700 text-white" : s === "in_progress" ? "bg-blue-700 text-white" : "bg-crm-surface text-crm-text-muted border border-crm-border"
                            : "text-crm-text-faint hover:bg-crm-surface border border-transparent hover:border-crm-border"
                        }`}>
                        {s === "todo" ? "To Do" : s === "in_progress" ? "In Progress" : "Done"}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create group dialog ──────────────────────────────────────────────────────
const GROUP_EMOJIS = ["💬", "🚀", "🎯", "📋", "🌍", "💡", "🏆", "📢", "🤝", "🔒"];

function CreateGroupDialog({
  open, onClose, contacts, onCreated, userId,
}: {
  open: boolean;
  onClose: () => void;
  contacts: Profile[];
  onCreated: (groupId: string) => void;
  userId: string;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [type, setType] = useState<"public" | "private">("private");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = contacts.filter(c =>
    !search || c.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast({ title: "Enter a group name", variant: "destructive" }); return; }
    setCreating(true);
    try {
      const { data: group, error } = await supabase
        .from("channels")
        .insert({ name: name.trim(), description: desc.trim() || null, type, created_by: userId, emoji })
        .select().single();
      if (error) throw error;

      // Add creator + selected members (no role column in channel_members — admin = channels.created_by)
      const memberRows = [{ channel_id: group.id, user_id: userId },
        ...Array.from(selected).map(uid => ({ channel_id: group.id, user_id: uid }))];
      await supabase.from("channel_members").insert(memberRows);

      toast({ title: `Group "${group.name}" created` });
      onCreated(group.id);
      onClose();
      setName(""); setDesc(""); setSelected(new Set()); setSearch("");
    } catch (err: any) {
      toast({ title: "Failed to create group", description: err.message, variant: "destructive" });
    } finally { setCreating(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-crm-card border border-crm-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-crm-border">
          <button onClick={onClose} className="p-1 rounded hover:bg-crm-surface text-crm-text-muted">
            <X size={16} />
          </button>
          <span className="text-[14px] font-bold text-crm-text flex-1">New Group</span>
          <button onClick={handleCreate} disabled={creating || !name.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-[12px] font-semibold rounded-full transition-colors">
            {creating ? <Loader2 size={12} className="animate-spin" /> : null}
            Create
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Emoji + name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={emoji} onChange={e => setEmoji(e.target.value)}
                className="appearance-none w-14 h-14 rounded-full bg-crm-surface border border-crm-border text-2xl text-center cursor-pointer outline-none">
                {GROUP_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <Input value={name} onChange={e => setName(e.target.value)}
                placeholder="Group name"
                className="bg-crm-surface border-crm-border text-crm-text text-[13px] h-9" />
              <Input value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Description (optional)"
                className="bg-crm-surface border-crm-border text-crm-text text-[13px] h-9" />
            </div>
          </div>

          {/* Type toggle */}
          <div className="flex gap-2">
            {(["private", "public"] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-1.5 rounded-full text-[11px] font-medium capitalize border transition-colors ${
                  type === t ? "bg-emerald-950 text-emerald-400 border-emerald-700" : "border-crm-border text-crm-text-muted hover:border-crm-border/80"
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Member selection */}
          <div>
            <p className="text-[11px] font-semibold text-crm-text-dim uppercase tracking-wider mb-2">
              Add members ({selected.size} selected)
            </p>
            <div className="relative mb-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-text-faint" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search contacts…"
                className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-8 pl-8" />
            </div>
            <div className="space-y-0.5 max-h-52 overflow-y-auto">
              {filtered.map(c => (
                <button key={c.id} onClick={() => toggle(c.id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-crm-surface transition-colors text-left">
                  <Checkbox checked={selected.has(c.id)} className="border-crm-border shrink-0" />
                  <Av name={c.full_name} url={c.avatar_url} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-crm-text truncate">{c.full_name}</p>
                    <p className="text-[10px] text-crm-text-faint truncate">{c.title || c.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create task dialog ───────────────────────────────────────────────────────
function CreateTaskDialog({
  open, onClose, channelId, members, userId,
  onCreated,
}: {
  open: boolean; onClose: () => void; channelId: string; members: GroupMember[]; userId: string;
  onCreated: (task: GroupTask) => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assigneeId, setAssigneeId] = useState<string | null>(userId);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { toast({ title: "Enter a task title", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from("tasks").insert({
        title: title.trim(), priority, status: "todo",
        assignee_id: assigneeId, channel_id: channelId, created_by: userId,
      }).select().single();
      if (error) throw error;
      if (assigneeId && assigneeId !== userId) {
        sendNotification(assigneeId, "new_task", { task_title: title.trim() });
      }
      toast({ title: "Task created" });
      onCreated(data as GroupTask);
      onClose();
      setTitle(""); setPriority("medium"); setAssigneeId(userId);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-crm-card border border-crm-border rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-crm-text">New Group Task</p>
          <button onClick={onClose} className="p-1 rounded hover:bg-crm-surface text-crm-text-muted"><X size={15} /></button>
        </div>
        <div className="space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Task title…"
            className="bg-crm-surface border-crm-border text-crm-text text-[13px]" autoFocus />
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={`flex-1 py-1.5 rounded-full text-[11px] font-medium capitalize border transition-colors ${
                  priority === p
                    ? p === "high" ? "bg-red-950 text-red-400 border-red-800" : p === "medium" ? "bg-amber-950 text-amber-400 border-amber-800" : "bg-crm-surface text-crm-text-muted border-crm-border"
                    : "border-crm-border text-crm-text-faint hover:border-crm-border/80"
                }`}>{p}</button>
            ))}
          </div>
          <select value={assigneeId ?? ""} onChange={e => setAssigneeId(e.target.value || null)}
            className="w-full bg-crm-surface border border-crm-border text-crm-text text-[12px] rounded-xl px-3 py-2 outline-none">
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>{m.profile.full_name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleSave} disabled={saving || !title.trim()}
          className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-colors">
          {saving ? "Creating…" : "Create Task"}
        </button>
      </div>
    </div>
  );
}

// ─── Add member dialog ────────────────────────────────────────────────────────
function AddMemberDialog({
  open, onClose, channelId, existingIds, contacts, onAdded,
}: {
  open: boolean; onClose: () => void; channelId: string; existingIds: string[]; contacts: Profile[]; onAdded: () => void;
}) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const available = contacts.filter(c => !existingIds.includes(c.id) && (!search || c.full_name.toLowerCase().includes(search.toLowerCase())));

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      const rows = Array.from(selected).map(uid => ({ channel_id: channelId, user_id: uid, role: "member" }));
      await supabase.from("channel_members").insert(rows);
      toast({ title: `Added ${selected.size} member${selected.size > 1 ? "s" : ""}` });
      onAdded();
      onClose();
      setSelected(new Set());
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-crm-card border border-crm-border rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[80vh]">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-crm-border">
          <button onClick={onClose} className="p-1 rounded hover:bg-crm-surface text-crm-text-muted"><X size={15} /></button>
          <p className="flex-1 text-[13px] font-bold text-crm-text">Add Members</p>
          <button onClick={handleAdd} disabled={saving || selected.size === 0}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-[11px] font-semibold rounded-full">
            Add {selected.size > 0 ? `(${selected.size})` : ""}
          </button>
        </div>
        <div className="px-4 py-2 border-b border-crm-border">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-text-faint" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…" className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-8 pl-8" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {available.map(c => (
            <button key={c.id} onClick={() => { const n = new Set(selected); n.has(c.id) ? n.delete(c.id) : n.add(c.id); setSelected(n); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-crm-surface transition-colors text-left">
              <Checkbox checked={selected.has(c.id)} className="border-crm-border shrink-0" />
              <Av name={c.full_name} url={c.avatar_url} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-crm-text truncate">{c.full_name}</p>
                <p className="text-[10px] text-crm-text-faint truncate">{c.title || c.email}</p>
              </div>
            </button>
          ))}
          {available.length === 0 && (
            <p className="text-center text-[11px] text-crm-text-faint py-6">No contacts to add</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MessagingModule() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const presence = usePresence();
  const endRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<ChatView | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [optimisticMsg, setOptimisticMsg] = useState<Message | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [search, setSearch] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showNewDm, setShowNewDm] = useState(false);

  // ── Contacts
  const { data: contacts = [] } = useQuery<Profile[]>({
    queryKey: ["msg-contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles")
        .select("id, full_name, email, avatar_url, title").order("full_name");
      return (data ?? []).filter((p: Profile) => p.id !== user?.id);
    },
    enabled: !!user?.id,
  });

  // ── Groups (channels user is member of or public)
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["groups", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("channels")
        .select("*, channel_members(user_id)")
        .eq("is_archived", false)
        .order("created_at", { ascending: false });
      return (data ?? []).map((g: any) => ({
        ...g,
        emoji: g.emoji ?? "💬",
        member_count: g.channel_members?.length ?? 0,
      }));
    },
    enabled: !!user?.id,
  });

  // ── Group members for active group
  const activeGroupId = view?.type === "group" ? view.id : null;
  const { data: members = [], refetch: refetchMembers } = useQuery<GroupMember[]>({
    queryKey: ["group-members", activeGroupId],
    queryFn: async () => {
      if (!activeGroupId) return [];
      const { data } = await supabase
        .from("channel_members")
        .select("user_id, role, profiles(id, full_name, email, avatar_url, title)")
        .eq("channel_id", activeGroupId);
      return (data ?? []).map((r: any) => ({
        user_id: r.user_id,
        role: r.role ?? "member",
        profile: r.profiles ?? { id: r.user_id, full_name: "Unknown", email: "" },
      }));
    },
    enabled: !!activeGroupId,
  });

  // ── Group tasks
  const { data: groupTasks = [], refetch: refetchTasks } = useQuery<GroupTask[]>({
    queryKey: ["group-tasks", activeGroupId],
    queryFn: async () => {
      if (!activeGroupId) return [];
      const { data } = await supabase
        .from("tasks")
        .select("id, title, status, priority, assignee_id, profiles(id, full_name, avatar_url)")
        .eq("channel_id", activeGroupId)
        .order("created_at", { ascending: false });
      return (data ?? []).map((t: any) => ({
        id: t.id, title: t.title, status: t.status, priority: t.priority,
        assignee_id: t.assignee_id,
        assignee: t.profiles ?? null,
        channel_id: activeGroupId,
      }));
    },
    enabled: !!activeGroupId,
  });

  // ── DM conversations
  const { data: dmConversations = [] } = useQuery<DmConversation[]>({
    queryKey: ["dm-conversations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: msgs } = await supabase.from("direct_messages")
        .select("sender_id, recipient_id, body, sent_at, read_at")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .is("deleted_at", null)
        .order("sent_at", { ascending: false })
        .limit(300);
      if (!msgs?.length) return [];
      const peerIds = new Set<string>();
      const map = new Map<string, DmConversation>();
      let unreadMap: Record<string, number> = {};
      for (const m of msgs) {
        const peerId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        peerIds.add(peerId);
        if (!map.has(peerId)) map.set(peerId, { peer_id: peerId, peer_name: "", last_message: m.body, last_at: m.sent_at, unread: 0 });
        if (m.recipient_id === user.id && !m.read_at) unreadMap[peerId] = (unreadMap[peerId] ?? 0) + 1;
      }
      if (peerIds.size > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", Array.from(peerIds));
        for (const p of (profiles ?? [])) {
          const dm = map.get(p.id);
          if (dm) { dm.peer_name = p.full_name; dm.peer_avatar = p.avatar_url; dm.unread = unreadMap[p.id] ?? 0; }
        }
      }
      return Array.from(map.values()).sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime());
    },
    enabled: !!user?.id,
  });

  // ── Messages
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["messages", view?.type, view?.type === "group" ? view.id : view?.type === "dm" ? view.peerId : null],
    queryFn: async () => {
      if (!view || !user?.id) return [];
      if (view.type === "group") {
        const { data: rawMsgs } = await supabase
          .from("channel_messages")
          .select("*, tasks(id, title, status, priority, assignee_id)")
          .eq("channel_id", view.id)
          .is("deleted_at", null)
          .order("sent_at", { ascending: true })
          .limit(200);
        if (rawMsgs?.length) {
          const sids = [...new Set(rawMsgs.map((m: any) => m.sender_id))];
          const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", sids);
          const pm = new Map((profiles ?? []).map((p: any) => [p.id, p]));
          for (const m of rawMsgs) m.sender = pm.get(m.sender_id) ?? { full_name: "Unknown" };
        }
        // Update read receipt
        supabase.from("channel_read_receipts").upsert({ channel_id: view.id, user_id: user.id, last_read_at: new Date().toISOString() }, { onConflict: "channel_id,user_id" });
        return rawMsgs ?? [];
      } else {
        const { data } = await supabase.from("direct_messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${view.peerId}),and(sender_id.eq.${view.peerId},recipient_id.eq.${user.id})`)
          .is("deleted_at", null).order("sent_at", { ascending: true }).limit(200);
        if (data?.length) {
          const sids = [...new Set(data.map((m: any) => m.sender_id))];
          const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", sids);
          const pm = new Map((profiles ?? []).map((p: any) => [p.id, p]));
          for (const m of data) m.sender = pm.get(m.sender_id) ?? { full_name: "Unknown" };
          // Mark unread as read
          const unread = data.filter((m: any) => m.recipient_id === user.id && !m.read_at);
          if (unread.length > 0) {
            supabase.from("direct_messages").update({ read_at: new Date().toISOString(), delivered_at: new Date().toISOString() }).in("id", unread.map((m: any) => m.id));
          }
        }
        return data ?? [];
      }
    },
    enabled: !!view,
    refetchInterval: 4000,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Realtime subscription
  useEffect(() => {
    if (!view) return;
    const table = view.type === "group" ? "channel_messages" : "direct_messages";
    const col = view.type === "group" ? "channel_id" : null;
    const val = view.type === "group" ? view.id : null;
    const filter = col ? `${col}=eq.${val}` : undefined;
    const sub = supabase.channel(`msgs-${view.type}-${view.type === "group" ? view.id : view.peerId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table, ...(filter ? { filter } : {}) }, () => {
        qc.invalidateQueries({ queryKey: ["messages"] });
        qc.invalidateQueries({ queryKey: ["dm-conversations"] });
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [view?.type, view?.type === "group" ? view.id : view?.type === "dm" ? view.peerId : null]);

  const handleSend = async () => {
    if (!body.trim() || !user?.id || !view) return;
    setSending(true);
    // Optimistic bubble — shows single grey tick while insert is in flight
    const trimmedBody = body.trim();
    setOptimisticMsg({
      id: `opt-${Date.now()}`,
      sender_id: user.id,
      body: trimmedBody,
      sent_at: new Date().toISOString(),
    });
    setBody("");
    setShowMentions(false);
    try {
      if (view.type === "group") {
        await supabase.from("channel_messages").insert({ channel_id: view.id, sender_id: user.id, body: trimmedBody });
        qc.invalidateQueries({ queryKey: ["messages", "group", view.id] });
      } else {
        await supabase.from("direct_messages").insert({ sender_id: user.id, recipient_id: view.peerId, body: trimmedBody });
        qc.invalidateQueries({ queryKey: ["messages", "dm", view.peerId] });
        qc.invalidateQueries({ queryKey: ["dm-conversations"] });
        sendNotification(view.peerId, "new_message", {
          sender: user.user_metadata?.full_name ?? user.email ?? "Someone",
        });
      }
    } catch (err: any) {
      setBody(trimmedBody); // restore body on error
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
      setOptimisticMsg(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeGroupId || !user?.id) return;
    await supabase.from("channel_members").delete().eq("channel_id", activeGroupId).eq("user_id", user.id);
    qc.invalidateQueries({ queryKey: ["groups"] });
    setView(null); setShowPanel(false); setMobileShowChat(false);
    toast({ title: "Left group" });
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeGroupId) return;
    await supabase.from("channel_members").delete().eq("channel_id", activeGroupId).eq("user_id", userId);
    refetchMembers();
    toast({ title: "Member removed" });
  };

  const handleUpdateTaskStatus = async (taskId: string, status: GroupTask["status"]) => {
    await supabase.from("tasks").update({ status }).eq("id", taskId);
    refetchTasks();
    qc.invalidateQueries({ queryKey: ["task-board"] });
  };

  // ── Chat list items (groups + DMs combined, sorted by last activity)
  const chatListItems = [
    ...groups.map(g => ({ kind: "group" as const, id: g.id, name: g.name, sub: `${g.member_count} members`, time: "", emoji: g.emoji, avatarUrl: g.avatar_url, unread: 0 })),
    ...dmConversations.map(dm => ({ kind: "dm" as const, id: dm.peer_id, name: dm.peer_name, sub: dm.last_message, time: relTime(dm.last_at), emoji: undefined, avatarUrl: dm.peer_avatar, unread: dm.unread, online: presence[dm.peer_id]?.online })),
  ].filter(item =>
    !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeGroup = view?.type === "group" ? groups.find(g => g.id === view.id) : null;
  const activeDmPeer = view?.type === "dm" ? view : null;

  // Admin = the user who created the channel (channels.created_by)
  // channel_members has no `role` column in the DB — using created_by is the source of truth
  const isGroupAdmin = activeGroup?.created_by === user?.id;

  // Group messages by date
  const groupedMessages: { day: string; msgs: Message[] }[] = [];
  for (const m of messages) {
    const day = dayLabel(m.sent_at);
    if (!groupedMessages.length || groupedMessages[groupedMessages.length - 1].day !== day) {
      groupedMessages.push({ day, msgs: [m] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(m);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-3 md:-m-6 overflow-hidden bg-crm-card border border-crm-border rounded-xl">

      {/* ── Sidebar ── */}
      <div className={`flex-col w-full md:w-[320px] md:max-w-[320px] shrink-0 border-r border-crm-border
        absolute md:relative inset-0 z-10 md:z-auto bg-crm-card
        ${mobileShowChat ? "hidden md:flex" : "flex"}`}>

        {/* Sidebar header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-crm-border bg-crm-card">
          <p className="text-[15px] font-bold text-crm-text flex-1">Messages</p>
          <button onClick={() => setShowNewDm(true)}
            title="New direct message"
            className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted hover:text-crm-text transition-colors">
            <MessageSquare size={16} />
          </button>
          <button onClick={() => setShowNewGroup(true)}
            title="New group"
            className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted hover:text-crm-text transition-colors">
            <Users size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-crm-border/50">
          <div className="flex items-center gap-2 bg-crm-surface/60 rounded-full px-3 py-1.5 border border-crm-border/40">
            <Search size={13} className="text-crm-text-faint shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search chats…"
              className="flex-1 bg-transparent text-[12px] text-crm-text placeholder-crm-text-faint outline-none" />
            {search && <button onClick={() => setSearch("")}><X size={11} className="text-crm-text-faint" /></button>}
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {chatListItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2 px-4 text-center">
              <MessageSquare size={24} className="text-crm-text-faint" />
              <p className="text-[11px] text-crm-text-faint">No chats yet.<br/>Create a group or start a DM.</p>
            </div>
          )}

          {/* Groups section */}
          {chatListItems.filter(i => i.kind === "group").length > 0 && (
            <>
              <div className="px-4 py-1.5 sticky top-0 bg-crm-card/90 backdrop-blur z-10">
                <p className="text-[9px] font-bold text-crm-text-faint uppercase tracking-widest">Groups</p>
              </div>
              {chatListItems.filter(i => i.kind === "group").map(item => {
                const isActive = view?.type === "group" && view.id === item.id;
                return (
                  <button key={item.id}
                    onClick={() => { setView({ type: "group", id: item.id }); setMobileShowChat(true); setShowPanel(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-crm-border/20 ${isActive ? "bg-crm-surface" : "hover:bg-crm-surface/60"}`}>
                    <Av name={item.name} url={item.avatarUrl} emoji={item.emoji} size={42} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="text-[13px] font-semibold text-crm-text truncate">{item.name}</p>
                      </div>
                      <p className="text-[11px] text-crm-text-faint truncate">{item.sub}</p>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* DMs section */}
          {chatListItems.filter(i => i.kind === "dm").length > 0 && (
            <>
              <div className="px-4 py-1.5 sticky top-0 bg-crm-card/90 backdrop-blur z-10">
                <p className="text-[9px] font-bold text-crm-text-faint uppercase tracking-widest">Direct Messages</p>
              </div>
              {chatListItems.filter(i => i.kind === "dm").map(item => {
                const isActive = view?.type === "dm" && view.peerId === item.id;
                return (
                  <button key={item.id}
                    onClick={() => { setView({ type: "dm", peerId: item.id, peerName: item.name, peerAvatar: item.avatarUrl }); setMobileShowChat(true); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-crm-border/20 ${isActive ? "bg-crm-surface" : "hover:bg-crm-surface/60"}`}>
                    <div className="relative shrink-0">
                      <Av name={item.name} url={item.avatarUrl} size={42} />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-crm-card ${item.online ? "bg-emerald-500" : "bg-crm-surface"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="text-[13px] font-semibold text-crm-text truncate">{item.name}</p>
                        {item.time && <span className="text-[10px] text-crm-text-faint shrink-0">{item.time}</span>}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-crm-text-faint truncate">{item.sub}</p>
                          {!item.online && presence[item.id]?.last_seen_at && (
                            <p className="text-[9px] text-crm-text-faint/70 truncate mt-0.5">
                              {formatPresence(presence[item.id])}
                            </p>
                          )}
                        </div>
                        {(item.unread ?? 0) > 0 && (
                          <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center px-1">
                            {item.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className={`flex-col flex-1 min-w-0 absolute md:relative inset-0 z-20 md:z-auto bg-crm-bg
        ${mobileShowChat ? "flex" : "hidden md:flex"}`}
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)", backgroundSize: "24px 24px" }}>

        {!view ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3 px-8">
              <div className="w-20 h-20 rounded-full bg-crm-surface border border-crm-border mx-auto flex items-center justify-center">
                <MessageSquare size={32} className="text-emerald-700" />
              </div>
              <p className="text-[14px] font-semibold text-crm-text">Select a chat</p>
              <p className="text-[12px] text-crm-text-faint">Choose a group or contact to start messaging</p>
              <div className="flex gap-2 justify-center pt-2">
                <button onClick={() => setShowNewGroup(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[12px] font-semibold rounded-full transition-colors">
                  <Users size={13} /> New Group
                </button>
                <button onClick={() => setShowNewDm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-crm-border text-crm-text-muted hover:bg-crm-surface text-[12px] rounded-full transition-colors">
                  <MessageSquare size={13} /> New Message
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0">
            {/* Chat column */}
            <div className="flex flex-col flex-1 min-w-0 min-h-0">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-crm-border/60 bg-crm-card shrink-0">
                <button onClick={() => { setMobileShowChat(false); setShowPanel(false); }}
                  className="md:hidden p-1 rounded text-crm-text-muted hover:text-crm-text">
                  <ArrowLeft size={18} />
                </button>
                <button onClick={() => view.type === "group" && setShowPanel(v => !v)} className="shrink-0">
                  {view.type === "group" && activeGroup
                    ? <Av name={activeGroup.name} url={activeGroup.avatar_url} emoji={activeGroup.emoji} size={38} />
                    : <div className="relative">
                        <Av name={activeDmPeer?.peerName ?? ""} url={activeDmPeer?.peerAvatar} size={38} />
                        {activeDmPeer && (
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-crm-card ${presence[activeDmPeer.peerId]?.online ? "bg-emerald-500" : "bg-crm-surface"}`} />
                        )}
                      </div>
                  }
                </button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => view.type === "group" && setShowPanel(v => !v)}>
                  <p className="text-[14px] font-bold text-crm-text truncate">
                    {view.type === "group" ? activeGroup?.name : activeDmPeer?.peerName}
                  </p>
                  <p className="text-[10px] text-crm-text-faint">
                    {view.type === "group"
                      ? `${members.length} members${groupTasks.filter(t => t.status !== "done").length > 0 ? ` · ${groupTasks.filter(t => t.status !== "done").length} open task${groupTasks.filter(t => t.status !== "done").length > 1 ? "s" : ""}` : ""}`
                      : formatPresence(presence[activeDmPeer?.peerId ?? ""])
                    }
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {view.type === "group" && (
                    <button onClick={() => setShowPanel(v => !v)}
                      className={`p-2 rounded-full transition-colors ${showPanel ? "bg-emerald-950 text-emerald-400" : "hover:bg-crm-surface text-crm-text-muted"}`}
                      title="Group info & tasks">
                      <ClipboardList size={16} />
                    </button>
                  )}
                  <button className="p-2 rounded-full hover:bg-crm-surface text-crm-text-muted transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-1">
                {groupedMessages.map(({ day, msgs: dayMsgs }) => (
                  <div key={day}>
                    <DaySep label={day} />
                    <div className="space-y-1.5">
                      {dayMsgs.map((msg, i) => {
                        const isOwn = msg.sender_id === user?.id;
                        const prevSameSender = i > 0 && dayMsgs[i - 1].sender_id === msg.sender_id;
                        return (
                          <Bubble
                            key={msg.id}
                            msg={msg}
                            isOwn={isOwn}
                            showSender={view.type === "group" && !isOwn && !prevSameSender}
                            onAvatarClick={() => {}}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && !optimisticMsg && (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
                    <p className="text-[12px] text-crm-text-faint">No messages yet. Say hello! 👋</p>
                  </div>
                )}
                {/* Optimistic message — single tick while insert is in flight */}
                {optimisticMsg && (
                  <div className="mt-1.5">
                    <Bubble
                      msg={optimisticMsg}
                      isOwn={true}
                      showSender={false}
                      isSending={true}
                    />
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t border-crm-border/60 bg-crm-card shrink-0">
                <div className="relative flex items-end gap-2 bg-crm-surface border border-crm-border/60 rounded-2xl px-3 py-2 focus-within:border-emerald-700/60 transition-colors">
                  {/* @mention autocomplete popup */}
                  {showMentions && view.type === "group" && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-crm-card border border-crm-border rounded-xl shadow-xl max-h-52 overflow-y-auto z-50">
                      <button
                        type="button"
                        onMouseDown={e => { e.preventDefault(); const lastAt = body.lastIndexOf("@"); setBody(body.slice(0, lastAt) + "@all "); setShowMentions(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-crm-surface transition-colors text-left">
                        <span className="font-bold text-emerald-400">@all</span>
                        <span className="text-crm-text-faint">Notify everyone</span>
                      </button>
                      {members
                        .filter(m => m.user_id !== user?.id && m.profile.full_name.toLowerCase().includes(mentionQuery.toLowerCase()))
                        .map(m => (
                          <button
                            key={m.user_id}
                            type="button"
                            onMouseDown={e => {
                              e.preventDefault();
                              const lastAt = body.lastIndexOf("@");
                              const mention = m.profile.full_name.replace(/\s+/g, "");
                              setBody(body.slice(0, lastAt) + `@${mention} `);
                              setShowMentions(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-crm-surface transition-colors text-left">
                            <Av name={m.profile.full_name} url={m.profile.avatar_url} size={22} />
                            <span className="text-crm-text truncate">{m.profile.full_name}</span>
                          </button>
                        ))}
                    </div>
                  )}
                  {view.type === "group" && (
                    <button onClick={() => setShowCreateTask(true)}
                      title="Create group task"
                      className="p-1 rounded text-crm-text-faint hover:text-emerald-400 transition-colors self-center shrink-0">
                      <ListTodo size={16} />
                    </button>
                  )}
                  <textarea
                    value={body}
                    onChange={e => {
                      const val = e.target.value;
                      setBody(val);
                      // Detect @ to trigger mention picker
                      const lastAt = val.lastIndexOf("@");
                      if (lastAt !== -1) {
                        const afterAt = val.slice(lastAt + 1);
                        if (!afterAt.includes(" ") && afterAt.length <= 25) {
                          setMentionQuery(afterAt);
                          setShowMentions(true);
                        } else {
                          setShowMentions(false);
                        }
                      } else {
                        setShowMentions(false);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === "Escape") { setShowMentions(false); return; }
                      if (e.key === "Enter" && !e.shiftKey && !showMentions) { e.preventDefault(); handleSend(); }
                    }}
                    onBlur={() => setTimeout(() => setShowMentions(false), 150)}
                    placeholder={view.type === "group" ? "Type a message… (@ to mention)" : "Type a message…"}
                    rows={1}
                    className="flex-1 bg-transparent text-[13px] text-crm-text placeholder-crm-text-faint outline-none resize-none max-h-32 overflow-y-auto"
                    style={{ lineHeight: "1.5" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!body.trim() || sending}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white disabled:opacity-40 transition-colors shrink-0"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Group info panel */}
            {showPanel && view.type === "group" && activeGroup && (
              <GroupInfoPanel
                group={activeGroup}
                members={members}
                tasks={groupTasks}
                isAdmin={isGroupAdmin}
                currentUserId={user?.id ?? ""}
                onAddMember={() => setShowAddMember(true)}
                onRemoveMember={handleRemoveMember}
                onLeaveGroup={handleLeaveGroup}
                onCreateTask={() => setShowCreateTask(true)}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onClose={() => setShowPanel(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* ── New DM: pick a contact ── */}
      {showNewDm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-crm-card border border-crm-border rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[80vh]">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-crm-border">
              <button onClick={() => setShowNewDm(false)} className="p-1 rounded hover:bg-crm-surface text-crm-text-muted"><X size={15} /></button>
              <p className="flex-1 text-[13px] font-bold text-crm-text">New Message</p>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {contacts.map(c => (
                <button key={c.id}
                  onClick={() => { setView({ type: "dm", peerId: c.id, peerName: c.full_name, peerAvatar: c.avatar_url }); setMobileShowChat(true); setShowNewDm(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-crm-surface transition-colors text-left">
                  <div className="relative">
                    <Av name={c.full_name} url={c.avatar_url} size={38} />
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-crm-card ${presence[c.id]?.online ? "bg-emerald-500" : "bg-crm-surface"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-crm-text truncate">{c.full_name}</p>
                    <p className="text-[10px] text-crm-text-faint truncate">{c.title || c.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
      <CreateGroupDialog
        open={showNewGroup}
        onClose={() => setShowNewGroup(false)}
        contacts={contacts}
        onCreated={id => { setView({ type: "group", id }); setMobileShowChat(true); qc.invalidateQueries({ queryKey: ["groups"] }); }}
        userId={user?.id ?? ""}
      />

      {activeGroupId && (
        <>
          <AddMemberDialog
            open={showAddMember}
            onClose={() => setShowAddMember(false)}
            channelId={activeGroupId}
            existingIds={members.map(m => m.user_id)}
            contacts={contacts}
            onAdded={refetchMembers}
          />
          <CreateTaskDialog
            open={showCreateTask}
            onClose={() => setShowCreateTask(false)}
            channelId={activeGroupId}
            members={members}
            userId={user?.id ?? ""}
            onCreated={() => refetchTasks()}
          />
        </>
      )}
    </div>
  );
}
