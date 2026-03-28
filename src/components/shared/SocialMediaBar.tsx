import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SocialMediaBarProps {
  variant?: "full" | "icons-only";
  showParliamentLink?: boolean;
  className?: string;
}

const socials = [
  { name: "X (Twitter)", icon: XIcon, href: "https://x.com/ecoparl_hub" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/ecoparl_hub" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/ecoparl_hub" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/ecoparl_hub" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@ecoparl_hub" },
];

const SocialMediaBar = ({ variant = "full", showParliamentLink = true, className = "" }: SocialMediaBarProps) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {variant === "full" && (
          <span className="text-sm font-semibold text-muted-foreground mr-1">@ecoparl_hub</span>
        )}
        {socials.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              title={`${s.name} — @ecoparl_hub`}
              className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </div>
      {showParliamentLink && variant === "full" && (
        <p className="text-xs text-muted-foreground mt-2">
          Official ECOWAS Parliament:{" "}
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
