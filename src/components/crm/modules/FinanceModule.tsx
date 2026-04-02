import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Plus, Pencil, Trash2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface BudgetItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  status: "pending" | "approved" | "paid";
  notes: string | null;
  created_at: string;
  created_by_name: string | null;
}

const STATUS_CONFIG = {
  pending:  { label: "Pending",  classes: "bg-amber-950 text-amber-400 border-amber-800",    icon: Clock },
  approved: { label: "Approved", classes: "bg-blue-950 text-blue-400 border-blue-800",        icon: CheckCircle2 },
  paid:     { label: "Paid",     classes: "bg-emerald-950 text-emerald-400 border-emerald-800", icon: CheckCircle2 },
};

const TYPE_CONFIG = {
  income:  { label: "Income",  classes: "bg-emerald-950 text-emerald-400 border-emerald-800" },
  expense: { label: "Expense", classes: "bg-red-950 text-red-400 border-red-800" },
};

const CATEGORIES = ["Venue", "Travel", "Accommodation", "Catering", "Marketing", "Equipment", "Staffing", "Sponsorship", "Other"];

// ─── Budget Item Form Dialog ───────────────────────────────────────────────────
function BudgetItemDialog({
  open, onClose, item,
}: {
  open: boolean;
  onClose: () => void;
  item?: BudgetItem;
}) {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState(item?.category ?? "Other");
  const [amount, setAmount] = useState(item ? String(item.amount) : "");
  const [type, setType] = useState<"income" | "expense">(item?.type ?? "expense");
  const [status, setStatus] = useState<"pending" | "approved" | "paid">(item?.status ?? "pending");
  const [notes, setNotes] = useState(item?.notes ?? "");

  const isEdit = !!item;

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        category,
        amount: Number(amount),
        type,
        status,
        notes: notes || null,
      };
      if (isEdit) {
        await (supabase as any).from("budget_items").update(payload).eq("id", item.id);
      } else {
        await (supabase as any).from("budget_items").insert({ ...payload, created_by: user!.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget-items"] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1610] border-[#1e2d22] text-[#c8e0cc] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-[#c8e0cc]">
            {isEdit ? "Edit Budget Item" : "Add Budget Item"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8"
              placeholder="e.g. Venue deposit" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-[#4a6650]">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1610] border-[#1e2d22]">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="text-[#c8e0cc] text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-[#4a6650]">Amount (USD)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8"
                placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-[#4a6650]">Type</Label>
              <Select value={type} onValueChange={v => setType(v as "income" | "expense")}>
                <SelectTrigger className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1610] border-[#1e2d22]">
                  <SelectItem value="income"  className="text-[#c8e0cc] text-xs">Income</SelectItem>
                  <SelectItem value="expense" className="text-[#c8e0cc] text-xs">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-[#4a6650]">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as "pending" | "approved" | "paid")}>
                <SelectTrigger className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1610] border-[#1e2d22]">
                  <SelectItem value="pending"  className="text-[#c8e0cc] text-xs">Pending</SelectItem>
                  <SelectItem value="approved" className="text-[#c8e0cc] text-xs">Approved</SelectItem>
                  <SelectItem value="paid"     className="text-[#c8e0cc] text-xs">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-[#4a6650]">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="bg-[#111a14] border-[#1e2d22] text-[#c8e0cc] text-xs min-h-[60px] resize-none"
              placeholder="Optional notes or reference" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="border-[#1e2d22] text-[#6b8f72] text-xs">
            Cancel
          </Button>
          <Button size="sm" disabled={!title.trim() || !amount || save.isPending}
            onClick={() => save.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Budget Items List ─────────────────────────────────────────────────────────
function BudgetList() {
  const { isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BudgetItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const { data = [], isLoading, error } = useQuery<BudgetItem[]>({
    queryKey: ["budget-items"],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("budget_items")
        .select("id, title, category, amount, type, status, notes, created_at, creator:profiles!budget_items_created_by_fkey(full_name)")
        .order("created_at", { ascending: false });
      if (res.error?.code === "42P01") return [];
      return (res.data ?? []).map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        amount: d.amount,
        type: d.type,
        status: d.status,
        notes: d.notes ?? null,
        created_at: d.created_at,
        created_by_name: d.creator?.full_name ?? null,
      }));
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("budget_items").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget-items"] });
      setConfirmDeleteId(null);
    },
  });

  const filtered = data.filter(d =>
    (filterStatus === "all" || d.status === filterStatus) &&
    (filterType === "all" || d.type === filterType)
  );

  const totalIncome  = data.filter(d => d.type === "income").reduce((s, d) => s + d.amount, 0);
  const totalExpense = data.filter(d => d.type === "expense").reduce((s, d) => s + d.amount, 0);
  const balance = totalIncome - totalExpense;

  if ((error as any)?.code === "42P01" || (!isLoading && !data.length && (error as any))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <AlertCircle className="h-7 w-7 text-amber-500" />
        <p className="text-sm text-[#6b8f72]">
          Create a <span className="font-mono text-emerald-500">budget_items</span> table in Supabase to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Income",  value: `$${totalIncome.toLocaleString()}`,  classes: "text-emerald-400" },
          { label: "Total Expenses", value: `$${totalExpense.toLocaleString()}`, classes: "text-red-400" },
          { label: "Balance",        value: `$${Math.abs(balance).toLocaleString()}`, classes: balance >= 0 ? "text-emerald-400" : "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1610] border border-[#1e2d22] rounded-xl p-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#4a6650]">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.classes}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-[#0d1610] border-[#1e2d22] text-[#c8e0cc] text-xs h-8 w-32">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1610] border-[#1e2d22]">
              <SelectItem value="all"     className="text-[#c8e0cc] text-xs">All types</SelectItem>
              <SelectItem value="income"  className="text-[#c8e0cc] text-xs">Income</SelectItem>
              <SelectItem value="expense" className="text-[#c8e0cc] text-xs">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-[#0d1610] border-[#1e2d22] text-[#c8e0cc] text-xs h-8 w-32">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1610] border-[#1e2d22]">
              <SelectItem value="all"      className="text-[#c8e0cc] text-xs">All statuses</SelectItem>
              <SelectItem value="pending"  className="text-[#c8e0cc] text-xs">Pending</SelectItem>
              <SelectItem value="approved" className="text-[#c8e0cc] text-xs">Approved</SelectItem>
              <SelectItem value="paid"     className="text-[#c8e0cc] text-xs">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setAddOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> Add Item
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
          <DollarSign className="h-6 w-6 text-[#4a6650]" />
          <p className="text-sm text-[#6b8f72]">No budget items found.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(item => {
          const statusCfg = STATUS_CONFIG[item.status];
          const typeCfg   = TYPE_CONFIG[item.type];
          const isConfirming = confirmDeleteId === item.id;

          return (
            <div key={item.id} className="bg-[#0d1610] border border-[#1e2d22] rounded-xl p-4 flex items-center gap-3 hover:border-[#2a3d2d] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-[13px] font-semibold text-[#c8e0cc] truncate">{item.title}</p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${typeCfg.classes}`}>{typeCfg.label}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${statusCfg.classes}`}>{statusCfg.label}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-mono text-[#4a6650] bg-[#111a14] border border-[#1e2d22] rounded px-1.5 py-0.5">{item.category}</span>
                  <span className="text-[10px] text-[#6b8f72]">{format(parseISO(item.created_at), "d MMM yyyy")}</span>
                  {item.created_by_name && <span className="text-[10px] text-[#4a6650]">by {item.created_by_name}</span>}
                </div>
                {item.notes && <p className="text-[10px] text-[#4a6650] mt-1 truncate">{item.notes}</p>}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <p className={`text-base font-bold ${item.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                  {item.type === "income" ? "+" : "-"}${item.amount.toLocaleString()}
                </p>

                {isAdmin && !isConfirming && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditTarget(item)}
                      className="w-7 h-7 rounded flex items-center justify-center bg-[#111a14] border border-[#1e2d22] text-[#4a6650] hover:text-[#a0c4a8] transition-colors">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(item.id)}
                      className="w-7 h-7 rounded flex items-center justify-center bg-[#111a14] border border-[#1e2d22] text-[#4a6650] hover:text-red-400 hover:border-red-900 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                {isAdmin && isConfirming && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => deleteItem.mutate(item.id)} disabled={deleteItem.isPending}
                      className="text-[10px] font-semibold text-red-400 bg-red-950 border border-red-800 rounded px-2 py-1">
                      {deleteItem.isPending ? "…" : "Delete"}
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)}
                      className="text-[10px] text-[#4a6650] bg-[#111a14] border border-[#1e2d22] rounded px-2 py-1">
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BudgetItemDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {editTarget && (
        <BudgetItemDialog item={editTarget} open={!!editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}

// ─── Sign-offs Tab ─────────────────────────────────────────────────────────────
function SignOffsTab() {
  const { isAdmin } = useAuthContext();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery<BudgetItem[]>({
    queryKey: ["budget-items"],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("budget_items")
        .select("id, title, category, amount, type, status, notes, created_at, creator:profiles!budget_items_created_by_fkey(full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (res.error?.code === "42P01") return [];
      return (res.data ?? []).map((d: any) => ({
        id: d.id, title: d.title, category: d.category, amount: d.amount,
        type: d.type, status: d.status, notes: d.notes ?? null,
        created_at: d.created_at, created_by_name: d.creator?.full_name ?? null,
      }));
    },
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from("budget_items").update({ status: "approved" }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budget-items"] }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );

  if (data.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
      <p className="text-sm text-[#6b8f72]">No items pending sign-off.</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {data.map(item => (
        <div key={item.id} className="bg-[#0d1610] border border-amber-800/40 rounded-xl p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#c8e0cc] truncate">{item.title}</p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-[10px] font-mono text-[#4a6650] bg-[#111a14] border border-[#1e2d22] rounded px-1.5 py-0.5">{item.category}</span>
              <span className={`text-[10px] ${item.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                {item.type === "income" ? "+" : "-"}${item.amount.toLocaleString()}
              </span>
              {item.created_by_name && <span className="text-[10px] text-[#4a6650]">by {item.created_by_name}</span>}
            </div>
          </div>
          {isAdmin && (
            <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate(item.id)}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
              Approve
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function FinanceModule() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[#c8e0cc]">Finance</h2>
        <p className="text-[12px] text-[#6b8f72] mt-0.5">
          Budget management, invoice tracking, and financial sign-off workflows
        </p>
      </div>

      <Tabs defaultValue="budget">
        <TabsList className="bg-[#111a14] border border-[#1e2d22] h-8">
          <TabsTrigger value="budget"   className="text-xs data-[state=active]:bg-[#1e2d22] data-[state=active]:text-[#c8e0cc] text-[#4a6650]">Budget</TabsTrigger>
          <TabsTrigger value="signoffs" className="text-xs data-[state=active]:bg-[#1e2d22] data-[state=active]:text-[#c8e0cc] text-[#4a6650]">Sign-offs</TabsTrigger>
        </TabsList>
        <TabsContent value="budget"   className="mt-4"><BudgetList /></TabsContent>
        <TabsContent value="signoffs" className="mt-4"><SignOffsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
