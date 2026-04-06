import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LineAreaYearlySalesChart() {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, parentHeightOffset: 0 },
    colors: ["hsl(152,100%,26%)", "hsl(190,35%,53%)"],
    stroke: { width: 2, curve: "smooth" },
    fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0.05, shadeIntensity: 1, type: "vertical" } },
    grid: { borderColor: "hsl(150,10%,88%)", strokeDashArray: 4, padding: { left: 0, right: 0 } },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      labels: { style: { colors: "hsl(150,10%,40%)", fontSize: "11px" } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "hsl(150,10%,40%)", fontSize: "11px" }, formatter: (v) => `${v}k` } },
    legend: { position: "top", horizontalAlign: "right", fontSize: "12px", labels: { colors: "hsl(150,10%,40%)" } },
    dataLabels: { enabled: false },
    tooltip: { theme: "dark" },
  };

  const series = [
    { name: "Registrations", data: [14, 18, 22, 28, 26, 34, 40, 38, 45, 42, 48, 55] },
    { name: "Engagements", data: [8, 12, 15, 20, 18, 24, 28, 32, 30, 36, 40, 45] },
  ];

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Yearly Overview</CardTitle>
        <p className="text-xs text-muted-foreground">Registration & engagement trends</p>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <Chart options={options} series={series} type="area" height={260} />
      </CardContent>
    </Card>
  );
}
