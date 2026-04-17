type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, { width: number; height: number; className: string }> = {
  sm: { width: 90, height: 30, className: "h-7 w-auto" },
  md: { width: 130, height: 44, className: "h-10 w-auto" },
  lg: { width: 180, height: 60, className: "h-14 w-auto" },
};

type Props = {
  size?: LogoSize;
  variant?: "light" | "dark" | "auto";
  alt?: string;
};

export default function AppLogo({ size = "md", variant = "auto", alt = "ECOWAS Parliament" }: Props) {
  const { width, height, className } = sizeMap[size];
  const src =
    variant === "dark"
      ? "/images/logo/logo-white.png"
      : "/images/logo/logo.png";

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`${className} object-contain`}
      decoding="async"
      fetchPriority="high"
    />
  );
}
