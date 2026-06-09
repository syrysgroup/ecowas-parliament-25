import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyStateV2({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  illustration,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  illustration?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-2))]",
        className,
      )}
    >
      {illustration ?? (Icon && (
        <div className="h-12 w-12 rounded-xl bg-[hsl(var(--surface-3))] flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-[hsl(var(--text-3))]" />
        </div>
      ))}
      <h3 className="text-[14px] font-semibold text-[hsl(var(--text-1))]">{title}</h3>
      {description && (
        <p className="text-[12.5px] text-[hsl(var(--text-3))] mt-1 max-w-sm">{description}</p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-4 flex items-center gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
