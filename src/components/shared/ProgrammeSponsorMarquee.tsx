import parliament25Logo from "@/assets/parliament-25-logo.png";

interface Sponsor {
  name: string;
}

interface ProgrammeSponsorMarqueeProps {
  sponsors: Sponsor[];
  speed?: number;
}

const ProgrammeSponsorMarquee = ({ sponsors, speed = 40 }: ProgrammeSponsorMarqueeProps) => {
  const doubled = [...sponsors, ...sponsors];

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b border-border/40 py-3 overflow-hidden">
      <div
        className="inline-flex animate-marquee items-center"
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((s, i) => (
          <div key={i} className="inline-flex items-center gap-2.5 px-6">
            <img
              src={parliament25Logo}
              alt={s.name}
              className="h-8 w-8 object-contain"
              loading="lazy"
            />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              {s.name}
            </span>
            <span className="w-px h-4 bg-border ml-3" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgrammeSponsorMarquee;
