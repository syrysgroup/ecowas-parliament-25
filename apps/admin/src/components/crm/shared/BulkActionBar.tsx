import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  children: ReactNode;
  label?: string;
}

/** Sticky action bar shown when one or more rows are selected.
 *  Slot bulk action buttons into `children` (e.g. Delete, Publish). */
export function BulkActionBar({ count, onClear, children, label = "selected" }: BulkActionBarProps) {
  if (count === 0) return null;
  return (
    <div className="sticky bottom-4 z-30 mx-auto flex w-fit items-center gap-3 rounded-full border bg-background/95 px-4 py-2 shadow-lg backdrop-blur">
      <span className="text-sm font-medium">
        {count} {label}
      </span>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2">{children}</div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onClear}
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
