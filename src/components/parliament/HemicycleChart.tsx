import { useState } from "react";
import AnimatedSection from "@/components/shared/AnimatedSection";

interface CountryData {
  name: string;
  seats: number;
  color: string;
  flag: string;
}

const countries: CountryData[] = [
  { name: "Nigeria", seats: 35, color: "hsl(var(--ecowas-green))", flag: "🇳🇬" },
  { name: "Ghana", seats: 8, color: "#ce1126", flag: "🇬🇭" },
  { name: "Côte d'Ivoire", seats: 7, color: "#f77f00", flag: "🇨🇮" },
  { name: "Senegal", seats: 6, color: "#00853f", flag: "🇸🇳" },
  { name: "Guinea", seats: 6, color: "#ce1126", flag: "🇬🇳" },
  { name: "Benin", seats: 5, color: "#008751", flag: "🇧🇯" },
  { name: "Cape Verde", seats: 5, color: "#003893", flag: "🇨🇻" },
  { name: "Gambia", seats: 5, color: "#3a7728", flag: "🇬🇲" },
  { name: "Guinea-Bissau", seats: 5, color: "#ce1126", flag: "🇬🇼" },
  { name: "Liberia", seats: 5, color: "#002868", flag: "🇱🇷" },
  { name: "Sierra Leone", seats: 5, color: "#1eb53a", flag: "🇸🇱" },
  { name: "Togo", seats: 5, color: "#006a4e", flag: "🇹🇬" },
  { name: "Burkina Faso", seats: 5, color: "#ef2b2d", flag: "🇧🇫" },
  { name: "Mali", seats: 5, color: "#14b53a", flag: "🇲🇱" },
  { name: "Niger", seats: 3, color: "#e05206", flag: "🇳🇪" },
];

const totalSeats = countries.reduce((sum, c) => sum + c.seats, 0);

const generateSeatPositions = () => {
  const seats: { x: number; y: number; countryIndex: number }[] = [];
  const rows = 5;
  const centerX = 250;
  const centerY = 230;

  let seatIndex = 0;
  const allSeats = countries.flatMap((c, ci) =>
    Array.from({ length: c.seats }, () => ci)
  );

  for (let row = 0; row < rows; row++) {
    const radius = 90 + row * 35;
    const seatsInRow = Math.round((allSeats.length / rows) * (0.7 + row * 0.15));
    const actualSeats = Math.min(seatsInRow, allSeats.length - seatIndex);

    for (let s = 0; s < actualSeats; s++) {
      if (seatIndex >= allSeats.length) break;
      const angle = Math.PI * (0.08 + (s / (actualSeats - 1 || 1)) * 0.84);
      const x = centerX + radius * Math.cos(Math.PI - angle);
      const y = centerY - radius * Math.sin(angle);
      seats.push({ x, y, countryIndex: allSeats[seatIndex] });
      seatIndex++;
    }
  }

  return seats;
};

const seatPositions = generateSeatPositions();

const HemicycleChart = () => {
  const [hoveredCountry, setHoveredCountry] = useState<number | null>(null);

  return (
    <AnimatedSection>
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-foreground">ECOWAS Parliament Hemicycle</h3>
          <p className="text-sm text-muted-foreground mt-1">{totalSeats} seats across 15 Member States</p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* SVG Hemicycle */}
          <div className="flex-1 w-full max-w-lg mx-auto">
            <svg viewBox="0 0 500 260" className="w-full" aria-label="Hemicycle seating chart">
              {/* Podium */}
              <rect x={210} y={210} width={80} height={30} rx={6} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={1} />
              <text x={250} y={229} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={9} fontWeight={600}>
                SPEAKER
              </text>

              {seatPositions.map((seat, i) => {
                const country = countries[seat.countryIndex];
                const isHighlighted = hoveredCountry === null || hoveredCountry === seat.countryIndex;
                return (
                  <circle
                    key={i}
                    cx={seat.x}
                    cy={seat.y}
                    r={6.5}
                    fill={country.color}
                    opacity={isHighlighted ? 0.9 : 0.15}
                    stroke={hoveredCountry === seat.countryIndex ? "hsl(var(--foreground))" : "none"}
                    strokeWidth={1.5}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCountry(seat.countryIndex)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  >
                    <title>{country.name} — {country.seats} seats</title>
                  </circle>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <h4 className="text-sm font-semibold text-foreground mb-3">Member States</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
              {countries.map((country, i) => (
                <button
                  key={country.name}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs transition-colors ${
                    hoveredCountry === i
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                  onMouseEnter={() => setHoveredCountry(i)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: country.color }}
                  />
                  <span className="text-foreground">{country.flag} {country.name}</span>
                  <span className="text-muted-foreground ml-auto">{country.seats}</span>
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
