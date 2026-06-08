import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * ModulePage — consistent header + tab strip wrapper for every CRM module.
 * Use instead of bare PageHeader when a module has tabs or breadcrumbs.
 */
export function ModulePage({
  title,
  description,
  icon: Icon,
  actions,
  tabs,
  breadcrumb,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
  tabs?: ReactNode;
  breadcrumb?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {breadcrumb && (
          <div className="text-[11px] text-[hsl(var(--text-3))] font-mono tracking-wide">{breadcrumb}</div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5 min-w-0">
            {Icon && (
              <div className="h-8 w-8 rounded-md bg-[hsl(var(--surface-3))] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-[hsl(var(--brand-green))]" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-[20px] font-semibold text-[hsl(var(--text-1))] tracking-tight leading-tight truncate">
                {title}
              </h1>
              {description && (
                <p className="text-[12.5px] text-[hsl(var(--text-3))] mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
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

/** Tab button used inside ModulePage's `tabs` slot. */
export function ModuleTab({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 h-9 text-[13px] font-medium border-b-2 transition-colors",
        active
          ? "border-[hsl(var(--brand-green))] text-[hsl(var(--text-1))]"
          : "border-transparent text-[hsl(var(--text-3))] hover:text-[hsl(var(--text-1))]",
      )}
    >
      {children}
    </button>
  );
}

/** Status pill — single-source semantics across modules. */
export function StatusPill({
  tone = "default", children,
}: {
  tone?: "default" | "success" | "warn" | "danger" | "info" | "brand";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    default: "bg-[hsl(var(--surface-3))] text-[hsl(var(--text-2))] border-[hsl(var(--border-subtle))]",
    success: "bg-[hsl(var(--brand-green)/0.12)] text-[hsl(var(--brand-green))] border-[hsl(var(--brand-green)/0.30)]",
    warn:    "bg-[hsl(var(--brand-yellow)/0.12)] text-[hsl(var(--brand-yellow))] border-[hsl(var(--brand-yellow)/0.30)]",
    danger:  "bg-[hsl(var(--brand-red)/0.12)] text-[hsl(var(--brand-red))] border-[hsl(var(--brand-red)/0.30)]",
    info:    "bg-blue-500/10 text-blue-400 border-blue-500/30",
    brand:   "bg-[hsl(var(--brand-green)/0.12)] text-[hsl(var(--brand-green))] border-[hsl(var(--brand-green)/0.30)]",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10.5px] font-medium border tracking-wide",
      tones[tone],
    )}>
      {children}
    </span>
  );
}


export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-[hsl(var(--border-subtle))]">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-[hsl(var(--surface-3))] flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-[hsl(var(--brand-green))]" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold text-[hsl(var(--text-1))] tracking-tight leading-tight truncate">
            {title}
          </h1>
          {description && (
            <p className="text-[13px] text-[hsl(var(--text-3))] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-2))]">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--surface-3))] flex items-center justify-center mb-4">
          <Icon className="h-7 w-7 text-[hsl(var(--text-3))]" />
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-[hsl(var(--text-1))]">{title}</h3>
      {description && (
        <p className="text-[13px] text-[hsl(var(--text-3))] mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[hsl(var(--surface-1))] border border-[hsl(var(--border-subtle))] shadow-[var(--shadow-elev-1)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "brand" | "warn" | "danger";
}) {
  const tones = {
    default: "text-[hsl(var(--text-2))] bg-[hsl(var(--surface-3))]",
    brand: "text-[hsl(var(--brand-green))] bg-[hsl(var(--brand-green)/0.12)]",
    warn: "text-[hsl(var(--brand-yellow))] bg-[hsl(var(--brand-yellow)/0.15)]",
    danger: "text-[hsl(var(--brand-red))] bg-[hsl(var(--brand-red)/0.12)]",
  } as const;
  return (
    <Surface className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[hsl(var(--text-3))]">
            {label}
          </p>
          <p className="text-[26px] font-bold text-[hsl(var(--text-1))] mt-2 leading-none">
            {value}
          </p>
          {delta && <p className="text-[12px] text-[hsl(var(--text-3))] mt-2">{delta}</p>}
        </div>
        {Icon && (
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Surface>
  );
}