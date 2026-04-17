import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

type DataType = {
  title: string;
  imgSrc: string;
  progress: number;
  subtitle: string;
  color: string;
};

const data: DataType[] = [
  { title: "Laravel", subtitle: "eCommerce", progress: 54, color: "bg-red-500", imgSrc: "/images/logos/laravel.png" },
  { title: "Figma", subtitle: "App UI Kit", progress: 85, color: "bg-primary", imgSrc: "/images/logos/figma.png" },
  { title: "VueJs", subtitle: "Calendar App", progress: 64, color: "bg-green-500", imgSrc: "/images/logos/vue.png" },
  { title: "React", subtitle: "Dashboard", progress: 40, color: "bg-sky-500", imgSrc: "/images/logos/react.png" },
  { title: "Bootstrap", subtitle: "Website", progress: 17, color: "bg-purple-500", imgSrc: "/images/logos/bootstrap.png" },
  { title: "Sketch", subtitle: "Website Design", progress: 30, color: "bg-amber-500", imgSrc: "/images/logos/sketch.png" },
];

const ActiveProjects = () => (
  <Card>
    <CardHeader className="flex flex-row items-start justify-between pb-2">
      <div>
        <p className="font-semibold text-card-foreground">Active Projects</p>
        <p className="text-xs text-muted-foreground">Average 72% completed</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Refresh</DropdownMenuItem>
          <DropdownMenuItem>Update</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      {data.map((item) => (
        <div key={item.title} className="flex items-center gap-3">
          <img src={item.imgSrc} alt={item.title} width={32} height={32} loading="lazy" decoding="async" className="shrink-0" />
          <div className="flex flex-1 flex-wrap justify-between items-center gap-x-4 gap-y-1">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-card-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 w-28">
              <Progress value={item.progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground w-8 text-right">{item.progress}%</span>
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default ActiveProjects;
