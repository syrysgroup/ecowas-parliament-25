import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ThemeToggleProps {
  /** "icon" = single button cycling through themes (default)
   *  "full" = three-way pill (system / light / dark) */
  variant?: "icon" | "full";
  /** Extra class names on the wrapper */
  className?: string;
}

export default function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!mounted) return null;

  if (variant === "full") {
    const options: { value: string; icon: React.ElementType; label: string }[] = [
      { value: "system",  icon: Monitor, label: "System" },
      { value: "light",   icon: Sun,     label: "Light"  },
      { value: "dark",    icon: Moon,    label: "Dark"   },
    ];
    const current = options.find(o => o.value === theme) ?? options[0];
    const CurrentIcon = current.icon;

    return (
      <div ref={ref} className={`${className}`}>
        {isOpen ? (
          <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-lg p-0.5">
            {options.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                title={label}
                onClick={() => { setTheme(value); setIsOpen(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  theme === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-lg p-0.5">
            <button
              title="Change theme"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors bg-background text-foreground shadow-sm"
            >
              <CurrentIcon size={13} />
              <span className="hidden sm:inline">{current.label}</span>
              <ChevronDown size={11} className="opacity-50" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Single cycling icon button
  const isDark = resolvedTheme === "dark";
  return (
    <button
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex items-center justify-center w-9 h-9 rounded-md border border-border text-foreground/70 hover:text-foreground hover:bg-muted transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
