import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HemicycleChart, { type HemicycleCountryData } from "@/components/parliament/HemicycleChart";
import CountryDelegationCard from "@/components/parliament/CountryDelegationCard";
import NominationTimeline from "@/components/parliament/NominationTimeline";
import ApplicationModal from "@/components/parliament/ApplicationModal";
import PeopleCard from "@/components/parliament/PeopleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Trophy, Users, Vote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fallbackNominees, fallbackRepresentatives } from "@/lib/parliament";
import parliamentHero from "@/assets/parliament-hero-clean.jpg";
import ProgrammeSponsorMarquee from "@/components/shared/ProgrammeSponsorMarquee";
import ProgrammeSponsorsFooter from "@/components/shared/ProgrammeSponsorsFooter";

type CountryRow = {
  name: string;
  flag: string;
  seats: number;
};

type NomineeRow = {
  id: string;
  full_name: string;
  country: string;
  bio?: string;
  avatar_url?: string;
  title?: string;
  organisation?: string;
  vote_count?: number;
};

type RepresentativeRow = {
  id: string;
  country: string;
  full_name: string;
  short_bio?: string;
  manifesto_summary?: string;
  headshot_url?: string;
  avatar_url?: string;
  title?: string;
  organisation?: string;
  featured?: boolean;
};

const seatPalette = [
  "hsl(var(--ecowas-green))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--primary))",
  "hsl(var(--ecowas-lime))",
  "hsl(var(--ecowas-blue))",
];

const objectives = [
  "Create a visible pathway from application to nomination, vote, and verified representation.",
  "Introduce each accepted delegate with a portrait, short bio, and public mandate.",
  "Give every ECOWAS member state a live view of seats, candidate momentum, and verified delegates.",
  "Support admin and moderator review queues through a secure Supabase-backed workflow.",
];

