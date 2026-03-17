import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";

const events = [
  { month: "January 2026", country: "🇳🇬 Nigeria", title: "Programme Kick-off & Planning", description: "Internal coordination and strategic planning sessions in Abuja." },
  { month: "February 2026", country: "🇳🇬 Nigeria", title: "Media Partnerships & Pre-Launch", description: "Engagement with media partners and finalisation of programme materials." },
  { month: "March 2026", country: "🇳🇬 Nigeria", title: "Official Media Announcement Launch", description: "Public media launch at Onomo Allure Abuja AATC Hotel on 5th March. Press conference with key stakeholders." },
  { month: "April 2026", country: "🇬🇭 Ghana / 🇸🇳 Senegal", title: "ECOWAS Smart Challenge & Media Training", description: "National youth innovation competitions begin. Journalists gather in Dakar for regional media training forum." },
  { month: "May 2026", country: "🇨🇮 Côte d'Ivoire", title: "Simulated Youth Parliament", description: "Young people take a seat at the table in Abidjan, launching the Rt. Hon. Speaker's vision of a future ECOWAS Youth Parliament." },
  { month: "June–July 2026", country: "Multiple States", title: "ECOWAS Caravan & Civic Education", description: "The Caravan moves through communities — airports, schools, buses, digital platforms — bringing Parliament closer to citizens." },
  { month: "August 2026", country: "🇨🇮 🇬🇭 🇹🇬 🇸🇱 🇳🇬", title: "Trade & SME Forums", description: "B2B forums, pilot trade corridors, and dialogue with policymakers in Abidjan, Accra, Lomé, Freetown, and Lagos." },
  { month: "September 2026", country: "🇨🇻 Cabo Verde", title: "Cultural & Creative Celebrations", description: "Fashion, film, food, literature, music, art, and sport celebrating West African diversity." },
  { month: "October 2026", country: "Multiple States", title: "ECOWAS TV Game Show & Civic Finale", description: "Civic education takes to the airwaves, blending learning with entertainment across the region." },
  { month: "November 2026", country: "🇳🇬 Nigeria", title: "Grand Finale in Abuja", description: "Leaders, partners, youth, entrepreneurs, and citizens gather for the closing ceremony — gala, documentary storytelling, and reflections." },
];

const Timeline = () => {
  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black">Programme Timeline</h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-2xl">
              A year-long journey across seven ECOWAS Member States — January to November 2026.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-10">
              {events.map((event, i) => (
                <AnimatedSection key={i} delay={i * 80}>
                  <div className="relative pl-12 md:pl-16">
                    {/* Dot */}
                    <div className="absolute left-2.5 md:left-4.5 top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow" />

                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-primary">{event.month}</span>
                        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{event.country}</span>
                      </div>
                      <h3 className="font-bold text-card-foreground text-lg">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Timeline;
