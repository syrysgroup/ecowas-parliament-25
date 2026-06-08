import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { Mail, Users, UserMinus, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { BulkActionBar } from "@/components/crm/shared/BulkActionBar";
import { useToast } from "@/hooks/use-toast";

interface Subscriber {
  id: string; email: string; subscribed_at: string; unsubscribed_at: string | null;
}

export default function NewsletterModule() {
  const { isAdmin } = useAuthContext();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");

  const { data: subscribers = [], isLoading } = useQuery<Subscriber[]>({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data } = await supabase.from("newsletter_subscribers")
        .select("*").order("subscribed_at", { ascending: false });
      return data ?? [];
    },
  });

  const unsubscribe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["newsletter-subscribers"] }),
  });

  const resubscribe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["newsletter-subscribers"] }),
  });

  const deleteSubscriber = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      setConfirmDeleteId(null);
    },
  });

  const active      = subscribers.filter(s => !s.unsubscribed_at);
  const unsubscribed = subscribers.filter(s => s.unsubscribed_at);

  const displayed = filter === "active"
    ? active
    : filter === "unsubscribed"
    ? unsubscribed
    : subscribers;

  const bulk = useBulkSelection(displayed);

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("newsletter_subscribers").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      qc.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      bulk.reset();
      setConfirmBulkDelete(false);
      toast({ title: `Deleted ${ids.length} subscriber${ids.length !== 1 ? "s" : ""}` });
    },
    onError: (e: any) => toast({ title: "Bulk delete failed", description: e.message, variant: "destructive" }),
  });

  const bulkUnsubscribe = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("newsletter_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      qc.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      bulk.reset();
      toast({ title: `Unsubscribed ${ids.length} subscriber${ids.length !== 1 ? "s" : ""}` });
    },
  });

  const bulkResubscribe = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("newsletter_subscribers")
        .update({ unsubscribed_at: null }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      qc.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      bulk.reset();
      toast({ title: `Re-subscribed ${ids.length} subscriber${ids.length !== 1 ? "s" : ""}` });
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-crm-text">Newsletter Subscribers</h2>
          <p className="text-[12px] text-crm-text-muted mt-0.5">{active.length} active · {unsubscribed.length} unsubscribed</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([["all", "All", subscribers.length], ["active", "Active", active.length], ["unsubscribed", "Unsubscribed", unsubscribed.length]] as [string, string, number][]).map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => { setFilter(val as typeof filter); bulk.reset(); }}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
              filter === val
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : "bg-crm-surface text-crm-text-muted border-crm-border hover:border-crm-border-hover"
            }`}
          >
            {label}: {count}
          </button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>}

      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
        {displayed.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-6 w-6 text-crm-text-dim mb-2" />
            <p className="text-sm text-crm-text-muted">No subscribers in this view.</p>
          </div>
        ) : (
          <>
            {isAdmin && (
              <div className="flex items-center gap-3 px-4 py-2 border-b border-crm-border bg-crm-surface/50">
                <Checkbox
                  checked={bulk.allSelected ? true : bulk.someSelected ? "indeterminate" : false}
                  onCheckedChange={() => bulk.toggleAll()}
                  className="border-crm-border"
                  aria-label="Select all"
                />
                <span className="text-[10px] font-mono uppercase text-crm-text-dim">
                  {bulk.selectedCount > 0 ? `${bulk.selectedCount} selected` : "Select all"}
                </span>
              </div>
            )}
            <div className="divide-y divide-crm-border">
              {displayed.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  {isAdmin && (
                    <Checkbox
                      checked={bulk.isSelected(s.id)}
                      onCheckedChange={() => bulk.toggle(s.id)}
                      className="border-crm-border"
                      aria-label={`Select ${s.email}`}
                    />
                  )}
                  <Mail size={13} className={s.unsubscribed_at ? "text-crm-text-faint" : "text-emerald-400"} />
                  <span className={`text-[12px] flex-1 min-w-0 truncate ${s.unsubscribed_at ? "text-crm-text-faint line-through" : "text-crm-text"}`}>
                    {s.email}
                  </span>
                  <span className="text-[10px] text-crm-text-dim shrink-0">{format(parseISO(s.subscribed_at), "d MMM yyyy")}</span>
                  {s.unsubscribed_at && (
                    <span className="text-[9px] font-mono text-red-400 bg-red-950 border border-red-800 rounded px-1.5 py-0.5 shrink-0">Unsub</span>
                  )}
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      {s.unsubscribed_at ? (
                        <button
                          title="Re-subscribe"
                          onClick={() => resubscribe.mutate(s.id)}
                          className="w-6 h-6 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-emerald-400 hover:bg-emerald-950 transition-colors"
                        >
                          <UserCheck size={11} />
                        </button>
                      ) : (
                        <button
                          title="Unsubscribe"
                          onClick={() => unsubscribe.mutate(s.id)}
                          className="w-6 h-6 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-amber-400 transition-colors"
                        >
                          <UserMinus size={11} />
                        </button>
                      )}
                      {confirmDeleteId === s.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteSubscriber.mutate(s.id)} className="text-[9px] text-red-400 bg-red-950 border border-red-800 rounded px-1.5 py-1">Yes</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-[9px] text-crm-text-dim bg-crm-surface border border-crm-border rounded px-1.5 py-1">No</button>
                        </div>
                      ) : (
                        <button
                          title="Delete permanently"
                          onClick={() => setConfirmDeleteId(s.id)}
                          className="w-6 h-6 rounded flex items-center justify-center bg-crm-surface border border-crm-border text-crm-text-dim hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {isAdmin && (
        <BulkActionBar count={bulk.selectedCount} onClear={bulk.reset}>
          <Button size="sm" variant="outline"
            onClick={() => bulkUnsubscribe.mutate(bulk.selectedIds)}
            disabled={bulkUnsubscribe.isPending}
            className="h-7 text-xs gap-1 border-amber-800 text-amber-400 hover:bg-amber-950">
            <UserMinus size={11} /> Unsubscribe
          </Button>
          <Button size="sm" variant="outline"
            onClick={() => bulkResubscribe.mutate(bulk.selectedIds)}
            disabled={bulkResubscribe.isPending}
            className="h-7 text-xs gap-1 border-emerald-800 text-emerald-400 hover:bg-emerald-950">
            <UserCheck size={11} /> Re-subscribe
          </Button>
          <Button size="sm" variant="destructive"
            onClick={() => setConfirmBulkDelete(true)}
            disabled={bulkDelete.isPending}
            className="h-7 text-xs gap-1">
            <Trash2 size={11} /> Delete
          </Button>
        </BulkActionBar>
      )}

      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent className="bg-crm-card border-crm-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-crm-text text-sm">Delete {bulk.selectedCount} subscriber{bulk.selectedCount !== 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription className="text-crm-text-muted text-xs">
              This permanently removes the selected subscriber{bulk.selectedCount !== 1 ? "s" : ""} from the newsletter list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-crm-border text-crm-text text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDelete.mutate(bulk.selectedIds)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
