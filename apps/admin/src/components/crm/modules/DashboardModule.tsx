import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users, Calendar, Briefcase, DollarSign, Globe, ArrowRight, TrendingUp,
  Sparkles, Crown, UserPlus, BarChart2, Handshake, CalendarDays,
  ShieldCheck, Settings, CheckSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import RevenueGrowthChart from "@/components/crm/dashboard/RevenueGrowthChart";
import EarningReportsWithTabs from "@/components/crm/dashboard/EarningReportsWithTabs";
import RadarSalesChart from "@/components/crm/dashboard/RadarSalesChart";
import ActivityTimeline from "@/components/crm/dashboard/ActivityTimeline";
import ActiveProjects from "@/components/crm/dashboard/ActiveProjects";
import SalesByCountries from "@/components/crm/dashboard/SalesByCountries";
import LastTransactions from "@/components/crm/dashboard/LastTransactions";
import ProjectStatus from "@/components/crm/dashboard/ProjectStatus";
import LineAreaYearlySalesChart from "@/components/crm/dashboard/LineAreaYearlySalesChart";
import DistributedBarChart from "@/components/crm/dashboard/DistributedBarChart";
import { useAuthContext } from "@/contexts/AuthContext";

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    setCount(0);
  }, [target]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ─── Generic stat card (existing, for non-superadmin) ─────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
  delay: number;
}

function StatCard({ label, value, suffix = "", prefix = "", change, positive, icon, iconBg, delay }: StatCardProps) {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref} className="animate-stagger-in" style={{ animationDelay: `${delay}ms` }}>
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 md:p-5 flex items-center gap-4 relative">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${iconBg}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {prefix}{count.toLocaleString()}{suffix}
              </p>
              <span className={`text-[11px] font-semibold ${positive ? "text-primary" : "text-destructive"}`}>
                {change}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Staggered chart wrapper ──────────────────────────────────────────────────
function StaggeredCard({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${className} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="hover:scale-[1.01] transition-transform duration-200">
        {children}
      </div>
    </div>
  );
}

// ─── Role-aware quick actions ─────────────────────────────────────────────────
function getRoleQuickActions(roles: string[], isSuperAdmin: boolean, isAdmin: boolean) {
  const actions: { label: string; section: string }[] = [];

  if (isSuperAdmin || isAdmin) {
    actions.push({ label: "User Management", section: "people" });
    actions.push({ label: "View Tasks", section: "tasks" });
    actions.push({ label: "Check Email", section: "email-inbox" });
  } else if (roles.includes("finance_coordinator")) {
    actions.push({ label: "Finance", section: "finance" });
    actions.push({ label: "Invoices", section: "invoices" });
    actions.push({ label: "Check Email", section: "email-inbox" });
  } else if (roles.includes("marketing_manager")) {
    actions.push({ label: "Marketing", section: "marketing" });
    actions.push({ label: "Newsletter", section: "newsletter" });
    actions.push({ label: "Analytics", section: "analytics" });
  } else if (roles.includes("programme_lead") || roles.includes("project_director")) {
    actions.push({ label: "View Tasks", section: "tasks" });
    actions.push({ label: "Calendar", section: "calendar" });
    actions.push({ label: "Programme Pillars", section: "programme-pillars" });
  } else if (roles.includes("communications_officer")) {
    actions.push({ label: "News Editor", section: "news-editor" });
    actions.push({ label: "Check Email", section: "email-inbox" });
    actions.push({ label: "Calendar", section: "calendar" });
  } else if (roles.includes("moderator")) {
    actions.push({ label: "Parliament Ops", section: "parliament-ops" });
    actions.push({ label: "View Tasks", section: "tasks" });
    actions.push({ label: "Check Email", section: "email-inbox" });
  } else {
    actions.push({ label: "View Tasks", section: "tasks" });
    actions.push({ label: "Check Email", section: "email-inbox" });
    actions.push({ label: "Calendar", section: "calendar" });
  }

  return actions;
}

