import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  format, isSameMonth, isToday, parseISO, isSameDay,
  addMonths, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { CALENDAR_CREATE_ROLES } from "../crmRoles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLOUR_OPTIONS = [
  { id: "green",  label: "Green",  cls: "bg-emerald-500" },
  { id: "blue",   label: "Blue",   cls: "bg-blue-500" },
  { id: "amber",  label: "Amber",  cls: "bg-amber-500" },
  { id: "red",    label: "Red",    cls: "bg-red-500" },
  { id: "violet", label: "Violet", cls: "bg-violet-500" },
  { id: "teal",   label: "Teal",   cls: "bg-teal-500" },
];

const EVENT_DOT: Record<string, string> = {
  green: "bg-emerald-500", blue: "bg-blue-500", amber: "bg-amber-500",
  red: "bg-red-500", violet: "bg-violet-500", teal: "bg-teal-500",
};

const EVENT_PILL: Record<string, string> = {
  green:  "bg-emerald-950 text-emerald-400 border-emerald-800",
  blue:   "bg-blue-950 text-blue-400 border-blue-800",
  amber:  "bg-amber-950 text-amber-400 border-amber-800",
  red:    "bg-red-950 text-red-400 border-red-800",
  violet: "bg-violet-950 text-violet-400 border-violet-800",
  teal:   "bg-teal-950 text-teal-400 border-teal-800",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Shared event form fields ─────────────────────────────────────────────────
function EventFormFields({
  title, setTitle,
  description, setDescription,
  startTime, setStartTime,
  endTime, setEndTime,
  allDay, setAllDay,
  colour, setColour,
}: {
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  startTime: string; setStartTime: (v: string) => void;
  endTime: string; setEndTime: (v: string) => void;
  allDay: boolean; setAllDay: (v: boolean) => void;
  colour: string; setColour: (v: string) => void;
}) {
  return (
    <div className="space-y-3 py-1">
      <div className="space-y-1">
        <Label className="text-[11px] text-crm-text-dim">Title *</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)}
          className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
          placeholder="Event title" />
      </div>
      <div className="flex items-center gap-3">
        <Label className="text-[11px] text-crm-text-dim">All day</Label>
        <Switch checked={allDay} onCheckedChange={setAllDay} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Start *</Label>
          <Input
            type={allDay ? "date" : "datetime-local"}
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">End</Label>
          <Input
            type={allDay ? "date" : "datetime-local"}
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] text-crm-text-dim">Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)}
          className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none"
          rows={2} placeholder="Optional description" />
      </div>
      <div className="space-y-2">
        <Label className="text-[11px] text-crm-text-dim">Colour</Label>
        <div className="flex gap-2">
          {COLOUR_OPTIONS.map(c => (
            <button
              key={c.id}
              onClick={() => setColour(c.id)}
              title={c.label}
              className={`w-6 h-6 rounded-full ${c.cls} transition-all
                ${colour === c.id ? "ring-2 ring-white ring-offset-1 ring-offset-crm-card" : "opacity-60 hover:opacity-100"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Add Event Dialog ──────────────────────────────────────────────────────────
function AddEventDialog({ open, onClose, defaultDate }: {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
}) {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(
    defaultDate ? format(defaultDate, "yyyy-MM-dd'T'09:00") : ""
  );
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [colour, setColour] = useState("green");

  const create = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("crm_calendar_events").insert({
        title,
        description: description || null,
        start_time: startTime,
        end_time: endTime || null,
        all_day: allDay,
        colour,
        created_by: user!.id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-calendar"] });
      qc.invalidateQueries({ queryKey: ["crm-upcoming-events"] });
      setTitle(""); setDescription(""); setStartTime(""); setEndTime("");
      setAllDay(false); setColour("green");
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">Add Event</DialogTitle>
        </DialogHeader>
        <EventFormFields
          title={title} setTitle={setTitle}
          description={description} setDescription={setDescription}
          startTime={startTime} setStartTime={setStartTime}
          endTime={endTime} setEndTime={setEndTime}
          allDay={allDay} setAllDay={setAllDay}
          colour={colour} setColour={setColour}
        />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!title.trim() || !startTime || create.isPending}
            onClick={() => create.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {create.isPending ? "Adding…" : "Add Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Event Dialog ─────────────────────────────────────────────────────────
function EditEventDialog({ event, open, onClose }: {
  event: any;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startTime, setStartTime] = useState(event?.start_time?.slice(0, 16) ?? "");
  const [endTime, setEndTime] = useState(event?.end_time?.slice(0, 16) ?? "");
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [colour, setColour] = useState(event?.colour ?? "green");

  const update = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("crm_calendar_events").update({
        title,
        description: description || null,
        start_time: startTime,
        end_time: endTime || null,
        all_day: allDay,
        colour,
      }).eq("id", event.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-calendar"] });
      qc.invalidateQueries({ queryKey: ["crm-upcoming-events"] });
      onClose();
    },
  });

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">Edit Event</DialogTitle>
        </DialogHeader>
        <EventFormFields
          title={title} setTitle={setTitle}
          description={description} setDescription={setDescription}
          startTime={startTime} setStartTime={setStartTime}
          endTime={endTime} setEndTime={setEndTime}
          allDay={allDay} setAllDay={setAllDay}
          colour={colour} setColour={setColour}
        />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!title.trim() || !startTime || update.isPending}
            onClick={() => update.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {update.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CalendarModule() {
  const { roles, isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(false);

  const canCreate = roles.some(r => CALENDAR_CREATE_ROLES.includes(r));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["crm-calendar", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("crm_calendar_events")
        .select("*")
        .gte("start_time", monthStart.toISOString())
        .lte("start_time", monthEnd.toISOString())
        .order("start_time", { ascending: true });
      return data ?? [];
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("crm_calendar_events").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-calendar"] });
      qc.invalidateQueries({ queryKey: ["crm-upcoming-events"] });
      setSelectedEvent(null);
      setConfirmDeleteEvent(false);
    },
  });

  const getEventsForDay = (day: Date) =>
    events.filter((e: any) => isSameDay(parseISO(e.start_time), day));

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
            className="p-1.5 rounded-lg text-crm-text-dim hover:text-crm-text-secondary hover:bg-crm-surface transition-colors">
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-[15px] font-semibold text-crm-text w-36 text-center">
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
          <Button size="sm" onClick={() => { setClickedDate(undefined); setAddOpen(true); }}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> Add Event
          </Button>
        )}
      </div>

      {/* Calendar grid */}
      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-crm-border">
          {DAY_NAMES.map(d => (
            <div key={d} className="px-2 py-2 text-[10px] font-mono uppercase text-crm-text-dim text-center">
              {d}
            </div>
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
              <div
                key={day.toISOString()}
                onClick={() => {
                  if (canCreate) { setClickedDate(day); setAddOpen(true); }
                }}
                className={`
                  border-b border-crm-border min-h-[80px] p-1.5 flex flex-col gap-1
                  ${!isLastCol ? "border-r" : ""} border-crm-border
                  ${isCurrentMonth ? "" : "bg-crm-card"}
                  ${canCreate ? "cursor-pointer hover:bg-crm-surface" : ""}
                  transition-colors
                `}
              >
                <span className={`
                  text-[11px] font-mono w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 self-start
                  ${isCurrentDay
                    ? "bg-emerald-600 text-white font-bold"
                    : isCurrentMonth ? "text-crm-text-muted" : "text-crm-text-faint"
                  }
                `}>
                  {format(day, "d")}
                </span>
                {isLoading ? null : dayEvents.slice(0, 2).map((ev: any) => (
                  <button
                    key={ev.id}
                    onClick={e => { e.stopPropagation(); setSelectedEvent(ev); setConfirmDeleteEvent(false); }}
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded border truncate text-left w-full
                      ${EVENT_PILL[ev.colour] ?? EVENT_PILL.green}`}
                  >
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

      {/* Event detail dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => { setSelectedEvent(null); setConfirmDeleteEvent(false); }}>
          <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${EVENT_DOT[selectedEvent.colour] ?? "bg-emerald-500"}`} />
                <DialogTitle className="text-sm font-semibold text-crm-text">{selectedEvent.title}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-2 py-1">
              <p className="text-[11px] font-mono text-crm-text-dim">
                {format(parseISO(selectedEvent.start_time), "EEEE, d MMMM yyyy")}
                {!selectedEvent.all_day && ` · ${format(parseISO(selectedEvent.start_time), "h:mm a")}`}
                {selectedEvent.end_time && ` – ${format(parseISO(selectedEvent.end_time), "h:mm a")}`}
              </p>
              {selectedEvent.description && (
                <p className="text-[12px] text-crm-text-secondary leading-relaxed">{selectedEvent.description}</p>
              )}
              {/* Inline delete confirm */}
              {confirmDeleteEvent && (
                <div className="flex items-center gap-2 pt-1 border-t border-crm-border">
                  <span className="text-[11px] text-red-400 flex-1">Delete this event?</span>
                  <Button size="sm" onClick={() => deleteEvent.mutate(selectedEvent.id)}
                    disabled={deleteEvent.isPending}
                    className="bg-red-700 hover:bg-red-600 text-white text-xs h-7 px-2">
                    {deleteEvent.isPending ? "…" : "Yes, delete"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmDeleteEvent(false)}
                    className="border-crm-border text-crm-text-muted text-xs h-7 px-2">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter className="gap-1.5">
              {isAdmin && !confirmDeleteEvent && (
                <>
                  <Button variant="outline" size="sm"
                    onClick={() => { setEditTarget(selectedEvent); setSelectedEvent(null); setEditOpen(true); }}
                    className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs gap-1">
                    <Pencil size={11} /> Edit
                  </Button>
                  <Button variant="outline" size="sm"
                    onClick={() => setConfirmDeleteEvent(true)}
                    className="border-red-900 text-red-500 hover:text-red-400 hover:bg-red-950 text-xs gap-1">
                    <Trash2 size={11} /> Delete
                  </Button>
                </>
              )}
              {!confirmDeleteEvent && (
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}
                  className="border-crm-border text-crm-text-muted text-xs">Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AddEventDialog open={addOpen} onClose={() => setAddOpen(false)} defaultDate={clickedDate} />
      <EditEventDialog
        event={editTarget}
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditTarget(null); }}
      />
    </div>
  );
}
