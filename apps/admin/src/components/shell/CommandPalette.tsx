import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { CRM_MODULES, MODULE_GROUPS, getModulesForRoles } from "@/components/crm/crmModules";
import { useAuthContext } from "@/contexts/AuthContext";

export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { roles } = useAuthContext();
  const navigate = useNavigate();
  const modules = getModulesForRoles(roles);

  const go = (section: string) => {
    onOpenChange(false);
    navigate(section === "" ? "/" : `/${section}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to a module, search records, run an action…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        {MODULE_GROUPS.map(group => {
          const items = modules.filter(m => m.group === group && !m.hideFromSidebar);
          if (items.length === 0) return null;
          return (
            <CommandGroup key={group} heading={group}>
              {items.map(m => {
                const Icon = m.icon;
                return (
                  <CommandItem
                    key={m.id}
                    value={`${m.label} ${m.group}`}
                    onSelect={() => go(m.section)}
                  >
                    <Icon className="h-4 w-4 mr-2 text-[hsl(var(--text-3))]" />
                    <span>{m.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("people")}>Invite a user…</CommandItem>
          <CommandItem onSelect={() => go("news-editor")}>New news article</CommandItem>
          <CommandItem onSelect={() => go("events-manager")}>Create event</CommandItem>
          <CommandItem onSelect={() => go("newsletter")}>Send newsletter</CommandItem>
          <CommandItem onSelect={() => go("settings")}>Open settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}