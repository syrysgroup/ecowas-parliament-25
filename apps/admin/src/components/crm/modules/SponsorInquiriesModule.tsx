import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import {
  Mail, Phone, Globe, ChevronDown, ChevronUp, Trash2,
  ExternalLink, Pencil, X, Check, PhoneCall, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { BulkActionBar } from "@/components/crm/shared/BulkActionBar";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────
type InquiryStatus = "new" | "contacted" | "qualified" | "converted" | "declined";
type RequestType = "inquiry" | "concept_note" | "briefing_call";

interface SponsorInquiry {
  id: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  programmes: string[];
  preferred_tier: string | null;
  message: string | null;
  status: InquiryStatus;
  request_type: RequestType;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile { id: string; full_name: string | null; email: string | null; }

// ─── Display config ────────────────────────────────────────────────────────
const STATUS_STYLES: Record<InquiryStatus, string> = {
  new:       "bg-emerald-950 text-emerald-400 border-emerald-800",
  contacted: "bg-blue-950 text-blue-400 border-blue-800",
  qualified: "bg-amber-950 text-amber-400 border-amber-800",
  converted: "bg-purple-950 text-purple-400 border-purple-800",
  declined:  "bg-red-950/60 text-red-400 border-red-800",
};
const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New", contacted: "Contacted", qualified: "Qualified",
  converted: "Converted", declined: "Declined",
};
const ALL_STATUSES: InquiryStatus[] = ["new", "contacted", "qualified", "converted", "declined"];

const TIER_BADGE: Record<string, string> = {
  presenting: "bg-violet-950 text-violet-300 border-violet-800",
  platinum:   "bg-purple-950 text-purple-300 border-purple-800",
  gold:       "bg-amber-950 text-amber-300 border-amber-800",
  silver:     "bg-slate-800 text-slate-300 border-slate-600",
  bronze:     "bg-orange-950 text-orange-300 border-orange-800",
  standard:   "bg-zinc-800 text-zinc-300 border-zinc-600",
};

function buildMailtoLink(inquiry: SponsorInquiry): string {
  const subject = `Re: Sponsorship Enquiry – ${inquiry.org_name} – ECOWAS Parliament Initiatives`;
  const body = [
    `Dear ${inquiry.contact_name},`,
    "",
    "Thank you for your interest in sponsoring the ECOWAS Parliament Initiatives 25th Anniversary Programme.",
    "",
    "",
    "─────────────────────────────────────────",
    `Organisation: ${inquiry.org_name}`,
    `Preferred tier: ${inquiry.preferred_tier ?? "Not specified"}`,
    `Programmes of interest: ${inquiry.programmes.length > 0 ? inquiry.programmes.join(", ") : "All / unspecified"}`,
    "",
    inquiry.message ?? "",
  ].join("\n");
  return `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function SponsorInquiriesModule() {
  const { isSuperAdmin, isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | RequestType>("all");
  const [tierFilter, setTierFilter] = useState<"all" | string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: inquiries = [], isLoading } = useQuery<SponsorInquiry[]>({
    queryKey: ["sponsor-inquiries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsor_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      return (data ?? []) as SponsorInquiry[];
    },
  });

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["all-profiles-brief"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      return data ?? [];
    },
    enabled: isSuperAdmin,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────
  const patchInquiry = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("sponsor_inquiries")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sponsor-inquiries"] }),
  });

  const deleteInquiry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sponsor_inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsor-inquiries"] });
      setConfirmDeleteId(null);
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("sponsor_inquiries").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      qc.invalidateQueries({ queryKey: ["sponsor-inquiries"] });
      bulk.reset();
      setConfirmBulkDelete(false);
      toast({ title: `Deleted ${ids.length} enquir${ids.length !== 1 ? "ies" : "y"}` });
    },
    onError: (e: any) => toast({ title: "Bulk delete failed", description: e.message, variant: "destructive" }),
  });

  const bulkPatch = useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("sponsor_inquiries")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, { ids }) => {
      qc.invalidateQueries({ queryKey: ["sponsor-inquiries"] });
      bulk.reset();
      toast({ title: `Updated ${ids.length} enquir${ids.length !== 1 ? "ies" : "y"}` });
    },
  });

  // ─── Derived ──────────────────────────────────────────────────────────────
  const byStatus = (s: InquiryStatus) => inquiries.filter((i) => i.status === s);
  const byType = (t: RequestType) => inquiries.filter((i) => (i.request_type ?? "inquiry") === t);
  const newCount = byStatus("new").length;
  const callCount = byType("briefing_call").length;

  const typeFiltered =
    typeFilter === "all" ? inquiries : inquiries.filter((i) => (i.request_type ?? "inquiry") === typeFilter);

  const statusFiltered =
    filter === "all" ? typeFiltered : typeFiltered.filter((i) => i.status === filter);

  const displayed =
    tierFilter === "all" ? statusFiltered : statusFiltered.filter((i) => (i.preferred_tier ?? "").toLowerCase() === tierFilter);

  const bulk = useBulkSelection(displayed);

  async function saveNotes(inquiry: SponsorInquiry) {
    const notes = editingNotes[inquiry.id] ?? inquiry.notes ?? "";
    setSavingNotes((p) => ({ ...p, [inquiry.id]: true }));
    try {
      await patchInquiry.mutateAsync({ id: inquiry.id, patch: { notes } });
      setEditingNotes((p) => {
        const n = { ...p };
        delete n[inquiry.id];
        return n;
      });
    } finally {
      setSavingNotes((p) => ({ ...p, [inquiry.id]: false }));
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Sponsor Inquiries</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            {newCount} new · {callCount > 0 ? `${callCount} call request${callCount !== 1 ? "s" : ""} · ` : ""}{inquiries.length} total
          </p>
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "inquiry", "concept_note", "briefing_call"] as const).map((t) => {
          const count =
            t === "all" ? inquiries.length :
            t === "briefing_call" ? callCount :
            byType(t as RequestType).length;
          const label = t === "all" ? "All types" : t === "concept_note" ? "Concept notes" : t === "briefing_call" ? "Briefing calls" : "Inquiries";
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-colors ${
                typeFilter === t
                  ? "bg-crm-accent text-crm-text border-crm-accent"
                  : "bg-crm-surface text-crm-text-muted border-crm-border hover:border-crm-border-hover"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", ...ALL_STATUSES] as const).map((tab) => {
          const count =
            tab === "all" ? inquiries.length : byStatus(tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-colors ${
                filter === tab
                  ? "bg-crm-accent text-crm-text border-crm-accent"
                  : "bg-crm-surface text-crm-text-muted border-crm-border hover:border-crm-border-hover"
              }`}
            >
              {tab === "all" ? "All" : STATUS_LABELS[tab]} ({count})
            </button>
          );
        })}
      </div>

      {/* Tier filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "presenting", "platinum", "gold", "silver", "bronze", "standard"] as const).map((t) => {
          const count = t === "all" ? inquiries.length : inquiries.filter(i => (i.preferred_tier ?? "").toLowerCase() === t).length;
          if (t !== "all" && count === 0) return null;
          return (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors capitalize ${
                tierFilter === t
                  ? t === "presenting" ? "bg-violet-950 text-violet-300 border-violet-800"
                  : t === "platinum"   ? "bg-purple-950 text-purple-300 border-purple-800"
                  : t === "gold"       ? "bg-amber-950 text-amber-300 border-amber-800"
                  : t === "silver"     ? "bg-slate-800 text-slate-300 border-slate-600"
                  : t === "bronze"     ? "bg-orange-950 text-orange-300 border-orange-800"
                  : t === "standard"   ? "bg-zinc-800 text-zinc-300 border-zinc-600"
                  : "bg-crm-accent text-crm-text border-crm-accent"
                  : "bg-crm-surface text-crm-text-muted border-crm-border hover:border-crm-border-hover"
              }`}
            >
              {t === "all" ? "All tiers" : t} ({count})
            </button>
          );
        })}
      </div>

      {/* Bulk action bar */}
      {bulk.selectedIds.size > 0 && (
        <BulkActionBar
          count={bulk.selectedIds.size}
          onClear={bulk.reset}
          actions={[
            {
              label: "Mark contacted",
              onClick: () =>
                bulkPatch.mutate({
                  ids: [...bulk.selectedIds],
                  patch: { status: "contacted" },
                }),
            },
            {
              label: "Mark declined",
              onClick: () =>
                bulkPatch.mutate({
                  ids: [...bulk.selectedIds],
                  patch: { status: "declined" },
                }),
            },
            {
              label: "Delete",
              variant: "destructive" as const,
              onClick: () => setConfirmBulkDelete(true),
            },
          ]}
        />
      )}

      {/* List */}
      {isLoading ? (
        <p className="text-crm-text-muted text-sm py-8 text-center">Loading…</p>
      ) : displayed.length === 0 ? (
        <p className="text-crm-text-muted text-sm py-8 text-center">No inquiries yet.</p>
      ) : (
        <div className="space-y-2">
          {displayed.map((inquiry) => {
            const isExpanded = expandedId === inquiry.id;
            const isNew = inquiry.status === "new";
            const notesValue = editingNotes[inquiry.id] ?? inquiry.notes ?? "";
            const isEditingNotes = inquiry.id in editingNotes;

            return (
              <div
                key={inquiry.id}
                className={`rounded-xl border transition-colors ${
                  isNew
                    ? "border-emerald-800/50 bg-emerald-950/10"
                    : "border-crm-border bg-crm-surface"
                }`}
              >
                {/* Collapsed row */}
                <div className="flex items-start gap-3 p-4">
                  <Checkbox
                    checked={bulk.isSelected(inquiry.id)}
                    onCheckedChange={() => bulk.toggle(inquiry.id)}
                    className="mt-0.5 shrink-0"
                  />

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : inquiry.id)
                    }
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-crm-text text-sm">
                        {inquiry.org_name}
                      </span>
                      <span className="text-crm-text-muted text-xs">
                        · {inquiry.contact_name}
                      </span>

                      {/* Status badge */}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLES[inquiry.status]}`}
                      >
                        {STATUS_LABELS[inquiry.status]}
                      </span>

                      {/* Request type badge */}
                      {inquiry.request_type === "briefing_call" && (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-amber-950 text-amber-400 border-amber-800">
                          <PhoneCall className="h-2.5 w-2.5" />
                          Call request
                        </span>
                      )}
                      {inquiry.request_type === "concept_note" && (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-blue-950 text-blue-400 border-blue-800">
                          <FileText className="h-2.5 w-2.5" />
                          Concept note
                        </span>
                      )}

                      {/* Tier badge */}
                      {inquiry.preferred_tier && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border capitalize ${
                            TIER_BADGE[inquiry.preferred_tier] ??
                            "bg-zinc-800 text-zinc-300 border-zinc-600"
                          }`}
                        >
                          {inquiry.preferred_tier}
                        </span>
                      )}
                    </div>

                    {/* Contact line */}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-crm-text-muted">
                        <Mail className="h-3 w-3" />
                        {inquiry.email}
                      </span>
                      {inquiry.phone && (
                        <span className="flex items-center gap-1 text-xs text-crm-text-muted">
                          <Phone className="h-3 w-3" />
                          {inquiry.phone}
                        </span>
                      )}
                      {inquiry.website && (
                        <a
                          href={inquiry.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                        >
                          <Globe className="h-3 w-3" />
                          {inquiry.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>

                    {/* Programme chips */}
                    {inquiry.programmes.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {inquiry.programmes.map((p) => (
                          <span
                            key={p}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-crm-accent/30 text-crm-text-muted border border-crm-border capitalize"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-crm-text-muted">
                      {format(parseISO(inquiry.created_at), "d MMM yyyy")}
                    </span>
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : inquiry.id)
                      }
                      className="text-crm-text-muted hover:text-crm-text transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(inquiry.id)}
                      className="text-crm-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-crm-border pt-4">
                    {/* Message */}
                    {inquiry.message && (
                      <div>
                        <p className="text-[10px] font-mono text-crm-text-muted mb-1 uppercase tracking-wider">
                          Message
                        </p>
                        <p className="text-sm text-crm-text whitespace-pre-wrap leading-relaxed">
                          {inquiry.message}
                        </p>
                      </div>
                    )}

                    {/* Programmes (expanded readable names) */}
                    {inquiry.programmes.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono text-crm-text-muted mb-1 uppercase tracking-wider">
                          Programmes of interest
                        </p>
                        <p className="text-sm text-crm-text capitalize">
                          {inquiry.programmes.join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Status controls */}
                    <div>
                      <p className="text-[10px] font-mono text-crm-text-muted mb-2 uppercase tracking-wider">
                        Status
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {ALL_STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              patchInquiry.mutate({
                                id: inquiry.id,
                                patch: { status: s },
                              })
                            }
                            className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-colors ${
                              inquiry.status === s
                                ? STATUS_STYLES[s]
                                : "bg-crm-surface text-crm-text-muted border-crm-border hover:border-crm-border-hover"
                            }`}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-mono text-crm-text-muted uppercase tracking-wider">
                          Internal notes
                        </p>
                        {!isEditingNotes && (
                          <button
                            onClick={() =>
                              setEditingNotes((p) => ({
                                ...p,
                                [inquiry.id]: inquiry.notes ?? "",
                              }))
                            }
                            className="flex items-center gap-1 text-[10px] text-crm-text-muted hover:text-crm-text transition-colors"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                        )}
                      </div>

                      {isEditingNotes ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={notesValue}
                            onChange={(e) =>
                              setEditingNotes((p) => ({
                                ...p,
                                [inquiry.id]: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg bg-crm-bg border border-crm-border text-crm-text text-sm px-3 py-2 resize-none focus:outline-none focus:border-crm-accent"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveNotes(inquiry)}
                              disabled={savingNotes[inquiry.id]}
                              className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-crm-accent text-crm-text border border-crm-accent hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              <Check className="h-3 w-3" />
                              {savingNotes[inquiry.id] ? "Saving…" : "Save"}
                            </button>
                            <button
                              onClick={() =>
                                setEditingNotes((p) => {
                                  const n = { ...p };
                                  delete n[inquiry.id];
                                  return n;
                                })
                              }
                              className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-crm-surface text-crm-text-muted border border-crm-border hover:border-crm-border-hover transition-colors"
                            >
                              <X className="h-3 w-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-crm-text-muted italic">
                          {inquiry.notes || "No notes yet."}
                        </p>
                      )}
                    </div>

                    {/* Assignment (super_admin only) */}
                    {isSuperAdmin && (
                      <div>
                        <p className="text-[10px] font-mono text-crm-text-muted mb-1.5 uppercase tracking-wider">
                          Assigned to
                        </p>
                        <select
                          value={inquiry.assigned_to ?? ""}
                          onChange={(e) =>
                            patchInquiry.mutate({
                              id: inquiry.id,
                              patch: { assigned_to: e.target.value || null },
                            })
                          }
                          className="bg-crm-bg border border-crm-border text-crm-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-crm-accent"
                        >
                          <option value="">Unassigned</option>
                          {profiles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.full_name ?? p.email ?? p.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Reply link */}
                    <div className="flex gap-3 pt-1">
                      <a
                        href={buildMailtoLink(inquiry)}
                        className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Compose reply
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete single confirm */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmDeleteId && deleteInquiry.mutate(confirmDeleteId)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirm */}
      <AlertDialog
        open={confirmBulkDelete}
        onOpenChange={(open) => !open && setConfirmBulkDelete(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {bulk.selectedIds.size} enquir
              {bulk.selectedIds.size !== 1 ? "ies" : "y"}?
            </AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDelete.mutate([...bulk.selectedIds])}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