const Parliament = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [nominees, setNominees] = useState<NomineeRow[]>(fallbackNominees);
  const [representatives, setRepresentatives] = useState<RepresentativeRow[]>(fallbackRepresentatives);
  const [applicationsByCountry, setApplicationsByCountry] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      const [countriesRes, nomineesRes, representativesRes, applicationsRes] = await Promise.all([
        (supabase as any).from("countries").select("name, flag, seats").order("sort_order"),
        (supabase as any).from("public_nominee_leaderboard").select("id, full_name, country, bio, avatar_url, title, organisation, vote_count").order("vote_count", { ascending: false }).limit(8),
        (supabase as any).from("public_representatives").select("id, country, full_name, short_bio, manifesto_summary, headshot_url, avatar_url, title, organisation, featured").limit(8),
        (supabase as any).from("applications").select("country, status"),
      ]);

      if (countriesRes.data?.length) setCountries(countriesRes.data);
      if (nomineesRes.data?.length) setNominees(nomineesRes.data);
      if (representativesRes.data?.length) setRepresentatives(representativesRes.data);

      const counts = (applicationsRes.data ?? []).reduce((acc: Record<string, number>, item: { country: string }) => {
        acc[item.country] = (acc[item.country] ?? 0) + 1;
        return acc;
      }, {});
      setApplicationsByCountry(counts);
    };

    void loadData();
  }, []);

  const countryRows = countries.length ? countries : [
    { name: "Benin", flag: "🇧🇯", seats: 5 },
    { name: "Cape Verde", flag: "🇨🇻", seats: 5 },
    { name: "Gambia", flag: "🇬🇲", seats: 5 },
    { name: "Ghana", flag: "🇬🇭", seats: 8 },
    { name: "Guinea", flag: "🇬🇳", seats: 6 },
    { name: "Guinea-Bissau", flag: "🇬🇼", seats: 5 },
    { name: "Côte d'Ivoire", flag: "🇨🇮", seats: 7 },
    { name: "Liberia", flag: "🇱🇷", seats: 5 },
    { name: "Nigeria", flag: "🇳🇬", seats: 35 },
    { name: "Senegal", flag: "🇸🇳", seats: 6 },
    { name: "Sierra Leone", flag: "🇸🇱", seats: 5 },
    { name: "Togo", flag: "🇹🇬", seats: 5 },
  ];

  const chartCountries: HemicycleCountryData[] = useMemo(
    () => countryRows.map((country, index) => ({ ...country, color: seatPalette[index % seatPalette.length] })),
    [countryRows],
  );

  const totalSeats = countryRows.reduce((sum, country) => sum + country.seats, 0);
  const delegationCards = countryRows.map((country) => ({
    ...country,
    applications: applicationsByCountry[country.name] ?? Math.max(2, Math.ceil(country.seats / 2)),
    nominees: nominees.filter((nominee) => nominee.country === country.name).length,
    representatives: representatives.filter((representative) => representative.country === country.name).length,
  }));

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-hero py-20 text-primary-foreground">
        <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <AnimatedSection>
            <Button asChild variant="ghost" className="mb-6 -ml-3 text-primary-foreground/70 hover:text-primary-foreground">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
            </Button>
            <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Programme Pillar</Badge>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Simulated Youth Parliament</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/75">
              A public-facing selection platform where young people apply, nominate, vote, and meet the verified delegates representing each ECOWAS country.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { label: "Total seats", value: totalSeats, icon: Users },
                { label: "Countries", value: 12, icon: MapPin },
                { label: "Live nominees", value: nominees.length, icon: Vote },
                { label: "Verified reps", value: representatives.length, icon: Trophy },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary-foreground/10 p-2"><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className="text-2xl font-black">{item.value}</p>
                      <p className="text-xs text-primary-foreground/60">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="overflow-hidden rounded-[2rem] border border-primary-foreground/15 bg-primary-foreground/10 p-3 shadow-2xl">
              <img src={parliamentHero} alt="Youth parliament chamber" className="aspect-[16/11] w-full rounded-[1.4rem] object-cover" loading="lazy" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl">
          <AnimatedSection className="text-center">
            <h2 className="text-2xl font-black text-foreground md:text-3xl">Public representation, not just registration</h2>
            <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">
              The parliament page now surfaces real delegate discovery: approved nominees with portraits and vote counts, plus accepted representatives with biographies so citizens can see who is speaking for them.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection className="mb-8 text-center">
            <h2 className="text-2xl font-black text-foreground">Interactive seating chart</h2>
            <p className="mt-1 text-muted-foreground">Hover the hemicycle to explore the 104-seat allocation by country.</p>
          </AnimatedSection>
          <HemicycleChart countries={chartCountries} />
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-black text-foreground">Country delegations</h2>
            <p className="mt-1 text-muted-foreground">Applications, nominee visibility, and verified delegate coverage by member state.</p>
          </AnimatedSection>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {delegationCards.map((country, index) => (
              <AnimatedSection key={country.name} delay={index * 40}>
                <CountryDelegationCard {...country} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-foreground">Top nominees and public leaderboard</h2>
              <p className="mt-1 text-muted-foreground">People can discover who is earning support before moderators verify final delegates.</p>
            </div>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {nominees.slice(0, 4).map((nominee, index) => (
              <AnimatedSection key={nominee.id} delay={index * 60}>
                <PeopleCard
                  image={nominee.avatar_url || fallbackNominees[index % fallbackNominees.length].avatar_url}
                  name={nominee.full_name}
                  country={nominee.country}
                  role={nominee.title || "Public nominee"}
                  bio={nominee.bio || "Public-facing nominee awaiting final verification."}
                  organisation={nominee.organisation}
                  badge="Nominee"
                  votes={nominee.vote_count || 0}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-black text-foreground">Accepted and verified representatives</h2>
            <p className="mt-1 text-muted-foreground">Published delegates can now be seen with portraits, mandate summaries, and a brief public bio.</p>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {representatives.slice(0, 4).map((representative, index) => (
              <AnimatedSection key={representative.id} delay={index * 60}>
                <PeopleCard
                  image={representative.headshot_url || representative.avatar_url || fallbackRepresentatives[index % fallbackRepresentatives.length].headshot_url}
                  name={representative.full_name}
                  country={representative.country}
                  role={representative.title || "Verified delegate"}
                  bio={representative.short_bio || representative.manifesto_summary || "Verified youth representative for their national delegation."}
                  organisation={representative.organisation}
                  badge={representative.featured ? "Featured representative" : "Verified"}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container max-w-3xl">
          <AnimatedSection className="mb-8">
            <h2 className="text-2xl font-black text-foreground">Selection process</h2>
            <p className="mt-1 text-muted-foreground">How applications, nominations, votes, and verification work together.</p>
          </AnimatedSection>
          <NominationTimeline />
          <AnimatedSection delay={300} className="mt-8 text-center">
            <Button size="lg" onClick={() => setModalOpen(true)}>Apply, nominate, or vote</Button>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-4 md:grid-cols-2">
          {objectives.map((objective, index) => (
            <AnimatedSection key={objective} delay={index * 60}>
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{objective}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <ApplicationModal open={modalOpen} onOpenChange={setModalOpen} />
    </Layout>
  );
};

export default Parliament;
