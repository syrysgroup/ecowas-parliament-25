interface SponsorLogoProps {
  name: string;
  color: string;
  size?: number;
}

const getInitials = (name: string) => {
  return name
    .split(/[\s&]+/)
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
};

const patterns: Record<string, (color: string, size: number) => JSX.Element> = {
  diamond: (color, size) => (
    <g>
      <rect x={size * 0.2} y={size * 0.2} width={size * 0.25} height={size * 0.25} rx={2} transform={`rotate(45 ${size * 0.325} ${size * 0.325})`} fill={color} opacity={0.15} />
      <rect x={size * 0.55} y={size * 0.55} width={size * 0.2} height={size * 0.2} rx={2} transform={`rotate(45 ${size * 0.65} ${size * 0.65})`} fill={color} opacity={0.1} />
    </g>
  ),
  circles: (color, size) => (
    <g>
      <circle cx={size * 0.75} cy={size * 0.25} r={size * 0.12} fill={color} opacity={0.1} />
      <circle cx={size * 0.2} cy={size * 0.7} r={size * 0.08} fill={color} opacity={0.08} />
    </g>
  ),
  stripe: (color, size) => (
    <g>
      <rect x={0} y={size * 0.85} width={size} height={size * 0.05} fill={color} opacity={0.2} rx={2} />
      <rect x={0} y={size * 0.92} width={size * 0.6} height={size * 0.03} fill={color} opacity={0.12} rx={1} />
    </g>
  ),
};

const patternKeys = Object.keys(patterns);

const SponsorLogo = ({ name, color, size = 48 }: SponsorLogoProps) => {
  const initials = getInitials(name);
  const patternIndex = name.length % patternKeys.length;
  const pattern = patterns[patternKeys[patternIndex]];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={name}
      className="flex-shrink-0"
    >
      <rect width={size} height={size} rx={size * 0.18} fill={color} opacity={0.08} />
      <rect
        x={1}
        y={1}
        width={size - 2}
        height={size - 2}
        rx={size * 0.18}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        opacity={0.25}
      />
      {pattern(color, size)}
      <text
        x="50%"
        y="52%"
        dominantBaseline="central"
        textAnchor="middle"
        fill={color}
        fontWeight={700}
        fontSize={size * 0.32}
        fontFamily="'Source Sans 3', sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
};

export default SponsorLogo;
