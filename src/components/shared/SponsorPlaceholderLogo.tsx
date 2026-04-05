import parliament25Logo from "@/assets/parliament-25-logo.png";

interface SponsorPlaceholderLogoProps {
  name: string;
  size?: number;
  showName?: boolean;
}

const SponsorPlaceholderLogo = ({ name, size = 96, showName = true }: SponsorPlaceholderLogoProps) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className="rounded-xl bg-card border border-border p-1.5 flex items-center justify-center"
      style={{ width: size + 12, height: size + 12 }}
    >
      <img
        src={parliament25Logo}
        alt={name}
        className="object-contain"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    </div>
    {showName && (
      <span className="text-[10px] font-semibold text-muted-foreground text-center max-w-[90px] leading-tight">
        {name}
      </span>
    )}
  </div>
);

export default SponsorPlaceholderLogo;
