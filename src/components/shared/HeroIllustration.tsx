import { cn } from "@/lib/utils";

type Theme = "youth" | "trade" | "women" | "civic" | "culture";

const HeroIllustration = ({ theme }: { theme: Theme }) => {
  const base = "absolute pointer-events-none";

  if (theme === "youth") {
    return (
      <div className={cn(base, "inset-0 overflow-hidden opacity-15")}>
        <svg className="absolute top-12 right-12 w-48 h-48 animate-[pulse_4s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="40" r="25" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
          <path d="M40 65 L40 80 L60 80 L60 65" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
          <path d="M50 15 L50 5" stroke="currentColor" strokeWidth="1" className="text-accent" />
          <path d="M25 40 L15 40" stroke="currentColor" strokeWidth="1" className="text-accent" />
          <path d="M75 40 L85 40" stroke="currentColor" strokeWidth="1" className="text-accent" />
          <path d="M32 22 L25 15" stroke="currentColor" strokeWidth="1" className="text-accent" />
          <path d="M68 22 L75 15" stroke="currentColor" strokeWidth="1" className="text-accent" />
        </svg>
        <svg className="absolute bottom-10 left-10 w-64 h-64 opacity-60" viewBox="0 0 200 200" fill="none">
          <path d="M10 100 H60 V50 H120 V100 H180" stroke="currentColor" strokeWidth="1" className="text-accent" strokeDasharray="4 4" />
          <path d="M10 150 H80 V120 H140 V170 H190" stroke="currentColor" strokeWidth="1" className="text-accent" strokeDasharray="4 4" />
          <circle cx="60" cy="50" r="4" fill="currentColor" className="text-accent" />
          <circle cx="120" cy="100" r="4" fill="currentColor" className="text-accent" />
          <circle cx="80" cy="120" r="4" fill="currentColor" className="text-accent" />
        </svg>
        <div className="absolute top-1/3 left-1/4 w-6 h-6 rotate-45 border border-accent/40 animate-[pulse_3s_ease-in-out_infinite_0.5s]" />
        <div className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full border-2 border-accent/30 animate-[pulse_3s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-1/4 right-1/4 w-8 h-8 rotate-12 border border-accent/20 animate-[pulse_4s_ease-in-out_infinite_1.5s]" />
      </div>
    );
  }

  if (theme === "trade") {
    return (
      <div className={cn(base, "inset-0 overflow-hidden opacity-15")}>
        <svg className="absolute top-8 right-8 w-72 h-72" viewBox="0 0 200 200" fill="none">
          <path d="M20 100 C60 60, 140 60, 180 100" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" strokeDasharray="6 3" />
          <path d="M20 130 C60 170, 140 170, 180 130" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" strokeDasharray="6 3" />
          <polygon points="175,95 185,100 175,105" fill="currentColor" className="text-primary-foreground" />
          <polygon points="25,125 15,130 25,135" fill="currentColor" className="text-primary-foreground" />
          {[{x:30,y:80},{x:70,y:60},{x:110,y:70},{x:150,y:65},{x:170,y:90}].map((p,i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="currentColor" className="text-primary-foreground" opacity="0.5" />
              <circle cx={p.x} cy={p.y} r="2" fill="currentColor" className="text-primary-foreground" />
            </g>
          ))}
        </svg>
        <svg className="absolute bottom-8 left-8 w-48 h-48 opacity-40" viewBox="0 0 100 100" fill="none">
          {Array.from({ length: 25 }, (_, i) => (
            <circle key={i} cx={15 + (i % 5) * 20} cy={15 + Math.floor(i / 5) * 20} r="1.5" fill="currentColor" className="text-primary-foreground" />
          ))}
        </svg>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 rounded-full border border-primary-foreground/20 animate-[pulse_4s_ease-in-out_infinite]" />
      </div>
    );
  }

  if (theme === "women") {
    return (
      <div className={cn(base, "inset-0 overflow-hidden opacity-15")}>
        <svg className="absolute top-10 right-10 w-56 h-56" viewBox="0 0 150 150" fill="none">
          {[20, 45, 70, 95, 120].map((x, i) => (
            <rect key={i} x={x} y={100 - (i + 1) * 15} width="15" height={(i + 1) * 15 + 30} rx="2" fill="currentColor" className="text-secondary" opacity={0.3 + i * 0.1} />
          ))}
          <path d="M15 130 L135 130" stroke="currentColor" strokeWidth="1" className="text-secondary" />
        </svg>
        <svg className="absolute bottom-8 left-8 w-48 h-48 opacity-50" viewBox="0 0 120 120" fill="none">
          <circle cx="40" cy="60" r="30" stroke="currentColor" strokeWidth="1" className="text-secondary" />
          <circle cx="70" cy="50" r="25" stroke="currentColor" strokeWidth="1" className="text-secondary" />
          <circle cx="55" cy="80" r="20" stroke="currentColor" strokeWidth="1" className="text-secondary" />
        </svg>
        <div className="absolute top-1/3 left-1/2 w-3 h-3 rounded-full bg-secondary/30 animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="absolute top-2/3 right-1/3 w-5 h-5 rounded-full border border-secondary/20 animate-[pulse_4s_ease-in-out_infinite_1s]" />
      </div>
    );
  }

  if (theme === "culture") {
    return (
      <div className={cn(base, "inset-0 overflow-hidden opacity-15")}>
        {/* Music notes & art shapes */}
        <svg className="absolute top-10 right-10 w-64 h-64 animate-[pulse_5s_ease-in-out_infinite]" viewBox="0 0 150 150" fill="none">
          {/* Music note 1 */}
          <circle cx="35" cy="110" r="8" fill="currentColor" className="text-ecowas-lime" opacity="0.6" />
          <line x1="43" y1="110" x2="43" y2="50" stroke="currentColor" strokeWidth="2" className="text-ecowas-lime" />
          <path d="M43 50 Q60 45, 55 60" stroke="currentColor" strokeWidth="2" className="text-ecowas-lime" fill="none" />
          {/* Music note 2 */}
          <circle cx="85" cy="95" r="7" fill="currentColor" className="text-ecowas-lime" opacity="0.4" />
          <line x1="92" y1="95" x2="92" y2="40" stroke="currentColor" strokeWidth="1.5" className="text-ecowas-lime" />
          {/* Film reel */}
          <circle cx="120" cy="40" r="18" stroke="currentColor" strokeWidth="1" className="text-ecowas-lime" />
          <circle cx="120" cy="40" r="5" fill="currentColor" className="text-ecowas-lime" opacity="0.3" />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return <circle key={i} cx={120 + 12 * Math.cos(rad)} cy={40 + 12 * Math.sin(rad)} r="2.5" fill="currentColor" className="text-ecowas-lime" opacity="0.4" />;
          })}
          {/* Palette shape */}
          <ellipse cx="40" cy="40" rx="20" ry="15" stroke="currentColor" strokeWidth="1" className="text-ecowas-lime" fill="none" transform="rotate(-15 40 40)" />
          <circle cx="30" cy="35" r="3" fill="currentColor" className="text-ecowas-lime" opacity="0.5" />
          <circle cx="38" cy="30" r="2.5" fill="currentColor" className="text-accent" opacity="0.5" />
          <circle cx="48" cy="33" r="2" fill="currentColor" className="text-secondary" opacity="0.5" />
        </svg>
        {/* Decorative waves */}
        <svg className="absolute bottom-8 left-8 w-72 h-32 opacity-50" viewBox="0 0 300 80" fill="none">
          <path d="M0 40 Q37.5 10, 75 40 Q112.5 70, 150 40 Q187.5 10, 225 40 Q262.5 70, 300 40" stroke="currentColor" strokeWidth="1.5" className="text-ecowas-lime" fill="none" />
          <path d="M0 55 Q37.5 25, 75 55 Q112.5 85, 150 55 Q187.5 25, 225 55 Q262.5 85, 300 55" stroke="currentColor" strokeWidth="1" className="text-ecowas-lime" fill="none" opacity="0.5" />
        </svg>
        <div className="absolute top-1/3 left-1/4 w-5 h-5 rotate-45 border border-ecowas-lime/30 animate-[pulse_3s_ease-in-out_infinite_0.5s]" />
        <div className="absolute top-2/3 right-1/4 w-4 h-4 rounded-full border-2 border-ecowas-lime/20 animate-[pulse_4s_ease-in-out_infinite_1s]" />
      </div>
    );
  }

  // civic
  return (
    <div className={cn(base, "inset-0 overflow-hidden opacity-15")}>
      <svg className="absolute top-10 right-10 w-56 h-56" viewBox="0 0 150 150" fill="none">
        <polygon points="30,50 30,100 80,120 80,30" stroke="currentColor" strokeWidth="1.5" className="text-ecowas-blue" fill="none" />
        <path d="M85 40 Q110 50 110 75 Q110 100 85 110" stroke="currentColor" strokeWidth="1.5" className="text-ecowas-blue" fill="none" />
        <path d="M90 25 Q125 45 125 75 Q125 105 90 125" stroke="currentColor" strokeWidth="1" className="text-ecowas-blue" fill="none" opacity="0.6" />
        <path d="M95 10 Q140 40 140 75 Q140 110 95 140" stroke="currentColor" strokeWidth="0.8" className="text-ecowas-blue" fill="none" opacity="0.3" />
      </svg>
      <svg className="absolute bottom-12 left-8 w-72 h-24 opacity-60" viewBox="0 0 300 60" fill="none">
        <path d="M10 30 Q75 10, 150 30 Q225 50, 290 30" stroke="currentColor" strokeWidth="1.5" className="text-ecowas-blue" strokeDasharray="8 4" />
        {[10, 75, 150, 225, 290].map((x, i) => (
          <circle key={i} cx={x} cy={i % 2 === 0 ? 30 : (i === 1 ? 18 : 42)} r="4" fill="currentColor" className="text-ecowas-blue" />
        ))}
      </svg>
      <div className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full border border-ecowas-blue/20 animate-[pulse_3s_ease-in-out_infinite]" />
    </div>
  );
};

export default HeroIllustration;
