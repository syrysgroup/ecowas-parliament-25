import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import CountdownTimer from "@/components/home/CountdownTimer";
import CountriesSection from "@/components/home/CountriesSection";
import AboutSection from "@/components/home/AboutSection";
import PillarsGrid from "@/components/home/PillarsGrid";
import SponsorsSection from "@/components/home/SponsorsSection";
import EventsSection from "@/components/home/EventsSection";
import StatsSection from "@/components/home/StatsSection";
import LatestNews from "@/components/home/LatestNews";
import NewsletterSection from "@/components/home/NewsletterSection";
import SponsorCTA from "@/components/home/SponsorCTA";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <MarqueeStrip />
      <CountdownTimer />
      <CountriesSection />
      <AboutSection />
      <PillarsGrid />
      <SponsorsSection />
      <EventsSection />
      <StatsSection />
      <LatestNews />
      <NewsletterSection />
      <SponsorCTA />
    </Layout>
  );
};

export default Index;
