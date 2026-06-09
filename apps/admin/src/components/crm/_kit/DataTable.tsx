import { ReactNode, useCallback } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyStateV2 } from "./EmptyStateV2";

export type Column<T> = {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  width?: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
};

export type SortState = { key: string; dir: "asc" | "desc" } | null;

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  empty?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  sort?: SortState;
  onSortChange?: (s: SortState) => void;
  density?: "comfortable" | "compact";
  className?: string;
  rowActions?: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading,
  empty,
  emptyTitle = "No results",
  emptyDescription,
  sort,
  onSortChange,
  density = "comfortable",
  className,
  rowActions,
}: DataTableProps<T>) {
  const padY = density === "compact" ? "py-1.5" : "py-2.5";

  const toggleSort = useCallback(
    (key: string) => {
      if (!onSortChange) return;
      if (!sort || sort.key !== key) onSortChange({ key, dir: "asc" });
      else if (sort.dir === "asc") onSortChange({ key, dir: "desc" });
      else onSortChange(null);
    },
    [sort, onSortChange],
  );

  if (loading) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-1))] p-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 rounded bg-[hsl(var(--surface-3))] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return empty ?? <EmptyStateV2 title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn("rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-1))] overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-2))]">
              {columns.map((c) => {
                const isSorted = sort?.key === c.key;
                const SortIcon = !c.sortable
                  ? null
                  : !isSorted
                    ? ChevronsUpDown
                    : sort?.dir === "asc"
                      ? ChevronUp
                      : ChevronDown;
                return (
                  <th
                    key={c.key}
                    style={c.width ? { width: c.width } : undefined}
                    className={cn(
                      "px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--text-3))]",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      !c.align && "text-left",
                      c.sortable && "cursor-pointer select-none hover:text-[hsl(var(--text-1))]",
                      c.className,
                    )}
                    onClick={c.sortable ? () => toggleSort(c.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.header}
                      {SortIcon && <SortIcon className="h-3 w-3 opacity-70" />}
                    </span>
                  </th>
                );
              })}
              {rowActions && <th className="w-px" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-[hsl(var(--border-subtle))] last:border-b-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-[hsl(var(--surface-2))]",
                  i % 2 === 1 && "bg-[hsl(var(--surface-1))]",
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 text-[hsl(var(--text-1))]",
                      padY,
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      c.className,
                    )}
                  >
                    {c.render ? c.render(row) : (row as any)[c.key]}
                  </td>
                ))}
                {rowActions && (
                  <td
                    className={cn("px-3 text-right", padY)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {rowActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
