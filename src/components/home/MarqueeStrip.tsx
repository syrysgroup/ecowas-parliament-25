const items = [
  "ECOWAS Parliament 25th Anniversary",
  "Youth Innovation & Entrepreneurship",
  "Trade & SME Forums",
  "Women's Empowerment Forum",
  "Parliamentary Awards 2025",
  "12 Member States · One Parliament",
  "Youth Parliament Simulation",
  "Civic Education & Democracy",
];

const MarqueeStrip = () => {
  const doubled = [...items, ...items];

  return (
    <div className="bg-primary overflow-hidden whitespace-nowrap border-t border-primary-foreground/10 border-b border-b-background/20 py-3">
      <div className="inline-flex animate-marquee" style={{ animationDuration: "35s" }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 px-7 text-[11px] font-bold text-primary-foreground/90 uppercase tracking-wider">
            {item}
            <span className="w-[3px] h-[3px] rounded-full bg-primary-foreground/40" />
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeStrip;
