import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import {
  startOfMonth, endOfMonth, addMonths, subMonths,
  format, parseISO,
} from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { CALENDAR_CREATE_ROLES } from "../crmRoles";
import { Button } from "@/components/ui/button";
import {
  PageHeaderV2,
  FilterBar,
  DataTable,
  EmptyStateV2,
  QuickActions,
  urlFlag,
  type Column,
} from "../_kit";
import { StatusPill } from "@/components/shell/primitives";
import LegacyCalendarModule, { EventFormSheet } from "./CalendarModule.legacy";

function CalendarModuleV2() {
  const { roles, user } = useAuthContext();
  const qc = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetEvent, setSheetEvent] = useState<any>(null);
  const [search, setSearch] = useState("");

  const canCreate = roles.some((r) => CALENDAR_CREATE_ROLES.includes(r));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

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
    enabled: !!user?.id,
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("crm_calendar_events").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-calendar"] });
      qc.invalidateQueries({ queryKey: ["crm-upcoming-events"] });
    },
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (events as any[]).filter((e) =>
      !s || e.title?.toLowerCase().includes(s) || e.description?.toLowerCase().includes(s),
    );
  }, [events, search]);

  const columns: Column<any>[] = [
    {
      key: "start_time",
      header: "Date",
      width: "160px",
      render: (e) => (
        <span className="text-[12px] text-[hsl(var(--text-2))] font-mono">
          {format(parseISO(e.start_time), "EEE, d MMM")}
          {!e.all_day && ` · ${format(parseISO(e.start_time), "HH:mm")}`}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (e) => (
        <div className="flex flex-col">
          <span className="font-medium text-[hsl(var(--text-1))]">{e.title}</span>
          {e.description && (
            <span className="text-[11.5px] text-[hsl(var(--text-3))] truncate max-w-md">
              {e.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "is_global",
      header: "Scope",
      width: "110px",
      render: (e) =>
        e.is_global ? <StatusPill tone="brand">Global</StatusPill> : <StatusPill>Personal</StatusPill>,
    },
  ];

  const openAdd = () => {
    setSheetEvent(null);
    setSheetOpen(true);
  };

  const openEdit = (ev: any) => {
    setSheetEvent(ev);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeaderV2
        icon={CalendarIcon}
        title="Calendar"
        description={format(currentDate, "MMMM yyyy")}
        meta={
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[hsl(var(--surface-3))] text-[hsl(var(--text-3))]">
            {(events as any[]).length}
          </span>
        }
        quickActions={
          <QuickActions
            items={[
              {
                key: "prev",
                icon: ChevronLeft,
                label: "Previous month",
                onClick: () => setCurrentDate((d) => subMonths(d, 1)),
              },
              {
                key: "next",
                icon: ChevronRight,
                label: "Next month",
                onClick: () => setCurrentDate((d) => addMonths(d, 1)),
              },
            ]}
          />
        }
        actions={
          canCreate && (
            <Button
              size="sm"
              onClick={openAdd}
              className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green)/0.85)] text-white text-xs gap-1.5 h-8"
            >
              <Plus className="h-3.5 w-3.5" /> New Event
            </Button>
          )
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search events…"
        right={
          <button
            onClick={() => setCurrentDate(new Date())}
            className="h-7 px-2 text-[11px] rounded-md border border-[hsl(var(--border-subtle))] text-[hsl(var(--text-2))] hover:text-[hsl(var(--text-1))] hover:bg-[hsl(var(--surface-3))]"
          >
            Today
          </button>
        }
      />

      <DataTable<any>
        columns={columns}
        rows={filtered}
        rowKey={(e) => e.id}
        loading={isLoading}
        onRowClick={canCreate ? openEdit : undefined}
        empty={
          <EmptyStateV2
            icon={CalendarIcon}
            title="Nothing scheduled"
            description={`No events for ${format(currentDate, "MMMM yyyy")}.`}
            primaryAction={
              canCreate && (
                <Button
                  size="sm"
                  onClick={openAdd}
                  className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green)/0.85)] text-white text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Event
                </Button>
              )
            }
          />
        }
        rowActions={
          canCreate
            ? (e) => (
                <QuickActions
                  items={[
                    { key: "edit", icon: Pencil, label: "Edit", onClick: () => openEdit(e) },
                    {
                      key: "del",
                      icon: Trash2,
                      label: "Delete",
                      onClick: () => {
                        if (confirm(`Delete "${e.title}"?`)) deleteEvent.mutate(e.id);
                      },
                    },
                  ]}
                />
              )
            : undefined
        }
      />

      <EventFormSheet
        key={sheetEvent?.id ?? "new"}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        event={sheetEvent}
      />
    </div>
  );
}

export default function CalendarModule() {
  if (urlFlag("v2")) return <CalendarModuleV2 />;
  return <LegacyCalendarModule />;
}
