import { ReactNode } from "react";
import ModuleSidebar from "./ModuleSidebar";
import TopBar from "./TopBar";
import CommandPalette, { useCommandPalette } from "./CommandPalette";
import { CRM_MODULES } from "@/components/crm/crmModules";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileCRMLayout from "@/components/crm/mobile/MobileCRMLayout";

export default function AppShell({
  activeSection,
  onNavigate,
  children,
}: {
  activeSection: string;
  onNavigate: (s: string) => void;
  children: ReactNode;
}) {
  const isMobile = useIsMobile();
  const palette = useCommandPalette();
  const active = CRM_MODULES.find(m => m.section === activeSection);

  if (isMobile) {
    return <MobileCRMLayout activeSection={activeSection} onNavigate={onNavigate}>{children}</MobileCRMLayout>;
  }

  return (
    <div className="flex h-screen bg-[hsl(var(--surface-2))] text-[hsl(var(--text-1))] overflow-hidden">
      <ModuleSidebar activeSection={activeSection} onNavigate={onNavigate} />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="h-[3px] flex-shrink-0" style={{ backgroundImage: "var(--gradient-brand)" }} />
        <TopBar
          moduleLabel={active?.label ?? "Dashboard"}
          moduleIcon={active?.icon}
          onNavigate={onNavigate}
          onOpenPalette={() => palette.setOpen(true)}
        />
        <main className="flex-1 overflow-y-auto crm-scroll px-6 py-6 bg-[hsl(var(--surface-2))]">
          <div className="max-w-[1600px] mx-auto w-full animate-fade-in">{children}</div>
        </main>
      </div>
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
    </div>
  );
}