import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import CountdownTimer from "@/components/home/CountdownTimer";
import PillarsGrid from "@/components/home/PillarsGrid";
import CountriesSection from "@/components/home/CountriesSection";
import DidYouKnow from "@/components/home/DidYouKnow";
import QuoteStrip from "@/components/home/QuoteStrip";
import SponsorsSection from "@/components/home/SponsorsSection";
import LatestNews from "@/components/home/LatestNews";
import SponsorCTA from "@/components/home/SponsorCTA";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CountdownTimer />
      <PillarsGrid />
      <CountriesSection />
      <DidYouKnow />
      <QuoteStrip />
      <SponsorsSection />
      <LatestNews />
      <SponsorCTA />
    </Layout>
  );
};

export default Index;
