import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import SpeakerSection from "@/components/home/SpeakerSection";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import CountdownTimer from "@/components/home/CountdownTimer";
import CountriesSection from "@/components/home/CountriesSection";
import AnniversarySection from "@/components/home/AnniversarySection";
import PillarsGrid from "@/components/home/PillarsGrid";
import ImplementingPartnersSection from "@/components/home/ImplementingPartnersSection";
import InstitutionalPartnersSection from "@/components/home/InstitutionalPartnersSection";
import SponsorPlaceholderSection from "@/components/home/SponsorPlaceholderSection";
import EventsSection from "@/components/home/EventsSection";
import StatsSection from "@/components/home/StatsSection";
import DidYouKnow from "@/components/home/DidYouKnow";
import LatestNews from "@/components/home/LatestNews";
import NewsletterSection from "@/components/home/NewsletterSection";
import SponsorCTA from "@/components/home/SponsorCTA";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <SpeakerSection />
      <MarqueeStrip />
      <CountdownTimer />
      <CountriesSection />
      <AnniversarySection />
      <PillarsGrid />
      <ImplementingPartnersSection />
      <InstitutionalPartnersSection />
      <SponsorPlaceholderSection />
      <EventsSection />
      <StatsSection />
      <DidYouKnow />
      <LatestNews />
      <NewsletterSection />
      <SponsorCTA />
    </Layout>
  );
};

export default Index;
