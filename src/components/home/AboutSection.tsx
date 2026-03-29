import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

const stats = [
  { value: "25", label: "Years of regional parliamentary democracy", color: "text-accent" },
  { value: "12", label: "Member states united under one parliament", color: "text-primary" },
  { value: "7", label: "Anniversary programme pillars", color: "text-ecowas-blue" },
  { value: "1,200+", label: "Expected delegates & participants", color: "text-ecowas-lime" },
];

const tags = ["Abuja, Nigeria", "12 Member States", "7 Programmes", "Free Entry", "EN · FR · PT"];

const AboutSection = () => {
  return (
    <section className="py-20 bg-muted/20 border-t border-b border-border">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <AnimatedSection>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              About the 25th Anniversary
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-6">
              A Quarter Century of Democratic Progress
            </h2>
            <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
              <p>
                Established to give voice to the peoples of West Africa through their elected
                representatives, the ECOWAS Parliament has spent 25 years championing regional
                integration, democratic governance, and the rule of law across its 12 member states.
              </p>
              <p>
                The 25th Anniversary programme brings together parliamentarians, civil society,
                youth leaders, entrepreneurs, and international partners in a landmark series of
                forums, ceremonies, and recognition events throughout 2025.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </AnimatedSection>

          {/* Right: Stats grid */}
          <AnimatedSection delay={200}>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors"
                >
                  <p className={`text-4xl font-black leading-none mb-1.5 ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">{stat.label}</p>
                </div>
              ))}
              {/* Logo row spanning 2 cols */}
              <div className="col-span-2 flex items-center gap-3.5 bg-card border border-border rounded-2xl p-4">
                <img
                  src={ecowasLogo}
                  alt="ECOWAS Parliament"
                  className="h-10 w-10 object-contain shrink-0"
                  style={{ filter: "drop-shadow(0 2px 6px hsl(152 100% 26% / 0.3))" }}
                />
                <div>
                  <p className="text-sm font-bold text-card-foreground">ECOWAS Parliament</p>
                  <p className="text-[11px] text-muted-foreground">
                    101 Yakubu Gowon Crescent, Asokoro · Abuja, Nigeria
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
