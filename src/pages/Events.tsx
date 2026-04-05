import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Eye } from "lucide-react";
import { useTranslation, formatDate } from "@/lib/i18n";

import eventLaunch from "@/assets/events/event-launch.jpg";
import eventSmart from "@/assets/events/event-smart.jpg";
import eventParliament from "@/assets/events/event-parliament.jpg";
import eventTrade from "@/assets/events/event-trade.jpg";
import eventCulture from "@/assets/events/event-culture.jpg";
import eventFinale from "@/assets/events/event-finale.jpg";

const eventFliers: Record<string, string> = {
  ev1: eventLaunch, ev2: eventSmart, ev3: eventParliament,
  ev4: eventTrade, ev5: eventCulture, ev6: eventFinale,
};

const staticEvents = [
  { id: "ev1", title: "Official Launch & Awards Nominations Open", description: "The 25th Anniversary programme is officially launched at a press conference in Abuja.", date: "2026-03-05T09:00:00Z", location: "Onomo Allure Abuja AATC Hotel", country: "Nigeria", programme: "Awards", capacity: 300 },
  { id: "ev2", title: "ECOWAS Smart Challenge & Media Training Forum", description: "National youth innovation competitions in Ghana and Senegal with media training for 50+ journalists.", date: "2026-04-15T09:00:00Z", location: "Accra International Conference Centre", country: "Ghana", programme: "Youth", capacity: 500 },
  { id: "ev3", title: "Simulated Youth Parliament", description: "150+ young people from across West Africa debate policy issues in a simulated ECOWAS Parliament session.", date: "2026-05-20T09:00:00Z", location: "Palais de la Culture, Abidjan", country: "Côte d'Ivoire", programme: "Parliament", capacity: 200 },
  { id: "ev4", title: "Trade & SME Forums", description: "B2B forums bringing together SME owners, investors, and policymakers across five cities.", date: "2026-08-10T09:00:00Z", location: "Multiple venues", country: "Nigeria", programme: "Trade", capacity: 400 },
  { id: "ev5", title: "West African Cultural & Creative Festival", description: "A week-long celebration of West African cultural diversity — fashion, film, food, literature, music, art, and sport.", date: "2026-09-15T09:00:00Z", location: "Praia Convention Centre", country: "Cabo Verde", programme: "Culture", capacity: 1000 },
  { id: "ev6", title: "Grand Finale & Awards Ceremony", description: "Leaders, partners, youth champions, and citizens gather for the closing ceremony and inaugural AWALCO Parliamentary Awards.", date: "2026-11-20T18:00:00Z", location: "ECOWAS Parliament Complex, Abuja", country: "Nigeria", programme: "Awards", capacity: 500 },
];

export default function Events() {
  const { t, locale } = useTranslation();

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 mb-3">{t("events.upcoming")}</Badge>
            <h1 className="text-4xl md:text-5xl font-black">{t("events.title")}</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">{t("events.subtitle")}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticEvents.map((event, i) => {
              const eventDate = new Date(event.date);
              const flier = eventFliers[event.id];
              return (
                <AnimatedSection key={event.id} delay={i * 80}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={flier}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="flex-1 flex flex-col p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px]">{event.programme}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(eventDate, locale)}</span>
                      </div>
                      <h3 className="font-bold text-base mb-2 text-foreground line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{event.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.country}</span>
                        {event.capacity && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.capacity}</span>}
                      </div>
                      <Button asChild className="w-full gap-2">
                        <Link to={`/events/${event.id}`}>
                          <Eye className="h-4 w-4" />View More
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
