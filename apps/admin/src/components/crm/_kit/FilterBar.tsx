import { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterChip = {
  key: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  onClear?: () => void;
};

/**
 * FilterBar — sticky toolbar: search (left), filter chips (middle), right slot.
 * All inputs controlled by parent.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  right,
  className,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterChip[];
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-wrap sticky top-0 z-10 py-2 bg-[hsl(var(--surface-1))] border-b border-[hsl(var(--border-subtle))]",
        className,
      )}
    >
      {onSearchChange && (
        <div className="relative flex-1 min-w-[180px] max-w-[280px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--text-3))]" />
          <input
            type="text"
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-8 pl-7 pr-2 text-[12.5px] rounded-md bg-[hsl(var(--surface-2))] border border-[hsl(var(--border-subtle))] text-[hsl(var(--text-1))] placeholder:text-[hsl(var(--text-3))] focus:outline-none focus:border-[hsl(var(--brand-green))]"
          />
        </div>
      )}
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={f.onClick}
              className={cn(
                "inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11.5px] font-medium border transition-colors",
                f.active
                  ? "bg-[hsl(var(--brand-green)/0.12)] text-[hsl(var(--brand-green))] border-[hsl(var(--brand-green)/0.30)]"
                  : "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-2))] border-[hsl(var(--border-subtle))] hover:text-[hsl(var(--text-1))]",
              )}
            >
              {f.label}
              {f.active && f.onClear && (
                <X
                  className="h-3 w-3 opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    f.onClear?.();
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}
