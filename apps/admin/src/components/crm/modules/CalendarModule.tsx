import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  format, isSameMonth, isToday, parseISO, isSameDay,
  addMonths, subMonths, startOfWeek, endOfWeek,
  eachDayOfInterval as eachDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { CALENDAR_CREATE_ROLES } from "../crmRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLOUR_OPTIONS = [
  { id: "green",  label: "Personal",  cls: "bg-emerald-500" },
  { id: "blue",   label: "Business",  cls: "bg-blue-500" },
  { id: "amber",  label: "Family",    cls: "bg-amber-500" },
  { id: "red",    label: "Holiday",   cls: "bg-red-500" },
  { id: "violet", label: "ETC",       cls: "bg-violet-500" },
  { id: "teal",   label: "Other",     cls: "bg-teal-500" },
];

const EVENT_DOT: Record<string, string> = {
  green: "bg-emerald-500", blue: "bg-blue-500", amber: "bg-amber-500",
  red: "bg-red-500", violet: "bg-violet-500", teal: "bg-teal-500",
};

const EVENT_PILL: Record<string, string> = {
  green: "bg-emerald-950 text-emerald-400 border-emerald-800",
  blue: "bg-blue-950 text-blue-400 border-blue-800",
  amber: "bg-amber-950 text-amber-400 border-amber-800",
  red: "bg-red-950 text-red-400 border-red-800",
  violet: "bg-violet-950 text-violet-400 border-violet-800",
  teal: "bg-teal-950 text-teal-400 border-teal-800",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Event Form Sheet ─────────────────────────────────────────────────────────
function EventFormSheet({
  open, onClose, event, defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  event?: any;
  defaultDate?: Date;
}) {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const isEdit = !!event;

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startTime, setStartTime] = useState(
    event?.start_time?.slice(0, 16) ?? (defaultDate ? format(defaultDate, "yyyy-MM-dd'T'09:00") : "")
  );
  const [endTime, setEndTime] = useState(event?.end_time?.slice(0, 16) ?? "");
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [colour, setColour] = useState(event?.colour ?? "green");
  const [url, setUrl] = useState(event?.url ?? "");
  const [isGlobal, setIsGlobal] = useState(event?.is_global ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !startTime) return;
    setSaving(true);
    try {
      const payload = {
        title,
        description: description || null,
        start_time: startTime,
        end_time: endTime || null,
        all_day: allDay,
        colour,
        is_global: isGlobal,
      };
      if (isEdit) {
        await supabase.from("crm_calendar_events").update(payload).eq("id", event.id);
      } else {
        await supabase.from("crm_calendar_events").insert({ ...payload, created_by: user!.id });
      }
      qc.invalidateQueries({ queryKey: ["crm-calendar"] });
      qc.invalidateQueries({ queryKey: ["crm-upcoming-events"] });
      onClose();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-crm-card border-crm-border text-crm-text w-[380px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? "Update Event" : "Add Event"}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-dim">Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event Title"
              className="bg-crm-surface border-crm-border text-crm-text text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-dim">Label</Label>
            <div className="flex gap-2">
              {COLOUR_OPTIONS.map(c => (
                <button key={c.id} onClick={() => setColour(c.id)} title={c.label}
                  className={`w-7 h-7 rounded-full ${c.cls} transition-all flex items-center justify-center
                    ${colour === c.id ? "ring-2 ring-white ring-offset-1 ring-offset-crm-card scale-110" : "opacity-60 hover:opacity-100"}`}>
                  {colour === c.id && <span className="text-[8px] text-white font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-dim">Start Date *</Label>
              <Input type={allDay ? "date" : "datetime-local"} value={startTime} onChange={e => setStartTime(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-dim">End Date</Label>
              <Input type={allDay ? "date" : "datetime-local"} value={endTime} onChange={e => setEndTime(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-[11px] text-crm-text-dim">All Day</Label>
            <Switch checked={allDay} onCheckedChange={setAllDay} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-dim">Event URL</Label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.example.com"
              className="bg-crm-surface border-crm-border text-crm-text text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-dim">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="bg-crm-surface border-crm-border text-crm-text text-sm resize-none" />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="is_global"
              checked={isGlobal}
              onCheckedChange={(v) => setIsGlobal(!!v)}
            />
            <Label htmlFor="is_global" className="cursor-pointer text-sm">
              Add to all users' calendars
            </Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} disabled={!title.trim() || !startTime || saving}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs flex-1">
              {saving ? "Saving…" : isEdit ? "Update" : "Add"}
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}
              className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ currentDate, onDateChange }: { currentDate: Date; onDateChange: (d: Date) => void }) {
  const [viewDate, setViewDate] = useState(currentDate);
  const mStart = startOfMonth(viewDate);
  const mEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(mStart);
  const calEnd = endOfWeek(mEnd);
  const allDays = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setViewDate(d => subMonths(d, 1))} className="p-1 text-crm-text-dim hover:text-crm-text-secondary">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[11px] font-semibold text-crm-text">{format(viewDate, "MMMM yyyy")}</span>
        <button onClick={() => setViewDate(d => addMonths(d, 1))} className="p-1 text-crm-text-dim hover:text-crm-text-secondary">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {["S","M","T","W","T","F","S"].map((d,i) => (
          <div key={i} className="text-[9px] text-crm-text-dim text-center py-1 font-mono">{d}</div>
        ))}
        {allDays.map(day => (
          <button key={day.toISOString()} onClick={() => { onDateChange(day); setViewDate(day); }}
            className={`text-[10px] w-7 h-7 rounded-full flex items-center justify-center transition-colors
              ${!isSameMonth(day, viewDate) ? "text-crm-text-faint" : "text-crm-text-muted hover:bg-crm-surface"}
              ${isToday(day) ? "bg-emerald-600 text-white font-bold" : ""}
            `}>
            {format(day, "d")}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CalendarModule() {
  const { roles, user } = useAuthContext();
  const qc = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetEvent, setSheetEvent] = useState<any>(null);
  const [sheetDefaultDate, setSheetDefaultDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, boolean>>(
    Object.fromEntries(COLOUR_OPTIONS.map(c => [c.id, true]))
  );

  const canCreate = roles.some(r => CALENDAR_CREATE_ROLES.includes(r));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["crm-calendar", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data } = await supabase
        .from("crm_calendar_events")
        .select("*")
        .or(`created_by.eq.${user!.id},is_global.eq.true`)
        .gte("start_time", monthStart.toISOString())
        .lte("start_time", monthEnd.toISOString())
        .order("start_time", { ascending: true });
      return data ?? [];
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("crm_calendar_events").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-calendar"] });
      qc.invalidateQueries({ queryKey: ["crm-upcoming-events"] });
      setSelectedEvent(null);
    },
  });

  const filteredEvents = events.filter((e: any) => filters[e.colour] !== false);
  const getEventsForDay = (day: Date) =>
    filteredEvents.filter((e: any) => isSameDay(parseISO(e.start_time), day));

  const openAdd = (date?: Date) => {
    setSheetEvent(null);
    setSheetDefaultDate(date);
    setSheetOpen(true);
  };

  const openEdit = (ev: any) => {
    setSheetEvent(ev);
    setSheetDefaultDate(undefined);
    setSheetOpen(true);
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Left Sidebar */}
      <div className="w-56 flex-shrink-0 space-y-5 hidden lg:block">
        {canCreate && (
          <Button size="sm" onClick={() => openAdd()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5 w-full">
            <Plus size={13} /> Add Event
          </Button>
        )}

        <MiniCalendar currentDate={currentDate} onDateChange={setCurrentDate} />

        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-crm-text-dim uppercase tracking-wider">Event Filters</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={Object.values(filters).every(Boolean)}
              onCheckedChange={v => setFilters(Object.fromEntries(COLOUR_OPTIONS.map(c => [c.id, !!v])))}
            />
            <span className="text-[11px] text-crm-text-secondary">View All</span>
          </label>
          {COLOUR_OPTIONS.map(c => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters[c.id]}
                onCheckedChange={v => setFilters(f => ({ ...f, [c.id]: !!v }))}
              />
              <span className={`w-2.5 h-2.5 rounded-full ${c.cls}`} />
              <span className="text-[11px] text-crm-text-secondary">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
              className="p-1.5 rounded-lg text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface transition-colors">
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-[15px] font-semibold text-crm-text w-40 text-center">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))}
              className="p-1.5 rounded-lg text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface transition-colors">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setCurrentDate(new Date())}
              className="text-[10px] font-mono text-crm-text-dim hover:text-emerald-400 border border-crm-border hover:border-emerald-800 px-2 py-1 rounded transition-colors">
              Today
            </button>
          </div>
          {canCreate && (
            <Button size="sm" onClick={() => openAdd()} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5 lg:hidden">
              <Plus size={13} /> Add Event
            </Button>
          )}
        </div>

        {/* Grid */}
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-crm-border">
            {DAY_NAMES.map(d => (
              <div key={d} className="px-2 py-2 text-[10px] font-mono uppercase text-crm-text-dim text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="border-r border-b border-crm-border min-h-[80px] bg-crm-card" />
            ))}
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const colIndex = (startPadding + idx) % 7;
              const isLastCol = colIndex === 6;
              return (
                <div key={day.toISOString()}
                  onClick={() => { if (canCreate) openAdd(day); }}
                  className={`border-b border-crm-border min-h-[80px] p-1.5 flex flex-col gap-1
                    ${!isLastCol ? "border-r" : ""} border-crm-border
                    ${isCurrentMonth ? "" : "bg-crm-card"}
                    ${canCreate ? "cursor-pointer hover:bg-crm-surface" : ""} transition-colors`}>
                  <span className={`text-[11px] font-mono w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 self-start
                    ${isCurrentDay ? "bg-emerald-600 text-white font-bold" : isCurrentMonth ? "text-crm-text-muted" : "text-crm-text-faint"}`}>
                    {format(day, "d")}
                  </span>
                  {!isLoading && dayEvents.slice(0, 2).map((ev: any) => (
                    <button key={ev.id} onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded border truncate text-left w-full
                        ${EVENT_PILL[ev.colour] ?? EVENT_PILL.green}`}>
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-crm-text-dim px-1">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event detail popover */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setSelectedEvent(null)}>
          <div className="bg-crm-card border border-crm-border rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${EVENT_DOT[selectedEvent.colour] ?? "bg-emerald-500"}`} />
                <h3 className="text-sm font-semibold text-crm-text">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-crm-text-dim hover:text-crm-text-secondary">
                <X size={14} />
              </button>
            </div>
            <p className="text-[11px] font-mono text-crm-text-dim mb-2">
              {format(parseISO(selectedEvent.start_time), "EEEE, d MMMM yyyy")}
              {!selectedEvent.all_day && ` · ${format(parseISO(selectedEvent.start_time), "h:mm a")}`}
              {selectedEvent.end_time && ` – ${format(parseISO(selectedEvent.end_time), "h:mm a")}`}
            </p>
            {selectedEvent.description && (
              <p className="text-[12px] text-crm-text-secondary mb-3">{selectedEvent.description}</p>
            )}
            {canCreate && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setSelectedEvent(null); openEdit(selectedEvent); }}
                  className="border-crm-border text-crm-text-muted text-xs gap-1">
                  <Pencil size={11} /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteEvent.mutate(selectedEvent.id)}
                  className="border-red-800 text-red-400 text-xs gap-1 hover:bg-red-950">
                  <Trash2 size={11} /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Sheet */}
      <EventFormSheet
        key={sheetEvent?.id ?? "new"}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        event={sheetEvent}
        defaultDate={sheetDefaultDate}
      />
    </div>
  );
}
