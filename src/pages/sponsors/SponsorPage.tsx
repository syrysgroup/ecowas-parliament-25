import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Globe, Mail, Building2 } from "lucide-react";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import parliament25Logo from "@/assets/parliament-25-logo.png";

export default function SponsorPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: sponsor, isLoading } = useQuery({
    queryKey: ["sponsor", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sponsors")
        .select("id, name, slug, acronym, about, description, tier, website, email, programmes, logo_url")
        .eq("slug", slug!)
        .eq("is_published", true)
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
        <section className="bg-gradient-hero text-primary-foreground py-16">
          <div className="container space-y-4">
            <Skeleton className="h-8 w-32 bg-primary-foreground/20" />
            <Skeleton className="h-12 w-64 bg-primary-foreground/20" />
            <Skeleton className="h-5 w-96 bg-primary-foreground/20" />
          </div>
        </section>
      </Layout>
    );
  }

  if (!sponsor) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container text-center">
            <h1 className="text-3xl font-black text-foreground mb-4">Sponsor not found</h1>
            <Button asChild><Link to="/sponsors">Back to Sponsors</Link></Button>
          </div>
        </section>
      </Layout>
    );
  }

  const tierLabel = sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1);
  const tierClass = sponsor.tier === "gold" || sponsor.tier === "Gold"
    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
    : "bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-300";

  return (
    <Layout>
      {/* Header with logos */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container">
          <AnimatedSection>
            <Button asChild variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 mb-8">
              <Link to="/sponsors"><ArrowLeft className="mr-2 h-4 w-4" />All Sponsors</Link>
            </Button>

            <div className="flex items-center gap-6 mb-8 flex-wrap">
              <div className="bg-white rounded-2xl p-3 shadow-lg">
                <img src={ecowasLogo} alt="ECOWAS Parliament" className="h-16 w-16 object-contain" width={64} height={64} loading="lazy" decoding="async" />
              </div>
              <span className="text-3xl text-primary-foreground/30 font-light">×</span>
              <div className="bg-white rounded-2xl p-3 shadow-lg">
                <img src={parliament25Logo} alt="Parliament@25" className="h-16 w-16 object-contain" width={64} height={64} loading="lazy" decoding="async" />
              </div>
              {sponsor.logo_url && (
                <>
                  <span className="text-3xl text-primary-foreground/30 font-light">×</span>
                  <div className="bg-white rounded-2xl p-3 shadow-lg">
                    <img src={sponsor.logo_url} alt={sponsor.name} className="h-16 w-auto max-w-[4rem] object-contain" width={64} height={64} loading="lazy" decoding="async" />
                  </div>
                </>
              )}
            </div>

            <Badge className={`${tierClass} border-0 mb-3`}>{tierLabel} Sponsor</Badge>
            <h1 className="text-3xl md:text-5xl font-black">{sponsor.acronym || sponsor.name}</h1>
            {sponsor.acronym && <p className="text-lg text-primary-foreground/70 mt-2">{sponsor.name}</p>}
            <p className="mt-4 text-primary-foreground/60 max-w-2xl">{sponsor.description}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl space-y-12">
          {sponsor.about && (
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                About {sponsor.acronym || sponsor.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{sponsor.about}</p>
            </AnimatedSection>
          )}

          {sponsor.programmes && sponsor.programmes.length > 0 && (
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-foreground mb-4">Programmes Supported</h2>
              <div className="flex flex-wrap gap-3">
                {sponsor.programmes.map(p => (
                  <Badge key={p} variant="secondary" className="text-sm px-4 py-2">{p}</Badge>
                ))}
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection>
            <Card className="bg-muted/30 border-border">
              <CardContent className="pt-6">
                <h3 className="font-bold text-foreground mb-4">Connect with {sponsor.acronym || sponsor.name}</h3>
                <div className="flex flex-wrap gap-3">
                  {sponsor.website && (
                    <Button asChild variant="default" className="gap-2">
                      <a href={sponsor.website} target="_blank" rel="noreferrer">
                        <Globe className="h-4 w-4" />Visit Website<ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {sponsor.email && (
                    <Button asChild variant="outline" className="gap-2">
                      <a href={`mailto:${sponsor.email}`}>
                        <Mail className="h-4 w-4" />{sponsor.email}
                      </a>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="gap-2">
                    <Link to="/contact">
                      <Mail className="h-4 w-4" />Sponsorship Enquiries
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
