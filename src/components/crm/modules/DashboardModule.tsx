import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Briefcase, TrendingUp, DollarSign, Globe, FileText, Mail } from "lucide-react";

// Lazy load chart components
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

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ label, value, change, positive, icon, iconBg }: StatCardProps) {
  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-xl font-bold text-foreground">{value}</p>
            <span className={`text-[11px] font-semibold ${positive ? "text-emerald-500" : "text-destructive"}`}>
              {change}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardModule({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { isSponsor } = useAuthContext();

  if (isSponsor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
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
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Registrations"
          value="24,983"
          change="+15.6%"
          positive
          icon={<Users className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          label="Active Events"
          value="12"
          change="+3"
          positive
          icon={<Calendar className="h-5 w-5 text-accent-foreground" />}
          iconBg="bg-accent/10"
        />
        <StatCard
          label="Revenue"
          value="$48.5k"
          change="+28.4%"
          positive
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          label="Countries"
          value="15"
          change="+2"
          positive
          icon={<Globe className="h-5 w-5 text-secondary" />}
          iconBg="bg-secondary/10"
        />
      </div>

      {/* Row 2: Revenue chart + Earning reports */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RevenueGrowthChart />
        </div>
        <div className="lg:col-span-2">
          <EarningReportsWithTabs />
        </div>
      </div>

      {/* Row 3: Yearly overview (full width) */}
      <LineAreaYearlySalesChart />

      {/* Row 4: Radar + Distributed bar + Project status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <RadarSalesChart />
        <DistributedBarChart />
        <ProjectStatus />
      </div>

      {/* Row 5: Activity + Countries + Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ActivityTimeline />
        <SalesByCountries />
        <LastTransactions />
      </div>

      {/* Row 6: Active projects (full width) */}
      <ActiveProjects />
    </div>
  );
}
