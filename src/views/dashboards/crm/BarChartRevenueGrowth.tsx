import { lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = lazy(() => import("react-apexcharts"));

const series = [{ data: [32, 52, 72, 94, 116, 94, 72] }];

const options: ApexOptions = {
  chart: { parentHeightOffset: 0, toolbar: { show: false }, sparkline: { enabled: false } },
  plotOptions: { bar: { borderRadius: 5, distributed: true, columnWidth: "55%" } },
  legend: { show: false },
  dataLabels: { enabled: false },
  colors: ["hsl(152,100%,26%)", "hsl(152,100%,26%)", "hsl(152,100%,26%)", "hsl(152,100%,26%)", "hsl(152,100%,26%)", "hsl(152,100%,26%)", "hsl(152,100%,26%)"],
  grid: { show: false, padding: { top: -10, left: -5, right: 0, bottom: -10 } },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    axisTicks: { show: false },
    axisBorder: { show: false },
    labels: { style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } },
  },
  yaxis: { show: false },
  tooltip: { enabled: false },
};

const BarChartRevenueGrowth = () => (
  <Card>
    <CardContent className="pt-5 pb-2">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-xl font-bold text-card-foreground">$4,673</p>
        </div>
        <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/30">
          +11.4%
        </Badge>
      </div>
      <Suspense fallback={<div className="h-[100px] bg-muted/30 rounded animate-pulse" />}>
        <ReactApexChart type="bar" height={100} options={options} series={series} />
      </Suspense>
      <p className="text-xs text-center text-muted-foreground mt-1">Revenue Growth</p>
    </CardContent>
  </Card>
);

export default BarChartRevenueGrowth;
