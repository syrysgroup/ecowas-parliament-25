import React from "react";
import { CRM_MODULES } from "../crmModules";
import { NotificationBell } from "../CRMNotifications";
import CRMAvatar from "../CRMAvatar";
import { useAuthContext } from "@/contexts/AuthContext";

interface MobileTopBarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function MobileTopBar({ activeSection, onNavigate }: MobileTopBarProps) {
  const { user } = useAuthContext();
  const activeModule = CRM_MODULES.find(m => m.section === activeSection);
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "User";

  return (
    <header className="h-14 flex items-center px-4 gap-3 flex-shrink-0 bg-crm-card/95 backdrop-blur-md border-b border-crm-border/50">
      {/* Logo mark */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white shadow-sm border border-black/8 flex items-center justify-center overflow-hidden">
        <img
          src="/images/logo/logo.png"
          alt="EP"
          className="w-6 h-6 object-contain"
          onError={e => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            el.parentElement!.innerHTML = '<span style="color:hsl(152 100% 26%)" class="font-black text-xs">EP</span>';
          }}
        />
      </div>

      {/* Active module label */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-crm-text truncate leading-tight">
          {activeModule?.label ?? "Dashboard"}
        </p>
        <p className="text-[9px] font-mono text-crm-text-dim tracking-widest uppercase leading-tight">
          ECOWAS · CRM
        </p>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <NotificationBell onNavigate={onNavigate} />
        <button
          onClick={() => onNavigate("profile")}
          className="flex items-center justify-center w-8 h-8 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Profile"
        >
          <CRMAvatar
            src={user?.user_metadata?.avatar_url}
            name={displayName}
            size="sm"
            status="online"
          />
        </button>
      </div>
    </header>
  );
}
