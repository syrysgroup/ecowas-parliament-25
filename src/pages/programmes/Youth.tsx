import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, BrainCircuit, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import SponsorLogo from "@/components/shared/SponsorLogo";
import parliament25Logo from "@/assets/parliament-25-logo.png";

const innovatorsSponsors = [
  { name: "NASENI", color: "hsl(152 100% 26%)" },
  { name: "SMEDAN", color: "hsl(340 66% 34%)" },
  { name: "Canada", color: "hsl(0 84% 40%)" },
];

const smartSponsors = [
  { name: "African Development Bank", color: "hsl(210 60% 40%)" },
  { name: "SYRYS Technologies", color: "hsl(260 50% 45%)" },
  { name: "Resident Technology", color: "hsl(152 100% 26%)" },
];

const Youth = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* Bold Split-Screen Landing */}
      <section className="relative flex-1 flex flex-col overflow-hidden">
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <Button asChild variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.backToHome")}</Link>
          </Button>
        </div>

        <div className="flex-1 grid md:grid-cols-2 relative min-h-[100vh]">
          {/* Left: Innovators Challenge */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground min-h-[50vh] md:min-h-0">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, hsl(152 100% 40% / 0.3) 20px, hsl(152 100% 40% / 0.3) 21px)"
            }} />
            <div className="relative z-10 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3">{t("youth.innovatorsTitle")}</h2>
              <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
                {t("youth.innovatorsDesc")}
              </p>
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg mb-8">
                <Link to="/programmes/youth/innovators">
                  {t("youth.learnMore")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {/* Sponsors */}
              <div className="flex items-center justify-center gap-3 opacity-80">
                {innovatorsSponsors.map((s) => (
                  <SponsorLogo key={s.name} name={s.name} color={s.color} size={40} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Smart Challenge */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-bl from-accent via-accent/95 to-accent/80 text-accent-foreground min-h-[50vh] md:min-h-0">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 20px, hsl(50 87% 55% / 0.3) 20px, hsl(50 87% 55% / 0.3) 21px)"
            }} />
            <div className="relative z-10 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3">{t("youth.smartTitle")}</h2>
              <p className="text-accent-foreground/70 text-sm leading-relaxed mb-6">
                {t("youth.smartDesc")}
              </p>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg mb-8">
                <Link to="/programmes/youth/smart">
                  {t("youth.learnMore")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {/* Sponsors */}
              <div className="flex items-center justify-center gap-3 opacity-80">
                {smartSponsors.map((s) => (
                  <SponsorLogo key={s.name} name={s.name} color={s.color} size={40} />
                ))}
              </div>
            </div>
          </div>

          {/* Center: 25th Anniversary Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
            <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-b from-muted to-muted/80 border-4 border-background shadow-2xl flex items-center justify-center">
              <img src={parliament25Logo} alt="Parliament @25" className="h-28 lg:h-36 w-auto object-contain drop-shadow-lg" />
            </div>
          </div>

          {/* Mobile center logo */}
          <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 md:hidden">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-muted to-muted/80 border-4 border-background shadow-2xl flex items-center justify-center">
              <img src={parliament25Logo} alt="Parliament @25" className="h-20 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Youth;
