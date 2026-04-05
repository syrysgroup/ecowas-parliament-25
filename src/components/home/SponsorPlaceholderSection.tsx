import AnimatedSection from "@/components/shared/AnimatedSection";
import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";
import SponsorPlaceholderLogo from "@/components/shared/SponsorPlaceholderLogo";
import { useTranslation } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n";

const mockSponsors = [
  { name: "West African Development Bank" },
  { name: "ECOWAS Commission" },
  { name: "African Union" },
  { name: "United Nations Development Programme" },
  { name: "GIZ West Africa" },
  { name: "Access Bank Group" },
];

const SponsorPlaceholderSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-muted/20 border-t border-border">
      <div className="container">
        <AnimatedSection className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mb-6">
            <Handshake className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {t("sponsorPlaceholder.title")} <span className="text-primary">{t("sponsorPlaceholder.titleAccent")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t("sponsorPlaceholder.subtitle")}</p>
        </AnimatedSection>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {mockSponsors.map((sponsor, i) => (
            <AnimatedSection key={sponsor.name} delay={i * 50}>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
                <SponsorPlaceholderLogo name={sponsor.name} size={40} showName={false} />
                <span className="text-sm font-semibold text-card-foreground">{sponsor.name}</span>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center">
          <Link to="/sponsors" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            {t("sponsorPlaceholder.becomeSponsor")}
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SponsorPlaceholderSection;
