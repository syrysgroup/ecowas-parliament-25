import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import PeopleCard from "@/components/parliament/PeopleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Vote, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FlagImg from "@/components/shared/FlagImg";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

type NomineeRow = {
  id: string; full_name: string; country: string; bio?: string;
  avatar_url?: string; title?: string; organisation?: string; vote_count?: number;
};

type RepresentativeRow = {
  id: string; country: string; full_name: string; short_bio?: string;
  manifesto_summary?: string; headshot_url?: string; avatar_url?: string;
  title?: string; organisation?: string; featured?: boolean;
};

type CountryRow = { name: string; flag: string; seats: number };

const countryFallback: CountryRow[] = [
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

export default function ParliamentCountry() {
  const { country: slug } = useParams<{ country: string }>();
  const countryName = decodeURIComponent(slug || "");

  const [countryInfo, setCountryInfo] = useState<CountryRow | null>(null);
  const [nominees, setNominees] = useState<NomineeRow[]>([]);
  const [representatives, setRepresentatives] = useState<RepresentativeRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const [countriesRes, nomineesRes, repsRes] = await Promise.all([
        (supabase as any).from("countries").select("name, flag, seats").eq("name", countryName).single(),
        (supabase as any).from("public_nominee_leaderboard").select("id, full_name, country, bio, avatar_url, title, organisation, vote_count").eq("country", countryName).order("vote_count", { ascending: false }),
        (supabase as any).from("public_representatives").select("id, country, full_name, short_bio, manifesto_summary, headshot_url, avatar_url, title, organisation, featured").eq("country", countryName),
      ]);

      if (countriesRes.data) setCountryInfo(countriesRes.data);
      else {
        const fb = countryFallback.find(c => c.name === countryName);
        if (fb) setCountryInfo(fb);
      }

      setNominees(nomineesRes.data ?? []);
      setRepresentatives(repsRes.data ?? []);
    };
    void load();
  }, [countryName]);

  if (!countryInfo) {
    return (
      <Layout>
        <section className="py-20"><div className="container text-center">
          <h1 className="text-3xl font-black text-foreground mb-4">Country not found</h1>
          <Button asChild><Link to="/programmes/parliament">Back to Parliament</Link></Button>
        </div></section>
      </Layout>
    );
  }

  const seats = countryInfo.seats;

  return (
    <Layout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container">
          <AnimatedSection>
            <Button asChild variant="secondary" className="mb-6 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25">
              <Link to="/programmes/parliament"><ArrowLeft className="mr-2 h-4 w-4" />Back to Parliament</Link>
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <FlagImg country={countryName} className="h-12 w-12" />
              <div>
                <h1 className="text-3xl md:text-5xl font-black">{countryName}</h1>
                <p className="text-primary-foreground/70 text-lg">{seats} parliamentary seats · 6th Legislature</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Nominees */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Vote className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black text-foreground">Nominees & Voting</h2>
            </div>
            <p className="text-muted-foreground">Public nominees from {countryName} earning support through community votes.</p>
          </AnimatedSection>
          {nominees.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {nominees.map((nominee, index) => (
                <AnimatedSection key={nominee.id} delay={index * 60}>
                  <PeopleCard
                    image={nominee.avatar_url || ecowasLogo}
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
          ) : (
            <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
              <p className="text-muted-foreground">No nominees yet for {countryName}. Applications are open.</p>
            </div>
          )}
        </div>
      </section>

      {/* Verified delegates */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <AnimatedSection className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black text-foreground">Verified Delegates</h2>
            </div>
            <p className="text-muted-foreground">Accepted representatives for {countryName} in the Simulated Youth Parliament.</p>
          </AnimatedSection>
          {representatives.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {representatives.map((rep, index) => (
                <AnimatedSection key={rep.id} delay={index * 60}>
                  <PeopleCard
                    image={rep.headshot_url || rep.avatar_url || ecowasLogo}
                    name={rep.full_name}
                    country={rep.country}
                    role={rep.title || "Verified delegate"}
                    bio={rep.short_bio || rep.manifesto_summary || "Verified youth representative for their national delegation."}
                    organisation={rep.organisation}
                    badge={rep.featured ? "Featured" : "Verified"}
                  />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
              <p className="text-muted-foreground">Delegate slots for {countryName} are open. {seats} seat(s) available.</p>
            </div>
          )}

          {/* Placeholder slots for unfilled seats */}
          {representatives.length < seats && (
            <div className="mt-8">
              <p className="text-sm text-muted-foreground mb-4">{Math.max(seats - representatives.length, 0)} unfilled seat(s)</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: Math.max(seats - representatives.length, 0) }).map((_, i) => (
                  <div key={i} className="rounded-3xl border border-dashed border-border bg-card/50 p-5 text-center">
                    <img src={ecowasLogo} alt="Placeholder" className="mx-auto h-20 w-20 object-contain opacity-30 mb-3" width={80} height={80} loading="lazy" decoding="async" />
                    <p className="text-sm font-semibold text-muted-foreground">—</p>
                    <p className="text-xs text-muted-foreground">6th Legislature</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
