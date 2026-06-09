import { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  tabs,
  footer,
  width = 520,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  tabs?: ReactNode;
  footer?: ReactNode;
  width?: 420 | 520 | 640;
  children: ReactNode;
}) {
  const widthClass =
    width === 420
      ? "sm:max-w-[420px]"
      : width === 640
        ? "sm:max-w-[640px]"
        : "sm:max-w-[520px]";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "p-0 bg-[hsl(var(--surface-1))] border-l border-[hsl(var(--border-subtle))] text-[hsl(var(--text-1))] flex flex-col",
          widthClass,
        )}
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-[hsl(var(--border-subtle))] space-y-1 text-left">
          <SheetTitle className="text-[15px] font-semibold text-[hsl(var(--text-1))]">
            {title}
          </SheetTitle>
          {subtitle && (
            <div className="text-[12px] text-[hsl(var(--text-3))]">{subtitle}</div>
          )}
          {tabs && <div className="pt-3 -mb-3 flex items-center gap-1">{tabs}</div>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-[hsl(var(--border-subtle))] flex items-center justify-end gap-2 bg-[hsl(var(--surface-2))]">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
