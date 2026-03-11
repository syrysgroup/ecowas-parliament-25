import { useState } from "react";
import AnimatedSection from "@/components/shared/AnimatedSection";

export interface CountryData {
  name: string;
  code: string;
  seats: number;
  flag: string;
  color: string;
}

export const COUNTRIES: CountryData[] = [
  { name: "Nigeria", code: "NG", seats: 35, flag: "🇳🇬", color: "hsl(140, 60%, 35%)" },
  { name: "Ghana", code: "GH", seats: 8, flag: "🇬🇭", color: "hsl(45, 85%, 50%)" },
  { name: "Ivory Coast", code: "CI", seats: 7, flag: "🇨🇮", color: "hsl(25, 80%, 50%)" },
  { name: "Guinea", code: "GN", seats: 6, flag: "🇬🇳", color: "hsl(0, 70%, 50%)" },
  { name: "Senegal", code: "SN", seats: 6, flag: "🇸🇳", color: "hsl(152, 60%, 40%)" },
  { name: "Benin", code: "BJ", seats: 5, flag: "🇧🇯", color: "hsl(120, 50%, 40%)" },
  { name: "Burkina Faso", code: "BF", seats: 5, flag: "🇧🇫", color: "hsl(10, 75%, 45%)" },
  { name: "Cape Verde", code: "CV", seats: 5, flag: "🇨🇻", color: "hsl(220, 70%, 45%)" },
  { name: "Gambia", code: "GM", seats: 5, flag: "🇬🇲", color: "hsl(210, 65%, 50%)" },
  { name: "Guinea-Bissau", code: "GW", seats: 5, flag: "🇬🇼", color: "hsl(50, 70%, 45%)" },
  { name: "Liberia", code: "LR", seats: 5, flag: "🇱🇷", color: "hsl(230, 55%, 50%)" },
  { name: "Mali", code: "ML", seats: 5, flag: "🇲🇱", color: "hsl(55, 80%, 45%)" },
  { name: "Niger", code: "NE", seats: 5, flag: "🇳🇪", color: "hsl(30, 85%, 55%)" },
  { name: "Sierra Leone", code: "SL", seats: 5, flag: "🇸🇱", color: "hsl(190, 60%, 45%)" },
  { name: "Togo", code: "TG", seats: 5, flag: "🇹🇬", color: "hsl(165, 55%, 40%)" },
];

const TOTAL_SEATS = COUNTRIES.reduce((sum, c) => sum + c.seats, 0);

const HemicycleChart = () => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Generate seat positions in a hemicycle (semicircle) layout
  const generateSeats = () => {
    const seats: { x: number; y: number; country: CountryData; seatIndex: number }[] = [];
    const rows = 5;
    const centerX = 400;
    const centerY = 340;
    const minRadius = 120;
    const maxRadius = 300;

    // Flatten all seats with country assignments
    const allSeats: { country: CountryData; seatIndex: number }[] = [];
    COUNTRIES.forEach((country) => {
      for (let i = 0; i < country.seats; i++) {
        allSeats.push({ country, seatIndex: i });
      }
    });

    let seatIdx = 0;
    for (let row = 0; row < rows; row++) {
      const radius = minRadius + (maxRadius - minRadius) * (row / (rows - 1));
      const seatsInRow = row === 0 ? 15 : row === 1 ? 20 : row === 2 ? 25 : row === 3 ? 27 : 28;
      const actualSeats = Math.min(seatsInRow, allSeats.length - seatIdx);

      for (let i = 0; i < actualSeats && seatIdx < allSeats.length; i++) {
        const angle = Math.PI - (Math.PI * (i + 0.5)) / actualSeats;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY - radius * Math.sin(angle);
        seats.push({ x, y, ...allSeats[seatIdx] });
        seatIdx++;
      }
    }

    return seats;
  };

  const seats = generateSeats();
  const activeCountry = selectedCountry || hoveredCountry;
  const activeData = COUNTRIES.find((c) => c.code === activeCountry);

  return (
    <AnimatedSection>
      <div className="relative bg-card rounded-3xl border border-border shadow-lg overflow-hidden">
        {/* Header */}
        <div className="text-center pt-8 pb-4 px-6">
          <h3 className="text-2xl md:text-3xl font-black text-foreground">
            ECOWAS Youth Parliament Chamber
          </h3>
          <p className="text-muted-foreground mt-1">
            {TOTAL_SEATS} seats across 15 member states
          </p>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* SVG Chart */}
          <div className="flex-1 px-4 pb-4">
            <svg viewBox="0 20 800 360" className="w-full max-w-2xl mx-auto">
              {/* Speaker podium */}
              <rect x="350" y="310" width="100" height="40" rx="8" fill="hsl(var(--primary))" opacity="0.15" />
              <text x="400" y="335" textAnchor="middle" fontSize="11" fontWeight="700" fill="hsl(var(--primary))">
                SPEAKER
              </text>

              {/* Seats */}
              {seats.map((seat, i) => {
                const isActive = activeCountry === seat.country.code;
                const isFaded = activeCountry && !isActive;
                return (
                  <circle
                    key={i}
                    cx={seat.x}
                    cy={seat.y}
                    r={isActive ? 10 : 8}
                    fill={seat.country.color}
                    opacity={isFaded ? 0.2 : 1}
                    stroke={isActive ? "hsl(var(--foreground))" : "transparent"}
                    strokeWidth={isActive ? 2 : 0}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredCountry(seat.country.code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() =>
                      setSelectedCountry(
                        selectedCountry === seat.country.code ? null : seat.country.code
                      )
                    }
                  />
                );
              })}
            </svg>
          </div>

          {/* Legend / Info Panel */}
          <div className="lg:w-80 p-6 border-t lg:border-t-0 lg:border-l border-border bg-muted/30">
            {activeData ? (
              <div className="text-center lg:text-left space-y-3">
                <div className="text-4xl">{activeData.flag}</div>
                <h4 className="text-xl font-bold text-foreground">{activeData.name}</h4>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: activeData.color }}
                  />
                  <span className="text-lg font-semibold text-foreground">
                    {activeData.seats} seat{activeData.seats > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {((activeData.seats / TOTAL_SEATS) * 100).toFixed(1)}% of total representation
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-foreground mb-3">Member States</h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      className="flex items-center gap-2 w-full text-left px-2 py-1 rounded-md hover:bg-muted transition-colors text-sm"
                      onMouseEnter={() => setHoveredCountry(c.code)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() =>
                        setSelectedCountry(selectedCountry === c.code ? null : c.code)
                      }
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-foreground">{c.flag} {c.name}</span>
                      <span className="ml-auto font-semibold text-muted-foreground">{c.seats}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default HemicycleChart;
