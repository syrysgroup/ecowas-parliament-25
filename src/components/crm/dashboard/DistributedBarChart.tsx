import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DistributedBarChart() {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, parentHeightOffset: 0 },
    plotOptions: { bar: { distributed: true, columnWidth: "55%", borderRadius: 5 } },
    colors: [
      "hsl(152,100%,26%)", "hsl(50,87%,45%)", "hsl(190,35%,53%)",
      "hsl(340,66%,34%)", "hsl(73,53%,49%)", "hsl(262,80%,60%)",
      "hsl(20,80%,55%)",
    ],
    grid: { borderColor: "hsl(150,10%,88%)", strokeDashArray: 4 },
    xaxis: {
      categories: ["Youth", "Trade", "Women", "Civic", "Culture", "Parliament", "Awards"],
      labels: { style: { colors: "hsl(150,10%,40%)", fontSize: "11px" } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "hsl(150,10%,40%)", fontSize: "11px" } } },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: { theme: "dark" },
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Programme Registrations</CardTitle>
        <p className="text-xs text-muted-foreground">By pillar this quarter</p>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <Chart options={options} series={[{ data: [120, 85, 95, 60, 75, 45, 55] }]} type="bar" height={240} />
      </CardContent>
    </Card>
  );
}
