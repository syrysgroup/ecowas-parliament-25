import { useState } from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Users, Briefcase } from "lucide-react";

const tabData: Record<string, { total: string; change: string; positive: boolean; series: number[] }> = {
  orders:   { total: "2,856", change: "+25.8%", positive: true, series: [28, 40, 36, 52, 38, 60, 55] },
  sales:    { total: "$8.5k", change: "+17.6%", positive: true, series: [35, 25, 45, 30, 55, 38, 48] },
  profit:   { total: "$1.28k", change: "-12.4%", positive: false, series: [55, 45, 35, 50, 30, 45, 25] },
  income:   { total: "$4.67k", change: "+32.1%", positive: true, series: [20, 35, 45, 55, 40, 65, 50] },
};

export default function EarningReportsWithTabs() {
  const [tab, setTab] = useState("orders");
  const d = tabData[tab];

  const options: ApexCharts.ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, sparkline: { enabled: true } },
    plotOptions: { bar: { columnWidth: "50%", borderRadius: 4 } },
    colors: ["hsl(152,100%,26%)"],
    grid: { show: false },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { show: false },
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
  };

  const icons = { orders: Briefcase, sales: DollarSign, profit: TrendingUp, income: Users };
  const Icon = icons[tab as keyof typeof icons];

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Earning Reports</CardTitle>
        <p className="text-xs text-muted-foreground">Quarterly performance overview</p>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 mb-4 h-9">
            <TabsTrigger value="orders" className="text-xs">Orders</TabsTrigger>
            <TabsTrigger value="sales" className="text-xs">Sales</TabsTrigger>
            <TabsTrigger value="profit" className="text-xs">Profit</TabsTrigger>
            <TabsTrigger value="income" className="text-xs">Income</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{d.total}</p>
              <span className={`text-xs font-medium ${d.positive ? "text-emerald-500" : "text-destructive"}`}>
                {d.change}
              </span>
            </div>
          </div>
          <div className="w-28 h-16">
            <Chart options={options} series={[{ data: d.series }]} type="bar" height={64} width="100%" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
