import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const countries = [
  { flag: "🇳🇬", name: "Nigeria", amount: "$8,450", change: "+25.8%", positive: true },
  { flag: "🇬🇭", name: "Ghana", amount: "$6,320", change: "+18.2%", positive: true },
  { flag: "🇸🇳", name: "Senegal", amount: "$4,890", change: "-8.4%", positive: false },
  { flag: "🇨🇮", name: "Côte d'Ivoire", amount: "$3,760", change: "+12.6%", positive: true },
  { flag: "🇹🇬", name: "Togo", amount: "$2,150", change: "+5.1%", positive: true },
];

export default function SalesByCountries() {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Engagement by Country</CardTitle>
        <p className="text-xs text-muted-foreground">Top contributing nations</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {countries.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-xl">{c.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">{c.amount}</span>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${c.positive ? "text-emerald-500" : "text-destructive"}`}>
                {c.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {c.change}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
