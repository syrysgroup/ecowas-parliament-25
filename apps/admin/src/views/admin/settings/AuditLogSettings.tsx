import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

type AuditRow = {
  id: string;
  action: string;
  performed_by: string | null;
  details: Record<string, any>;
  created_at: string;
};

const PAGE_SIZE = 20;

const AuditLogSettings = () => {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-log", page],
    queryFn: async () => {
      const { data, error, count } = await (supabase as any)
        .from("admin_audit_log")
        .select("*, profiles:performed_by(full_name, email)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: (data ?? []) as AuditRow[], total: count ?? 0 };
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              {["Timestamp", "Action", "Performed By", "Details"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              : data?.rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-muted-foreground text-sm">No audit logs yet.</td>
                  </tr>
                )
              : data?.rows.map((row) => (
                  <tr key={row.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(row.created_at), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{row.action}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {(row as any).profiles?.full_name ?? (row as any).profiles?.email ?? row.performed_by ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-xs">
                      {JSON.stringify(row.details)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{data?.total ?? 0} total entries</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              <ChevronLeft size={13} />
            </Button>
            <span className="text-xs px-2">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogSettings;
