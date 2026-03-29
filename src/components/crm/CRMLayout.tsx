import { ReactNode } from "react";
import CRMSidebar from "./CRMSidebar";
import { CRM_MODULES } from "./crmModules";

interface CRMLayoutProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  children: ReactNode;
}

export default function CRMLayout({ activeSection, onNavigate, children }: CRMLayoutProps) {
  const activeModule = CRM_MODULES.find(m => m.section === activeSection);
  const moduleLabel = activeModule?.label ?? "Dashboard";

  return (
    <div className="flex h-screen bg-[#0a0f0d] text-[#e8f5e9] overflow-hidden">
      <CRMSidebar activeSection={activeSection} onNavigate={onNavigate} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-[#1e2d22] flex items-center px-6 gap-3 flex-shrink-0 bg-[#080d0a]">
          <span className="text-[10px] font-mono text-[#4a6650] tracking-widest uppercase">
            ECOWAS Parliament 25
          </span>
          <span className="text-[#1e2d22]">/</span>
          <span className="text-[13px] font-semibold text-[#c8e0cc]">{moduleLabel}</span>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
