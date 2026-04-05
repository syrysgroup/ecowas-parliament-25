import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Globe, Mail, Building2 } from "lucide-react";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import parliament25Logo from "@/assets/parliament-25-logo.png";

interface SponsorData {
  slug: string;
  name: string;
  acronym: string;
  description: string;
  programmes: string[];
  tier: string;
  website: string;
  email?: string;
  about: string;
  color: string;
}

const sponsorData: SponsorData[] = [
  {
    slug: "naseni",
    name: "National Agency for Science and Engineering Infrastructure",
    acronym: "NASENI",
    description: "Supporting youth innovation and technology development across West Africa through the ECOWAS Parliament 25th Anniversary Programme.",
    programmes: ["Youth Innovation", "ECOWAS Smart Challenge"],
    tier: "Gold",
    website: "https://naseni.gov.ng",
    about: "NASENI is Nigeria's foremost agency for science and engineering infrastructure development. As a Gold sponsor of the ECOWAS Parliament 25th Anniversary Programme, NASENI is empowering the next generation of West African innovators through technology bootcamps, startup incubation, and the ECOWAS Smart Challenge.",
    color: "hsl(142, 50%, 40%)",
  },
  {
    slug: "smedan",
    name: "Small and Medium Enterprises Development Agency of Nigeria",
    acronym: "SMEDAN",
    description: "Facilitating SME growth and cross-border trade linkages across the ECOWAS region.",
    programmes: ["Trade & SME Forums", "Women's Entrepreneurship"],
    tier: "Silver",
    website: "https://smedan.gov.ng",
    about: "SMEDAN drives SME development policy and programme implementation in Nigeria. Through the 25th Anniversary Programme, SMEDAN supports trade facilitation forums, export readiness programmes, and women-led enterprise development across ECOWAS member states.",
    color: "hsl(190, 35%, 53%)",
  },
  {
    slug: "providus-bank",
    name: "Providus Bank",
    acronym: "Providus",
    description: "Banking partner for the 25th Anniversary Programme, supporting financial inclusion and trade finance across West Africa.",
    programmes: ["Trade & SME Forums", "Awards Ceremony"],
    tier: "Gold",
    website: "https://providusbank.com",
    about: "Providus Bank is a leading Nigerian commercial bank providing innovative financial solutions. As a programme sponsor, Providus Bank supports cross-border trade finance initiatives, the AWALCO Parliamentary Awards, and financial literacy programmes for young West Africans.",
    color: "hsl(152, 100%, 26%)",
  },
  {
    slug: "alliance-economic-research",
    name: "Alliance Economic Research and Ethics",
    acronym: "AERE",
    description: "Providing research and policy analysis for democratic governance and economic integration programmes.",
    programmes: ["Civic Education", "Youth Parliament"],
    tier: "Silver",
    website: "https://allianceresearch.org",
    email: "info@allianceresearch.org",
    about: "Alliance Economic Research and Ethics (AERE) is a policy research organisation focused on democratic governance, economic ethics, and regional integration in Africa. AERE provides analytical support for the programme's civic education campaigns, parliamentary simulations, and governance strengthening initiatives.",
    color: "hsl(220, 60%, 50%)",
  },
];

export default function SponsorPage() {
  const { slug } = useParams<{ slug: string }>();
  const sponsor = sponsorData.find(s => s.slug === slug);

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

  const tierClass = sponsor.tier === "Gold"
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

            <div className="flex items-center gap-6 mb-8">
              <div className="bg-white rounded-2xl p-3 shadow-lg">
                <img src={ecowasLogo} alt="ECOWAS Parliament" className="h-16 w-16 object-contain" />
              </div>
              <span className="text-3xl text-primary-foreground/30 font-light">×</span>
              <div className="bg-white rounded-2xl p-3 shadow-lg">
                <img src={parliament25Logo} alt={sponsor.name} className="h-16 w-16 object-contain" />
              </div>
            </div>

            <Badge className={`${tierClass} border-0 mb-3`}>{sponsor.tier} Sponsor</Badge>
            <h1 className="text-3xl md:text-5xl font-black">{sponsor.acronym}</h1>
            <p className="text-lg text-primary-foreground/70 mt-2">{sponsor.name}</p>
            <p className="mt-4 text-primary-foreground/60 max-w-2xl">{sponsor.description}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl space-y-12">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              About {sponsor.acronym}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{sponsor.about}</p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-2xl font-bold text-foreground mb-4">Programmes Supported</h2>
            <div className="flex flex-wrap gap-3">
              {sponsor.programmes.map(p => (
                <Badge key={p} variant="secondary" className="text-sm px-4 py-2">{p}</Badge>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <Card className="bg-muted/30 border-border">
              <CardContent className="pt-6">
                <h3 className="font-bold text-foreground mb-4">Connect with {sponsor.acronym}</h3>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="default" className="gap-2">
                    <a href={sponsor.website} target="_blank" rel="noreferrer">
                      <Globe className="h-4 w-4" />Visit Website<ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
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

export { sponsorData };
