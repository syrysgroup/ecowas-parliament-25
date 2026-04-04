import { getFlagSrc } from "@/lib/flags";

interface FlagImgProps {
  country: string;
  className?: string;
}

const FlagImg = ({ country, className = "h-6 w-6" }: FlagImgProps) => {
  const src = getFlagSrc(country);
  if (!src) return <span className={className}>🏳️</span>;
  return <img src={src} alt={`${country} flag`} className={`${className} object-cover rounded-sm`} />;
};

export default FlagImg;
