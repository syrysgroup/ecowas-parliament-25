import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, Crown, Globe, Sparkles, Building2, Scale } from "lucide-react";
import NotFound from "@/pages/NotFound";

interface PartnerData {
  name: string;
  fullName: string;
  lead: string;
  role: string;
  type: "implementing" | "institutional";
  description: string;
  longDescription: string[];
  icon: typeof Crown;
  accent: string;
  website?: string;
}

const partnersData: Record<string, PartnerData> = {
  "duchess-nl": {
    name: "Duchess NL",
    fullName: "Duchess NL",
    lead: "Dr. Victoria Akai IIPM",
    role: "CEO",
    type: "implementing",
    description: "Leading implementing partner coordinating the programme direction and executive partnerships.",
    longDescription: [
      "Duchess NL serves as the lead implementing partner for the ECOWAS Parliament 25th Anniversary programme, coordinating the overall programme direction, executive partnerships, and stakeholder engagement strategy.",
      "Under the leadership of Dr. Victoria Akai IIPM, Duchess NL brings extensive experience in international programme management, diplomatic engagement, and institutional partnership development across West Africa and beyond.",
      "The organisation is responsible for aligning the strategic vision of the anniversary programme with the broader goals of the ECOWAS Parliament, ensuring that each pillar — from youth empowerment to trade diplomacy — delivers meaningful impact for the region's citizens.",
    ],
    icon: Crown,
    accent: "bg-primary/10 text-primary",
    website: "",
  },
  "borderless-trade": {
    name: "Borderless Trade & Investment",
    fullName: "Borderless Trade & Investment",
    lead: "Dr. Olori Boye-Ajayi",
    role: "Managing Partner",
    type: "implementing",
    description: "Driving trade diplomacy, regional engagement, and private-sector mobilisation.",
    longDescription: [
      "Borderless Trade & Investment is a strategic implementing partner driving trade diplomacy, regional engagement, and private-sector mobilisation for the 25th Anniversary programme.",
      "Led by Dr. Olori Boye-Ajayi, the organisation specialises in cross-border trade facilitation, economic integration advocacy, and connecting West African enterprises with continental and global markets.",
      "Their work on the anniversary programme focuses on the Trade & SME pillar, facilitating policy dialogue, market access forums, and entrepreneurship support that align with the African Continental Free Trade Area (AfCFTA) implementation goals.",
    ],
    icon: Globe,
    accent: "bg-ecowas-blue/10 text-ecowas-blue",
    website: "",
  },
  "cmd-tourism": {
    name: "CMD Tourism & Trade Enterprises",
    fullName: "CMD Tourism & Trade Enterprises",
    lead: "Madam Cecile Mambo Doumbe",
    role: "CEO",
    type: "implementing",
    description: "Supporting programming, event experience, and community-facing delivery.",
    longDescription: [
      "CMD Tourism & Trade Enterprises supports the programming, event experience, and community-facing delivery of the ECOWAS Parliament 25th Anniversary celebration.",
      "Under the leadership of Madam Cecile Mambo Doumbe, CMD brings deep expertise in tourism development, trade enterprise management, media production, and large-scale event management across the West African region.",
      "The organisation plays a pivotal role in ensuring that anniversary events are accessible, well-produced, and reflective of the cultural diversity and shared heritage of ECOWAS member states.",
    ],
    icon: Sparkles,
    accent: "bg-secondary/10 text-secondary",
    website: "",
  },
  awalco: {
    name: "AWALCO",
    fullName: "Association of West African Legislative Correspondents",
    lead: "",
    role: "Institutional Partner",
    type: "institutional",
    description: "A professional body uniting legislative journalists across West Africa.",
    longDescription: [
      "The Association of West African Legislative Correspondents (AWALCO) is a professional body that brings together legislative journalists and media practitioners across the West African sub-region.",
      "AWALCO plays a critical role in strengthening parliamentary reporting, promoting media freedom, and enhancing public accountability in governance across ECOWAS member states.",
      "As an institutional partner of the 25th Anniversary programme, AWALCO provides media engagement support, ensuring comprehensive coverage of anniversary events and amplifying the Parliament's message to citizens across the region.",
    ],
    icon: Building2,
    accent: "bg-ecowas-blue/10 text-ecowas-blue",
    website: "",
  },
  "alliance-economic-research": {
    name: "Alliance for Economic Research and Ethics LTD/GTE",
    fullName: "Alliance for Economic Research and Ethics LTD/GTE",
    lead: "",
    role: "Institutional Partner",
    type: "institutional",
    description: "An organisation dedicated to evidence-based economic research and ethical governance.",
    longDescription: [
      "The Alliance for Economic Research and Ethics LTD/GTE is dedicated to advancing evidence-based economic research, ethical governance practices, and institutional strengthening across Africa.",
      "The organisation supports policy development through rigorous research, capacity building, and advocacy for transparent and accountable governance structures.",
      "As an institutional partner of the 25th Anniversary programme, the Alliance contributes research expertise and policy analysis to support the Parliament's programmatic goals, particularly in areas of economic integration and governance reform.",
    ],
    icon: Scale,
    accent: "bg-accent/10 text-accent",
    website: "",
  },
};

const PartnerPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const partner = slug ? partnersData[slug] : undefined;

  if (!partner) return <NotFound />;

  const Icon = partner.icon;

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
              {partner.type === "implementing" ? "Implementing Partner" : "Institutional Partner"}
            </Badge>
            <h1 className="mt-2 text-4xl font-black md:text-5xl">{partner.name}</h1>
            {partner.fullName !== partner.name && (
              <p className="mt-2 text-lg text-primary-foreground/60">{partner.fullName}</p>
            )}
            {partner.lead && (
              <p className="mt-4 text-primary-foreground/80">
                <span className="font-semibold">{partner.lead}</span> — {partner.role}
              </p>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-4 rounded-2xl ${partner.accent}`}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">{partner.name}</h2>
                <p className="text-sm text-muted-foreground">{partner.description}</p>
              </div>
            </div>

            <div className="space-y-5">
              {partner.longDescription.map((para, i) => (
                <p key={i} className="text-[15px] text-muted-foreground leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {partner.website && (
              <div className="mt-10 p-6 bg-muted/30 rounded-2xl border border-border">
                <h3 className="text-sm font-bold text-foreground mb-2">Visit Partner Website</h3>
                <Button asChild variant="outline" size="sm">
                  <a href={partner.website} target="_blank" rel="noopener noreferrer">
                    Visit {partner.name} <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            )}

            {!partner.website && (
              <div className="mt-10 p-6 bg-muted/30 rounded-2xl border border-border">
                <p className="text-sm text-muted-foreground">
                  Partner website link will be added soon. Check back for updates.
                </p>
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default PartnerPage;
