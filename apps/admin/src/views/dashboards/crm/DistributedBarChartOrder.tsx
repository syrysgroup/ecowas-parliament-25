import { lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = lazy(() => import("react-apexcharts"));

const series = [{ data: [77, 55, 23, 43, 77, 55, 89] }];

const options: ApexOptions = {
  chart: { type: "bar", parentHeightOffset: 0, toolbar: { show: false }, sparkline: { enabled: true } },
  tooltip: { enabled: false },
  legend: { show: false },
  dataLabels: { enabled: false },
  colors: ["hsl(152,100%,26%)"],
  states: { hover: { filter: { type: "none" } }, active: { filter: { type: "none" } } },
  plotOptions: {
    bar: { borderRadius: 4, distributed: true, columnWidth: "55%", borderRadiusApplication: "end" },
  },
  grid: { show: false, padding: { top: 0, bottom: 0 } },
  xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], axisBorder: { show: false }, axisTicks: { show: false }, labels: { show: false } },
  yaxis: { show: false },
};

const DistributedBarChartOrder = () => (
  <Card>
    <CardContent className="pt-5 pb-2">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="text-xl font-bold text-card-foreground">2,856</p>
        </div>
        <Badge variant="secondary" className="text-red-600 bg-red-100 dark:bg-red-900/30">
          -3.5%
        </Badge>
      </div>
      <Suspense fallback={<div className="h-[80px] bg-muted/30 rounded animate-pulse" />}>
        <ReactApexChart type="bar" height={80} options={options} series={series} />
      </Suspense>
      <p className="text-xs text-center text-muted-foreground mt-1">Weekly Orders</p>
    </CardContent>
  </Card>
);

export default DistributedBarChartOrder;
