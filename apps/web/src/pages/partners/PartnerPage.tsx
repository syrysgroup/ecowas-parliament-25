import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ArrowLeft, Building2, Globe, Twitter, Linkedin, Facebook, User } from "lucide-react";
import NotFound from "@/pages/NotFound";

interface PartnerRecord {
  id: string; name: string; slug: string;
  description: string | null; long_description: string[] | null;
  partner_type: string; website: string | null;
  lead_name: string | null; lead_role: string | null; lead_image_url: string | null;
  logo_url: string | null; social_links: Record<string, string> | null;
}

const TYPE_CONFIG: Record<string, { label: string; gradient: string; accent: string }> = {
  implementing:  { label: "Implementing Partner",  gradient: "from-primary via-primary/80 to-emerald-600",   accent: "text-primary" },
  institutional: { label: "Institutional Partner", gradient: "from-blue-700 via-blue-600 to-blue-500",        accent: "text-blue-600" },
  consultant:    { label: "Consultant",             gradient: "from-violet-700 via-violet-600 to-violet-500",  accent: "text-violet-600" },
};

const PartnerPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: partner, isLoading } = useQuery({
    queryKey: ["partner", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partners")
        .select("id, name, slug, description, long_description, partner_type, website, lead_name, lead_role, lead_image_url, logo_url, social_links")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as PartnerRecord | null;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="space-y-4 w-full max-w-lg px-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-14 w-80" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!partner) return <NotFound />;

  const cfg = TYPE_CONFIG[partner.partner_type] ?? TYPE_CONFIG.implementing;
  const paragraphs = partner.long_description ?? (partner.description ? [partner.description] : []);
  const socialLinks = partner.social_links ?? {};

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${cfg.gradient} text-white`}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative container py-20">
          <AnimatedSection>
            <Link
              to="/stakeholders"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Stakeholders
            </Link>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
              {/* Logo — large */}
              <div className="shrink-0">
                <div className="w-40 h-40 lg:w-52 lg:h-52 rounded-3xl bg-white shadow-2xl flex items-center justify-center p-5 ring-4 ring-white/20">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain"
                      loading="eager"
                    />
                  ) : (
                    <Building2 className="h-16 w-16 text-gray-300" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 mb-4">
                  {cfg.label}
                </span>
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-3">{partner.name}</h1>
                {partner.description && (
                  <p className="text-white/75 text-lg leading-relaxed max-w-2xl">{partner.description}</p>
                )}

                {/* Website + social */}
                <div className="flex flex-wrap gap-3 mt-8">
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
                    >
                      <Globe className="h-4 w-4" /> Visit Website <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/15 hover:bg-white/25 transition-colors border border-white/20">
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/15 hover:bg-white/25 transition-colors border border-white/20">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/15 hover:bg-white/25 transition-colors border border-white/20">
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Main text */}
            <AnimatedSection className="md:col-span-2">
              {paragraphs.length > 0 && (
                <div className="space-y-5">
                  {paragraphs.map((para, i) => (
                    <p key={i} className="text-[15px] text-muted-foreground leading-relaxed">{para}</p>
                  ))}
                </div>
              )}
            </AnimatedSection>

            {/* Lead card sidebar */}
            {(partner.lead_name || partner.lead_image_url) && (
              <AnimatedSection>
                <div className="sticky top-24 rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                  {partner.lead_image_url ? (
                    <div className="w-full aspect-square overflow-hidden">
                      <img
                        src={partner.lead_image_url}
                        alt={partner.lead_name ?? "Lead"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5">
                    {partner.lead_name && (
                      <p className="font-black text-base text-foreground">{partner.lead_name}</p>
                    )}
                    {partner.lead_role && (
                      <p className="text-sm text-muted-foreground mt-1">{partner.lead_role}</p>
                    )}
                    <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${cfg.gradient} opacity-60`} />
                  </div>
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-card border border-border">
              <div>
                <h3 className="text-xl font-black text-foreground">Work with {partner.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Get in touch to explore partnership opportunities.</p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                {partner.website && (
                  <Button asChild>
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <Globe className="h-4 w-4" /> Visit {partner.name} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/contact" className="gap-2">Contact Us</Link>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default PartnerPage;