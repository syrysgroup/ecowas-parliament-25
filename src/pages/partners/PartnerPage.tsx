import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ArrowLeft, Building2 } from "lucide-react";
import NotFound from "@/pages/NotFound";

interface PartnerRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string[] | null;
  partner_type: string;
  website: string | null;
  lead_name: string | null;
  lead_role: string | null;
  lead_image_url: string | null;
  logo_url: string | null;
  social_links: Record<string, string> | null;
}

const PartnerPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: partner, isLoading } = useQuery({
    queryKey: ["partner", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partners")
        .select("id, name, slug, description, long_description, partner_type, website, lead_name, lead_role, lead_image_url, logo_url, social_links")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as PartnerRecord | null;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="bg-gradient-hero py-20 text-primary-foreground">
          <div className="container space-y-4">
            <Skeleton className="h-5 w-32 bg-primary-foreground/20" />
            <Skeleton className="h-12 w-80 bg-primary-foreground/20" />
            <Skeleton className="h-5 w-64 bg-primary-foreground/20" />
          </div>
        </section>
      </Layout>
    );
  }

  if (!partner) return <NotFound />;

  const typeLabel = partner.partner_type === "implementing"
    ? "Implementing Partner"
    : partner.partner_type === "consultant"
    ? "Consultant"
    : "Institutional Partner";

  const accentClass = partner.partner_type === "implementing"
    ? "bg-primary/10 text-primary"
    : "bg-ecowas-blue/10 text-ecowas-blue";

  const paragraphs = partner.long_description ?? (partner.description ? [partner.description] : []);
  const socialLinks = partner.social_links ?? {};

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container">
          <AnimatedSection>
            <Link
              to="/stakeholders"
              className="inline-flex items-center gap-1.5 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Stakeholders
            </Link>
            <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground mb-3">
              {typeLabel}
            </Badge>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">{partner.name}</h1>
            {partner.lead_name && (
              <p className="mt-4 text-primary-foreground/80">
                <span className="font-semibold">{partner.lead_name}</span>
                {partner.lead_role && <> — {partner.lead_role}</>}
              </p>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <AnimatedSection>
            <div className="flex items-start gap-4 mb-8">
              {(partner.logo_url || partner.lead_image_url) ? (
                <img
                  src={partner.logo_url ?? partner.lead_image_url!}
                  alt={partner.name}
                  className="h-16 w-16 rounded-2xl object-contain bg-white border border-border p-1 shrink-0"
                />
              ) : (
                <div className={`p-4 rounded-2xl ${accentClass} shrink-0`}>
                  <Building2 className="h-8 w-8" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-black text-foreground">{partner.name}</h2>
                {partner.description && (
                  <p className="text-sm text-muted-foreground mt-1">{partner.description}</p>
                )}
              </div>
            </div>

            {partner.lead_image_url && partner.logo_url && (
              <div className="flex items-center gap-4 mb-8 p-4 bg-muted/30 rounded-2xl border border-border">
                <img src={partner.lead_image_url} alt={partner.lead_name ?? ""} className="h-16 w-16 rounded-full object-cover border border-border" width={64} height={64} loading="lazy" decoding="async" />
                <div>
                  {partner.lead_name && <p className="font-semibold text-foreground">{partner.lead_name}</p>}
                  {partner.lead_role && <p className="text-sm text-muted-foreground">{partner.lead_role}</p>}
                </div>
              </div>
            )}

            {paragraphs.length > 0 && (
              <div className="space-y-5">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-[15px] text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-10 p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
              {partner.website ? (
                <>
                  <h3 className="text-sm font-bold text-foreground">Visit Partner Website</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" size="sm">
                      <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        Visit {partner.name} <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Partner website link will be added soon. Check back for updates.
                </p>
              )}

              {Object.keys(socialLinks).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {socialLinks.twitter && (
                    <Button asChild variant="ghost" size="sm" className="text-xs">
                      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter / X</a>
                    </Button>
                  )}
                  {socialLinks.linkedin && (
                    <Button asChild variant="ghost" size="sm" className="text-xs">
                      <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </Button>
                  )}
                  {socialLinks.facebook && (
                    <Button asChild variant="ghost" size="sm" className="text-xs">
                      <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default PartnerPage;
