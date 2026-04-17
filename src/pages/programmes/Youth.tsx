import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, BrainCircuit } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import parliament25Logo from "@/assets/parliament-25-logo.png";
import innovatorsBg from "@/assets/youth-innovators-bg.jpg";
import smartBg from "@/assets/youth-smart-bg.jpg";
import ProgrammeSponsorMarquee from "@/components/shared/ProgrammeSponsorMarquee";
import ProgrammeSponsorsFooter from "@/components/shared/ProgrammeSponsorsFooter";

interface SponsorRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

const Youth = () => {
  const { t } = useTranslation();

  const { data: sponsors = [] } = useQuery<SponsorRow[]>({
    queryKey: ["sponsors-youth-inline"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("sponsors")
        .select("id, name, slug, logo_url")
        .eq("is_published", true)
        .contains("programmes", ["youth"])
        .order("sort_order")
        .limit(6);

      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <ProgrammeSponsorMarquee programme="youth" />

      <section className="relative flex-1 flex flex-col overflow-hidden">
        {/* BACK BUTTON */}
        <div className="absolute top-6 left-6 z-20">
          <Button asChild variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25">
            <Link to="/">
              <span className="mr-2">←</span>
              {t("common.backToHome")}
            </Link>
          </Button>
        </div>

        <div className="flex-1 grid md:grid-cols-2 relative min-h-[100vh]">

          {/* LEFT */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 text-primary-foreground overflow-hidden">
            <img src={innovatorsBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/70" />

            <div className="relative z-10 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-accent" />
              </div>

              <h2 className="text-3xl md:text-4xl font-black mb-3">
                {t("youth.innovatorsTitle")}
              </h2>

              <p className="text-primary-foreground/70 text-sm mb-6">
                {t("youth.innovatorsDesc")}
              </p>

              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold mb-8">
                <Link to="/programmes/youth/innovators">
                  {t("youth.learnMore")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              {/* LEFT SPONSORS */}
              {sponsors.length > 0 && (
                <div className="grid grid-cols-3 gap-3 place-items-center max-w-xs mx-auto">
                  {sponsors.slice(0, 3).map((s) => (
                    <Link
                      key={s.id}
                      to={`/sponsors/${s.slug}`}
                      className="flex items-center justify-center w-full"
                    >
                      <div className="h-20 w-full flex items-center justify-center">
                        {s.logo_url ? (
                          <img
                            src={s.logo_url}
                            alt={s.name}
                            loading="lazy"
                            decoding="async"
                            className="max-h-16 max-w-full object-contain opacity-90 transition-all duration-300 hover:scale-105 hover:opacity-100"
                          />
                        ) : (
                          <span className="text-[10px] font-semibold text-primary-foreground/80 uppercase tracking-wider text-center leading-tight">
                            {s.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 text-accent-foreground overflow-hidden">
            <img src={smartBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-accent/60" />

            <div className="relative z-10 text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>

              <h2 className="text-3xl md:text-4xl font-black mb-3">
                {t("youth.smartTitle")}
              </h2>

              <p className="text-accent-foreground/70 text-sm mb-6">
                {t("youth.smartDesc")}
              </p>

              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold mb-8">
                <Link to="/programmes/youth/smart">
                  {t("youth.learnMore")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              {/* RIGHT SPONSORS */}
              {sponsors.length > 3 && (
                <div className="grid grid-cols-3 gap-3 place-items-center max-w-xs mx-auto">
                  {sponsors.slice(3, 6).map((s) => (
                    <Link
                      key={s.id}
                      to={`/sponsors/${s.slug}`}
                      className="flex items-center justify-center w-full"
                    >
                      <div className="h-20 w-full flex items-center justify-center">
                        {s.logo_url ? (
                          <img
                            src={s.logo_url}
                            alt={s.name}
                            loading="lazy"
                            decoding="async"
                            className="max-h-16 max-w-full object-contain opacity-90 transition-all duration-300 hover:scale-105 hover:opacity-100"
                          />
                        ) : (
                          <span className="text-[10px] font-semibold text-accent-foreground/80 uppercase tracking-wider text-center leading-tight">
                            {s.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CENTER LOGO (UNCHANGED) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
            <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-b from-muted to-muted/80 border-4 border-background shadow-2xl flex items-center justify-center">
              <img
                src={parliament25Logo}
                alt="Parliament @25"
                className="h-28 lg:h-36 w-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>

        </div>
      </section>

      <ProgrammeSponsorsFooter programme="youth" />
    </div>
  );
};

export default Youth;
