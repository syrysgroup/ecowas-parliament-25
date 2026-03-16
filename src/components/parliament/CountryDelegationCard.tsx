import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { CountryData } from "./HemicycleChart";

interface CountryDelegationCardProps {
  country: CountryData;
  status: "open" | "closed" | "coming_soon";
  filled: number;
}

const statusConfig = {
  open: { label: "Nominations Open", className: "bg-primary/10 text-primary border-primary/30" },
  closed: { label: "Nominations Closed", className: "bg-secondary/10 text-secondary border-secondary/30" },
  coming_soon: { label: "Coming Soon", className: "bg-accent/10 text-accent-foreground border-accent/30" },
};

const CountryDelegationCard = ({ country, status, filled }: CountryDelegationCardProps) => {
  const cfg = statusConfig[status];
  const vacant = country.seats - filled;

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{country.flag}</span>
          <div>
            <h4 className="font-bold text-card-foreground leading-tight">{country.name}</h4>
            <span className="text-xs text-muted-foreground">{country.code}</span>
          </div>
        </div>
        <Badge variant="outline" className={cfg.className}>
          {cfg.label}
        </Badge>
      </div>

      {/* Seat allocation bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> {country.seats} seats
          </span>
          <span className="font-medium text-foreground">
            {filled}/{country.seats} filled
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(filled / country.seats) * 100}%`,
              backgroundColor: country.color,
            }}
          />
        </div>
      </div>

      {/* Seat dots */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {Array.from({ length: country.seats }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${
              i < filled
                ? "text-primary-foreground border-transparent"
                : "bg-muted text-muted-foreground border-border"
            }`}
            style={i < filled ? { backgroundColor: country.color } : {}}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryDelegationCard;
