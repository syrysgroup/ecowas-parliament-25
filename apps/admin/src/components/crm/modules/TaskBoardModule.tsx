import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Plus, Pencil, Trash2, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { TASK_CREATE_ROLES } from "../crmRoles";
import { Button } from "@/components/ui/button";
import { DEFAULT_AVATAR } from "@/lib/constants";
import {
  PageHeaderV2,
  FilterBar,
  DataTable,
  EmptyStateV2,
  QuickActions,
  urlFlag,
  type Column,
  type FilterChip,
} from "../_kit";
import LegacyTaskBoardModule, {
  CreateTaskDialog,
  EditTaskDialog,
} from "./TaskBoardModule.legacy";
import { StatusPill } from "@/components/shell/primitives";

const STATUSES = [
  { id: "todo",        label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review",      label: "Review" },
  { id: "done",        label: "Done" },
];

const PRIORITY_TONE: Record<string, "danger" | "warn" | "info" | "success"> = {
  urgent: "danger",
  high:   "warn",
  medium: "info",
  low:    "success",
};

function TaskBoardModuleV2() {
  const { user, roles, isSuperAdmin, isProjectDirector, isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const canCreate = roles.some((r) => TASK_CREATE_ROLES.includes(r));

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["crm-tasks", user?.id, roles],
    queryFn: async () => {
      let q = supabase
        .from("tasks")
        .select("*, assignee:profiles!assignee_id(id, full_name, avatar_url)")
        .order("created_at", { ascending: false });
      if (!isSuperAdmin && !isProjectDirector) q = q.eq("assignee_id", user?.id);
      const { data } = await q;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["crm-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name").order("full_name");
      return data ?? [];
    },
    enabled: canCreate || isAdmin,
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("tasks").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-tasks"] });
      qc.invalidateQueries({ queryKey: ["crm-task-counts"] });
      qc.invalidateQueries({ queryKey: ["crm-my-tasks"] });
    },
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (tasks as any[]).filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (s && !t.title?.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [tasks, search, statusFilter]);

  const filters: FilterChip[] = STATUSES.map((s) => ({
    key: s.id,
    label: s.label,
    active: statusFilter === s.id,
    onClick: () => setStatusFilter((cur) => (cur === s.id ? null : s.id)),
    onClear: () => setStatusFilter(null),
  }));

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Title",
      render: (t) => (
        <div className="flex flex-col">
          <span className="font-medium text-[hsl(var(--text-1))]">{t.title}</span>
          {t.pillar && (
            <span className="text-[10px] font-mono uppercase text-[hsl(var(--text-3))]">{t.pillar}</span>
          )}
        </div>
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      width: "180px",
      render: (t) =>
        t.assignee ? (
          <div className="flex items-center gap-1.5">
            <img
              src={t.assignee.avatar_url || DEFAULT_AVATAR}
              alt=""
              className="w-5 h-5 rounded-full object-cover"
              onError={(e) => ((e.target as HTMLImageElement).src = DEFAULT_AVATAR)}
            />
            <span className="text-[12px] text-[hsl(var(--text-2))] truncate">
              {t.assignee.full_name}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-[hsl(var(--text-3))]">Unassigned</span>
        ),
    },
    {
      key: "due_date",
      header: "Due",
      width: "120px",
      render: (t) =>
        t.due_date ? (
          <span className="inline-flex items-center gap-1 text-[11.5px] text-[hsl(var(--text-2))]">
            <Clock className="h-3 w-3" />
            {format(parseISO(t.due_date), "d MMM")}
          </span>
        ) : (
          <span className="text-[11px] text-[hsl(var(--text-3))]">—</span>
        ),
    },
    {
      key: "priority",
      header: "Priority",
      width: "100px",
      render: (t) => (
        <StatusPill tone={PRIORITY_TONE[t.priority] ?? "default"}>{t.priority}</StatusPill>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (t) => (
        <StatusPill tone={t.status === "done" ? "success" : t.status === "review" ? "warn" : "info"}>
          {STATUSES.find((s) => s.id === t.status)?.label ?? t.status}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeaderV2
        icon={CheckSquare}
        title="Task Board"
        description={
          isSuperAdmin || isProjectDirector
            ? "All tasks across the workspace"
            : "Tasks assigned to you"
        }
        meta={
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[hsl(var(--surface-3))] text-[hsl(var(--text-3))]">
            {(tasks as any[]).length}
          </span>
        }
        actions={
          canCreate && (
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green)/0.85)] text-white text-xs gap-1.5 h-8"
            >
              <Plus className="h-3.5 w-3.5" /> New Task
            </Button>
          )
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tasks…"
        filters={filters}
      />

      <DataTable<any>
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        loading={isLoading}
        onRowClick={isAdmin ? (r) => setEditTarget(r) : undefined}
        empty={
          <EmptyStateV2
            icon={CheckSquare}
            title="No tasks yet"
            description={canCreate ? "Create your first task to get started." : "Tasks assigned to you will appear here."}
            primaryAction={
              canCreate && (
                <Button
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green)/0.85)] text-white text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Task
                </Button>
              )
            }
          />
        }
        rowActions={
          isAdmin
            ? (t) => (
                <QuickActions
                  items={[
                    {
                      key: "edit",
                      icon: Pencil,
                      label: "Edit",
                      onClick: () => setEditTarget(t),
                    },
                    {
                      key: "del",
                      icon: Trash2,
                      label: "Delete",
                      onClick: () => {
                        if (confirm(`Delete task "${t.title}"?`)) deleteTask.mutate(t.id);
                      },
                    },
                  ]}
                />
              )
            : undefined
        }
      />

      <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} profiles={profiles as any[]} />
      <EditTaskDialog
        task={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        profiles={profiles as any[]}
      />
    </div>
  );
}

export default function TaskBoardModule() {
  // Opt-in to the V2 redesign with ?v2=1
  if (urlFlag("v2")) return <TaskBoardModuleV2 />;
  return <LegacyTaskBoardModule />;
}
