import { Badge } from "@/components/ui/badge";

interface PeopleCardProps {
  image: string;
  name: string;
  country: string;
  role: string;
  bio: string;
  organisation?: string;
  badge?: string;
  votes?: number;
}

const PeopleCard = ({ image, name, country, role, bio, organisation, badge, votes }: PeopleCardProps) => {
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-transform duration-300 hover:-translate-y-1">
      <img src={image} alt={name} className="aspect-[4/4.5] w-full object-cover" loading="lazy" />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{country}</p>
            <h3 className="text-xl font-black text-card-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {badge && <Badge className="bg-primary/10 text-primary">{badge}</Badge>}
            {typeof votes === "number" && <Badge variant="outline">{votes} votes</Badge>}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
        {organisation && <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{organisation}</p>}
      </div>
    </article>
  );
};

export default PeopleCard;