// ─── Welcome banner ───────────────────────────────────────────────────────────
function WelcomeBanner({ name, onNavigate, roles, isSuperAdmin, isAdmin }: {
  name: string; onNavigate: (s: string) => void;
  roles: string[]; isSuperAdmin: boolean; isAdmin: boolean;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const quickActions = getRoleQuickActions(roles, isSuperAdmin, isAdmin);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-primary-foreground animate-fade-in">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-24 -translate-x-24 blur-2xl" />
      <Sparkles className="absolute top-4 right-4 w-6 h-6 text-accent/40 animate-pulse" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <img src="/images/logo/logo.png" alt="ECOWAS Parliament Initiatives" className="h-14 md:h-16 object-contain drop-shadow-lg" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div className="h-10 w-px bg-primary-foreground/20 hidden md:block" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider mb-1">{today}</p>
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            {greeting}, {name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-primary-foreground/80 max-w-lg">
            Here's an overview of your workspace. Stay on top of tasks, communications, and key metrics.
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {quickActions.map((btn) => (
              <button
                key={btn.section}
                onClick={() => onNavigate(btn.section)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/25 text-xs font-medium transition-all duration-200 backdrop-blur-sm border border-primary-foreground/10"
              >
                {btn.label}
                <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Live system stat card (super_admin) ──────────────────────────────────────
function SystemStatCard({ label, value, icon: Icon, gradient, textColor }: {
  label: string;
  value: number | null;
  icon: React.ElementType;
  gradient: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-xl p-4 border flex items-center gap-3 ${gradient} hover:shadow-lg transition-all duration-200 group`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-current/10 group-hover:scale-110 transition-transform duration-200 ${textColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className={`text-2xl font-black tabular-nums ${textColor}`}>
          {value === null ? (
            <span className="inline-block w-12 h-7 bg-current/10 rounded animate-pulse align-middle" />
          ) : (
            value.toLocaleString()
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Live dashboard stats hook ────────────────────────────────────────────────
function useDashboardStats(enabled: boolean) {
  return useQuery({
    queryKey: ["crm-dashboard-system-stats"],
    queryFn: async () => {
      const [usersRes, invitesRes, sponsorsRes, tasksRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("invitations").select("id", { count: "exact", head: true }).is("accepted_at", null),
        supabase.from("sponsors").select("id", { count: "exact", head: true }).eq("is_published", true),
        (supabase as any).from("tasks").select("id", { count: "exact", head: true }).neq("status", "done"),
      ]);
      return {
        users:   usersRes.count   ?? 0,
        invites: invitesRes.count ?? 0,
        sponsors: sponsorsRes.count ?? 0,
        tasks:   tasksRes.count   ?? 0,
      };
    },
    enabled,
    staleTime: 60_000,
  });
}

// ─── Super admin overview: live stats + quick-nav grid ───────────────────────
const QUICK_NAV_ITEMS = [
  { label: "Super Admin Hub",    desc: "Users, roles, invitations & system config", section: "super-admin",      icon: Crown,        gradient: "bg-gradient-to-br from-amber-50 to-amber-100/60 border-amber-200 dark:from-amber-950 dark:to-amber-900/40 dark:border-amber-800/60",     iconColor: "text-amber-700 dark:text-amber-400"   },
  { label: "People & Access",    desc: "Manage staff accounts, invite & delete",    section: "people",            icon: UserPlus,     gradient: "bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-200 dark:from-emerald-950 dark:to-emerald-900/40 dark:border-emerald-800/40", iconColor: "text-emerald-700 dark:text-emerald-400" },
  { label: "Analytics",          desc: "Traffic, engagement & programme metrics",   section: "analytics",         icon: BarChart2,    gradient: "bg-gradient-to-br from-blue-50 to-blue-100/60 border-blue-200 dark:from-blue-950 dark:to-blue-900/40 dark:border-blue-800/40",           iconColor: "text-blue-700 dark:text-blue-400"    },
  { label: "Sponsors & Partners",desc: "Sponsor CRUD, tiers & logos",              section: "sponsors-partners", icon: Handshake,    gradient: "bg-gradient-to-br from-violet-50 to-violet-100/60 border-violet-200 dark:from-violet-950 dark:to-violet-900/40 dark:border-violet-800/40", iconColor: "text-violet-700 dark:text-violet-400"  },
  { label: "Finance",            desc: "Budget, income & reconciliation",           section: "finance",           icon: DollarSign,   gradient: "bg-gradient-to-br from-yellow-50 to-yellow-100/60 border-yellow-200 dark:from-yellow-950 dark:to-yellow-900/40 dark:border-yellow-800/40", iconColor: "text-yellow-700 dark:text-yellow-400"  },
  { label: "Events Manager",     desc: "Events, RSVP & attendance",                 section: "events-manager",    icon: CalendarDays, gradient: "bg-gradient-to-br from-sky-50 to-sky-100/60 border-sky-200 dark:from-sky-950 dark:to-sky-900/40 dark:border-sky-800/40",                 iconColor: "text-sky-700 dark:text-sky-400"     },
  { label: "Roles & Permissions",desc: "Role assignments & permission matrix",      section: "roles",             icon: ShieldCheck,  gradient: "bg-gradient-to-br from-red-50 to-red-100/60 border-red-200 dark:from-red-950 dark:to-red-900/40 dark:border-red-800/40",               iconColor: "text-red-700 dark:text-red-400"     },
  { label: "Settings",           desc: "Platform, SMTP, branding & sessions",       section: "settings",          icon: Settings,     gradient: "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200 dark:from-slate-900 dark:to-slate-900/60 dark:border-slate-700/40",        iconColor: "text-slate-600 dark:text-slate-300"   },
] as const;

function SuperAdminSystemOverview({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { data: stats, isLoading } = useDashboardStats(true);

  return (
    <div className="space-y-6">
      {/* Live system stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SystemStatCard
          label="Total Users"
          value={isLoading ? null : (stats?.users ?? 0)}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200 dark:from-emerald-950 dark:to-emerald-900/40 dark:border-emerald-800/60"
          textColor="text-emerald-700 dark:text-emerald-400"
        />
        <SystemStatCard
          label="Pending Invites"
          value={isLoading ? null : (stats?.invites ?? 0)}
          icon={UserPlus}
          gradient="bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200 dark:from-amber-950 dark:to-amber-900/40 dark:border-amber-800/60"
          textColor="text-amber-700 dark:text-amber-400"
        />
        <SystemStatCard
          label="Active Sponsors"
          value={isLoading ? null : (stats?.sponsors ?? 0)}
          icon={Handshake}
          gradient="bg-gradient-to-br from-violet-50 to-violet-100/60 border border-violet-200 dark:from-violet-950 dark:to-violet-900/40 dark:border-violet-800/60"
          textColor="text-violet-700 dark:text-violet-400"
        />
        <SystemStatCard
          label="Open Tasks"
          value={isLoading ? null : (stats?.tasks ?? 0)}
          icon={CheckSquare}
          gradient="bg-gradient-to-br from-sky-50 to-sky-100/60 border border-sky-200 dark:from-sky-950 dark:to-sky-900/40 dark:border-sky-800/60"
          textColor="text-sky-700 dark:text-sky-400"
        />
      </div>

      {/* Quick navigation grid */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Navigation</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.section}
                onClick={() => onNavigate(item.section)}
                className={`group flex flex-col items-start p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg text-left ${item.gradient}`}
              >
                <div className={`w-9 h-9 rounded-lg bg-current/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 ${item.iconColor}`}>
                  <Icon size={16} />
                </div>
                <p className="text-[12.5px] font-semibold text-foreground leading-tight">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardModule({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { user, isSponsor, isSuperAdmin, isAdmin, roles } = useAuthContext();
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "User";

  if (isSponsor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 animate-fade-in">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Welcome to your Sponsor Portal</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Use Sponsor Metrics to view your visibility reports and engagement data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Welcome banner */}
      <WelcomeBanner name={displayName} onNavigate={onNavigate} roles={roles} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} />

      {/* Super admin: live system stats + quick-nav grid */}
      {isSuperAdmin ? (
        <SuperAdminSystemOverview onNavigate={onNavigate} />
      ) : (
        /* Other staff roles: existing presentational stat cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Registrations"
            value={24983}
            change="+15.6%"
            positive
            icon={<Users className="h-5 w-5 text-primary-foreground" />}
            iconBg="bg-primary"
            delay={0}
          />
          <StatCard
            label="Active Events"
            value={12}
            change="+3"
            positive
            icon={<Calendar className="h-5 w-5 text-accent-foreground" />}
            iconBg="bg-accent"
            delay={80}
          />
          <StatCard
            label="Revenue"
            value={48500}
            prefix="$"
            change="+28.4%"
            positive
            icon={<DollarSign className="h-5 w-5 text-primary-foreground" />}
            iconBg="bg-primary/80"
            delay={160}
          />
          <StatCard
            label="Countries"
            value={15}
            change="+2"
            positive
            icon={<Globe className="h-5 w-5 text-secondary-foreground" />}
            iconBg="bg-secondary"
            delay={240}
          />
        </div>
      )}

      {/* Charts section — shown to all staff roles */}

      {/* Row 2: Revenue chart + Earning reports */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <StaggeredCard delay={0} className="lg:col-span-3">
          <RevenueGrowthChart />
        </StaggeredCard>
        <StaggeredCard delay={100} className="lg:col-span-2">
          <EarningReportsWithTabs />
        </StaggeredCard>
      </div>

      {/* Row 3: Yearly overview */}
      <StaggeredCard delay={0}>
        <LineAreaYearlySalesChart />
      </StaggeredCard>

      {/* Row 4: Radar + Distributed bar + Project status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StaggeredCard delay={0}>
          <RadarSalesChart />
        </StaggeredCard>
        <StaggeredCard delay={100}>
          <DistributedBarChart />
        </StaggeredCard>
        <StaggeredCard delay={200}>
          <ProjectStatus />
        </StaggeredCard>
      </div>

      {/* Row 5: Activity + Countries + Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StaggeredCard delay={0}>
          <ActivityTimeline />
        </StaggeredCard>
        <StaggeredCard delay={100}>
          <SalesByCountries />
        </StaggeredCard>
        <StaggeredCard delay={200}>
          <LastTransactions />
        </StaggeredCard>
      </div>

      {/* Row 6: Active projects */}
      <StaggeredCard delay={0}>
        <ActiveProjects />
      </StaggeredCard>
    </div>
  );
}
