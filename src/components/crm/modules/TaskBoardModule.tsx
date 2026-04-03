import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Clock, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { TASK_CREATE_ROLES } from "../crmRoles";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLUMNS = [
  { id: "todo",        label: "To Do",       accent: "border-t-[#2a3d2d]" },
  { id: "in_progress", label: "In Progress", accent: "border-t-blue-800" },
  { id: "review",      label: "Review",      accent: "border-t-amber-800" },
  { id: "done",        label: "Done",        accent: "border-t-emerald-800" },
];

const PILLARS = ["youth","trade","women","civic","culture","awards","parliament","general"];
const PRIORITIES = ["low","medium","high","urgent"];

const PRIORITY_COLOURS: Record<string, string> = {
  urgent: "text-red-400 bg-red-950 border-red-800",
  high:   "text-orange-400 bg-orange-950 border-orange-800",
  medium: "text-amber-400 bg-amber-950 border-amber-800",
  low:    "text-emerald-400 bg-emerald-950 border-emerald-800",
};

// ─── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onStatusChange, canUpdateStatus, isAdmin, onEdit, onDelete }: {
  task: any;
  onStatusChange: (id: string, status: string) => void;
  canUpdateStatus: boolean;
  isAdmin: boolean;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(task.status);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div
        className="bg-crm-card border border-crm-border rounded-lg p-3 space-y-2 hover:border-crm-border-hover transition-colors"
      >
        <p
          className="text-[12.5px] font-medium text-crm-text leading-snug cursor-pointer"
          onClick={() => canUpdateStatus && setOpen(true)}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {task.pillar && (
            <span className="text-[9px] font-mono text-crm-text-dim uppercase bg-crm-surface border border-crm-border rounded px-1.5 py-0.5">
              {task.pillar}
            </span>
          )}
          <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${PRIORITY_COLOURS[task.priority] ?? ""}`}>
            {task.priority}
          </span>
        </div>
        <div className="flex items-center justify-between">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-crm-border flex items-center justify-center text-[9px] font-bold text-emerald-400 uppercase">
                {task.assignee.full_name?.charAt(0) ?? "?"}
              </div>
              <span className="text-[10px] text-crm-text-muted truncate max-w-[80px]">
                {task.assignee.full_name?.split(" ")[0]}
              </span>
            </div>
          ) : <span />}
          {task.due_date && (
            <span className="flex items-center gap-1 text-[10px] text-crm-text-dim">
              <Clock size={9} />
              {format(parseISO(task.due_date), "d MMM")}
            </span>
          )}
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="pt-1 border-t border-crm-border flex items-center gap-1.5">
            {!confirmDelete ? (
              <>
                <button
                  onClick={() => onEdit(task)}
                  className="flex items-center gap-1 text-[10px] text-crm-text-dim hover:text-crm-text-secondary transition-colors px-1.5 py-0.5 rounded hover:bg-crm-surface"
                >
                  <Pencil size={10} /> Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1 text-[10px] text-crm-text-dim hover:text-red-400 transition-colors px-1.5 py-0.5 rounded hover:bg-red-950"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-[10px] text-red-400 flex-1">Delete task?</span>
                <button
                  onClick={() => { onDelete(task.id); setConfirmDelete(false); }}
                  className="text-[10px] font-semibold text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded hover:bg-red-950 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[10px] text-crm-text-dim hover:text-crm-text-secondary px-1.5 py-0.5 rounded hover:bg-crm-surface transition-colors"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {canUpdateStatus && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">{task.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {task.description && (
                <p className="text-[12px] text-crm-text-muted">{task.description}</p>
              )}
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Update status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-crm-card border-crm-border">
                    {COLUMNS.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-crm-text text-xs">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="border-crm-border text-crm-text-muted text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={() => { onStatusChange(task.id, newStatus); setOpen(false); }}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// ─── Shared task form fields ───────────────────────────────────────────────────
function TaskFormFields({
  title, setTitle,
  description, setDescription,
  pillar, setPillar,
  priority, setPriority,
  assigneeId, setAssigneeId,
  dueDate, setDueDate,
  profiles,
}: {
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  pillar: string; setPillar: (v: string) => void;
  priority: string; setPriority: (v: string) => void;
  assigneeId: string; setAssigneeId: (v: string) => void;
  dueDate: string; setDueDate: (v: string) => void;
  profiles: any[];
}) {
  return (
    <div className="space-y-3 py-1">
      <div className="space-y-1">
        <Label className="text-[11px] text-crm-text-dim">Title *</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)}
          className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
          placeholder="Task title" />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] text-crm-text-dim">Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)}
          className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none"
          rows={2} placeholder="Optional description" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Pillar</Label>
          <Select value={pillar} onValueChange={setPillar}>
            <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-crm-card border-crm-border">
              {PILLARS.map(p => (
                <SelectItem key={p} value={p} className="text-crm-text text-xs capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-crm-card border-crm-border">
              {PRIORITIES.map(p => (
                <SelectItem key={p} value={p} className="text-crm-text text-xs capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Assign to</Label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent className="bg-crm-card border-crm-border">
              {profiles.map((p: any) => (
                <SelectItem key={p.id} value={p.id} className="text-crm-text text-xs">{p.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-crm-text-dim">Due date</Label>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
        </div>
      </div>
    </div>
  );
}

// ─── Create Task Dialog ────────────────────────────────────────────────────────
function CreateTaskDialog({ open, onClose, profiles }: {
  open: boolean;
  onClose: () => void;
  profiles: any[];
}) {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pillar, setPillar] = useState("general");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("tasks").insert({
        title,
        description: description || null,
        pillar,
        assignee_id: assigneeId || null,
        created_by: user!.id,
        priority,
        due_date: dueDate || null,
        status: "todo",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-tasks"] });
      qc.invalidateQueries({ queryKey: ["crm-task-counts"] });
      qc.invalidateQueries({ queryKey: ["crm-my-tasks"] });
      setTitle(""); setDescription(""); setPillar("general");
      setAssigneeId(""); setPriority("medium"); setDueDate("");
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">New Task</DialogTitle>
        </DialogHeader>
        <TaskFormFields
          title={title} setTitle={setTitle}
          description={description} setDescription={setDescription}
          pillar={pillar} setPillar={setPillar}
          priority={priority} setPriority={setPriority}
          assigneeId={assigneeId} setAssigneeId={setAssigneeId}
          dueDate={dueDate} setDueDate={setDueDate}
          profiles={profiles}
        />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!title.trim() || create.isPending}
            onClick={() => create.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {create.isPending ? "Creating…" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Task Dialog ──────────────────────────────────────────────────────────
function EditTaskDialog({ task, open, onClose, profiles }: {
  task: any;
  open: boolean;
  onClose: () => void;
  profiles: any[];
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [pillar, setPillar] = useState(task?.pillar ?? "general");
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id ?? "");
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0, 10) ?? "");

  // Sync state when task changes
  const syncedTask = task?.id;
  useState(() => {
    if (!task) return;
    setTitle(task.title ?? "");
    setDescription(task.description ?? "");
    setPillar(task.pillar ?? "general");
    setAssigneeId(task.assignee_id ?? "");
    setPriority(task.priority ?? "medium");
    setDueDate(task.due_date?.slice(0, 10) ?? "");
  });

  const update = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("tasks").update({
        title,
        description: description || null,
        pillar,
        priority,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
      }).eq("id", task.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-tasks"] });
      qc.invalidateQueries({ queryKey: ["crm-task-counts"] });
      qc.invalidateQueries({ queryKey: ["crm-my-tasks"] });
      onClose();
    },
  });

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">Edit Task</DialogTitle>
        </DialogHeader>
        <TaskFormFields
          title={title} setTitle={setTitle}
          description={description} setDescription={setDescription}
          pillar={pillar} setPillar={setPillar}
          priority={priority} setPriority={setPriority}
          assigneeId={assigneeId} setAssigneeId={setAssigneeId}
          dueDate={dueDate} setDueDate={setDueDate}
          profiles={profiles}
        />
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!title.trim() || update.isPending}
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
export default function TaskBoardModule() {
  const { user, roles, isSuperAdmin, isProjectDirector, isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  const canCreate = roles.some(r => TASK_CREATE_ROLES.includes(r));

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["crm-tasks", user?.id, roles],
    queryFn: async () => {
      let q = (supabase as any)
        .from("tasks")
        .select("*, assignee:profiles!assignee_id(id, full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (!isSuperAdmin && !isProjectDirector) {
        q = q.eq("assignee_id", user?.id);
      }
      const { data } = await q;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["crm-profiles"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      return data ?? [];
    },
    enabled: canCreate || isAdmin,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await (supabase as any).from("tasks").update({ status }).eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-tasks"] });
      qc.invalidateQueries({ queryKey: ["crm-task-counts"] });
      qc.invalidateQueries({ queryKey: ["crm-my-tasks"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("tasks").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-tasks"] });
      qc.invalidateQueries({ queryKey: ["crm-task-counts"] });
      qc.invalidateQueries({ queryKey: ["crm-my-tasks"] });
    },
  });

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = (tasks ?? []).filter((t: any) => t.status === col.id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-crm-text-dim">Task Board</h2>
          <p className="text-[13px] font-semibold text-crm-text mt-0.5">
            {(isSuperAdmin || isProjectDirector) ? "All Tasks" : "My Tasks"}
          </p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> New Task
          </Button>
        )}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-4">
        {COLUMNS.map(col => {
          const colTasks = tasksByStatus[col.id] ?? [];
          return (
            <div key={col.id} className={`flex flex-col gap-2 bg-crm border-t-2 ${col.accent} border border-crm-border rounded-xl p-3 min-h-[200px]`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-crm-text-muted">{col.label}</span>
                <span className="text-[10px] font-mono text-crm-text-faint bg-crm-surface border border-crm-border rounded-full px-1.5">
                  {isLoading ? "…" : colTasks.length}
                </span>
              </div>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 bg-crm-surface rounded-lg animate-pulse" />
                ))
              ) : colTasks.length === 0 ? (
                <p className="text-[10px] text-crm-text-faint text-center py-4">No tasks</p>
              ) : (
                colTasks.map((task: any) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canUpdateStatus={task.assignee_id === user?.id || isSuperAdmin || isProjectDirector}
                    onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
                    isAdmin={isAdmin}
                    onEdit={(t) => { setEditTarget(t); setEditOpen(true); }}
                    onDelete={(id) => deleteTask.mutate(id)}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>

      <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} profiles={profiles} />
      <EditTaskDialog
        task={editTarget}
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditTarget(null); }}
        profiles={profiles}
      />
    </div>
  );
}
