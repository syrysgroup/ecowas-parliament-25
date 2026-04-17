import { useState } from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const series = [
  { name: "Revenue", data: [32, 55, 45, 75, 55, 70, 40, 65, 50] },
  { name: "Expenses", data: [-35, -45, -30, -55, -40, -60, -35, -50, -40] },
];

export default function RevenueGrowthChart() {
  const [year, setYear] = useState("2026");

  const options: ApexCharts.ApexOptions = {
    chart: { type: "bar", stacked: true, toolbar: { show: false }, parentHeightOffset: 0 },
    plotOptions: {
      bar: { columnWidth: "35%", borderRadius: 6, borderRadiusApplication: "around", borderRadiusWhenStacked: "all" },
    },
    colors: ["hsl(152,100%,26%)", "hsl(340,66%,34%)"],
    grid: { borderColor: "hsl(150,10%,88%)", strokeDashArray: 4, padding: { left: 0, right: 0 } },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      labels: { style: { colors: "hsl(150,10%,40%)", fontSize: "11px" } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: "hsl(150,10%,40%)", fontSize: "11px" }, formatter: (v) => `${Math.abs(v)}k` },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: { theme: "dark" },
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">Revenue Growth</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Monthly overview</p>
        </div>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[90px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <Chart options={options} series={series} type="bar" height={260} />
      </CardContent>
    </Card>
  );
}
