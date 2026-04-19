import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import {
  Plus, Pencil, Trash2, Eye, X, Printer, Send,
  FileText, CheckCircle2, Clock, AlertCircle, Ban, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount?: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  client_company: string | null;
  client_address: string | null;
  client_country: string | null;
  issue_date: string;
  due_date: string | null;
  status: string;
  notes: string | null;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  total: number;
  amount_paid: number | null;
  balance: number | null;
  currency: string | null;
  created_at: string;
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  draft:     { label: "Draft",     cls: "text-crm-text-muted bg-crm-surface border-crm-border",           icon: <FileText size={10} /> },
  sent:      { label: "Sent",      cls: "text-blue-400 bg-blue-950 border-blue-800",                      icon: <Send size={10} /> },
  paid:      { label: "Paid",      cls: "text-emerald-400 bg-emerald-950 border-emerald-800",             icon: <CheckCircle2 size={10} /> },
  partial:   { label: "Partial",   cls: "text-amber-400 bg-amber-950 border-amber-800",                   icon: <DollarSign size={10} /> },
  overdue:   { label: "Overdue",   cls: "text-red-400 bg-red-950 border-red-800",                         icon: <AlertCircle size={10} /> },
  cancelled: { label: "Cancelled", cls: "text-crm-text-faint bg-crm-surface/50 border-crm-border/50",     icon: <Ban size={10} /> },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-mono border rounded px-1.5 py-0.5 ${meta.cls}`}>
      {meta.icon}{meta.label}
    </span>
  );
}

function fmtCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

// ─── Invoice Form Dialog ──────────────────────────────────────────────────────
function InvoiceFormDialog({
  open, onClose, invoice,
}: { open: boolean; onClose: () => void; invoice?: Invoice }) {
  const qc = useQueryClient();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const isEdit = !!invoice;

  const [clientName,    setClientName]    = useState(invoice?.client_name ?? "");
  const [clientEmail,   setClientEmail]   = useState(invoice?.client_email ?? "");
  const [clientCompany, setClientCompany] = useState(invoice?.client_company ?? "");
  const [clientAddress, setClientAddress] = useState(invoice?.client_address ?? "");
  const [clientCountry, setClientCountry] = useState(invoice?.client_country ?? "");
  const [issueDate,     setIssueDate]     = useState(invoice?.issue_date ?? new Date().toISOString().split("T")[0]);
  const [dueDate,       setDueDate]       = useState(invoice?.due_date ?? "");
  const [status,        setStatus]        = useState(invoice?.status ?? "draft");
  const [notes,         setNotes]         = useState(invoice?.notes ?? "");
  const [taxRate,       setTaxRate]       = useState(invoice?.tax_rate?.toString() ?? "0");
  const [amountPaid,    setAmountPaid]    = useState(invoice?.amount_paid?.toString() ?? "0");
  const [currency,      setCurrency]      = useState(invoice?.currency ?? "USD");

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice ? [] : [{ description: "", quantity: 1, unit_price: 0 }]
  );

  // Load existing items when editing
  useQuery({
    queryKey: ["invoice-items-edit", invoice?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoice_items")
        .select("id, description, quantity, unit_price, amount")
        .eq("invoice_id", invoice!.id)
        .order("sort_order");
      setItems(data?.length ? data : [{ description: "", quantity: 1, unit_price: 0 }]);
      return data;
    },
    enabled: isEdit && open,
  });

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const addItem    = () => setItems(prev => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const subtotal  = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unit_price)), 0);
  const taxAmount = subtotal * (Number(taxRate) / 100);
  const total     = subtotal + taxAmount;

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        client_name: clientName.trim(), client_email: clientEmail || null,
        client_company: clientCompany || null, client_address: clientAddress || null,
        client_country: clientCountry || null, issue_date: issueDate,
        due_date: dueDate || null, status, notes: notes || null,
        subtotal, tax_rate: Number(taxRate), tax_amount: taxAmount,
        total, amount_paid: Number(amountPaid), currency,
        updated_at: new Date().toISOString(),
      };

      let invoiceId = invoice?.id;

      if (isEdit) {
        const { error } = await supabase.from("invoices").update(payload).eq("id", invoiceId);
        if (error) throw error;
        // Replace all items
        await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
      } else {
        // Get next invoice number
        const { data: numData } = await supabase.rpc("next_invoice_number");
        const { data: newInv, error } = await supabase
          .from("invoices")
          .insert({ ...payload, invoice_number: numData ?? `INV-${Date.now()}`, created_by: user?.id })
          .select("id").single();
        if (error) throw error;
        invoiceId = newInv.id;
      }

      // Insert items
      const validItems = items.filter(it => it.description.trim());
      if (validItems.length > 0) {
        const { error: itemErr } = await supabase.from("invoice_items").insert(
          validItems.map((it, i) => ({
            invoice_id: invoiceId, description: it.description.trim(),
            quantity: Number(it.quantity), unit_price: Number(it.unit_price),
            sort_order: i,
          }))
        );
        if (itemErr) throw itemErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: isEdit ? "Invoice updated" : "Invoice created" });
      onClose();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-crm-text">
            {isEdit ? `Edit ${invoice.invoice_number}` : "New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Client info */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 mb-2">Client Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Client Name *</Label>
                <Input value={clientName} onChange={e => setClientName(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Company</Label>
                <Input value={clientCompany} onChange={e => setClientCompany(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Email</Label>
                <Input value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Country</Label>
                <Input value={clientCountry} onChange={e => setClientCountry(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Address</Label>
                <Input value={clientAddress} onChange={e => setClientAddress(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
              </div>
            </div>
          </div>

          {/* Invoice meta */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 mb-2">Invoice Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Issue Date</Label>
                <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-crm-card border-crm-border">
                    {Object.entries(STATUS_META).map(([val, meta]) => (
                      <SelectItem key={val} value={val} className="text-crm-text text-xs">{meta.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-crm-text-dim">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-crm-card border-crm-border">
                    {["USD","EUR","GBP","NGN","GHS","XOF"].map(c => (
                      <SelectItem key={c} value={c} className="text-crm-text text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500">Line Items</p>
              <button onClick={addItem} className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <Plus size={11} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_5rem_6rem_1.5rem] gap-2">
                <p className="text-[9px] text-crm-text-dim uppercase tracking-wider">Description</p>
                <p className="text-[9px] text-crm-text-dim uppercase tracking-wider">Qty</p>
                <p className="text-[9px] text-crm-text-dim uppercase tracking-wider">Unit Price</p>
                <span />
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_5rem_6rem_1.5rem] gap-2 items-center">
                  <Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)}
                    placeholder="Service description" className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
                  <Input type="number" min="0" step="0.01" value={item.quantity}
                    onChange={e => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                    className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
                  <Input type="number" min="0" step="0.01" value={item.unit_price}
                    onChange={e => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                    className="bg-crm-surface border-crm-border text-crm-text text-xs h-8" />
                  <button onClick={() => removeItem(idx)} disabled={items.length === 1}
                    className="text-crm-text-dim hover:text-red-400 disabled:opacity-30 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 ml-auto w-64 space-y-1.5 border-t border-crm-border pt-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-crm-text-dim">Subtotal</span>
                <span className="text-crm-text font-mono">{fmtCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-crm-text-dim">Tax (%)</span>
                <Input type="number" min="0" max="100" step="0.1" value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-6 w-16 text-right" />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-crm-text-dim">Tax Amount</span>
                <span className="text-crm-text font-mono">{fmtCurrency(taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-[12px] font-bold border-t border-crm-border pt-1.5">
                <span className="text-crm-text">Total</span>
                <span className="text-emerald-400 font-mono">{fmtCurrency(total, currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-crm-text-dim">Amount Paid</span>
                <Input type="number" min="0" step="0.01" value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-6 w-24 text-right" />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-crm-text-dim">Balance</span>
                <span className={`font-mono font-bold ${total - Number(amountPaid) > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {fmtCurrency(total - Number(amountPaid), currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-[11px] text-crm-text-dim">Notes / Terms</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs resize-none" rows={3}
              placeholder="Payment terms, bank details, thank-you note..." />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-crm-border">
          <Button variant="outline" size="sm" onClick={onClose} className="border-crm-border text-crm-text-muted text-xs">Cancel</Button>
          <Button size="sm" disabled={!clientName.trim() || save.isPending} onClick={() => save.mutate()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
            {save.isPending ? "Saving…" : isEdit ? "Update Invoice" : "Create Invoice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Invoice Preview Dialog ───────────────────────────────────────────────────
function InvoicePreview({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["invoice-items-preview", invoice.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoice_items")
        .select("id, description, quantity, unit_price, amount")
        .eq("invoice_id", invoice.id)
        .order("sort_order");
      return data ?? [];
    },
  });

  const handlePrint = () => {
    const content = printRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>${invoice.invoice_number}</title>
      <style>
        body{font-family:system-ui,sans-serif;color:#111;padding:32px;max-width:720px;margin:0 auto}
        table{width:100%;border-collapse:collapse}
        th,td{padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:left}
        th{background:#f9fafb;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
        .text-right{text-align:right} .font-bold{font-weight:700}
        .total-row td{border-top:2px solid #111;font-weight:700}
      </style></head>
      <body onload="window.print();window.close()">${content}</body></html>
    `);
    win.document.close();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-crm-card border-crm-border text-crm-text max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-crm-text">{invoice.invoice_number}</DialogTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint}
                className="border-crm-border text-crm-text-muted text-xs gap-1">
                <Printer size={12} /> Print / PDF
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}><X size={14} /></Button>
            </div>
          </div>
        </DialogHeader>

        <div ref={printRef} className="py-2">
          {/* Header */}
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-xs text-crm-text-dim uppercase tracking-widest mb-1">Invoice To</p>
              <p className="font-bold text-crm-text">{invoice.client_name}</p>
              {invoice.client_company && <p className="text-sm text-crm-text-muted">{invoice.client_company}</p>}
              {invoice.client_email && <p className="text-xs text-crm-text-dim">{invoice.client_email}</p>}
              {invoice.client_address && <p className="text-xs text-crm-text-dim">{invoice.client_address}</p>}
              {invoice.client_country && <p className="text-xs text-crm-text-dim">{invoice.client_country}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-400">{invoice.invoice_number}</p>
              <StatusBadge status={invoice.status} />
              <div className="mt-3 space-y-1 text-xs text-crm-text-dim">
                <p>Issued: <span className="text-crm-text">{format(parseISO(invoice.issue_date), "d MMM yyyy")}</span></p>
                {invoice.due_date && (
                  <p>Due: <span className="text-crm-text">{format(parseISO(invoice.due_date), "d MMM yyyy")}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <table className="w-full text-[12px] mb-4">
            <thead>
              <tr className="border-b border-crm-border">
                <th className="text-left text-[10px] text-crm-text-dim uppercase tracking-wider py-2">Description</th>
                <th className="text-right text-[10px] text-crm-text-dim uppercase tracking-wider py-2 w-16">Qty</th>
                <th className="text-right text-[10px] text-crm-text-dim uppercase tracking-wider py-2 w-24">Unit Price</th>
                <th className="text-right text-[10px] text-crm-text-dim uppercase tracking-wider py-2 w-24">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-surface">
              {items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-2.5 text-crm-text">{item.description}</td>
                  <td className="py-2.5 text-right text-crm-text-muted">{item.quantity}</td>
                  <td className="py-2.5 text-right text-crm-text-muted">{fmtCurrency(item.unit_price, invoice.currency ?? "USD")}</td>
                  <td className="py-2.5 text-right text-crm-text">{fmtCurrency(item.amount ?? item.quantity * item.unit_price, invoice.currency ?? "USD")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="ml-auto w-60 space-y-1.5 border-t border-crm-border pt-3">
            <div className="flex justify-between text-[11px]">
              <span className="text-crm-text-dim">Subtotal</span>
              <span className="text-crm-text font-mono">{fmtCurrency(invoice.subtotal, invoice.currency ?? "USD")}</span>
            </div>
            {(invoice.tax_rate ?? 0) > 0 && (
              <div className="flex justify-between text-[11px]">
                <span className="text-crm-text-dim">Tax ({invoice.tax_rate}%)</span>
                <span className="text-crm-text font-mono">{fmtCurrency(invoice.tax_amount ?? 0, invoice.currency ?? "USD")}</span>
              </div>
            )}
            <div className="flex justify-between text-[12px] font-bold border-t border-crm-border pt-1.5">
              <span className="text-crm-text">Total</span>
              <span className="text-emerald-400 font-mono">{fmtCurrency(invoice.total, invoice.currency ?? "USD")}</span>
            </div>
            {(invoice.amount_paid ?? 0) > 0 && (
              <>
                <div className="flex justify-between text-[11px]">
                  <span className="text-crm-text-dim">Amount Paid</span>
                  <span className="text-emerald-400 font-mono">−{fmtCurrency(invoice.amount_paid ?? 0, invoice.currency ?? "USD")}</span>
                </div>
                <div className="flex justify-between text-[12px] font-bold">
                  <span className="text-crm-text">Balance Due</span>
                  <span className={`font-mono ${(invoice.balance ?? 0) > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {fmtCurrency(invoice.balance ?? 0, invoice.currency ?? "USD")}
                  </span>
                </div>
              </>
            )}
          </div>

          {invoice.notes && (
            <div className="mt-6 p-3 bg-crm-surface rounded-lg border border-crm-border">
              <p className="text-[10px] text-crm-text-dim uppercase tracking-wider mb-1">Notes</p>
              <p className="text-[12px] text-crm-text-muted whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────
export default function InvoiceModule() {
  const { isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen,        setAddOpen]        = useState(false);
  const [editTarget,     setEditTarget]     = useState<Invoice | null>(null);
  const [previewTarget,  setPreviewTarget]  = useState<Invoice | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusFilter,   setStatusFilter]   = useState<string>("all");
  const [search,         setSearch]         = useState("");

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      setConfirmDeleteId(null);
      toast({ title: "Invoice deleted" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const filtered = invoices.filter(inv => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!inv.invoice_number.toLowerCase().includes(q) &&
          !inv.client_name.toLowerCase().includes(q) &&
          !(inv.client_company ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Summary stats
  const totalOutstanding = invoices
    .filter(inv => ["sent","partial","overdue"].includes(inv.status))
    .reduce((s, inv) => s + (inv.balance ?? 0), 0);
  const totalPaid = invoices
    .filter(inv => inv.status === "paid")
    .reduce((s, inv) => s + inv.total, 0);
  const overdueCount = invoices.filter(inv => inv.status === "overdue").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Invoices</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">{invoices.length} invoices total</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setAddOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
            <Plus size={13} /> New Invoice
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Invoices",  value: invoices.length,                         accent: "bg-crm-surface border-crm-border",         icon: <FileText size={14} className="text-crm-text-dim" /> },
          { label: "Outstanding",     value: fmtCurrency(totalOutstanding),             accent: "bg-amber-950/50 border-amber-800",          icon: <Clock size={14} className="text-amber-400" /> },
          { label: "Collected",       value: fmtCurrency(totalPaid),                    accent: "bg-emerald-950/50 border-emerald-800",      icon: <CheckCircle2 size={14} className="text-emerald-400" /> },
          { label: "Overdue",         value: overdueCount,                               accent: overdueCount > 0 ? "bg-red-950/50 border-red-800" : "bg-crm-surface border-crm-border", icon: <AlertCircle size={14} className={overdueCount > 0 ? "text-red-400" : "text-crm-text-dim"} /> },
        ].map(card => (
          <div key={card.label} className={`border rounded-xl p-3 flex items-center gap-3 ${card.accent}`}>
            <div className="w-8 h-8 rounded-lg bg-crm-card/50 flex items-center justify-center flex-shrink-0">
              {card.icon}
            </div>
            <div>
              <p className="text-[10px] text-crm-text-dim uppercase tracking-wider">{card.label}</p>
              <p className="text-base font-bold text-crm-text">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search client or #..."
          className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 w-48"
        />
        <div className="flex gap-1.5">
          {["all", ...Object.keys(STATUS_META)].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-[9px] font-mono px-2 py-1 rounded-lg border transition-colors ${
                statusFilter === s
                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                  : "bg-crm-surface text-crm-text-muted border-crm-border hover:border-crm-border-hover"
              }`}
            >
              {s === "all" ? "All" : STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-crm-text-muted">
          <FileText className="mx-auto h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">No invoices found</p>
        </div>
      ) : (
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_1fr_6rem_6rem_7rem_6rem] gap-2 px-4 py-2 border-b border-crm-border bg-crm-surface/50">
            {["#","Client","Company","Issued","Due","Total","Status"].map(h => (
              <p key={h} className="text-[9px] font-mono uppercase tracking-wider text-crm-text-dim">{h}</p>
            ))}
          </div>
          <div className="divide-y divide-crm-surface">
            {filtered.map(inv => (
              <div key={inv.id}
                className="grid grid-cols-[3rem_1fr_1fr_6rem_6rem_7rem_6rem] gap-2 px-4 py-3 items-center hover:bg-crm-surface/30 transition-colors group"
              >
                <p className="text-[11px] font-mono text-emerald-400 truncate">{inv.invoice_number}</p>
                <p className="text-[12px] text-crm-text font-medium truncate">{inv.client_name}</p>
                <p className="text-[11px] text-crm-text-muted truncate">{inv.client_company || "—"}</p>
                <p className="text-[11px] text-crm-text-dim">{format(parseISO(inv.issue_date), "d MMM yy")}</p>
                <p className="text-[11px] text-crm-text-dim">{inv.due_date ? format(parseISO(inv.due_date), "d MMM yy") : "—"}</p>
                <p className="text-[12px] text-crm-text font-mono font-semibold">{fmtCurrency(inv.total, inv.currency ?? "USD")}</p>
                <div className="flex items-center gap-1">
                  <StatusBadge status={inv.status} />
                  {isAdmin && (
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                      <button onClick={() => setPreviewTarget(inv)} title="Preview"
                        className="w-5 h-5 rounded flex items-center justify-center text-crm-text-dim hover:text-crm-text bg-crm-surface border border-crm-border transition-colors">
                        <Eye size={10} />
                      </button>
                      <button onClick={() => setEditTarget(inv)} title="Edit"
                        className="w-5 h-5 rounded flex items-center justify-center text-crm-text-dim hover:text-crm-text bg-crm-surface border border-crm-border transition-colors">
                        <Pencil size={10} />
                      </button>
                      {confirmDeleteId === inv.id ? (
                        <>
                          <button onClick={() => deleteInvoice.mutate(inv.id)}
                            className="text-[9px] text-red-400 bg-red-950 border border-red-800 rounded px-1.5 py-0.5">Yes</button>
                          <button onClick={() => setConfirmDeleteId(null)}
                            className="text-[9px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-1.5 py-0.5">No</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(inv.id)} title="Delete"
                          className="w-5 h-5 rounded flex items-center justify-center text-crm-text-dim hover:text-red-400 bg-crm-surface border border-crm-border transition-colors">
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {addOpen && <InvoiceFormDialog open onClose={() => setAddOpen(false)} />}
      {editTarget && <InvoiceFormDialog open onClose={() => setEditTarget(null)} invoice={editTarget} />}
      {previewTarget && <InvoicePreview invoice={previewTarget} onClose={() => setPreviewTarget(null)} />}
    </div>
  );
}
