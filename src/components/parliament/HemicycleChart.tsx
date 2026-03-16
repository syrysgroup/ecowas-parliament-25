import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const COUNTRIES = [
  { name: "Cabo Verde", color: "hsl(var(--primary))" },
  { name: "The Gambia", color: "hsl(var(--primary))" },
  { name: "Guinea-Bissau", color: "hsl(var(--primary))" },
  { name: "Guinea", color: "hsl(var(--primary))" },
  { name: "Senegal", color: "hsl(var(--primary))" },
  { name: "Mali", color: "hsl(50, 87%, 45%)" },
  { name: "Burkina Faso", color: "hsl(50, 87%, 45%)" },
  { name: "Niger", color: "hsl(50, 87%, 45%)" },
  { name: "Nigeria", color: "hsl(340, 66%, 34%)" },
  { name: "Ghana", color: "hsl(340, 66%, 34%)" },
  { name: "Togo", color: "hsl(340, 66%, 34%)" },
  { name: "Benin", color: "hsl(340, 66%, 34%)" },
  { name: "Côte d'Ivoire", color: "hsl(50, 87%, 45%)" },
  { name: "Liberia", color: "hsl(var(--primary))" },
  { name: "Sierra Leone", color: "hsl(var(--primary))" },
];

const HemicycleChart = () => {
  const cx = 250;
  const cy = 240;
  const radius = 180;
  const total = COUNTRIES.length;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 500 280" className="w-full max-w-lg">
        {/* Hemicycle arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {COUNTRIES.map((country, i) => {
          const angle = Math.PI + (Math.PI * (i + 0.5)) / total;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          return (
            <Tooltip key={country.name}>
              <TooltipTrigger asChild>
                <circle
                  cx={x}
                  cy={y}
                  r={14}
                  fill={country.color}
                  className="cursor-pointer transition-transform hover:scale-110 origin-center"
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="font-semibold">
                {country.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {/* Speaker podium */}
        <rect x={cx - 30} y={cy - 4} width={60} height={8} rx={4} fill="hsl(var(--primary))" opacity={0.3} />
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--primary))" }} /> West</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "hsl(50, 87%, 45%)" }} /> Central</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "hsl(340, 66%, 34%)" }} /> East</span>
      </div>
    </div>
  );
};

export default HemicycleChart;
