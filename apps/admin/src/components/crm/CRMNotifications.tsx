import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Bell, X, MessageSquare, CheckSquare, Calendar, FileText, Check, CheckCheck, Sun, Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NotifItem {
  id: string;
  type: "message" | "task" | "event" | "application";
  title: string;
  body: string;
  time: string;
  sourceId?: string;
}

export interface NotifData {
  items: NotifItem[];
  readIds: Set<string>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNotifications() {
  const { user, roles } = useAuthContext();
  const qc = useQueryClient();
  const isAdmin = roles.some(r => ["super_admin", "admin", "moderator"].includes(r));

  const query = useQuery<NotifData>({
    queryKey: ["crm-notifications", user?.id],
    queryFn: async () => {
      const items: NotifItem[] = [];

      let readIds = new Set<string>();
      try {
        const { data: reads } = await supabase
          .from("notification_reads")
          .select("notif_id")
          .eq("user_id", user!.id);
        readIds = new Set((reads ?? []).map((r: any) => r.notif_id as string));
      } catch {
        // table may not exist yet — ignore
      }

      try {
        const msgRes = await supabase
          .from("crm_messages")
          .select("id, subject, body, sent_at, is_read")
          .eq("to_user_id", user!.id)
          .eq("is_archived", false)
          .order("sent_at", { ascending: false })
          .limit(10);
        (msgRes.data ?? []).forEach((m: any) => {
          items.push({ id: `msg-${m.id}`, type: "message", title: "New message", body: m.subject || "(No subject)", time: m.sent_at, sourceId: m.id });
        });
      } catch { /* skip */ }

      try {
        const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const taskRes = await supabase
          .from("tasks")
          .select("id, title, created_at")
          .eq("assignee_id", user!.id)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(5);
        (taskRes.data ?? []).forEach((t: any) => {
          items.push({ id: `task-${t.id}`, type: "task", title: "Task assigned", body: t.title, time: t.created_at, sourceId: t.id });
        });
      } catch { /* skip */ }

      try {
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const evtRes = await supabase
          .from("crm_calendar_events")
          .select("id, title, start_time, created_by")
          .or(`created_by.eq.${user!.id},is_global.eq.true`)
          .gte("start_time", new Date().toISOString())
          .lte("start_time", todayEnd.toISOString())
          .order("start_time", { ascending: true })
          .limit(5);
        (evtRes.data ?? []).forEach((e: any) => {
          items.push({ id: `evt-${e.id}`, type: "event", title: "Event today", body: e.title, time: e.start_time, sourceId: e.id });
        });
      } catch { /* skip */ }

      if (isAdmin) {
        try {
          const appRes = await supabase
            .from("applications")
            .select("id, country, created_at")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(5);
          (appRes.data ?? []).forEach((a: any) => {
            items.push({ id: `app-${a.id}`, type: "application", title: "Pending application", body: `From ${a.country || "unknown country"}`, time: a.created_at, sourceId: a.id });
          });
        } catch { /* skip */ }
      }

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return { items, readIds };
    },
    enabled: !!user?.id,
    refetchInterval: 30_000,
    retry: 0,
  });

  useEffect(() => {
    if (!user?.id) return;
    const invalidate = () => qc.invalidateQueries({ queryKey: ["crm-notifications", user.id] });
    const channels = [
      supabase.channel("notif-crm-messages").on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "crm_messages", filter: `to_user_id=eq.${user.id}` }, invalidate).subscribe(),
      supabase.channel("notif-tasks").on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "tasks", filter: `assignee_id=eq.${user.id}` }, invalidate).on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "tasks", filter: `assignee_id=eq.${user.id}` }, invalidate).subscribe(),
      supabase.channel("notif-events").on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "crm_calendar_events" }, invalidate).subscribe(),
      supabase.channel("notif-reads").on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "notification_reads", filter: `user_id=eq.${user.id}` }, invalidate).subscribe(),
    ];
    if (isAdmin) {
      channels.push(supabase.channel("notif-applications").on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "applications" }, invalidate).subscribe());
    }
    return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
  }, [user?.id, isAdmin, qc]);

  return query;
}

// ─── Type styling ─────────────────────────────────────────────────────────────
export const NOTIF_STYLE: Record<NotifItem["type"], { ring: string; Icon: React.ElementType }> = {
  message:     { ring: "bg-blue-950 border-blue-800 text-blue-400",           Icon: MessageSquare },
  task:        { ring: "bg-amber-950 border-amber-800 text-amber-400",        Icon: CheckSquare  },
  event:       { ring: "bg-emerald-950 border-emerald-800 text-emerald-400",  Icon: Calendar     },
  application: { ring: "bg-violet-950 border-violet-800 text-violet-400",     Icon: FileText     },
};

export const NOTIF_DEST: Record<NotifItem["type"], string> = {
  message:     "email-inbox",
  task:        "tasks",
  event:       "calendar",
  application: "parliament-ops",
};

