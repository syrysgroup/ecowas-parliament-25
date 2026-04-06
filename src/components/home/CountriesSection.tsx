import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { getFlagSrc } from "@/lib/flags";

interface CountryRow {
  id: string;
  name: string;
  code: string | null;
  flag_url: string | null;
}

const CountriesSection = () => {
  const { t } = useTranslation();

  const { data: countries = [], isLoading } = useQuery<CountryRow[]>({
    queryKey: ["countries-marquee"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("countries")
        .select("id, name, code, flag_url")
        .order("name");
      return data ?? [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour — country list is static
  });

  if (isLoading) {
    return (
      <section className="py-8 bg-card border-t border-b border-border overflow-hidden">
        <div className="flex gap-2 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-28 rounded-xl flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  const doubled = [...countries, ...countries];

  return (
    <section className="py-8 bg-card border-t border-b border-border overflow-hidden">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-5">
        {t("countries.heading")}
      </p>
      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-card to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        <div className="flex animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: "24s" }}>
          {doubled.map((country, i) => {
            // Prefer Supabase Storage URL; fall back to local bundled asset
            const flagSrc = country.flag_url || getFlagSrc(country.name);
            return (
              <div
                key={`${country.id}-${i}`}
                className="flex-shrink-0 flex flex-col items-center gap-2 mx-2.5 px-4 py-3 bg-muted/30 border border-border rounded-xl min-w-[106px] hover:border-primary/30 hover:-translate-y-1 transition-all cursor-default"
              >
                {flagSrc ? (
                  <img
                    src={flagSrc}
                    alt={country.name}
                    className="w-[62px] h-10 object-cover rounded shadow-md"
                    loading="lazy"
                    width={62}
                    height={40}
                    decoding="async"
                  />
                ) : (
                  <div className="w-[62px] h-10 rounded shadow-md bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono">{country.code}</span>
                  </div>
                )}
                <p className="text-[10px] font-bold text-muted-foreground text-center whitespace-nowrap leading-tight">{country.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
