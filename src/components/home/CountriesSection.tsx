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
  const doubled = [...countries, ...countries];

  return (
    <section className="py-8 bg-card border-t border-b border-border overflow-hidden">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-5">
        12 ECOWAS Member States
      </p>

      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-card to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-card to-transparent pointer-events-none" />

        <div className="flex animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: "24s" }}>
          {doubled.map((country, i) => (
            <div
              key={`${country.name}-${i}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 mx-2.5 px-4 py-3 bg-muted/30 border border-border rounded-xl min-w-[106px] hover:border-primary/30 hover:-translate-y-1 transition-all cursor-default"
            >
              <img
                src={country.flag}
                alt={`Flag of ${country.name}`}
                className="w-[62px] h-10 object-cover rounded shadow-md"
              />
              <p className="text-[10px] font-bold text-muted-foreground text-center whitespace-nowrap leading-tight">
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
