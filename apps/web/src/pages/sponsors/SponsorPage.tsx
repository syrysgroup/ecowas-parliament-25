import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Globe, Mail, Building2, Award, ChevronRight } from "lucide-react";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import parliament25Logo from "@/assets/parliament-25-logo.png";

const PROGRAMME_META: Record<string, { label: string; emoji: string }> = {
  youth:      { label: "Youth Innovation",     emoji: "🚀" },
  trade:      { label: "Trade & SME",           emoji: "🤝" },
  women:      { label: "Women's Forum",         emoji: "⚡" },
  civic:      { label: "Civic Education",       emoji: "🏛️" },
  culture:    { label: "Culture & Creativity",  emoji: "🎨" },
  awards:     { label: "AWALCO Awards",         emoji: "🏆" },
  parliament: { label: "Youth Parliament",      emoji: "🌍" },
};

const TIER_CONFIG: Record<string, { label: string; gradient: string; badge: string; accent: string }> = {
  presenting: { label: "Presenting Sponsor",  gradient: "from-primary via-primary/80 to-primary/60",   badge: "bg-primary/20 text-primary border-primary/30",         accent: "text-primary" },
  platinum:   { label: "Platinum Sponsor",    gradient: "from-slate-700 via-slate-600 to-slate-500",    badge: "bg-slate-100 text-slate-800 border-slate-200",         accent: "text-slate-600" },
  gold:       { label: "Gold Sponsor",        gradient: "from-amber-600 via-amber-500 to-yellow-400",   badge: "bg-amber-100 text-amber-800 border-amber-200",         accent: "text-amber-600" },
  silver:     { label: "Silver Sponsor",      gradient: "from-slate-500 via-slate-400 to-slate-300",    badge: "bg-slate-100 text-slate-700 border-slate-200",         accent: "text-slate-500" },
  bronze:     { label: "Bronze Sponsor",      gradient: "from-orange-700 via-orange-600 to-orange-400", badge: "bg-orange-100 text-orange-800 border-orange-200",       accent: "text-orange-600" },
  standard:   { label: "Sponsor",             gradient: "from-primary/70 via-primary/50 to-primary/30", badge: "bg-muted text-muted-foreground border-border",          accent: "text-muted-foreground" },
};

export default function SponsorPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: sponsor, isLoading } = useQuery({
    queryKey: ["sponsor", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sponsors")
        .select("id, name, slug, acronym, about, description, tier, website, email, programmes, logo_url")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as {
        id: string; name: string; slug: string; acronym: string | null;
        about: string | null; description: string | null; tier: string;
        website: string | null; email: string | null; programmes: string[];
        logo_url: string | null;
      } | null;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="space-y-4 w-full max-w-lg px-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-14 w-80" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!sponsor) {
    return (
      <Layout>
        <section className="py-32 text-center">
          <div className="container">
            <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-foreground mb-4">Sponsor not found</h1>
            <Button asChild><Link to="/sponsors">← Back</Link></Button>
          </div>
        </section>
      </Layout>
    );
  }

  const tierCfg = TIER_CONFIG[sponsor.tier] ?? TIER_CONFIG.standard;
  const displayName = sponsor.acronym || sponsor.name;

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${tierCfg.gradient} text-white`}>
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative container py-20">
          <AnimatedSection>
            <Link
              to="/sponsors"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> All Sponsors
            </Link>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
              {/* Sponsor logo — large and bold */}
              <div className="shrink-0">
                <div className="w-40 h-40 lg:w-56 lg:h-56 rounded-3xl bg-white shadow-2xl flex items-center justify-center p-5 ring-4 ring-white/20">
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain"
                      loading="eager"
                    />
                  ) : (
                    <span className="text-6xl font-black text-gray-300">{displayName.charAt(0)}</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-white/15 text-white border-white/20 mb-4`}>
                  <Award className="h-3 w-3" />
                  {tierCfg.label}
                </span>

                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-2">{displayName}</h1>
                {sponsor.acronym && (
                  <p className="text-xl text-white/70 font-medium mb-4">{sponsor.name}</p>
                )}
                {sponsor.description && (
                  <p className="text-white/75 text-lg leading-relaxed max-w-2xl">{sponsor.description}</p>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-8">
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
                    >
                      <Globe className="h-4 w-4" /> Visit Website <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {sponsor.email && (
                    <a
                      href={`mailto:${sponsor.email}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 text-white font-bold text-sm hover:bg-white/25 transition-colors border border-white/20"
                    >
                      <Mail className="h-4 w-4" /> Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Partnership logos */}
            <div className="mt-14 pt-8 border-t border-white/20 flex items-center gap-4 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">In partnership with</span>
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-xl p-2 shadow-md">
                  <img src={ecowasLogo} alt="ECOWAS Parliament Initiatives" className="h-10 w-10 object-contain" loading="lazy" />
                </div>
                <div className="bg-white rounded-xl p-2 shadow-md">
                  <img src={parliament25Logo} alt="Parliament@25" className="h-10 w-10 object-contain" loading="lazy" />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── About ── */}
      {(sponsor.about || (sponsor.programmes && sponsor.programmes.length > 0)) && (
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* About text */}
              {sponsor.about && (
                <AnimatedSection className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-5">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-black text-foreground">About {displayName}</h2>
                  </div>
                  <div className="space-y-4">
                    {sponsor.about.split("\n\n").map((para, i) => (
                      <p key={i} className="text-muted-foreground leading-relaxed text-[15px]">{para}</p>
                    ))}
                  </div>
                </AnimatedSection>
              )}

              {/* Programmes sidebar */}
              {sponsor.programmes && sponsor.programmes.length > 0 && (
                <AnimatedSection>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-5">Programmes Supported</h3>
                  <div className="space-y-2">
                    {sponsor.programmes.map(p => {
                      const meta = PROGRAMME_META[p];
                      return (
                        <div
                          key={p}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border"
                        >
                          <span className="text-lg">{meta?.emoji ?? "🌍"}</span>
                          <span className="text-sm font-semibold text-foreground">{meta?.label ?? p}</span>
                        </div>
                      );
                    })}
                  </div>
                </AnimatedSection>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact strip ── */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-card border border-border">
              <div>
                <h3 className="text-xl font-black text-foreground">Connect with {displayName}</h3>
                <p className="text-sm text-muted-foreground mt-1">Reach out directly or enquire about sponsorship opportunities.</p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                {sponsor.website && (
                  <Button asChild>
                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <Globe className="h-4 w-4" /> Website <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                {sponsor.email && (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${sponsor.email}`} className="gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </a>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/contact" className="gap-2">
                    <Mail className="h-4 w-4" /> Sponsorship Enquiries <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}