import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { Input } from "@/components/ui/input";

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  sent_at: string;
  deleted_at: string | null;
  sender_name: string | null;
}

function formatMsgTime(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return `Yesterday ${format(d, "HH:mm")}`;
  return format(d, "d MMM, HH:mm");
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function MessagingModule() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<Profile | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load all staff contacts
  const { data: contacts = [] } = useQuery<Profile[]>({
    queryKey: ["chat-contacts"],
    queryFn: async () => {
      const res = await (supabase as any).from("profiles").select("id, full_name, email").order("full_name");
      return (res.data ?? [])
        .filter((p: Profile) => p.id !== user?.id)
        .map((p: any) => ({ id: p.id, full_name: p.full_name ?? "Unknown", email: p.email ?? "" }));
    },
  });

  // Load messages for selected contact
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", selectedContact?.id],
    enabled: !!selectedContact,
    queryFn: async () => {
      const res = await (supabase as any)
        .from("chat_messages")
        .select("id, sender_id, recipient_id, body, sent_at, deleted_at, sender:profiles!chat_messages_sender_id_fkey(full_name)")
        .or(`and(sender_id.eq.${user!.id},recipient_id.eq.${selectedContact!.id}),and(sender_id.eq.${selectedContact!.id},recipient_id.eq.${user!.id})`)
        .order("sent_at", { ascending: true });
      if (res.error?.code === "42P01") return [];
      return (res.data ?? []).map((m: any) => ({
        id: m.id, sender_id: m.sender_id, recipient_id: m.recipient_id,
        body: m.body, sent_at: m.sent_at,
        deleted_at: m.deleted_at ?? null,
        sender_name: m.sender?.full_name ?? null,
      }));
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!selectedContact) return;
    const channel = (supabase as any)
      .channel(`chat-${user!.id}-${selectedContact.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "chat_messages",
      }, () => {
        qc.invalidateQueries({ queryKey: ["chat-messages", selectedContact.id] });
      })
      .subscribe();
    return () => { (supabase as any).removeChannel(channel); };
  }, [selectedContact, user, qc]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!draft.trim() || !selectedContact) return;
      await (supabase as any).from("chat_messages").insert({
        sender_id: user!.id,
        recipient_id: selectedContact.id,
        body: draft.trim(),
        sent_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["chat-messages", selectedContact?.id] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("chat_messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .eq("sender_id", user!.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-messages", selectedContact?.id] });
      setConfirmDeleteId(null);
    },
  });

  const filteredContacts = contacts.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-0 border border-crm-border rounded-xl overflow-hidden">
      {/* Contact list */}
      <div className="w-64 flex-shrink-0 bg-crm border-r border-crm-border flex flex-col">
        <div className="p-3 border-b border-crm-border">
          <h2 className="text-[11px] font-semibold text-crm-text mb-2">Messages</h2>
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-text-dim" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts…"
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-7 pl-7"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedContact(c)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-crm-surface transition-colors ${selectedContact?.id === c.id ? "bg-crm-surface border-r-2 border-emerald-600" : ""}`}
            >
              <div className="w-7 h-7 rounded-full bg-crm-border flex items-center justify-center text-[10px] font-bold text-emerald-400 flex-shrink-0 uppercase">
                {initials(c.full_name)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-crm-text truncate">{c.full_name}</p>
                <p className="text-[9px] text-crm-text-dim truncate">{c.email}</p>
              </div>
            </button>
          ))}
          {filteredContacts.length === 0 && (
            <p className="text-[10px] text-crm-text-dim text-center py-6">No contacts found</p>
          )}
        </div>
      </div>

      {/* Chat pane */}
      <div className="flex-1 flex flex-col bg-crm-card min-w-0">
        {!selectedContact ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <MessageSquare className="h-8 w-8 text-crm-text-dim" />
            <p className="text-sm text-crm-text-muted">Select a contact to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-crm-border flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-crm-border flex items-center justify-center text-[10px] font-bold text-emerald-400 uppercase">
                {initials(selectedContact.full_name)}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-crm-text">{selectedContact.full_name}</p>
                <p className="text-[9px] text-crm-text-dim">{selectedContact.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMine = msg.sender_id === user?.id;
                const isDeleted = !!msg.deleted_at;
                const isConfirming = confirmDeleteId === msg.id;

                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
                    <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`px-3 py-2 rounded-2xl text-[12px] relative ${
                        isDeleted
                          ? "bg-crm-surface border border-crm-border text-crm-text-dim italic"
                          : isMine
                            ? "bg-emerald-800 text-white"
                            : "bg-crm-surface border border-crm-border text-crm-text"
                      }`}>
                        {isDeleted ? "Message deleted" : msg.body}
                      </div>
                      <div className={`flex items-center gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
                        <span className="text-[9px] text-crm-text-dim">{formatMsgTime(msg.sent_at)}</span>
                        {isMine && !isDeleted && !isConfirming && (
                          <button
                            onClick={() => setConfirmDeleteId(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-crm-text-dim hover:text-red-400"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                        {isMine && isConfirming && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => deleteMessage.mutate(msg.id)}
                              className="text-[9px] text-red-400 bg-red-950 border border-red-800 rounded px-1.5 py-0.5">
                              Delete
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              className="text-[9px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-1.5 py-0.5">
                              No
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-crm-text-dim">No messages yet. Say hello!</p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-crm-border flex items-center gap-2">
              <Input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (draft.trim()) sendMessage.mutate(); } }}
                placeholder={`Message ${selectedContact.full_name}…`}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-9 flex-1"
              />
              <button
                onClick={() => { if (draft.trim()) sendMessage.mutate(); }}
                disabled={!draft.trim() || sendMessage.isPending}
                className="w-9 h-9 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
