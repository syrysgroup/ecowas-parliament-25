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
  // Double the list for seamless marquee
  const doubled = [...countries, ...countries];

  return (
    <section className="py-16 bg-muted/30 overflow-hidden">
      <div className="container mb-10">
        <AnimatedSection className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Across <span className="text-primary">12 Member States</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From capitals to communities, the programme unfolds across all ECOWAS Parliament member states.
          </p>
        </AnimatedSection>
      </div>

      {/* Marquee ticker */}
      <div className="relative group">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none" />

        <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
          {doubled.map((country, i) => (
            <div
              key={`${country.name}-${i}`}
              className="flex-shrink-0 flex flex-col items-center mx-6 group/flag cursor-default"
            >
              <div className="w-20 h-14 rounded-lg overflow-hidden shadow-md border border-border bg-card group-hover/flag:scale-110 group-hover/flag:shadow-xl transition-all duration-300">
                <img
                  src={country.flag}
                  alt={`Flag of ${country.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 text-xs font-bold text-card-foreground group-hover/flag:text-primary transition-colors text-center whitespace-nowrap">
                {country.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
