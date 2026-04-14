import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroIllustration from "@/components/shared/HeroIllustration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Palette, MapPin, Calendar, Target, Music, Film,
  UtensilsCrossed, BookOpen, Paintbrush, Dumbbell, Theater, Sparkles,
} from "lucide-react";
import FlagImg from "@/components/shared/FlagImg";
import { getFlagSrc } from "@/lib/flags";
import ProgrammeSponsorMarquee from "@/components/shared/ProgrammeSponsorMarquee";
import ProgrammeSponsorsFooter from "@/components/shared/ProgrammeSponsorsFooter";

const artForms = [
  { title: "Fashion", desc: "West African textile traditions — from Kente and Adire to contemporary haute couture — showcased on the runway.", icon: <Sparkles className="h-5 w-5" /> },
  { title: "Film", desc: "Screenings of Nollywood, Ghallywood, and emerging cinema from across the region, with filmmaker Q&As.", icon: <Film className="h-5 w-5" /> },
  { title: "Food", desc: "Culinary showcases featuring jollof, thieboudienne, attieke, and fusion cuisines from all 12 Member States.", icon: <UtensilsCrossed className="h-5 w-5" /> },
  { title: "Literature", desc: "Readings, panel discussions, and book launches celebrating West African storytelling traditions.", icon: <BookOpen className="h-5 w-5" /> },
  { title: "Music", desc: "Live performances spanning Afrobeats, Mbalax, Highlife, Fuji, Coupé-Décalé, and traditional rhythms.", icon: <Music className="h-5 w-5" /> },
  { title: "Visual Art", desc: "Exhibitions of paintings, sculpture, photography, and mixed media from emerging and established artists.", icon: <Paintbrush className="h-5 w-5" /> },
  { title: "Sport", desc: "Friendly inter-country competitions in football, athletics, and traditional games promoting unity.", icon: <Dumbbell className="h-5 w-5" /> },
  { title: "Performance", desc: "Dance, theatre, spoken word, and slam poetry celebrating the oral traditions of the region.", icon: <Theater className="h-5 w-5" /> },
];

const festivalSchedule = [
  { day: "Day 1", title: "Opening Ceremony & Fashion Show", desc: "Grand opening with a pan-West African fashion runway featuring designers from all participating countries." },
  { day: "Day 2", title: "Film Festival & Literary Salon", desc: "Screenings of short films and documentaries, alongside author readings and book launches." },
  { day: "Day 3", title: "Culinary Showcase & Food Market", desc: "A taste of West Africa — chef demonstrations, food stalls, and a cooking competition." },
  { day: "Day 4", title: "Music & Dance Festival", desc: "Live performances from top musicians and dance troupes across the region." },
  { day: "Day 5", title: "Art Exhibition & Sport Day", desc: "Visual art exhibitions open alongside friendly sporting competitions." },
  { day: "Day 6", title: "Cultural Exchange Forum", desc: "Panels on creative industries, cultural policy, and cross-border artistic collaboration." },
  { day: "Day 7", title: "Grand Closing Gala", desc: "A spectacular closing celebration with performances, awards, and the handover to the Grand Finale." },
];

const culturalContributions = [
  { country: "Nigeria", contributions: ["Nollywood", "Afrobeats", "Adire Textiles"] },
  { country: "Ghana", contributions: ["Kente Weaving", "Highlife Music", "Jollof Culture"] },
  { country: "Senegal", contributions: ["Mbalax", "Thieboudienne", "Teranga Hospitality"] },
  { country: "Côte d'Ivoire", contributions: ["Coupé-Décalé", "Attieke", "Contemporary Art"] },
  { country: "Cabo Verde", contributions: ["Morna Music", "Cachupa", "Creole Literature"] },
];

const featuredArtists = [
  { name: "Amara Diop", country: "Senegal", discipline: "Fashion Designer", bio: "Award-winning designer blending traditional Senegalese textiles with contemporary silhouettes." },
  { name: "Kwame Asante", country: "Ghana", discipline: "Filmmaker", bio: "Director whose documentaries on West African diaspora communities have screened at international festivals." },
  { name: "Lúcia Évora", country: "Cabo Verde", discipline: "Musician", bio: "Morna and jazz fusion artist carrying forward the legacy of Cabo Verdean musical tradition." },
  { name: "Chioma Nwosu", country: "Nigeria", discipline: "Visual Artist", bio: "Mixed-media artist exploring identity, migration, and belonging through large-scale installations." },
];

const objectives = [
  "Organise a week-long cultural festival showcasing West African creative industries",
  "Celebrate fashion, film, food, literature, music, art, sport, and performance",
  "Foster cross-cultural dialogue and appreciation across Member States",
  "Support creative entrepreneurs and artists from the region",
  "Culminate in a regional cultural showcase preceding the Grand Finale",
  "Document West African cultural heritage for future generations",
];

