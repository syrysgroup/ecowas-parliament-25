import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  stats: string;
  icon: LucideIcon;
  iconColor?: string;
  chipText: string;
  chipVariant?: "positive" | "negative";
};

export default function CustomerStats({ title, subtitle, stats, icon: Icon, iconColor = "text-primary", chipText, chipVariant = "positive" }: Props) {
  const isPositive = chipVariant === "positive";
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg bg-primary/10 ${iconColor}`}>
            <Icon size={20} />
          </div>
          <Badge
            variant="secondary"
            className={`flex items-center gap-1 text-xs ${isPositive ? "text-green-600 bg-green-100 dark:bg-green-900/30" : "text-red-500 bg-red-100 dark:bg-red-900/30"}`}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {chipText}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-card-foreground">{stats}</p>
        <p className="text-sm font-medium text-card-foreground mt-0.5">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
