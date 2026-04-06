import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  { time: "12 min ago", title: "New sponsor onboarded", desc: "GreenTech Ltd joined as Gold sponsor", color: "bg-primary", initials: "GT" },
  { time: "45 min ago", title: "Event published", desc: "Youth Innovation Summit — Lagos", color: "bg-accent", initials: "YI" },
  { time: "2 hours ago", title: "Team member added", desc: "Amina Diallo joined as Programme Lead", color: "bg-secondary", initials: "AD" },
  { time: "5 hours ago", title: "News article published", desc: "ECOWAS Trade Forum 2026 preview", color: "bg-primary", initials: "NE" },
  { time: "Yesterday", title: "New partner registered", desc: "AfriTech Foundation — Implementing Partner", color: "bg-accent", initials: "AF" },
];

export default function ActivityTimeline() {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Activity Timeline</CardTitle>
        <p className="text-xs text-muted-foreground">Recent platform activity</p>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {activities.map((a, i) => (
            <div key={i} className="flex gap-3 relative">
              {i < activities.length - 1 && (
                <div className="absolute left-[17px] top-10 w-px h-[calc(100%-10px)] bg-border" />
              )}
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className={`${a.color} text-primary-foreground text-[10px] font-bold`}>
                  {a.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
