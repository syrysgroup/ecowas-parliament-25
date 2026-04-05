import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HemicycleChart, { type HemicycleCountryData } from "@/components/parliament/HemicycleChart";
import CountryDelegationCard from "@/components/parliament/CountryDelegationCard";
import NominationTimeline from "@/components/parliament/NominationTimeline";
import ApplicationModal from "@/components/parliament/ApplicationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, MapPin, Trophy, Users, Vote, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fallbackNominees, fallbackRepresentatives } from "@/lib/parliament";
import parliamentHero from "@/assets/parliament-hero-clean.jpg";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import ProgrammeSponsorMarquee from "@/components/shared/ProgrammeSponsorMarquee";
import ProgrammeSponsorsFooter from "@/components/shared/ProgrammeSponsorsFooter";
import FlagImg from "@/components/shared/FlagImg";

type CountryRow = { name: string; flag: string; seats: number };
type NomineeRow = { id: string; full_name: string; country: string; bio?: string; avatar_url?: string; title?: string; organisation?: string; vote_count?: number };
type RepresentativeRow = { id: string; country: string; full_name: string; short_bio?: string; manifesto_summary?: string; headshot_url?: string; avatar_url?: string; title?: string; organisation?: string; featured?: boolean };

const seatPalette = [
  "hsl(var(--ecowas-green))", "hsl(var(--accent))", "hsl(var(--secondary))",
  "hsl(var(--primary))", "hsl(var(--ecowas-lime))", "hsl(var(--ecowas-blue))",
];

const objectives = [
  "Create a visible pathway from application to nomination, vote, and verified representation.",
  "Introduce each accepted delegate with a portrait, short bio, and public mandate.",
  "Give every ECOWAS member state a live view of seats, candidate momentum, and verified delegates.",
  "Support admin and moderator review queues through a secure Supabase-backed workflow.",
];

