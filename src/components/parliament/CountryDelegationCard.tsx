import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface CountryDelegationCardProps {
  name: string;
  flag: string;
  seats: number;
  status: "open" | "closed" | "coming-soon";
  filled: number;
}

const statusConfig = {
  open: { label: "Nominations Open", className: "bg-primary/10 text-primary border-primary/20" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
  "coming-soon": { label: "Coming Soon", className: "bg-accent/10 text-accent-foreground border-accent/20" },
};

const CountryDelegationCard = ({ name, flag, seats, status, filled }: CountryDelegationCardProps) => {
  const cfg = statusConfig[status];

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{flag}</span>
          <h3 className="font-bold text-card-foreground">{name}</h3>
        </div>
        <Badge variant="outline" className={cfg.className}>
          {cfg.label}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{seats} parliamentary seats</p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: seats }).map((_, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              i < filled
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground/40"
            }`}
          >
            <User className="h-3.5 w-3.5" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryDelegationCard;
