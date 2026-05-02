import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListingCard, { ListingCardData } from "@/components/marketplace/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { ECOWAS_COUNTRIES } from "@/lib/validation/marketplace";
import { Search, Plus, Globe2, Sparkles, ShoppingBag, Users } from "lucide-react";

interface Cat { id: string; name: string; slug: string; }

export default function Marketplace() {
  const [listings, setListings] = useState<(ListingCardData & { id: string; category_id: string | null })[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string>("all");
  const [cat, setCat] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const [{ data: l }, { data: c }] = await Promise.all([
        supabase.from("marketplace_listings")
          .select("id, slug, title, country, image_url, price_min, price_max, currency, unit, moq, is_featured, category_id, category:marketplace_categories(name)")
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

  const filtered = useMemo(() => listings.filter(l => {
    if (country !== "all" && l.country !== country) return false;
    if (cat !== "all" && l.category_id !== cat) return false;
    if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [listings, country, cat, q]);

  return (
    <Layout
      seoTitle="West Africa Marketplace — ECOWAS Parliament Initiatives"
      seoDescription="Discover authentic goods from West African SMEs. Connect directly with verified producers across the 15 ECOWAS member states."
    >
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-ecowas-yellow/30 text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--ecowas-yellow)) 0, transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--secondary)) 0, transparent 40%)"
        }} />
        <div className="container relative z-10 py-20 md:py-28">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-background/15 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
              <Sparkles className="h-3.5 w-3.5" /> West Africa B2B Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
              Real goods. Real producers. <span className="text-ecowas-yellow">One West Africa.</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-primary-foreground/85 max-w-2xl">
              Discover what ECOWAS SMEs offer and connect directly. Buyers leave a clear order request — sellers respond fast.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/marketplace/sell"><Plus className="h-4 w-4 mr-2" />List your goods</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background/10 border-background/30 text-primary-foreground hover:bg-background/20">
                <a href="#listings"><ShoppingBag className="h-4 w-4 mr-2" />Browse listings</a>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
              {[
                { icon: Globe2, label: "15 nations", sub: "ECOWAS region" },
                { icon: ShoppingBag, label: `${listings.length}+ listings`, sub: "Verified SMEs" },
                { icon: Users, label: "Direct B2B", sub: "Buyer–seller" },
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
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-8">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">SEARCH</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Rice, cocoa, kente…" className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5 lg:w-56">
            <label className="text-xs font-semibold text-muted-foreground">COUNTRY</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 lg:w-56">
            <label className="text-xs font-semibold text-muted-foreground">CATEGORY</label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No listings match your filters yet.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/marketplace/sell">Be the first to list</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}