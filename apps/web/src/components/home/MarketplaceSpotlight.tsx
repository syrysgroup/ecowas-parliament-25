import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FlagImg from "@/components/shared/FlagImg";
import { supabase } from "@/integrations/supabase/client";
import placeholder from "@/assets/parliament-25-logo.png";
import { ArrowRight, Globe2, Plus, ShieldCheck, ShoppingBag, Sparkles, Users } from "lucide-react";

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
 .select("id, slug, title, country, image_url, seller_company, category:marketplace_categories(name)", { count: "exact" })
 .eq("status", "approved")
 .order("is_featured", { ascending: false })
 .order("created_at", { ascending: false })
 .limit(4);
 setItems((data as never) || []);
 setCount(c || 0);
 })();
 }, []);

 return (
 <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-primary via-primary to-primary/95 text-primary-foreground">
 <div className="absolute inset-0 opacity-25 pointer-events-none" style={{
 backgroundImage:
 "radial-gradient(circle at 15% 20%, hsl(var(--ecowas-yellow)) 0, transparent 45%), radial-gradient(circle at 85% 80%, hsl(var(--secondary)) 0, transparent 50%)",
 }} />
 <div className="container relative z-10">
 <AnimatedSection>
 <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
 {/* Left: pitch */}
 <div>
 <Badge className="bg-ecowas-yellow text-foreground border-0 mb-4 font-semibold">
 <Sparkles className="h-3 w-3 mr-1" />Linked to Trade &amp; SME Programmes
 </Badge>
 <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
 ECOWAS Trade Network <span className="text-ecowas-yellow">Marketplace</span>
 </h2>
 <p className="mt-5 text-lg text-primary-foreground/85 max-w-xl">
 A regional storefront connecting verified West African SMEs with buyers across the world.
 List your product, register as a buyer, or browse vetted goods from 12 ECOWAS member states.
 </p>

 <div className="mt-7 flex flex-wrap gap-3">
 <Button asChild size="lg" variant="secondary" className="font-semibold">
 <Link to="/marketplace"><ShoppingBag className="h-4 w-4 mr-2" />Browse Marketplace</Link>
 </Button>
 <Button asChild size="lg" variant="outline" className="bg-background/10 border-background/30 text-primary-foreground hover:bg-background/20">
 <Link to="/marketplace#listings"><Plus className="h-4 w-4 mr-2" />List Your Product</Link>
 </Button>
 <Button asChild size="lg" variant="outline" className="bg-background/10 border-background/30 text-primary-foreground hover:bg-background/20">
 <Link to="/marketplace#listings"><Users className="h-4 w-4 mr-2" />Register as Buyer</Link>
 </Button>
 </div>

 <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
 {[
 { icon: Globe2, label: "12 nations", sub: "ECOWAS region" },
 { icon: ShoppingBag, label: `${count}+ listings`, sub: "Verified SMEs" },
 { icon: ShieldCheck, label: "Guaranteed", sub: "ECOWAS-brokered" },
 ].map((s, i) => (
 <div key={i} className="bg-background/10 backdrop-blur rounded-xl p-3 border border-background/20">
 <s.icon className="h-5 w-5 mb-1.5 text-ecowas-yellow" />
 <div className="font-bold text-sm">{s.label}</div>
 <div className="text-[10px] text-primary-foreground/70">{s.sub}</div>
 </div>
 ))}
 </div>
 </div>

 {/* Right: 2x2 collage */}
 <div className="grid grid-cols-2 gap-3 sm:gap-4">
 {(items.length > 0 ? items : Array.from({ length: 4 }).map((_, i) => ({
 id: `ph-${i}`, slug: "", title: "Coming soon", country: null, image_url: null, seller_company: null, category: null,
 } as SpotlightItem))).map((it, idx) => (
 <Link
 to={it.slug ? `/marketplace/listings/${it.slug}` : "/marketplace"}
 key={it.id}
 className={`group relative overflow-hidden rounded-2xl border border-background/20 bg-background/5 backdrop-blur aspect-square transition-transform hover:-translate-y-1 hover:shadow-2xl ${idx === 0 ? "row-span-2 col-span-1 aspect-[1/2.05]" : ""}`}
 >
 <img
 src={it.image_url || placeholder}
 alt={it.title}
 className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
 loading="lazy"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
 {it.category && (
 <Badge className="absolute top-2 left-2 bg-ecowas-yellow text-foreground border-0 text-[10px] font-semibold">
 {it.category.name}
 </Badge>
 )}
 <div className="absolute bottom-0 left-0 right-0 p-3 text-primary-foreground">
 <div className="font-bold text-sm leading-tight line-clamp-2">{it.title}</div>
 {it.country && (
 <div className="flex items-center gap-1.5 text-[10px] text-primary-foreground/85 mt-1">
 <FlagImg country={it.country} className="h-2.5 w-3.5" />
 <span>{it.country}</span>
 </div>
 )}
 </div>
 </Link>
 ))}
 <Link to="/marketplace" className="col-span-2 mt-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-ecowas-yellow hover:underline">
 See all listings <ArrowRight className="h-4 w-4" />
 </Link>
 </div>
 </div>
 </AnimatedSection>
 </div>
 </section>
 );
}
