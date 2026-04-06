import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const projects = [
  { name: "Youth Innovation Summit", leader: "Amina D.", progress: 78, status: "On Track", statusClass: "bg-primary/10 text-primary" },
  { name: "Trade Forum 2026", leader: "Kwame O.", progress: 45, status: "In Progress", statusClass: "bg-accent/10 text-accent-foreground" },
  { name: "Women's Leadership", leader: "Fatou S.", progress: 92, status: "Finishing", statusClass: "bg-emerald-500/10 text-emerald-600" },
  { name: "Parliament Assembly", leader: "Ibrahim K.", progress: 30, status: "Planning", statusClass: "bg-secondary/10 text-secondary" },
  { name: "Culture & Arts Expo", leader: "Chioma E.", progress: 60, status: "On Track", statusClass: "bg-primary/10 text-primary" },
];

export default function ActiveProjects() {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Active Projects</CardTitle>
        <p className="text-xs text-muted-foreground">Programme pillar progress</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.leader}</p>
                </div>
                <Badge variant="secondary" className={`${p.statusClass} text-[10px] border-0`}>
                  {p.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={p.progress} className="h-1.5 flex-1" />
                <span className="text-[11px] font-medium text-muted-foreground w-8 text-right">{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
