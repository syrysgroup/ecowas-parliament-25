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
  { name: "Benin", flag: flagBenin },
  { name: "Cabo Verde", flag: flagCaboVerde },
  { name: "Côte d'Ivoire", flag: flagCoteDivoire },
  { name: "The Gambia", flag: flagGambia },
  { name: "Ghana", flag: flagGhana },
  { name: "Guinea", flag: flagGuinea },
  { name: "Guinea-Bissau", flag: flagGuineaBissau },
  { name: "Liberia", flag: flagLiberia },
  { name: "Nigeria", flag: flagNigeria },
  { name: "Senegal", flag: flagSenegal },
  { name: "Sierra Leone", flag: flagSierraLeone },
  { name: "Togo", flag: flagTogo },
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
              <div className="group flex flex-col items-center p-5 bg-card rounded-xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <img
                  src={country.flag}
                  alt={`Flag of ${country.name}`}
                  className="w-16 h-12 object-cover rounded-sm mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300"
                />
                <h3 className="font-bold text-card-foreground text-sm text-center group-hover:text-primary transition-colors">
                  {country.name}
                </h3>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
