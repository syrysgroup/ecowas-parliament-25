import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * PageHeaderV2 — refined header for module pages.
 * Slots: meta (count badge / last-updated), quickActions (icon cluster),
 * actions (primary CTAs), tabs (tab strip).
 */
export function PageHeaderV2({
  title,
  description,
  icon: Icon,
  meta,
  quickActions,
  actions,
  tabs,
  breadcrumb,
  className,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  meta?: ReactNode;
  quickActions?: ReactNode;
  actions?: ReactNode;
  tabs?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3">
        {breadcrumb && (
          <div className="text-[11px] text-[hsl(var(--text-3))] font-mono tracking-wide">
            {breadcrumb}
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5 min-w-0">
            {Icon && (
              <div className="h-8 w-8 rounded-md bg-[hsl(var(--surface-3))] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-[hsl(var(--brand-green))]" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] font-semibold text-[hsl(var(--text-1))] tracking-tight leading-tight truncate">
                  {title}
                </h1>
                {meta}
              </div>
              {description && (
                <p className="text-[12.5px] text-[hsl(var(--text-3))] mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {quickActions}
            {actions}
          </div>
        </div>
        {tabs && (
          <div className="border-b border-[hsl(var(--border-subtle))] -mx-6 px-6">
            <div className="flex items-center gap-1 -mb-px">{tabs}</div>
          </div>
        )}
        {!tabs && <div className="h-px bg-[hsl(var(--border-subtle))]" />}
      </div>
      {children}
    </div>
  );
}