// ─── Bell component ───────────────────────────────────────────────────────────
export function NotificationBell({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [open, setOpen]         = useState(false);
  const [tab, setTab]           = useState<"unread" | "all">("unread");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const { user } = useAuthContext();
  const { data, isLoading } = useNotifications();

  const allItems    = data?.items   ?? [];
  const readIds     = data?.readIds ?? new Set<string>();
  const unreadItems = allItems.filter(n => !readIds.has(n.id));
  const unreadCount = unreadItems.length;
  const visibleItems = tab === "unread" ? unreadItems : allItems;

  const markRead = useCallback(async (ids: string[]) => {
    if (!user?.id || ids.length === 0) return;
    try {
      await supabase
        .from("notification_reads")
        .upsert(ids.map(notif_id => ({ user_id: user.id, notif_id })), { onConflict: "user_id,notif_id" });
      const msgIds = ids.filter(id => id.startsWith("msg-")).map(id => id.replace("msg-", ""));
      if (msgIds.length > 0) {
        await supabase.from("crm_messages").update({ is_read: true }).in("id", msgIds).eq("to_user_id", user.id);
      }
    } catch { /* ignore */ }
    qc.invalidateQueries({ queryKey: ["crm-notifications", user.id] });
  }, [user?.id, qc]);

  const markSelected = () => { markRead(Array.from(selected)); setSelected(new Set()); };
  const markAllRead  = () => { markRead(unreadItems.map(n => n.id)); setSelected(new Set()); };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const handleNotifClick = (n: NotifItem) => {
    markRead([n.id]);
    setOpen(false);
    setSelected(new Set());
    onNavigate(NOTIF_DEST[n.type]);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
        setSelected(new Set());
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen(v => !v);
    setSelected(new Set());
    if (!open) setTab("unread");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        id="crm-topbar-notifications"
        onClick={handleToggle}
        className={`relative p-1.5 rounded-lg transition-colors ${
          open ? "bg-crm-border text-crm-text-secondary" : "text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface"
        }`}
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-[340px] bg-crm-card border border-crm-border rounded-xl shadow-2xl shadow-black/70 z-[9999] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-crm-border/60">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-crm-text-muted" />
              <span className="text-[13px] font-semibold text-crm-text">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-crm-surface text-crm-text-faint transition-colors">
              <X size={13} />
            </button>
          </div>

          <div className="flex items-center gap-1 px-3 pt-2 pb-1">
            {(["unread", "all"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  tab === t ? "bg-crm-border text-crm-text" : "text-crm-text-faint hover:text-crm-text-muted hover:bg-crm-surface"
                }`}
              >
                {t === "unread" ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` : "All"}
              </button>
            ))}
          </div>

          {selected.size > 0 && (
            <div className="flex items-center justify-between px-4 py-1.5 bg-crm-surface/60 border-b border-crm-border/40">
              <span className="text-[10px] text-crm-text-muted">{selected.size} selected</span>
              <button onClick={markSelected} className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                <CheckCheck size={11} /> Mark selected as read
              </button>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <div className="w-4 h-4 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-10 h-10 rounded-full bg-crm-surface border border-crm-border flex items-center justify-center">
                  <Check size={16} className="text-emerald-500" />
                </div>
                <p className="text-[12px] font-medium text-crm-text-muted">All caught up</p>
                <p className="text-[10px] text-crm-text-faint">No unread notifications</p>
                {tab === "unread" && allItems.length > 0 && (
                  <button onClick={() => setTab("all")} className="text-[10px] text-emerald-500 hover:text-emerald-400 mt-1 transition-colors">
                    View all notifications →
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-crm-border/40">
                {visibleItems.map(n => {
                  const isRead     = readIds.has(n.id);
                  const isSelected = selected.has(n.id);
                  const { ring, Icon } = NOTIF_STYLE[n.type];
                  return (
                    <div
                      key={n.id}
                      className={`group relative flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                        isSelected ? "bg-crm-surface" : isRead ? "opacity-60 hover:opacity-80 hover:bg-crm-surface/40" : "hover:bg-crm-surface"
                      }`}
                      onClick={() => handleNotifClick(n)}
                    >
                      <div
                        className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 rounded border transition-all cursor-pointer z-10
                          ${isSelected ? "border-emerald-500 bg-emerald-600" : "border-crm-border bg-crm-card opacity-0 group-hover:opacity-100"} sm:flex`}
                        onClick={e => toggleSelect(n.id, e)}
                      >
                        {isSelected && <Check size={9} className="text-white" />}
                      </div>
                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ml-4 ${ring}`}>
                        <Icon size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[11px] font-semibold leading-tight ${isRead ? "text-crm-text-muted" : "text-crm-text"}`}>{n.title}</p>
                          <span className="text-[9px] text-crm-text-faint shrink-0 mt-0.5">{format(parseISO(n.time), "d MMM")}</span>
                        </div>
                        <p className="text-[10px] text-crm-text-muted truncate mt-0.5">{n.body}</p>
                        <p className="text-[9px] text-crm-text-faint mt-0.5">{format(parseISO(n.time), "h:mm a")}</p>
                      </div>
                      {!isRead && <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {(allItems.length > 0 || unreadCount > 0) && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-crm-border/60 bg-crm-surface/30">
              {unreadCount > 0 ? (
                <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-crm-text-faint hover:text-crm-text-muted transition-colors">
                  <CheckCheck size={11} /> Mark all as read
                </button>
              ) : <span />}
              <button onClick={() => setTab("all")} className="text-[10px] text-emerald-500 hover:text-emerald-400 transition-colors">
                View all →
              </button>
            </div>
          )}
        </div>
      , document.body)}
    </div>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
export { CRMThemeToggleWidget as CRMThemeToggle };

function CRMThemeToggleWidget({ size = 15 }: { size?: number }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";
  return (
    <button
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-1.5 rounded-lg transition-colors text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}
