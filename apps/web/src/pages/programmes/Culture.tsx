import { Link } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Palette } from "lucide-react";
import ProgrammeSponsorMarquee from "@/components/shared/ProgrammeSponsorMarquee";
import ProgrammeSponsorsFooter from "@/components/shared/ProgrammeSponsorsFooter";
import CommitteeStakeholders from "@/components/shared/CommitteeStakeholders";
import { useProgrammeVisibility } from "@/hooks/useProgrammeVisibility";

const Culture = () => {
  const { isLoading, isVisible } = useProgrammeVisibility("culture");

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isVisible) {
    return <NotFound />;
  }

  return (
    <Layout>
      <ProgrammeSponsorMarquee programme="culture" />

      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container">
          <Button asChild variant="secondary" className="mb-6">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-6 w-6" />
            <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
              Programme Pillar
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">Cultural & Creative Celebrations</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/80">
            This programme page is visible only when the corresponding pillar is active in admin.
          </p>
        </div>
      </section>

      <CommitteeStakeholders programmeSlug="culture" />
      <ProgrammeSponsorsFooter programme="culture" />
    </Layout>
  );
};

export default Culture;
