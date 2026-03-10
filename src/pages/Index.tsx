import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import CountdownTimer from "@/components/home/CountdownTimer";
import PillarsGrid from "@/components/home/PillarsGrid";
import CountriesSection from "@/components/home/CountriesSection";
import QuoteStrip from "@/components/home/QuoteStrip";
import LatestNews from "@/components/home/LatestNews";
import PartnersStrip from "@/components/home/PartnersStrip";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CountdownTimer />
      <PillarsGrid />
      <CountriesSection />
      <QuoteStrip />
      <LatestNews />
      <PartnersStrip />
    </Layout>
  );
};

export default Index;
