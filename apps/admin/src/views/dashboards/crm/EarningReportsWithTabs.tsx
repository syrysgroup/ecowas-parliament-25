import { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, ShoppingCart, BarChart2, DollarSign, PieChart } from "lucide-react";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = lazy(() => import("react-apexcharts"));

const tabData = [
  { type: "orders", icon: <ShoppingCart size={16} />, series: [{ data: [28, 10, 46, 38, 15, 30, 35, 28, 8] }] },
  { type: "sales", icon: <BarChart2 size={16} />, series: [{ data: [35, 25, 15, 40, 42, 25, 48, 8, 30] }] },
  { type: "profit", icon: <DollarSign size={16} />, series: [{ data: [10, 22, 27, 33, 42, 32, 27, 22, 8] }] },
  { type: "income", icon: <PieChart size={16} />, series: [{ data: [5, 9, 12, 18, 20, 25, 30, 36, 48] }] },
];

const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const primaryColor = "hsl(152,100%,26%)";
const lightColor = "hsl(152,100%,26%,0.15)";

const EarningReportsWithTabs = () => {
  const [tab, setTab] = useState("orders");
  const currentTab = tabData.find((t) => t.type === tab)!;

  const seriesData = (currentTab.series[0].data as number[]);
  const max = Math.max(...seriesData);
  const colors = seriesData.map((v) => (v === max ? primaryColor : lightColor));

  const options: ApexOptions = {
    chart: { parentHeightOffset: 0, toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 6, distributed: true, columnWidth: "33%", borderRadiusApplication: "end", dataLabels: { position: "top" } },
    },
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: {
      offsetY: -11,
      formatter: (val) => `${val}k`,
      style: { fontWeight: 500, colors: ["hsl(var(--foreground))"], fontSize: "12px" },
    },
    colors,
    states: { hover: { filter: { type: "none" } }, active: { filter: { type: "none" } } },
    grid: { show: false, padding: { top: -19, left: -4, right: 0, bottom: -11 } },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { color: "hsl(var(--border))" },
      categories,
      labels: { style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } },
    },
    yaxis: {
      labels: { offsetX: -18, formatter: (val) => `$${val}k`, style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } },
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <p className="font-semibold text-card-foreground">Earning Reports</p>
          <p className="text-xs text-muted-foreground">Yearly Earnings Overview</p>
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
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto bg-transparent gap-3 mb-6 flex-wrap">
            {tabData.map((t) => (
              <TabsTrigger
                key={t.type}
                value={t.type}
                className="flex flex-col items-center gap-1 h-auto w-[100px] py-3 border border-dashed data-[state=active]:border-primary data-[state=active]:border-solid rounded-xl"
              >
                <span className={tab === t.type ? "text-primary" : "text-muted-foreground"}>{t.icon}</span>
                <span className="text-xs capitalize">{t.type}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabData.map((t) => (
            <TabsContent key={t.type} value={t.type} className="mt-0">
              <Suspense fallback={<div className="h-[233px] bg-muted/30 rounded animate-pulse" />}>
                <ReactApexChart type="bar" height={233} width="100%" options={options} series={currentTab.series} />
              </Suspense>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EarningReportsWithTabs;
