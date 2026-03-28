import AnimatedSection from "@/components/shared/AnimatedSection";
import flagBenin from "@/assets/flags/benin.png";
import flagCaboVerde from "@/assets/flags/cabo-verde.png";
import flagCoteDivoire from "@/assets/flags/cote-divoire.png";
import flagGambia from "@/assets/flags/gambia.png";
import flagGhana from "@/assets/flags/ghana.png";
import flagGuineaBissau from "@/assets/flags/guinea-bissau.png";
import flagGuinea from "@/assets/flags/guinea.png";
import flagLiberia from "@/assets/flags/liberia.png";
import flagNigeria from "@/assets/flags/nigeria.png";
import flagSenegal from "@/assets/flags/senegal.png";
import flagSierraLeone from "@/assets/flags/sierra-leone.png";
import flagTogo from "@/assets/flags/togo.png";

const countries = [
  { name: "Benin", flag: flagBenin, role: "Cultural & civic programmes" },
  { name: "Cabo Verde", flag: flagCaboVerde, role: "Cultural celebrations" },
  { name: "Côte d'Ivoire", flag: flagCoteDivoire, role: "Youth parliament & reports in Abidjan" },
  { name: "The Gambia", flag: flagGambia, role: "Parliamentary diplomacy engagement" },
  { name: "Ghana", flag: flagGhana, role: "Smart Challenge finale in Accra" },
  { name: "Guinea", flag: flagGuinea, role: "Regional integration forums" },
  { name: "Guinea-Bissau", flag: flagGuineaBissau, role: "Trade & governance programmes" },
  { name: "Liberia", flag: flagLiberia, role: "Civic education & empowerment" },
  { name: "Nigeria", flag: flagNigeria, role: "Host country & launch venue" },
  { name: "Senegal", flag: flagSenegal, role: "Media training forum in Dakar" },
  { name: "Sierra Leone", flag: flagSierraLeone, role: "Trade forum in Freetown" },
  { name: "Togo", flag: flagTogo, role: "Trade & SME forum in Lomé" },
];

const CountriesSection = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Across <span className="text-primary">12 Member States</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From capitals to communities, the programme unfolds across all ECOWAS Parliament member states in West Africa.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {countries.map((country, i) => (
            <AnimatedSection key={country.name} delay={i * 60}>
              <div className="group flex flex-col items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <img
                  src={country.flag}
                  alt={`Flag of ${country.name}`}
                  className="w-12 h-8 object-cover rounded-sm mb-3 shadow-sm"
                />
                <h3 className="font-bold text-card-foreground text-sm text-center">{country.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 text-center leading-snug">{country.role}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
