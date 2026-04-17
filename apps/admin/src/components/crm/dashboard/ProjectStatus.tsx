import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectStatus() {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "donut" },
    labels: ["Completed", "In Progress", "Planning", "On Hold"],
    colors: ["hsl(152,100%,26%)", "hsl(50,87%,45%)", "hsl(190,35%,53%)", "hsl(340,66%,34%)"],
    stroke: { width: 2, colors: ["hsl(0,0%,100%)"] },
    legend: { position: "bottom", fontSize: "12px", labels: { colors: "hsl(150,10%,40%)" } },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "70%", labels: { show: true, total: { show: true, label: "Total", fontSize: "14px", color: "hsl(150,10%,40%)" } } } } },
    tooltip: { theme: "dark" },
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Project Status</CardTitle>
        <p className="text-xs text-muted-foreground">Overall programme health</p>
      </CardHeader>
      <CardContent className="pt-0 flex justify-center">
        <Chart options={options} series={[35, 40, 15, 10]} type="donut" height={240} width={280} />
      </CardContent>
    </Card>
  );
}
