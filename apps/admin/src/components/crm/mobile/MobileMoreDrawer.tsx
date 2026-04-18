import React from "react";
import { X, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import type { AppRole } from "@/contexts/AuthContext";
import { getModulesForRoles, MODULE_GROUPS } from "../crmModules";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

interface MobileMoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  roles: AppRole[];
  onSignOut: () => void;
}

const PRIMARY_SECTIONS = new Set(["", "comms", "tasks", "team", "email-inbox", "calendar", "documents"]);

export default function MobileMoreDrawer({
  open, onOpenChange, activeSection, onNavigate, roles, onSignOut,
}: MobileMoreDrawerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const allModules = getModulesForRoles(roles).filter(m => !m.hideFromSidebar);
  const moreModules = allModules.filter(m => !PRIMARY_SECTIONS.has(m.section));

  const grouped = MODULE_GROUPS.map(group => ({
    group,
    modules: moreModules.filter(m => m.group === group),
  })).filter(g => g.modules.length > 0);

  const handleNavigate = (section: string) => {
    onNavigate(section);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="bg-crm-card border-crm-border max-h-[88vh] flex flex-col">
        {/* Custom handle */}
        <div className="mx-auto mt-2 mb-1 w-10 h-1 rounded-full bg-crm-border flex-shrink-0" />

        {/* Header */}
        <DrawerHeader className="px-4 pt-1 pb-2 border-b border-crm-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-[15px] font-bold text-crm-text">All Modules</DrawerTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-1.5 rounded-lg text-crm-text-dim hover:text-crm-text hover:bg-crm-surface transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <DrawerClose className="p-1.5 rounded-lg text-crm-text-dim hover:text-crm-text hover:bg-crm-surface transition-colors">
                <X size={15} />
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        {/* Scrollable module list */}
        <div className="flex-1 overflow-y-auto py-2 overscroll-contain">
          {grouped.map(({ group, modules }) => (
            <div key={group} className="mb-2">
              {/* Group label */}
              <div className="px-4 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(var(--ecowas-green)/0.25)] to-transparent" />
                  <span className="text-[9px] font-bold tracking-[0.18em] text-[hsl(var(--ecowas-green)/0.65)] uppercase whitespace-nowrap">
                    {group}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[hsl(var(--ecowas-green)/0.25)] to-transparent" />
                </div>
              </div>

              {/* 2-column module grid */}
              <div className="grid grid-cols-2 gap-1 px-3">
                {modules.map(mod => {
                  const isActive = mod.section === activeSection;
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => handleNavigate(mod.section)}
                      className={`
                        flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left min-h-[48px]
                        transition-all duration-150 active:scale-95
                        ${isActive
                          ? "bg-[hsl(var(--ecowas-green)/0.12)] text-[hsl(var(--ecowas-green))] font-semibold border border-[hsl(var(--ecowas-green)/0.25)]"
                          : "text-crm-text-muted hover:bg-crm-surface hover:text-crm-text border border-transparent"
                        }
                      `}
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      <span className="text-[12px] font-medium truncate">{mod.label}</span>
                      {mod.isStub && (
                        <span className="ml-auto text-[7px] font-mono text-crm-text-faint bg-crm-surface border border-crm-border rounded px-1 flex-shrink-0">
                          soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t border-crm-border/50 pt-3 pb-2 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => handleNavigate("profile")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-crm-surface text-crm-text-muted text-[12px] font-medium min-h-[48px] transition-colors hover:bg-crm-border active:scale-95"
            >
              <User size={15} />
              Profile
            </button>
            <button
              onClick={() => { onOpenChange(false); onSignOut(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-red-400 text-[12px] font-medium min-h-[48px] transition-colors hover:bg-destructive/20 active:scale-95"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