const principalOfficers = [
  { role: "Speaker", country: "Togo" },
  { role: "1st Deputy Speaker", country: "Nigeria" },
  { role: "2nd Deputy Speaker", country: "Côte d'Ivoire" },
  { role: "3rd Deputy Speaker", country: "Ghana" },
  { role: "4th Deputy Speaker", country: "Gambia" },
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
        (supabase as any).from("public_representatives").select("id, country, full_name, short_bio, manifesto_summary, headshot_url, avatar_url, title, organisation, featured").limit(50),
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
    { name: "Benin", flag: "🇧🇯", seats: 5 }, { name: "Cape Verde", flag: "🇨🇻", seats: 5 },
    { name: "Gambia", flag: "🇬🇲", seats: 5 }, { name: "Ghana", flag: "🇬🇭", seats: 8 },
    { name: "Guinea", flag: "🇬🇳", seats: 6 }, { name: "Guinea-Bissau", flag: "🇬🇼", seats: 5 },
    { name: "Côte d'Ivoire", flag: "🇨🇮", seats: 7 }, { name: "Liberia", flag: "🇱🇷", seats: 5 },
    { name: "Nigeria", flag: "🇳🇬", seats: 35 }, { name: "Senegal", flag: "🇸🇳", seats: 6 },
    { name: "Sierra Leone", flag: "🇸🇱", seats: 5 }, { name: "Togo", flag: "🇹🇬", seats: 5 },
  ];

  const chartCountries: HemicycleCountryData[] = useMemo(
    () => countryRows.map((country, index) => ({ ...country, color: seatPalette[index % seatPalette.length] })),
    [countryRows],
  );

  const totalSeats = countryRows.reduce((sum, country) => sum + country.seats, 0);
  const delegationCards = countryRows.map((country) => ({
    ...country,
    applications: applicationsByCountry[country.name] ?? Math.max(2, Math.ceil(country.seats / 2)),
    nominees: nominees.filter((n) => n.country === country.name).length,
    representatives: representatives.filter((r) => r.country === country.name).length,
  }));

  return (
    <Layout>
      <ProgrammeSponsorMarquee sponsors={[{ name: "EU Delegation ECOWAS" }, { name: "ECOWAS Commission" }, { name: "AWALCO" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 text-primary-foreground">
        <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <AnimatedSection>
            <Button asChild variant="secondary" className="mb-6 -ml-3 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25">
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

      {/* Emulation notice */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <AnimatedSection className="text-center">
            <Badge className="bg-ecowas-green/10 text-ecowas-green border-ecowas-green/20 mb-4">Representation Model</Badge>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">Emulating the ECOWAS Parliament</h2>
            <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">
              The Simulated Youth Parliament mirrors the actual ECOWAS Parliament in its representation structure — each member state is allocated seats proportional to its population, and delegates follow the same institutional hierarchy including Principal Officers and country delegations.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Principal Officers */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black text-foreground">Principal Officers</h2>
            </div>
            <p className="text-muted-foreground">Leadership of the Simulated Youth Parliament · 6th Legislature</p>
          </AnimatedSection>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {principalOfficers.map((officer, index) => (
              <AnimatedSection key={officer.role} delay={index * 60}>
                <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <img src={ecowasLogo} alt="Placeholder" className="mx-auto h-24 w-24 object-contain opacity-40 mb-4" />
                  <Badge className="bg-primary/10 text-primary mb-2 text-xs">{officer.role}</Badge>
                  <p className="font-bold text-card-foreground">—</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <FlagImg country={officer.country} className="h-4 w-4" />
                    <p className="text-xs text-muted-foreground">{officer.country}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">6th Legislature</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs: Delegations / Delegates */}
      <section className="py-16">
        <div className="container">
          <Tabs defaultValue="delegations" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="delegations">Country Delegations</TabsTrigger>
              <TabsTrigger value="delegates">Delegates</TabsTrigger>
            </TabsList>

            <TabsContent value="delegations">
              <AnimatedSection className="mb-8">
                <h2 className="text-2xl font-black text-foreground">Country delegations</h2>
                <p className="mt-1 text-muted-foreground">Click a country to view nominations, voting, and verified delegates.</p>
              </AnimatedSection>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {delegationCards.map((country, index) => (
                  <AnimatedSection key={country.name} delay={index * 40}>
                    <CountryDelegationCard {...country} />
                  </AnimatedSection>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="delegates">
              {/* Principal officers at top */}
              <AnimatedSection className="mb-8">
                <h2 className="text-2xl font-black text-foreground mb-1">Principal Officers & Country Delegates</h2>
                <p className="text-muted-foreground">6th Legislature · Simulated Youth Parliament</p>
              </AnimatedSection>

              <div className="mb-10">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" /> Principal Officers
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {principalOfficers.map((officer, index) => (
                    <div key={officer.role} className="rounded-3xl border border-border bg-card p-4 text-center shadow-sm">
                      <img src={ecowasLogo} alt="Placeholder" className="mx-auto h-20 w-20 object-contain opacity-40 mb-3" />
                      <Badge className="bg-primary/10 text-primary mb-1 text-xs">{officer.role}</Badge>
                      <p className="font-bold text-card-foreground text-sm">—</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <FlagImg country={officer.country} className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">{officer.country}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">6th Legislature</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* All country delegate slots */}
              {countryRows.map((country) => {
                const countryReps = representatives.filter(r => r.country === country.name);
                const emptySlots = Math.max(country.seats - countryReps.length, 0);
                return (
                  <div key={country.name} className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <FlagImg country={country.name} className="h-6 w-6" />
                      <h3 className="text-lg font-bold text-foreground">{country.name}</h3>
                      <span className="text-sm text-muted-foreground">({country.seats} seats)</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                      {countryReps.map((rep) => (
                        <div key={rep.id} className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
                          <img src={rep.headshot_url || rep.avatar_url || ecowasLogo} alt={rep.full_name} className="mx-auto h-20 w-20 rounded-full object-cover mb-2" />
                          <p className="font-semibold text-card-foreground text-sm">{rep.full_name}</p>
                          <p className="text-[10px] text-muted-foreground">6th Legislature</p>
                        </div>
                      ))}
                      {Array.from({ length: emptySlots }).map((_, i) => (
                        <div key={`empty-${i}`} className="rounded-2xl border border-dashed border-border bg-card/50 p-4 text-center">
                          <img src={ecowasLogo} alt="Placeholder" className="mx-auto h-20 w-20 object-contain opacity-20 mb-2" />
                          <p className="font-semibold text-muted-foreground text-sm">—</p>
                          <p className="text-[10px] text-muted-foreground">6th Legislature</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Hemicycle */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection className="mb-8 text-center">
            <h2 className="text-2xl font-black text-foreground">Interactive seating chart</h2>
            <p className="mt-1 text-muted-foreground">Hover the hemicycle to explore the {totalSeats}-seat allocation by country.</p>
          </AnimatedSection>
          <HemicycleChart countries={chartCountries} />
        </div>
      </section>

      {/* Selection process */}
      <section className="py-16">
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

      <section className="bg-muted/30 py-16">
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

      <ProgrammeSponsorsFooter tiers={[
        { label: "Programme Partners", sponsors: [{ name: "EU Delegation ECOWAS" }] },
        { label: "Institutional Partners", sponsors: [{ name: "ECOWAS Commission" }, { name: "AWALCO" }] },
      ]} />
      <ApplicationModal open={modalOpen} onOpenChange={setModalOpen} />
    </Layout>
  );
};

export default Parliament;
