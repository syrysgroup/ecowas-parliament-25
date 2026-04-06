import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

const events = [
  {
    icon: "🎉",
    iconBg: "bg-primary/10",
    title: "8 Figma designs done",
    time: "Wednesday",
    desc: "Designs for charts, main dashboard, invoice page completed",
    avatars: ["/images/avatars/1.png", "/images/avatars/2.png", "/images/avatars/3.png"],
  },
  {
    icon: "📋",
    iconBg: "bg-amber-100 dark:bg-amber-900/20",
    title: "Client meeting",
    time: "April, 20",
    desc: "Project meeting with john @10:15am",
    avatars: ["/images/avatars/4.png", "/images/avatars/5.png"],
  },
  {
    icon: "📱",
    iconBg: "bg-sky-100 dark:bg-sky-900/20",
    title: "Create new project for client",
    time: "January, 10",
    desc: "6 team members in a project",
    avatars: ["/images/avatars/6.png", "/images/avatars/7.png", "/images/avatars/8.png"],
  },
  {
    icon: "✅",
    iconBg: "bg-green-100 dark:bg-green-900/20",
    title: "New order received",
    time: "January, 7",
    desc: "Due to important project, we've deployed today.",
  },
];

const ActivityTimeline = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <p className="font-semibold text-card-foreground">Activity Timeline</p>
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
      <div className="flex flex-col">
        {events.map((event, idx) => (
          <div key={idx} className="flex gap-4 relative pb-6 last:pb-0">
            {idx < events.length - 1 && (
              <span className="absolute left-4 top-8 bottom-0 w-px bg-border" />
            )}
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${event.iconBg} z-10`}>
              {event.icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-card-foreground">{event.title}</p>
                <span className="text-xs text-muted-foreground shrink-0">{event.time}</span>
              </div>
              <p className="text-xs text-muted-foreground">{event.desc}</p>
              {event.avatars && (
                <div className="flex mt-2 -space-x-2">
                  {event.avatars.map((a, i) => (
                    <img key={i} src={a} alt="" className="w-6 h-6 rounded-full border-2 border-card object-cover" loading="lazy" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ActivityTimeline;
