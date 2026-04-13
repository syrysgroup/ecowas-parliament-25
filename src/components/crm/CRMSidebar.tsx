import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { getModulesForRoles, MODULE_GROUPS, type ModuleGroup } from "./crmModules";
import { CRM_ROLE_META } from "./crmRoles";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const STORAGE_KEY = "crm_sidebar_collapsed";

interface CRMSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

function SidebarContent({
  activeSection,
  onNavigate,
  collapsed,
  setCollapsed,
  isMobile,
  onItemClick,
}: {
  activeSection: string;
  onNavigate: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  isMobile: boolean;
  onItemClick?: () => void;
}) {
  const { user, roles, signOut } = useAuthContext();

  const { data: emailUnreadCount = 0 } = useQuery<number>({
    queryKey: ["email-inbox-unread", user?.id],
    queryFn: async () => {
      const acctRes = await (supabase as any)
        .from("email_accounts")
        .select("id")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .single();
      if (!acctRes.data?.id) return 0;
      const { count } = await (supabase as any)
        .from("emails")
        .select("id", { count: "exact", head: true })
        .eq("account_id", acctRes.data.id)
        .eq("folder", "inbox")
        .eq("is_read", false);
      return count ?? 0;
    },
    enabled: !!user?.id,
    refetchInterval: 60_000,
  });

  const visibleModules = getModulesForRoles(roles).filter(m => !m.hideFromSidebar);
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "User";
  const primaryRole = roles[0];
  const roleMeta = primaryRole ? CRM_ROLE_META[primaryRole] : null;

  const grouped = MODULE_GROUPS.map(group => ({
    group,
    modules: visibleModules.filter(m => m.group === group),
  })).filter(g => g.modules.length > 0);

  const handleNav = (section: string) => {
    onNavigate(section);
    onItemClick?.();
  };

  const showLabels = isMobile || !collapsed;

  return (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className={`flex items-center border-b border-crm-border/60 h-16 px-3 ${collapsed && !isMobile ? "justify-center" : "justify-between"}`}>
        {showLabels ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 animate-glow-pulse shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
              <img
                src="/images/logo/logo.png"
                alt="ECOWAS"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-primary-foreground font-black text-xs">EP</span>';
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-foreground block leading-tight truncate">
                ECOWAS CRM
              </span>
              <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
                Parliament 25
              </span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center animate-glow-pulse shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            <img
              src="/images/logo/logo.png"
              alt="EP"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-primary-foreground font-black text-xs">EP</span>';
              }}
            />
          </div>
        )}
        {showLabels && !isMobile && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50"
            title="Collapse sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && !isMobile && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50"
          title="Expand sidebar"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {grouped.map(({ group, modules }, gi) => (
          <div key={group} className={gi > 0 ? "mt-2" : ""}>
            {/* Group header */}
            {showLabels ? (
              <div className={`px-3 pt-3 pb-2 ${gi > 0 ? "mt-1" : ""}`}>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/30" />
                  <span className="text-[8px] font-bold tracking-[0.18em] text-primary/50 uppercase select-none whitespace-nowrap">
                    {group}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/30" />
                </div>
              </div>
            ) : (
              gi > 0 && <div className="mx-3 my-2 h-px bg-primary/20" />
            )}

            <ul className="space-y-0.5 px-2">
              {modules.map((mod, mi) => {
                const isActive = mod.section === activeSection;
                const Icon = mod.icon;
                return (
                  <li
                    key={mod.id}
                    className="animate-stagger-in"
                    style={{ animationDelay: `${(gi * 4 + mi) * 30}ms` }}
                  >
                    <button
                      onClick={() => handleNav(mod.section)}
                      title={collapsed && !isMobile ? mod.label : undefined}
                      className={`
                        relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left
                        transition-all duration-150 ease-out group
                        ${isActive
                          ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-semibold border-l-[3px] border-primary pl-2 shadow-[inset_0_0_12px_hsl(var(--primary)/0.12)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-[3px] border-transparent"
                        }
                        ${collapsed && !isMobile ? "justify-center" : ""}
                      `}
                    >
                      <Icon
                        size={16}
                        className={`flex-shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                          isActive ? "text-primary" : ""
                        }`}
                      />
                      {showLabels && (
                        <span className="text-[12.5px] font-medium truncate flex-1">{mod.label}</span>
                      )}
                      {showLabels && mod.isStub && (
                        <span className="ml-auto text-[8px] font-mono text-muted-foreground bg-muted border border-border rounded px-1 py-0.5 flex-shrink-0">
                          soon
                        </span>
                      )}
                      {/* Email unread badge */}
                      {mod.section === "email-inbox" && emailUnreadCount > 0 && (
                        collapsed && !isMobile ? (
                          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-destructive animate-bounce-in" />
                        ) : showLabels ? (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/15 border border-destructive/30 text-destructive flex-shrink-0 animate-bounce-in">
                            {emailUnreadCount > 99 ? "99+" : emailUnreadCount}
                          </span>
                        ) : null
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className={`border-t border-crm-border/40 p-3 bg-gradient-to-t from-[hsl(152,40%,4%)] to-transparent ${collapsed && !isMobile ? "flex justify-center" : ""}`}>
        {showLabels ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold uppercase ring-2 ring-primary/30 shadow-[0_0_8px_hsl(var(--primary)/0.3)]">
                  {displayName.charAt(0)}
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card animate-pulse-dot" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-foreground truncate">{displayName}</p>
                {roleMeta && (
                  <p className="text-[10px] font-medium text-primary truncate">
                    {roleMeta.label}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={signOut}
            title="Sign out"
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function CRMSidebar({ activeSection, onNavigate }: CRMSidebarProps) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); }
    catch { /* ignore */ }
  }, [collapsed]);

  // Mobile: Sheet drawer
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed top-3 left-3 z-50 p-2 rounded-xl bg-card/90 backdrop-blur-lg border border-border shadow-lg text-foreground hover:bg-muted transition-colors md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-gradient-to-b from-[hsl(152,30%,8%)] via-[hsl(152,25%,6%)] to-[hsl(152,20%,4%)] border-r border-crm-border/40">
          <SidebarContent
            activeSection={activeSection}
            onNavigate={onNavigate}
            collapsed={false}
            setCollapsed={() => {}}
            isMobile
            onItemClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop/Tablet: persistent sidebar
  return (
    <aside
      className={`
        flex flex-col h-screen
        bg-gradient-to-b from-[hsl(152,30%,8%)] via-[hsl(152,25%,6%)] to-[hsl(152,20%,4%)]
        border-r border-crm-border/40
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? "w-[60px]" : "w-[240px]"}
      `}
    >
      <SidebarContent
        activeSection={activeSection}
        onNavigate={onNavigate}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={false}
      />
    </aside>
  );
}

// Export mobile trigger for use in header
export function MobileMenuTrigger({ onOpen }: { onOpen: () => void }) {
  return null; // handled internally via Sheet now
}
