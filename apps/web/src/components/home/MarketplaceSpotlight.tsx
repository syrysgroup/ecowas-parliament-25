import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FlagImg from "@/components/shared/FlagImg";
import { supabase } from "@/integrations/supabase/client";
import placeholder from "@/assets/parliament-25-logo.png";
import { ArrowRight, Globe2, Plus, ShieldCheck, ShoppingBag, Users } from "lucide-react";

interface SpotlightItem {
  id: string;
  slug: string;
  title: string;
  country: string | null;
  image_url: string | null;
  seller_company: string | null;
  category?: { name: string } | null;
}

export default function MarketplaceSpotlight() {
  const [items, setItems] = useState<SpotlightItem[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, count: c } = await supabase
        .from("marketplace_listings")
        .select(
          "id, slug, title, country, image_url, seller_company, category:marketplace_categories(name)",
          { count: "exact" }
        )
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);
      setItems((data as never) || []);
      setCount(c || 0);
    })();
  }, []);

  const display: SpotlightItem[] =
    items.length > 0
      ? items
      : Array.from({ length: 4 }).map((_, i) => ({
          id: `ph-${i}`,
          slug: "",
          title: "Coming soon",
          country: null,
          image_url: null,
          seller_company: null,
          category: null,
        }));

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: editorial pitch */}
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-5">
              <span className="h-px w-8 bg-primary" />
              ECOWAS Trade Network
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              West African SMEs.<br />
              <span className="text-primary">One trusted marketplace.</span>
            </h2>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              A curated storefront connecting verified West African producers with buyers worldwide.
              List a product, register as a buyer, or browse vetted goods from 12 ECOWAS member states.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/marketplace">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Marketplace
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold">
                <Link to="/marketplace#listings">
                  <Plus className="h-4 w-4 mr-2" />
                  List Your Product
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="font-semibold">
                <Link to="/marketplace#listings">
                  <Users className="h-4 w-4 mr-2" />
                  Register as Buyer
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { icon: Globe2, label: "12", sub: "Member states" },
                { icon: ShoppingBag, label: `${count}+`, sub: "Verified listings" },
                { icon: ShieldCheck, label: "ECOWAS", sub: "Brokered & vetted" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground leading-tight">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Right: clean editorial grid */}
          <AnimatedSection delay={120}>
            <div className="grid grid-cols-2 gap-4">
              {display.map((it) => (
                <Link
                  to={it.slug ? `/marketplace/listings/${it.slug}` : "/marketplace"}
                  key={it.id}
                  className="group block bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40"
                >
                  <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                    <img
                      src={it.image_url || placeholder}
                      alt={it.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {it.category && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 bg-background/90 backdrop-blur text-foreground border-0 text-[10px] font-semibold"
                      >
                        {it.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-sm text-card-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {it.title}
                    </div>
                    {it.country && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
                        <FlagImg country={it.country} className="h-2.5 w-3.5" />
                        <span>{it.country}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <Link
              to="/marketplace"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
            >
              See all listings <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
