import SponsorLogo from "@/components/shared/SponsorLogo";

const sponsors = [
  { name: "Providus Bank", color: "hsl(152, 100%, 26%)" },
  { name: "Global African Business Assoc.", color: "hsl(50, 87%, 45%)" },
  { name: "VALCERTRA", color: "hsl(340, 66%, 34%)" },
  { name: "SMEDAN", color: "hsl(190, 35%, 53%)" },
  { name: "Awalco", color: "hsl(152, 100%, 26%)" },
  { name: "African Development Bank", color: "hsl(190, 35%, 53%)" },
  { name: "ECOWAS Commission", color: "hsl(50, 87%, 45%)" },
];

const SponsorLogoMarquee = () => {
  const doubled = [...sponsors, ...sponsors];

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b border-border/40 py-3 overflow-hidden">
      <div className="inline-flex animate-marquee items-center" style={{ animationDuration: "40s" }}>
        {doubled.map((s, i) => (
          <div key={i} className="inline-flex items-center gap-2.5 px-6">
            <SponsorLogo name={s.name} color={s.color} size={32} />
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

export default SponsorLogoMarquee;
