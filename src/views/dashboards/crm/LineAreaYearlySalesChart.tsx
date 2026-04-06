import { lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = lazy(() => import("react-apexcharts"));

const series = [{ data: [40, 10, 65, 45] }];

const options: ApexOptions = {
  chart: { parentHeightOffset: 0, toolbar: { show: false }, sparkline: { enabled: true } },
  tooltip: { enabled: false },
  dataLabels: { enabled: false },
  stroke: { width: 2, curve: "smooth" },
  grid: { show: false, padding: { top: 10, bottom: 15 } },
  fill: {
    type: "gradient",
    gradient: {
      opacityTo: 0.7,
      opacityFrom: 0.5,
      shadeIntensity: 0.5,
      stops: [0, 80, 100],
      colorStops: [
        { offset: 0, color: "hsl(152,100%,26%)", opacity: 0.6 },
        { offset: 100, color: "hsl(152,100%,26%)", opacity: 0.1 },
      ],
    },
  },
  theme: { monochrome: { enabled: false } },
  colors: ["hsl(152,100%,26%)"],
  xaxis: { labels: { show: false }, axisTicks: { show: false }, axisBorder: { show: false } },
  yaxis: { show: false },
};

const LineAreaYearlySalesChart = () => (
  <Card>
    <CardContent className="pt-5 pb-2">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground">Sales</p>
          <p className="text-xl font-bold text-card-foreground">$28.5k</p>
        </div>
        <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/30">
          +24.8%
        </Badge>
      </div>
      <Suspense fallback={<div className="h-[80px] bg-muted/30 rounded animate-pulse" />}>
        <ReactApexChart type="area" height={80} options={options} series={series} />
      </Suspense>
      <p className="text-xs text-center text-muted-foreground mt-1">Yearly Sales</p>
    </CardContent>
  </Card>
);

export default LineAreaYearlySalesChart;
