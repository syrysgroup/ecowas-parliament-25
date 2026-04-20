import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

interface SocialMediaBarProps {
  variant?: "full" | "icons-only";
  showParliamentLink?: boolean;
  className?: string;
}

const socials = [
  { name: "X (Twitter)", icon: XIcon, href: "https://x.com/ecoparl_initiatives", color: "text-foreground dark:text-white" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/ecoparl_initiatives", color: "text-[#E4405F]" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/ecoparl_initiatives", color: "text-[#1877F2]" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/ecoparl_initiatives", color: "text-[#0A66C2]" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@ecoparl_initiatives", color: "text-[#FF0000]" },
  { name: "Telegram", icon: TelegramIcon, href: "https://t.me/ecowasparliament_en", color: "text-[#26A5E4]" },
];

const SocialMediaBar = ({ variant = "full", showParliamentLink = true, className = "" }: SocialMediaBarProps) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {variant === "full" && (
          <span className="text-sm font-semibold text-muted-foreground mr-1">@ecoparl_initiatives</span>
        )}
        {socials.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              title={`${s.name} — @ecoparl_initiatives`}
              className={`w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center ${s.color} transition-colors`}
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </div>
      {showParliamentLink && variant === "full" && (
        <p className="text-xs text-muted-foreground mt-2">
          Official ECOWAS Parliament Initiatives:{" "}
          <a href="https://parl.ecowas.int" target="_blank" rel="noreferrer" className="underline hover:text-primary">
            parl.ecowas.int
          </a>
          {" · "}
          <a href="https://x.com/ecowas_parliament" target="_blank" rel="noreferrer" className="underline hover:text-primary">
            @ecowas_parliament
          </a>
        </p>
      )}
    </div>
  );
};

export default SocialMediaBar;
