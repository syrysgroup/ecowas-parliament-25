import { lazy, Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = lazy(() => import("react-apexcharts"));

const series = [
  { name: "Sales", data: [32, 27, 27, 30, 25, 25] },
  { name: "Visits", data: [25, 35, 20, 20, 20, 20] },
];

const options: ApexOptions = {
  chart: { parentHeightOffset: 0, toolbar: { show: false } },
  colors: ["hsl(152,100%,26%)", "hsl(199,89%,48%)"],
  plotOptions: {
    radar: { polygons: { connectorColors: "hsl(var(--border))", strokeColors: "hsl(var(--border))" } },
  },
  stroke: { width: 0 },
  fill: { opacity: [1, 1] },
  markers: { size: 0 },
  legend: {
    show: true,
    position: "bottom",
    labels: { colors: "hsl(var(--muted-foreground))" },
  },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    labels: { style: { colors: Array(6).fill("hsl(var(--muted-foreground))"), fontSize: "12px" } },
  },
  yaxis: { show: false },
  grid: { show: false },
};

const RadarSalesChart = () => (
  <Card>
    <CardHeader className="flex flex-row items-start justify-between pb-2">
      <div>
        <p className="font-semibold text-card-foreground">Sales Radar</p>
        <p className="text-xs text-muted-foreground">Monthly Sales vs Visits</p>
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
          <DropdownMenuItem>Last Year</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent>
      <Suspense fallback={<div className="h-[280px] bg-muted/30 rounded animate-pulse" />}>
        <ReactApexChart type="radar" height={280} options={options} series={series} />
      </Suspense>
    </CardContent>
  </Card>
);

export default RadarSalesChart;
