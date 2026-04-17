import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Medal, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import FlagImg from "@/components/shared/FlagImg";

interface CountryDelegationCardProps {
  name: string;
  flag: string;
  seats: number;
  applications: number;
  nominees: number;
  representatives: number;
}

const CountryDelegationCard = ({ name, flag, seats, applications, nominees, representatives }: CountryDelegationCardProps) => {
  const fillRate = Math.min((representatives / seats) * 100, 100);
  const statusLabel = representatives >= seats ? "Delegation filled" : representatives > 0 ? "Seats being filled" : "Open for submissions";

  return (
    <Link to={`/programmes/parliament/${encodeURIComponent(name)}`} className="block">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <FlagImg country={name} className="h-8 w-8" />
            <h3 className="text-xl font-black text-card-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{seats} parliamentary seats</p>
          </div>
          <Badge className="bg-primary/10 text-primary">{statusLabel}</Badge>
        </div>

        <div className="mb-4 h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${fillRate}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-2xl bg-muted/50 p-3">
            <FileText className="mb-2 h-4 w-4 text-primary" />
            <p className="text-lg font-black text-foreground">{applications}</p>
            <p className="text-xs text-muted-foreground">Applications</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-3">
            <Vote className="mb-2 h-4 w-4 text-primary" />
            <p className="text-lg font-black text-foreground">{nominees}</p>
            <p className="text-xs text-muted-foreground">Nominees</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-3">
            <Medal className="mb-2 h-4 w-4 text-primary" />
            <p className="text-lg font-black text-foreground">{representatives}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{Math.max(seats - representatives, 0)} seat(s) still available for this delegation.</span>
        </div>
      </div>
    </Link>
  );
};

export default CountryDelegationCard;
