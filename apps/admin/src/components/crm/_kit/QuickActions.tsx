import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type QuickAction = {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
};

export function QuickActions({
  items,
  className,
}: {
  items: QuickAction[];
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={250}>
      <div className={cn("flex items-center gap-0.5", className)}>
        {items.map((a) => (
          <Tooltip key={a.key}>
            <TooltipTrigger asChild>
              <button
                onClick={a.onClick}
                disabled={a.disabled}
                aria-label={a.label}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-[hsl(var(--text-2))] hover:text-[hsl(var(--text-1))] hover:bg-[hsl(var(--surface-3))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <a.icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[11px]">
              {a.label}
              {a.shortcut && (
                <span className="ml-2 font-mono text-[10px] opacity-70">{a.shortcut}</span>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
