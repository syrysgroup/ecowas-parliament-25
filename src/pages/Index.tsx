import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import CountdownTimer from "@/components/home/CountdownTimer";
import PillarsGrid from "@/components/home/PillarsGrid";
import AnnouncementGallery from "@/components/home/AnnouncementGallery";
import SponsorsSection from "@/components/home/SponsorsSection";
import CountriesSection from "@/components/home/CountriesSection";
import QuoteStrip from "@/components/home/QuoteStrip";
import LatestNews from "@/components/home/LatestNews";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CountdownTimer />
      <PillarsGrid />
      <AnnouncementGallery />
      <SponsorsSection />
      <CountriesSection />
      <QuoteStrip />
      <LatestNews />
    </Layout>
  );
};

export default Index;
