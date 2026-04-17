import { lazy, Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = lazy(() => import("react-apexcharts"));

const series = [
  { data: [2000, 2000, 4000, 4000, 3050, 3050, 2050, 2050, 3050, 3050, 4700, 4700, 2750, 2750, 5700, 5700] },
];

const stats = [
  { title: "Donates", amount: "$756.26", trendDiff: 139.34, trend: "negative" },
  { title: "Retweet", amount: "$243.58", trendDiff: 42.34, trend: "positive" },
  { title: "Revenue", amount: "$2,456", trendDiff: 27.54, trend: "positive" },
];

const options: ApexOptions = {
  chart: { parentHeightOffset: 0, toolbar: { show: false }, sparkline: { enabled: true } },
  stroke: { width: 2, curve: "straight" },
  dataLabels: { enabled: false },
  colors: ["hsl(152,100%,26%)"],
  grid: { show: false },
  xaxis: { labels: { show: false }, axisTicks: { show: false }, axisBorder: { show: false } },
  yaxis: { show: false },
  tooltip: { enabled: false },
};

const ProjectStatus = () => (
  <Card>
    <CardHeader className="flex flex-row items-start justify-between pb-2">
      <div>
        <p className="font-semibold text-card-foreground">Project Status</p>
        <p className="text-xs text-muted-foreground">Weekly Progress</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Last Week</DropdownMenuItem>
          <DropdownMenuItem>Last Month</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent>
      <Suspense fallback={<div className="h-[100px] bg-muted/30 rounded animate-pulse" />}>
        <ReactApexChart type="line" height={100} options={options} series={series} />
      </Suspense>
      <div className="flex flex-col gap-3 mt-4">
        {stats.map((s) => (
          <div key={s.title} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <p className="text-sm text-card-foreground">{s.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-card-foreground">{s.amount}</p>
              <div className={`flex items-center gap-0.5 text-xs ${s.trend === "positive" ? "text-green-600" : "text-red-500"}`}>
                {s.trend === "positive" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {s.trendDiff}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ProjectStatus;
