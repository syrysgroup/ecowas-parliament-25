import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ListingCard, { ListingCardData } from "@/components/marketplace/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { ECOWAS_COUNTRIES } from "@/lib/validation/marketplace";
import { Search, Plus, Globe2, Sparkles, ShoppingBag, Users, SlidersHorizontal, X, ShieldCheck } from "lucide-react";

interface Cat { id: string; name: string; slug: string; }
type FullListing = ListingCardData & { id: string; category_id: string | null; description?: string | null; spec_tags?: string[] | null };

export default function Marketplace() {
  const [listings, setListings] = useState<FullListing[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [catIds, setCatIds] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minMoq, setMinMoq] = useState<string>("");
  const [spec, setSpec] = useState("");
  const [sort, setSort] = useState<"featured" | "newest" | "price_asc" | "price_desc" | "moq_asc">("featured");

  useEffect(() => {
    (async () => {
      const [{ data: l }, { data: c }] = await Promise.all([
        supabase.from("marketplace_listings")
          .select("id, slug, title, description, country, image_url, price_min, price_max, currency, unit, moq, is_featured, category_id, spec_tags, category:marketplace_categories(name)")
          .eq("status", "approved")
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase.from("marketplace_categories").select("id, name, slug").order("sort_order"),
      ]);
      setListings((l as never) || []);
      setCats((c as never) || []);
      setLoading(false);
    })();
  }, []);

  const priceMax = useMemo(() => {
    const m = Math.max(0, ...listings.map(l => l.price_max ?? l.price_min ?? 0));
    return m > 0 ? Math.ceil(m / 100) * 100 : 10000;
  }, [listings]);

  useEffect(() => { setPriceRange([0, priceMax]); }, [priceMax]);

  const toggle = <T,>(arr: T[], v: T): T[] => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const clearAll = () => {
    setQ(""); setCountries([]); setCatIds([]); setPriceRange([0, priceMax]); setMinMoq(""); setSpec(""); setSort("featured");
  };

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    const sl = spec.toLowerCase();
    const moq = Number(minMoq);
    const list = listings.filter(l => {
      if (countries.length && (!l.country || !countries.includes(l.country))) return false;
      if (catIds.length && (!l.category_id || !catIds.includes(l.category_id))) return false;
      if (ql && !(l.title.toLowerCase().includes(ql) || (l.description ?? "").toLowerCase().includes(ql))) return false;
      const p = l.price_min ?? l.price_max ?? 0;
      if (p < priceRange[0] || (l.price_max ?? p) > priceRange[1]) return false;
      if (minMoq && !Number.isNaN(moq) && (l.moq ?? 0) > moq) {
        // user wants AT LEAST `moq` available — listing's MOQ must be <= moq
        return false;
      }
      if (sl) {
        const tags = (l.spec_tags ?? []).join(" ").toLowerCase();
        if (!tags.includes(sl) && !(l.description ?? "").toLowerCase().includes(sl)) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      switch (sort) {
        case "newest": return 0; // already ordered by created desc
        case "price_asc": return (a.price_min ?? Infinity) - (b.price_min ?? Infinity);
        case "price_desc": return (b.price_max ?? b.price_min ?? 0) - (a.price_max ?? a.price_min ?? 0);
        case "moq_asc": return (a.moq ?? Infinity) - (b.moq ?? Infinity);
        case "featured":
        default:
          return Number(b.is_featured) - Number(a.is_featured);
      }
    });
  }, [listings, countries, catIds, q, priceRange, minMoq, spec, sort]);

  const activeFilterCount =
    (q ? 1 : 0) + countries.length + catIds.length + (spec ? 1 : 0) + (minMoq ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < priceMax ? 1 : 0);

  const FiltersPanel = () => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-muted-foreground">SEARCH</label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Rice, cocoa, kente…" className="pl-9" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">COUNTRY</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {ECOWAS_COUNTRIES.map(c => (
            <button key={c} type="button" onClick={() => setCountries(p => toggle(p, c))}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${countries.includes(c) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">CATEGORY</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {cats.map(c => (
            <button key={c.id} type="button" onClick={() => setCatIds(p => toggle(p, c.id))}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${catIds.includes(c.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary"}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">PRICE RANGE (USD)</label>
        <div className="mt-3 px-2">
          <Slider min={0} max={priceMax} step={Math.max(1, Math.round(priceMax / 100))}
            value={priceRange} onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])} />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>${priceRange[0]}</span><span>${priceRange[1]}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">MIN AVAILABLE</label>
          <Input type="number" min="0" value={minMoq} onChange={e => setMinMoq(e.target.value)} placeholder="e.g. 100" className="mt-1.5" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">SIZE / SPEC</label>
          <Input value={spec} onChange={e => setSpec(e.target.value)} placeholder="grade A, 25kg…" className="mt-1.5" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">SORT</label>
        <Select value={sort} onValueChange={(v: never) => setSort(v)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: low → high</SelectItem>
            <SelectItem value="price_desc">Price: high → low</SelectItem>
            <SelectItem value="moq_asc">Lowest MOQ</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
          <X className="h-3.5 w-3.5 mr-1" />Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout
      seoTitle="West Africa Marketplace — ECOWAS Parliament Initiatives"
      seoDescription="ECOWAS Parliament Initiatives is the trusted distributor and guarantor for SME goods across the 15 West African nations."
    >
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-ecowas-yellow/30 text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--ecowas-yellow)) 0, transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--secondary)) 0, transparent 40%)"
        }} />
        <div className="container relative z-10 py-20 md:py-28">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-background/15 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
              <ShieldCheck className="h-3.5 w-3.5" /> ECOWAS-distributed &amp; guaranteed
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
              Real West African goods. <span className="text-ecowas-yellow">Brokered by ECOWAS.</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-primary-foreground/85 max-w-2xl">
              ECOWAS Parliament Initiatives is the trusted distributor and guarantor between verified SMEs and buyers
              across the 15 member states. One contact. Vetted producers. Secure deals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/marketplace/sell"><Plus className="h-4 w-4 mr-2" />List your goods with ECOWAS</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background/10 border-background/30 text-primary-foreground hover:bg-background/20">
                <a href="#listings"><ShoppingBag className="h-4 w-4 mr-2" />Browse listings</a>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
              {[
                { icon: Globe2, label: "15 nations", sub: "ECOWAS region" },
                { icon: ShoppingBag, label: `${listings.length}+ listings`, sub: "Verified SMEs" },
                { icon: ShieldCheck, label: "Guaranteed", sub: "ECOWAS-brokered" },
              ].map((s, i) => (
                <div key={i} className="bg-background/10 backdrop-blur rounded-xl p-3 border border-background/20">
                  <s.icon className="h-5 w-5 mb-1.5 text-ecowas-yellow" />
                  <div className="font-bold text-sm">{s.label}</div>
                  <div className="text-[10px] text-primary-foreground/70">{s.sub}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Filters + grid */}
      <section id="listings" className="container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" />Filters</h2>
                {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount}</Badge>}
              </div>
              <FiltersPanel />
            </div>
          </aside>

          {/* Main */}
          <div>
            {/* Mobile filter trigger */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />Filters
                    {activeFilterCount > 0 && <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="mt-5"><FiltersPanel /></div>
                </SheetContent>
              </Sheet>
              <p className="text-sm text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
            </div>
            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">{filtered.length} of {listings.length} listings</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No listings match your filters yet.</p>
                <Button variant="outline" className="mt-4" onClick={clearAll}>Clear filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}