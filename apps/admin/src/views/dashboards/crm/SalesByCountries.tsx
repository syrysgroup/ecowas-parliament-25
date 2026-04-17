import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react";

const data = [
  { title: "$8.45k", subtitle: "United States", trendNumber: 25.8, trend: "positive", imgSrc: "/images/cards/us.png" },
  { title: "$7.78k", subtitle: "Brazil", trendNumber: 16.2, trend: "negative", imgSrc: "/images/cards/brazil.png" },
  { title: "$6.48k", subtitle: "India", trendNumber: 12.3, trend: "positive", imgSrc: "/images/cards/india.png" },
  { title: "$4.98k", subtitle: "Australia", trendNumber: 11.9, trend: "positive", imgSrc: "/images/cards/australia.png" },
  { title: "$3.89k", subtitle: "France", trendNumber: 8.6, trend: "negative", imgSrc: "/images/cards/france.png" },
  { title: "$2.22k", subtitle: "China", trendNumber: 6.2, trend: "negative", imgSrc: "/images/cards/china.png" },
];

const SalesByCountries = () => (
  <Card>
    <CardHeader className="flex flex-row items-start justify-between pb-2">
      <div>
        <p className="font-semibold text-card-foreground">Sales by Countries</p>
        <p className="text-xs text-muted-foreground">Monthly Sales Overview</p>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      {data.map((item) => (
        <div key={item.subtitle} className="flex items-center gap-3">
          <img
            src={item.imgSrc}
            alt={item.subtitle}
            className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-1 justify-between items-center">
            <div>
              <p className="text-sm font-medium text-card-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${item.trend === "positive" ? "text-green-600" : "text-red-500"}`}>
              {item.trend === "positive" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {item.trendNumber}%
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default SalesByCountries;