const Culture = () => (
  <Layout>
    <ProgrammeSponsorMarquee programme="culture" />
    {/* Hero */}
    <section className="relative py-24 bg-gradient-hero text-primary-foreground overflow-hidden">
      <HeroIllustration theme="culture" />
      <div className="container relative">
        <AnimatedSection>
          <Button asChild variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 mb-6 -ml-3">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-ecowas-lime/20 text-ecowas-lime">
              <Palette className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="border-primary-foreground/20 text-primary-foreground/70">Programme Pillar</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Cultural & Creative<br />Celebrations</h1>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">Fashion, film, food, literature, music, art, and sport celebrating the diversity that binds West Africa together.</p>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: <MapPin className="h-5 w-5" />, value: "Cabo Verde", label: "Host Country" },
              { icon: <Palette className="h-5 w-5" />, value: "8", label: "Art Forms" },
              { icon: <Calendar className="h-5 w-5" />, value: "Sep 2026", label: "Festival Date" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-foreground/10">{s.icon}</div>
                <div>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs text-primary-foreground/50">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Overview */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <AnimatedSection>
          <h2 className="text-2xl font-bold text-foreground mb-4">Overview & Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            Culture gives the 25th Anniversary its rhythm. From fashion runways and film screenings to culinary showcases and live music, this pillar celebrates the extraordinary creative diversity that binds West Africa together. Hosted in Cabo Verde in September 2026, the Cultural & Creative Festival serves as a vibrant bridge between nations — proving that art, food, music, and storytelling are the shared languages of the ECOWAS community. The festival honours the region's rich cultural heritage while creating platforms for emerging artists and creative entrepreneurs.
          </p>
        </AnimatedSection>
      </div>
    </section>

    {/* Art Forms */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">Eight Creative Disciplines</h2>
          <p className="text-muted-foreground mt-1">Celebrating West Africa's creative heritage across every art form</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {artForms.map((a, i) => (
            <AnimatedSection key={i} delay={i * 60}>
              <Card className="h-full group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="p-2.5 rounded-lg bg-ecowas-lime/10 text-ecowas-lime w-fit mb-4 group-hover:bg-ecowas-lime group-hover:text-primary-foreground transition-colors duration-300">
                    {a.icon}
                  </div>
                  <h3 className="font-bold text-card-foreground mb-1">{a.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Festival Programme */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">Festival Programme</h2>
          <p className="text-muted-foreground mt-1">Seven days of celebration in Praia, Cabo Verde — September 2026</p>
        </AnimatedSection>
        <div className="space-y-4">
          {festivalSchedule.map((day, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="py-5 px-6 flex gap-5 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-ecowas-lime/10 text-ecowas-lime flex items-center justify-center font-black text-sm">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="font-bold text-card-foreground">{day.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{day.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Cultural Exchange Map */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">Cultural Contributions</h2>
          <p className="text-muted-foreground mt-1">What each nation brings to the festival</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {culturalContributions.map((c, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <Card className="h-full hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FlagImg country={c.country} className="h-8 w-8" />
                    <h3 className="font-bold text-card-foreground text-lg">{c.country}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.contributions.map((item, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Featured Artists */}
    <section className="py-16">
      <div className="container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">Featured Artists & Curators</h2>
          <p className="text-muted-foreground mt-1">Creative voices shaping the festival</p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredArtists.map((a, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <Card className="h-full text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ecowas-lime/20 via-accent/10 to-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Palette className="h-7 w-7 text-ecowas-lime" />
                  </div>
                  <h3 className="font-bold text-card-foreground">{a.name}</h3>
                  <p className="text-sm text-muted-foreground"><FlagImg country={a.country} className="h-4 w-4 inline mr-1" />{a.country}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">{a.discipline}</Badge>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{a.bio}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Objectives */}
    <section className="py-16 bg-muted/30">
      <div className="container max-w-4xl">
        <AnimatedSection className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Objectives</h2>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 gap-4">
          {objectives.map((obj, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border">
                <Target className="h-5 w-5 text-ecowas-lime flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{obj}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="container text-center">
        <AnimatedSection>
          <h2 className="text-3xl font-black text-foreground mb-4">Celebrate With Us</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join artists, performers, and culture lovers from across West Africa for the biggest creative celebration in ECOWAS history.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="bg-ecowas-lime text-primary-foreground hover:bg-ecowas-lime/90">
              Festival Details Coming Soon
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/timeline">View Timeline</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
    <ProgrammeSponsorsFooter programme="culture" tiers={[
      { label: "Programme Partners", sponsors: [{ name: "Cabo Verde Tourism Board" }] },
      { label: "Institutional Partners", sponsors: [{ name: "ECOWAS Commission" }, { name: "AWALCO" }] },
    ]} />
  </Layout>
);

export default Culture;
