import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Eye } from "lucide-react";
import { useTranslation, formatDate } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export default function Events() {
  const { t, locale } = useTranslation();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("date", { ascending: true });
      return data ?? [];
    },
  });

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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No events published yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any, i: number) => {
                const eventDate = new Date(event.date);
                return (
                  <AnimatedSection key={event.id} delay={i * 80}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      {event.cover_image_url ? (
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={event.cover_image_url}
                            alt={event.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <CardContent className="flex-1 flex flex-col p-5">
                        <div className="flex items-center gap-2 mb-2">
                          {event.tag && <Badge variant="secondary" className="text-[10px]">{event.tag}</Badge>}
                          {event.programme && <Badge variant="outline" className="text-[10px]">{event.programme}</Badge>}
                          <span className="text-xs text-muted-foreground">{formatDate(eventDate, locale)}</span>
                        </div>
                        <h3 className="font-bold text-base mb-2 text-foreground line-clamp-2">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{event.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                          {event.country && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.country}</span>}
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
          )}
        </div>
      </section>
    </Layout>
  );
}
