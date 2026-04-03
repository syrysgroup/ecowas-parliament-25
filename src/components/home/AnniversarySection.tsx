import AnimatedSection from "@/components/shared/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import parliament25Logo from "@/assets/parliament-25-logo.png";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

const stats = [
  { value: "25", label: "Years of regional parliamentary representation", color: "text-accent" },
  { value: "12", label: "Member states united under one parliament", color: "text-primary" },
  { value: "7", label: "Anniversary programme pillars", color: "text-ecowas-blue" },
  { value: "1,200+", label: "Expected delegates & participants", color: "text-ecowas-lime" },
];

const tags = ["Abuja, Nigeria", "12 Member States", "7 Programmes", "Free Entry", "EN · FR · PT"];

const AnniversarySection = () => {
  return (
    <section className="py-20 bg-muted/20 border-t border-b border-border">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Logo in circular white shape */}
          <AnimatedSection className="flex justify-center">
            <div className="relative">
              <div className="w-96 h-96 md:w-[28rem] md:h-[28rem] rounded-full bg-gray-200 border-4 border-ecowas-green shadow-xl flex items-center justify-center">
                <img
                  src={parliament25Logo}
                  alt="Parliament at 25 Anniversary Logo"
                  className="h-72 md:h-80 w-auto object-contain drop-shadow-[0_0_30px_hsl(152_100%_26%/0.15)]"
                />
              </div>
              {/* Subtle decorative ring */}
              <div className="absolute inset-0 w-96 h-96 md:w-[28rem] md:h-[28rem] rounded-full border-2 border-ecowas-green/20 scale-110" />
            </div>
          </AnimatedSection>

          {/* Right: Text + Stats */}
          <div>
            <AnimatedSection delay={100}>
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
                🏛️ Parliament at 25
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-5">
                A Quarter Century of <span className="text-primary">Representation</span>
              </h2>
              <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
                <p>
                  Established to give voice to the peoples of West Africa through their elected
                  representatives, the ECOWAS Parliament has spent 25 years championing regional
                  integration, representation of the people, and the rule of law across its 12 member states.
                </p>
                <p>
                  The "Parliament at 25" emblem represents a quarter century of democratic
                  representation. It symbolises the unity of 12 member states under a shared
                  parliamentary vision — promoting integration and the aspirations of over 400 million West Africans.
                </p>
                <p>
                  The anniversary programme spans seven pillars — from youth empowerment and
                  trade diplomacy to cultural celebration and civic education — each reflecting
                  the Parliament's enduring commitment to the people it serves.
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

            {/* Stats grid */}
            <AnimatedSection delay={250} className="mt-8">
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
                  <div className="bg-white rounded-full p-1.5 shadow-sm shrink-0">
                    <img
                      src={ecowasLogo}
                      alt="ECOWAS Parliament"
                      className="h-9 w-9 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-card-foreground">ECOWAS Parliament</p>
                    <p className="text-[11px] text-muted-foreground">
                      Herbert Macaulay Way, Central Business District, P.M.B. 576, Abuja, Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnniversarySection;
