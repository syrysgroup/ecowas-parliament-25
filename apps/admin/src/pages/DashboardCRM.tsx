import { CreditCard, DollarSign } from "lucide-react";
import DistributedBarChartOrder from "@/views/dashboards/crm/DistributedBarChartOrder";
import LineAreaYearlySalesChart from "@/views/dashboards/crm/LineAreaYearlySalesChart";
import BarChartRevenueGrowth from "@/views/dashboards/crm/BarChartRevenueGrowth";
import EarningReportsWithTabs from "@/views/dashboards/crm/EarningReportsWithTabs";
import RadarSalesChart from "@/views/dashboards/crm/RadarSalesChart";
import SalesByCountries from "@/views/dashboards/crm/SalesByCountries";
import ProjectStatus from "@/views/dashboards/crm/ProjectStatus";
import ActiveProjects from "@/views/dashboards/crm/ActiveProjects";
import LastTransaction from "@/views/dashboards/crm/LastTransaction";
import ActivityTimeline from "@/views/dashboards/crm/ActivityTimeline";
import CustomerStats from "@/components/card-statistics/CustomerStats";

const DashboardCRM = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">CRM Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Top stat cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <DistributedBarChartOrder />
          <LineAreaYearlySalesChart />
          <CustomerStats
            title="Total Profit"
            subtitle="Last Week"
            stats="1.28k"
            icon={CreditCard}
            chipText="-12.2%"
            chipVariant="negative"
          />
          <CustomerStats
            title="Total Sales"
            subtitle="Last Week"
            stats="24.67k"
            icon={DollarSign}
            chipText="+24.67%"
            chipVariant="positive"
          />
          <div className="col-span-2">
            <BarChartRevenueGrowth />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Earning Reports — wide */}
          <div className="lg:col-span-8">
            <EarningReportsWithTabs />
          </div>
          {/* Radar */}
          <div className="lg:col-span-4">
            <RadarSalesChart />
          </div>

          {/* Row 2 */}
          <div className="lg:col-span-4">
            <SalesByCountries />
          </div>
          <div className="lg:col-span-4">
            <ProjectStatus />
          </div>
          <div className="lg:col-span-4">
            <ActiveProjects />
          </div>

          {/* Row 3 */}
          <div className="lg:col-span-6">
            <LastTransaction />
          </div>
          <div className="lg:col-span-6">
            <ActivityTimeline />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCRM;
