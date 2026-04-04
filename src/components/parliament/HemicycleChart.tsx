import { useMemo, useRef, useState } from "react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import FlagImg from "@/components/shared/FlagImg";

export interface HemicycleCountryData {
  name: string;
  seats: number;
  color: string;
  flag: string;
}

interface HemicycleChartProps {
  countries?: HemicycleCountryData[];
}

const defaultCountries: HemicycleCountryData[] = [
  { name: "Benin", seats: 5, color: "hsl(var(--ecowas-green))", flag: "🇧🇯" },
  { name: "Cape Verde", seats: 5, color: "hsl(var(--accent))", flag: "🇨🇻" },
  { name: "Gambia", seats: 5, color: "hsl(var(--secondary))", flag: "🇬🇲" },
  { name: "Ghana", seats: 8, color: "hsl(var(--primary))", flag: "🇬🇭" },
  { name: "Guinea", seats: 6, color: "hsl(var(--ecowas-lime))", flag: "🇬🇳" },
  { name: "Guinea-Bissau", seats: 5, color: "hsl(var(--ecowas-blue))", flag: "🇬🇼" },
  { name: "Côte d'Ivoire", seats: 7, color: "hsl(var(--ecowas-yellow))", flag: "🇨🇮" },
  { name: "Liberia", seats: 5, color: "hsl(var(--primary) / 0.8)", flag: "🇱🇷" },
  { name: "Nigeria", seats: 35, color: "hsl(var(--secondary) / 0.9)", flag: "🇳🇬" },
  { name: "Senegal", seats: 6, color: "hsl(var(--accent) / 0.9)", flag: "🇸🇳" },
  { name: "Sierra Leone", seats: 5, color: "hsl(var(--ecowas-blue) / 0.8)", flag: "🇸🇱" },
  { name: "Togo", seats: 5, color: "hsl(var(--ecowas-green) / 0.8)", flag: "🇹🇬" },
];

const createSeatPositions = (countries: HemicycleCountryData[]) => {
  const seats: { x: number; y: number; countryIndex: number }[] = [];
  const centerX = 250;
  const centerY = 242;
  const allSeats = countries.flatMap((country, countryIndex) =>
    Array.from({ length: country.seats }, () => countryIndex),
  );
  const rows = [14, 18, 22, 24, 26];
  const radii = [78, 106, 134, 162, 190];

  let seatIndex = 0;
  rows.forEach((seatsInRow, rowIndex) => {
    for (let seat = 0; seat < seatsInRow; seat += 1) {
      if (seatIndex >= allSeats.length) return;
      const angle = Math.PI * (0.1 + (seat / Math.max(seatsInRow - 1, 1)) * 0.8);
      const x = centerX + radii[rowIndex] * Math.cos(Math.PI - angle);
      const y = centerY - radii[rowIndex] * Math.sin(angle);
      seats.push({ x, y, countryIndex: allSeats[seatIndex] });
      seatIndex += 1;
    }
  });

  return seats;
};

const HemicycleChart = ({ countries = defaultCountries }: HemicycleChartProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const totalSeats = useMemo(() => countries.reduce((sum, country) => sum + country.seats, 0), [countries]);
  const seatPositions = useMemo(() => createSeatPositions(countries), [countries]);
  const hoveredData = hoveredCountry !== null ? countries[hoveredCountry] : null;

  return (
    <AnimatedSection>
      <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-black text-foreground">ECOWAS Youth Parliament Hemicycle</h3>
          <p className="mt-1 text-sm text-muted-foreground">{totalSeats} seats across 12 Member States</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="relative mx-auto w-full max-w-2xl flex-1" ref={containerRef} onMouseMove={(event) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
          }}>
            <svg viewBox="0 0 500 280" className="w-full" aria-label="Hemicycle seating chart">
              <rect x={188} y={218} width={124} height={36} rx={10} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1.2} />
              <text x={250} y={240} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10} fontWeight={700}>
                SPEAKER'S DESK
              </text>

              {seatPositions.map((seat, index) => {
                const country = countries[seat.countryIndex];
                const isHighlighted = hoveredCountry === null || hoveredCountry === seat.countryIndex;
                return (
                  <circle
                    key={`${country.name}-${index}`}
                    cx={seat.x}
                    cy={seat.y}
                    r={6.2}
                    fill={country.color}
                    opacity={isHighlighted ? 0.95 : 0.16}
                    stroke={hoveredCountry === seat.countryIndex ? "hsl(var(--foreground))" : "none"}
                    strokeWidth={1.4}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredCountry(seat.countryIndex)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />
                );
              })}
            </svg>

            {hoveredData && (
              <div
                className="pointer-events-none absolute z-50 rounded-2xl border border-border bg-popover px-3 py-2 text-sm shadow-lg"
                style={{ left: tooltipPos.x, top: tooltipPos.y, transform: "translate(-50%, -120%)" }}
              >
                <div className="flex items-center gap-2">
                  <FlagImg country={hoveredData.name} className="h-5 w-5" />
                  <span className="font-semibold text-popover-foreground">{hoveredData.name}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{hoveredData.seats} seats allocated</p>
              </div>
            )}
          </div>

          <div className="w-full flex-shrink-0 lg:w-[18rem]">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Member States</h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {countries.map((country, index) => (
                <button
                  key={country.name}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    hoveredCountry === index ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                  onMouseEnter={() => setHoveredCountry(index)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: country.color }} />
                  <span className="text-foreground">{country.flag} {country.name}</span>
                  <span className="ml-auto text-muted-foreground">{country.seats}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default HemicycleChart;
