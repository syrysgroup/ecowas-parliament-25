import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  format, isSameMonth, isToday, parseISO, isSameDay,
  addMonths, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
      <DialogContent className="bg-[#0d1610] border-[#1e2d22] text-[#c8e0cc] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-[#c8e0cc]">Add Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8"
              placeholder="Event title" />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-[11px] text-[#4a6650]">All day</Label>
            <Switch checked={allDay} onCheckedChange={setAllDay} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-[#4a6650]">Start *</Label>
              <Input
                type={allDay ? "date" : "datetime-local"}
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-[#4a6650]">End</Label>
              <Input
                type={allDay ? "date" : "datetime-local"}
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs resize-none"
              rows={2} placeholder="Optional description" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] text-[#4a6650]">Colour</Label>
            <div className="flex gap-2">
              {COLOUR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setColour(c.id)}
                  title={c.label}
                  className={`w-6 h-6 rounded-full ${c.cls} transition-all
                    ${colour === c.id ? "ring-2 ring-white ring-offset-1 ring-offset-[#0d1610]" : "opacity-60 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-[#1e2d22] text-[#6b8f72] text-xs">
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CalendarModule() {
  const { roles } = useAuthContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const canCreate = roles.some(r => CALENDAR_CREATE_ROLES.includes(r));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0=Sun

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

  const getEventsForDay = (day: Date) =>
    events.filter((e: any) => isSameDay(parseISO(e.start_time), day));

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
            className="p-1.5 rounded-lg text-[#4a6650] hover:text-[#a0c4a8] hover:bg-[#111a14] transition-colors">
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-[15px] font-semibold text-[#c8e0cc] w-36 text-center">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button onClick={() => setCurrentDate(d => addMonths(d, 1))}
            className="p-1.5 rounded-lg text-[#4a6650] hover:text-[#a0c4a8] hover:bg-[#111a14] transition-colors">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date())}
            className="text-[10px] font-mono text-[#4a6650] hover:text-emerald-400 border border-[#1e2d22] hover:border-emerald-800 px-2 py-1 rounded transition-colors">
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
      <div className="bg-[#0d1610] border border-[#1e2d22] rounded-xl overflow-hidden">
        {/* Day name headers */}
        <div className="grid grid-cols-7 border-b border-[#1e2d22]">
          {DAY_NAMES.map(d => (
            <div key={d} className="px-2 py-2 text-[10px] font-mono uppercase text-[#4a6650] text-center">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Leading empty cells */}
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="border-r border-b border-[#1e2d22] min-h-[80px] bg-[#080d0a]" />
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
                  border-b border-[#1e2d22] min-h-[80px] p-1.5 flex flex-col gap-1
                  ${!isLastCol ? "border-r" : ""} border-[#1e2d22]
                  ${isCurrentMonth ? "" : "bg-[#080d0a]"}
                  ${canCreate ? "cursor-pointer hover:bg-[#111a14]" : ""}
                  transition-colors
                `}
              >
                <span className={`
                  text-[11px] font-mono w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 self-start
                  ${isCurrentDay
                    ? "bg-emerald-600 text-white font-bold"
                    : isCurrentMonth ? "text-[#6b8f72]" : "text-[#2a3d2d]"
                  }
                `}>
                  {format(day, "d")}
                </span>
                {isLoading ? null : dayEvents.slice(0, 2).map((ev: any) => (
                  <button
                    key={ev.id}
                    onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded border truncate text-left w-full
                      ${EVENT_PILL[ev.colour] ?? EVENT_PILL.green}`}
                  >
                    {ev.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[9px] text-[#4a6650] px-1">+{dayEvents.length - 2} more</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event detail dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="bg-[#0d1610] border-[#1e2d22] text-[#c8e0cc] max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${EVENT_DOT[selectedEvent.colour] ?? "bg-emerald-500"}`} />
                <DialogTitle className="text-sm font-semibold text-[#c8e0cc]">{selectedEvent.title}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-2 py-1">
              <p className="text-[11px] font-mono text-[#4a6650]">
                {format(parseISO(selectedEvent.start_time), "EEEE, d MMMM yyyy")}
                {!selectedEvent.all_day && ` · ${format(parseISO(selectedEvent.start_time), "h:mm a")}`}
                {selectedEvent.end_time && ` – ${format(parseISO(selectedEvent.end_time), "h:mm a")}`}
              </p>
              {selectedEvent.description && (
                <p className="text-[12px] text-[#a0c4a8] leading-relaxed">{selectedEvent.description}</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}
                className="border-[#1e2d22] text-[#6b8f72] text-xs">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AddEventDialog open={addOpen} onClose={() => setAddOpen(false)} defaultDate={clickedDate} />
    </div>
  );
}
