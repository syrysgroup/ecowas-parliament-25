import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { format, parseISO } from "date-fns";
import { DEFAULT_AVATAR } from "@/lib/constants";
import {
  Send, MessageSquare, Search, Phone as PhoneIcon, Video, MoreVertical,
  Plus, User, MapPin, Briefcase, Mail, ChevronDown, ChevronRight,
  Check, CheckCheck, Linkedin, Twitter, Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileRow { id: string; full_name: string; email: string; avatar_url?: string | null; title?: string | null; country?: string | null; bio?: string | null; organisation?: string | null; phone?: string | null; linkedin_url?: string | null; twitter_url?: string | null; }

interface Channel {
  id: string; name: string; description: string | null;
  type: "public" | "private"; created_by: string; is_archived: boolean;
}
interface DmConversation {
  peer_id: string; peer_name: string; peer_avatar?: string | null; last_message: string; last_at: string;
}
type ActiveView = { type: "channel"; id: string } | { type: "dm"; peerId: string; peerName: string };

// ─── Profile View Dialog (Enhanced) ───────────────────────────────────────────
function ProfileViewDialog({ open, onClose, profileId }: { open: boolean; onClose: () => void; profileId: string | null }) {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["view-profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const { data } = await (supabase as any).from("profiles")
        .select("id, full_name, email, avatar_url, title, country, bio, organisation, phone, linkedin_url, twitter_url")
        .eq("id", profileId).single();
      return data;
    },
    enabled: !!profileId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">{t("crm.chat.userProfile")}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : profile ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-crm-border">
              <img src={profile.avatar_url || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[14px] font-semibold text-crm-text">{profile.full_name}</p>
              {profile.title && <p className="text-[11px] text-crm-text-muted flex items-center justify-center gap-1"><Briefcase size={11} /> {profile.title}</p>}
            </div>
            <div className="w-full space-y-2 text-[12px]">
              {profile.email && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-surface">
                  <Mail size={13} className="text-crm-text-dim" />
                  <span className="text-crm-text break-all">{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-surface">
                  <Phone size={13} className="text-crm-text-dim" />
                  <span className="text-crm-text">{profile.phone}</span>
                </div>
              )}
              {profile.country && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-surface">
                  <MapPin size={13} className="text-crm-text-dim" />
                  <span className="text-crm-text">{profile.country}</span>
                </div>
              )}
              {profile.organisation && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-surface">
                  <Briefcase size={13} className="text-crm-text-dim" />
                  <span className="text-crm-text">{profile.organisation}</span>
                </div>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-surface hover:bg-emerald-950/30 transition-colors">
                  <Linkedin size={13} className="text-crm-text-dim" />
                  <span className="text-emerald-400">LinkedIn</span>
                </a>
              )}
              {profile.twitter_url && (
                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-surface hover:bg-emerald-950/30 transition-colors">
                  <Twitter size={13} className="text-crm-text-dim" />
                  <span className="text-emerald-400">Twitter / X</span>
                </a>
              )}
              {profile.bio && (
                <p className="text-[11px] text-crm-text-secondary leading-relaxed px-1 pt-1">{profile.bio}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-crm-text-muted text-center py-8">{t("crm.chat.profileNotFound")}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Channel Dialog ────────────────────────────────────────────────────
function CreateChannelDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (ch: Channel) => void;
}) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { t } = useTranslation();
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
      toast({ title: `#${ch.name} ${t("crm.chat.created")}` });
      onCreated(ch);
      onClose();
      setName("");
    } catch (err: any) {
      toast({ title: t("crm.common.error"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">{t("crm.chat.createChannel")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">{t("crm.chat.channelName")}</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. announcements"
              className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">{t("crm.chat.type")}</Label>
            <Select value={type} onValueChange={v => setType(v as "public" | "private")}>
              <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text-secondary text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-crm-card border-crm-border text-crm-text">
                <SelectItem value="public">{t("crm.chat.public")}</SelectItem>
                <SelectItem value="private">{t("crm.chat.private")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">{t("crm.common.cancel")}</Button>
          <Button size="sm" onClick={handleCreate} disabled={saving || !name.trim()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {saving ? t("crm.common.creating") : t("crm.common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function CollapsibleSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1.5 px-4 py-2 hover:bg-crm-surface/50 transition-colors">
        {open ? <ChevronDown size={12} className="text-crm-text-dim" /> : <ChevronRight size={12} className="text-crm-text-dim" />}
        <p className="text-[10px] font-semibold text-crm-text-dim uppercase tracking-wider">{title}</p>
      </button>
      {open && children}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ body, senderName, time, isOwn, avatarUrl, readAt, deliveredAt, onAvatarClick }: {
  body: string; senderName: string; time: string; isOwn: boolean; avatarUrl?: string | null;
  readAt?: string | null; deliveredAt?: string | null; onAvatarClick?: () => void;
}) {
  const displayAvatar = avatarUrl || DEFAULT_AVATAR;
  return (
    <div className={`flex gap-2.5 mb-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <button type="button" onClick={onAvatarClick} className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-crm-border hover:ring-2 hover:ring-emerald-600 transition-all">
        <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
      </button>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && <span className="text-[9px] text-crm-text-dim mb-0.5 font-medium">{senderName}</span>}
        <div className={`px-3 py-2 rounded-xl text-[12.5px] leading-relaxed
          ${isOwn
            ? "bg-emerald-950 border border-emerald-800 text-emerald-100 rounded-br-sm"
            : "bg-crm-surface border border-crm-border text-crm-text-secondary rounded-bl-sm"
          }`}>
          {body}
        </div>
        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[9px] text-crm-text-faint">{time}</span>
          {isOwn && (
            readAt ? (
              <CheckCheck size={12} className="text-emerald-400" />
            ) : deliveredAt ? (
              <CheckCheck size={12} className="text-crm-text-faint" />
            ) : (
              <Check size={12} className="text-crm-text-faint" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Presence Hook ────────────────────────────────────────────────────────────
function usePresenceData() {
  const { data: presenceMap = {} } = useQuery<Record<string, { is_online: boolean; last_seen_at: string }>>({
    queryKey: ["user-presence"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("user_presence").select("user_id, is_online, last_seen_at");
      const map: Record<string, { is_online: boolean; last_seen_at: string }> = {};
      for (const row of (data ?? [])) {
        map[row.user_id] = { is_online: row.is_online, last_seen_at: row.last_seen_at };
      }
      return map;
    },
    refetchInterval: 30_000,
  });
  return presenceMap;
}

function isUserOnline(presence: { is_online: boolean; last_seen_at: string } | undefined): boolean {
  if (!presence) return false;
  if (!presence.is_online) return false;
  const twoMinAgo = Date.now() - 2 * 60 * 1000;
  return new Date(presence.last_seen_at).getTime() > twoMinAgo;
}

function PresenceDot({ online, size = 8 }: { online: boolean; size?: number }) {
  return (
    <span
      className={`inline-block rounded-full flex-shrink-0 ${online ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
      style={{ width: size, height: size }}
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MessagingModule() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const presenceMap = usePresenceData();

  const [view, setView] = useState<ActiveView | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [search, setSearch] = useState("");
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);

  // ── Channels
  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("channels").select("*")
        .eq("is_archived", false).order("name");
      return data ?? [];
    },
  });

  // ── DM conversations
  const { data: dmConversations = [] } = useQuery<DmConversation[]>({
    queryKey: ["dm-conversations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: msgs } = await (supabase as any).from("direct_messages")
        .select("sender_id, recipient_id, body, sent_at")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .is("deleted_at", null)
        .order("sent_at", { ascending: false })
        .limit(200);
      if (!msgs?.length) return [];

      const peerIds = new Set<string>();
      const map = new Map<string, DmConversation>();
      for (const m of msgs) {
        const peerId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        peerIds.add(peerId);
        if (!map.has(peerId)) {
          map.set(peerId, { peer_id: peerId, peer_name: "", last_message: m.body, last_at: m.sent_at });
        }
      }

      if (peerIds.size > 0) {
        const { data: profiles } = await (supabase as any).from("profiles")
          .select("id, full_name, avatar_url").in("id", Array.from(peerIds));
        for (const p of (profiles ?? [])) {
          const dm = map.get(p.id);
          if (dm) { dm.peer_name = p.full_name; dm.peer_avatar = p.avatar_url; }
        }
      }

      return Array.from(map.values()).sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime());
    },
    enabled: !!user?.id,
  });

  // ── Contacts
  const { data: contacts = [] } = useQuery<ProfileRow[]>({
    queryKey: ["chat-contacts"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("profiles")
        .select("id, full_name, email, avatar_url, title, country, phone, linkedin_url, twitter_url").order("full_name");
      return (data ?? []).filter((p: ProfileRow) => p.id !== user?.id);
    },
    enabled: !!user?.id,
  });

  // ── Active messages
  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", view?.type, view?.type === "channel" ? view.id : view?.type === "dm" ? view.peerId : null],
    queryFn: async () => {
      if (!view) return [];
      if (view.type === "channel") {
        const { data: rawMsgs } = await (supabase as any).from("channel_messages")
          .select("*")
          .eq("channel_id", view.id).is("deleted_at", null).order("sent_at", { ascending: true }).limit(100);
        if (rawMsgs?.length) {
          const senderIds = [...new Set(rawMsgs.map((m: any) => m.sender_id))];
          const { data: profiles } = await (supabase as any).from("profiles")
            .select("id, full_name, email, avatar_url").in("id", senderIds);
          const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
          for (const m of rawMsgs) {
            m.sender = profileMap.get(m.sender_id) ?? { full_name: "Unknown", email: "" };
          }
        }
        return rawMsgs ?? [];
      } else {
        const { data } = await (supabase as any).from("direct_messages")
          .select("*")
          .or(`and(sender_id.eq.${user!.id},recipient_id.eq.${view.peerId}),and(sender_id.eq.${view.peerId},recipient_id.eq.${user!.id})`)
          .is("deleted_at", null).order("sent_at", { ascending: true }).limit(100);
        if (data?.length) {
          const senderIds = [...new Set(data.map((m: any) => m.sender_id))];
          const { data: profiles } = await (supabase as any).from("profiles")
            .select("id, full_name, email, avatar_url").in("id", senderIds);
          const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
          for (const m of data) {
            m.sender = profileMap.get(m.sender_id) ?? { full_name: "Unknown", email: "" };
          }
        }
        return data ?? [];
      }
    },
    enabled: !!view,
    refetchInterval: 5000,
  });

  // Mark messages as read when viewing DM
  useEffect(() => {
    if (view?.type === "dm" && user?.id && messages.length > 0) {
      const unread = messages.filter((m: any) => m.recipient_id === user.id && !m.read_at);
      if (unread.length > 0) {
        const ids = unread.map((m: any) => m.id);
        (supabase as any).from("direct_messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", ids)
          .then(() => {
            qc.invalidateQueries({ queryKey: ["chat-messages", "dm", view.peerId] });
          });
      }
    }
  }, [messages, view, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!body.trim() || !user?.id || !view) return;
    setSending(true);
    try {
      if (view.type === "channel") {
        const { error } = await (supabase as any).from("channel_messages").insert({
          channel_id: view.id, sender_id: user.id, body: body.trim(),
        });
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["chat-messages", "channel", view.id] });
      } else {
        const { error } = await (supabase as any).from("direct_messages").insert({
          sender_id: user.id, recipient_id: view.peerId, body: body.trim(),
        });
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["chat-messages", "dm", view.peerId] });
        qc.invalidateQueries({ queryKey: ["dm-conversations"] });
      }
      setBody("");
    } catch (err: any) {
      toast({ title: t("crm.common.error"), description: err.message, variant: "destructive" });
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

  const activePeerId = view?.type === "dm" ? view.peerId : null;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-crm-card border border-crm-border rounded-xl overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-72 border-r border-crm-border flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-crm-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-800">
              <img src={DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-crm-text truncate">{t("crm.chat.title")}</p>
            </div>
            <button onClick={() => setShowCreateChannel(true)}
              className="p-1.5 text-crm-text-dim hover:text-emerald-400 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-text-faint" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("crm.chat.search")}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 pl-8" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Channels - collapsible */}
          <CollapsibleSection title={t("crm.chat.channels")}>
            {channels.filter(c => !search || c.name.includes(search.toLowerCase())).map(ch => (
              <button key={ch.id}
                onClick={() => setView({ type: "channel", id: ch.id })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-crm-surface transition-colors text-left
                  ${view?.type === "channel" && view.id === ch.id ? "bg-crm-surface" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-crm-border flex items-center justify-center text-crm-text-muted text-[10px] font-bold">#</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-crm-text truncate">#{ch.name}</p>
                  <p className="text-[10px] text-crm-text-faint truncate">{ch.description || t("crm.chat.channel")}</p>
                </div>
              </button>
            ))}
          </CollapsibleSection>

          {/* Direct Messages - collapsible */}
          <CollapsibleSection title={t("crm.chat.directMessages")}>
            {dmConversations.filter(c => !search || c.peer_name.toLowerCase().includes(search.toLowerCase())).map(dm => (
              <button key={dm.peer_id}
                onClick={() => setView({ type: "dm", peerId: dm.peer_id, peerName: dm.peer_name })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-crm-surface transition-colors text-left
                  ${view?.type === "dm" && view.peerId === dm.peer_id ? "bg-crm-surface" : ""}`}>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-crm-border flex-shrink-0">
                  <img src={dm.peer_avatar || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-crm-card ${isUserOnline(presenceMap[dm.peer_id]) ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
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
          </CollapsibleSection>

          {/* Contacts - collapsible */}
          <CollapsibleSection title={t("crm.chat.contacts")} defaultOpen={false}>
            {filteredContacts.map(c => (
              <button key={c.id}
                onClick={() => setView({ type: "dm", peerId: c.id, peerName: c.full_name })}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-crm-surface transition-colors text-left
                  ${view?.type === "dm" && view.peerId === c.id ? "bg-crm-surface" : ""}`}>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-crm-border flex-shrink-0">
                  <img src={c.avatar_url || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-crm-card ${isUserOnline(presenceMap[c.id]) ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-crm-text truncate">{c.full_name}</p>
                  <p className="text-[10px] text-crm-text-faint truncate">{c.title || c.country || ""}</p>
                </div>
              </button>
            ))}
          </CollapsibleSection>
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
                <p className="text-[13px] font-semibold text-crm-text">{t("crm.chat.selectContact")}</p>
                <p className="text-[11px] text-crm-text-muted mt-1">{t("crm.chat.selectContactDesc")}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-crm-border">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => activePeerId && setViewProfileId(activePeerId)}
                  className="w-9 h-9 rounded-full overflow-hidden border border-crm-border hover:ring-2 hover:ring-emerald-600 transition-all">
                  {view.type === "channel" ? (
                    <div className="w-full h-full bg-crm-border flex items-center justify-center text-crm-text-muted text-[10px] font-bold">#</div>
                  ) : (
                    <img src={contacts.find(c => c.id === activePeerId)?.avatar_url || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
                <div>
                  <p className="text-[13px] font-semibold text-crm-text">{activeLabel}</p>
                  <p className="text-[10px] text-emerald-400">{t("crm.chat.online")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[PhoneIcon, Video, Search].map((Icon, i) => (
                  <button key={i} className="p-2 text-crm-text-dim hover:text-crm-text-secondary transition-colors rounded">
                    <Icon size={15} />
                  </button>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 text-crm-text-dim hover:text-crm-text-secondary transition-colors rounded">
                      <MoreVertical size={15} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-crm-card border-crm-border text-crm-text" align="end">
                    {activePeerId && (
                      <DropdownMenuItem onClick={() => setViewProfileId(activePeerId)} className="text-xs gap-2 cursor-pointer">
                        <User size={13} /> {t("crm.chat.viewProfile")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.map((msg: any) => (
                <MessageBubble
                  key={msg.id}
                  body={msg.body}
                  senderName={msg.sender?.full_name || "Unknown"}
                  time={format(parseISO(msg.sent_at), "h:mm a")}
                  isOwn={msg.sender_id === user?.id}
                  avatarUrl={msg.sender?.avatar_url}
                  readAt={msg.read_at}
                  deliveredAt={msg.delivered_at}
                  onAvatarClick={() => setViewProfileId(msg.sender_id)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-crm-border">
              <div className="flex gap-2">
                <Input value={body} onChange={e => setBody(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={t("crm.chat.typeMessage")}
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

      {/* Dialogs */}
      <CreateChannelDialog
        open={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onCreated={(ch) => setView({ type: "channel", id: ch.id })}
      />
      <ProfileViewDialog
        open={!!viewProfileId}
        onClose={() => setViewProfileId(null)}
        profileId={viewProfileId}
      />
    </div>
  );
}
