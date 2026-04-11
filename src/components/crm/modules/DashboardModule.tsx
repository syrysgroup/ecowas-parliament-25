import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Briefcase, DollarSign, Globe, ArrowRight, TrendingUp, Sparkles } from "lucide-react";

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

// ─── Stat card ────────────────────────────────────────────────────────────────
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
    <div
      ref={ref}
      className="animate-stagger-in"
      style={{ animationDelay: `${delay}ms` }}
    >
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

// ─── Welcome banner ───────────────────────────────────────────────────────────
function WelcomeBanner({ name, onNavigate }: { name: string; onNavigate: (s: string) => void }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-primary-foreground animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-24 -translate-x-24 blur-2xl" />
      <Sparkles className="absolute top-4 right-4 w-6 h-6 text-accent/40 animate-pulse" />

      <div className="relative z-10">
        <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider mb-1">{today}</p>
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          {greeting}, {name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-primary-foreground/80 max-w-lg">
          Here's an overview of your workspace. Stay on top of tasks, communications, and key metrics.
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: "View Tasks", section: "tasks" },
            { label: "Check Email", section: "email-inbox" },
            { label: "Calendar", section: "calendar" },
          ].map((btn) => (
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
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardModule({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { user, isSponsor } = useAuthContext();
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
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome banner */}
      <WelcomeBanner name={displayName} onNavigate={onNavigate} />

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Registrations"
          value={24983}
          change="+15.6%"
          positive
          icon={<Users className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          delay={0}
        />
        <StatCard
          label="Active Events"
          value={12}
          change="+3"
          positive
          icon={<Calendar className="h-5 w-5 text-accent-foreground" />}
          iconBg="bg-accent/15"
          delay={80}
        />
        <StatCard
          label="Revenue"
          value={48500}
          prefix="$"
          change="+28.4%"
          positive
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          delay={160}
        />
        <StatCard
          label="Countries"
          value={15}
          change="+2"
          positive
          icon={<Globe className="h-5 w-5 text-secondary" />}
          iconBg="bg-secondary/10"
          delay={240}
        />
      </div>

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
