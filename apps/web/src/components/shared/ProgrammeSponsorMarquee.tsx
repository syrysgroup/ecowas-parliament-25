import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import parliament25Logo from "@/assets/parliament-25-logo.png";

interface ProgrammeSponsorMarqueeProps {
  programme: string;
  speed?: number;
}

const ProgrammeSponsorMarquee = ({ programme, speed = 40 }: ProgrammeSponsorMarqueeProps) => {
  const { data: sponsors = [] } = useQuery({
    queryKey: ["marquee-sponsors", programme],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsors")
        .select("id, name, logo_url, description")
        .eq("is_published", true)
        .contains("programmes", [programme])
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fallback: single parliament logo while loading or if no sponsors
  const items = sponsors.length > 0 ? [...sponsors, ...sponsors] : null;

  if (!items) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/40 py-3 overflow-hidden">
        <div className="inline-flex animate-marquee items-center" style={{ animationDuration: `${speed}s` }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="inline-flex items-center gap-2.5 px-6">
              <img src={parliament25Logo} alt="ECOWAS Parliament Initiatives" className="h-10 w-auto object-contain" loading="lazy" />
              <span className="w-px h-4 bg-border ml-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b border-border/40 py-3 overflow-hidden">
      <div
        className="inline-flex animate-marquee items-center"
        style={{ animationDuration: `${speed}s` }}
      >
        {items.map((s, i) => (
          <div key={i} className="inline-flex items-center gap-2.5 px-6">
            {s.logo_url ? (
              <div className="flex flex-col items-center gap-0.5">
                <img
                  src={s.logo_url}
                  alt={s.name}
                  className="h-10 w-auto max-w-[120px] object-contain"
                  loading="lazy"
                />
                {s.description && (
                  <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wider whitespace-nowrap max-w-[120px] truncate">
                    {s.description}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {s.name}
                </span>
                {s.description && (
                  <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wider whitespace-nowrap">
                    {s.description}
                  </span>
                )}
              </div>
            )}
            <span className="w-px h-4 bg-border ml-3" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgrammeSponsorMarquee;
