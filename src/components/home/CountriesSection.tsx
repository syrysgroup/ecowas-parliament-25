import AnimatedSection from "@/components/shared/AnimatedSection";

const countries = [
  { name: "Nigeria", flag: "🇳🇬", role: "Host country & launch venue" },
  { name: "Ghana", flag: "🇬🇭", role: "Smart Challenge finale in Accra" },
  { name: "Côte d'Ivoire", flag: "🇨🇮", role: "Youth parliament & reports in Abidjan" },
  { name: "Senegal", flag: "🇸🇳", role: "Media training forum in Dakar" },
  { name: "Cabo Verde", flag: "🇨🇻", role: "Cultural celebrations" },
  { name: "Togo", flag: "🇹🇬", role: "Trade & SME forum in Lomé" },
  { name: "Sierra Leone", flag: "🇸🇱", role: "Trade forum in Freetown" },
];

const CountriesSection = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Across <span className="text-primary">7 Member States</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From capitals to communities, the programme unfolds across West Africa.
          </p>
        </AnimatedSection>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {countries.map((country, i) => (
            <AnimatedSection key={country.name} delay={i * 80}>
              <div className="group flex flex-col items-center p-5 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-36 md:w-40">
                <span className="text-4xl mb-3">{country.flag}</span>
                <h3 className="font-bold text-card-foreground text-sm text-center">{country.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 text-center leading-snug">{country.role}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
