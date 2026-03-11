interface SponsorLogoProps {
  name: string;
  color: string;
  secondaryColor?: string;
  className?: string;
  size?: number;
}

const getInitials = (name: string) => {
  return name
    .split(/[\s&]+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

// Deterministic shape variant based on name
const getVariant = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  return Math.abs(hash) % 6;
};

const SponsorLogo = ({ name, color, secondaryColor, className = "", size = 80 }: SponsorLogoProps) => {
  const initials = getInitials(name);
  const variant = getVariant(name);
  const sc = secondaryColor || color;
  const half = size / 2;

  const shapes: Record<number, JSX.Element> = {
    0: (
      <>
        <circle cx={half} cy={half} r={half * 0.85} fill={color} opacity="0.12" />
        <circle cx={half} cy={half} r={half * 0.6} fill={color} opacity="0.18" />
      </>
    ),
    1: (
      <>
        <rect x={half * 0.2} y={half * 0.2} width={size * 0.8} height={size * 0.8} rx={size * 0.15} fill={color} opacity="0.12" />
        <rect x={half * 0.5} y={half * 0.5} width={size * 0.5} height={size * 0.5} rx={size * 0.1} fill={sc} opacity="0.15" />
      </>
    ),
    2: (
      <>
        <polygon points={`${half},${half * 0.2} ${size * 0.85},${size * 0.8} ${half * 0.15},${size * 0.8}`} fill={color} opacity="0.12" />
        <circle cx={half} cy={half * 1.1} r={half * 0.35} fill={sc} opacity="0.15" />
      </>
    ),
    3: (
      <>
        <rect x={0} y={half * 0.6} width={size} height={size * 0.45} rx={size * 0.08} fill={color} opacity="0.1" />
        <circle cx={half} cy={half * 0.6} r={half * 0.4} fill={sc} opacity="0.15" />
      </>
    ),
    4: (
      <>
        <ellipse cx={half} cy={half} rx={half * 0.9} ry={half * 0.6} fill={color} opacity="0.12" />
        <line x1={half * 0.3} y1={half} x2={size * 0.85} y2={half} stroke={sc} strokeWidth="2" opacity="0.2" />
      </>
    ),
    5: (
      <>
        <rect x={half * 0.15} y={half * 0.15} width={size * 0.85} height={size * 0.85} rx={size * 0.42} fill={color} opacity="0.1" />
        <rect x={half * 0.4} y={half * 0.4} width={size * 0.6} height={size * 0.6} rx={size * 0.3} fill={sc} opacity="0.1" transform={`rotate(15 ${half} ${half})`} />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={name}
    >
      {shapes[variant]}
      <text
        x={half}
        y={half}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.28}
        fontWeight="800"
        fill={color}
        letterSpacing="1"
      >
        {initials}
      </text>
      <text
        x={half}
        y={half + size * 0.22}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.09}
        fontWeight="600"
        fill={color}
        opacity="0.6"
      >
        {name.length > 18 ? name.slice(0, 16) + "…" : name}
      </text>
    </svg>
  );
};

export default SponsorLogo;
