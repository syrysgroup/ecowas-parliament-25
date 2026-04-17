import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RadarSalesChart() {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "radar", toolbar: { show: false }, dropShadow: { enabled: true, blur: 4, opacity: 0.15 } },
    colors: ["hsl(152,100%,26%)", "hsl(50,87%,45%)"],
    stroke: { width: 2 },
    fill: { opacity: 0.15 },
    markers: { size: 0 },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      labels: { style: { colors: Array(6).fill("hsl(150,10%,40%)"), fontSize: "11px" } },
    },
    yaxis: { show: false },
    legend: { position: "bottom", fontSize: "12px", labels: { colors: "hsl(150,10%,40%)" } },
    grid: { show: false },
  };

  const series = [
    { name: "This Year", data: [70, 90, 80, 95, 60, 85] },
    { name: "Last Year", data: [50, 70, 60, 80, 50, 70] },
  ];

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Sales Analytics</CardTitle>
        <p className="text-xs text-muted-foreground">Revenue comparison</p>
      </CardHeader>
      <CardContent className="pt-0">
        <Chart options={options} series={series} type="radar" height={280} />
      </CardContent>
    </Card>
  );
}
