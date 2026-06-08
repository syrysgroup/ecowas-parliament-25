import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ListingCard, { ListingCardData } from "@/components/marketplace/ListingCard";
import SellerListingDrawer from "@/components/marketplace/SellerListingDrawer";
import BuyerRegistrationDrawer from "@/components/marketplace/BuyerRegistrationDrawer";
import ConnectionRequestModal, { ConnectionListing } from "@/components/marketplace/ConnectionRequestModal";
import { supabase } from "@/integrations/supabase/client";
import { ECOWAS_COUNTRIES } from "@/lib/validation/marketplace";
import { Search, Plus, Globe2, ShoppingBag, Users, ShieldCheck } from "lucide-react";

interface Cat { id: string; name: string; slug: string }
type FullListing = ListingCardData & { id: string; category_id: string | null };

export default function Marketplace() {
 const [listings, setListings] = useState<FullListing[]>([]);
 const [cats, setCats] = useState<Cat[]>([]);
 const [loading, setLoading] = useState(true);
 const [q, setQ] = useState("");
 const [country, setCountry] = useState<string>("all");
 const [activeCat, setActiveCat] = useState<string>("all");
 const [sellerOpen, setSellerOpen] = useState(false);
 const [buyerOpen, setBuyerOpen] = useState(false);
 const [connectListing, setConnectListing] = useState<ConnectionListing | null>(null);

 useEffect(() => {
 (async () => {
 const [{ data: l }, { data: c }] = await Promise.all([
 supabase.from("marketplace_listings")
 .select("id, slug, title, description, country, image_url, is_featured, category_id, seller_company, seller_email, seller_phone, category:marketplace_categories(name)")
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

 const filtered = useMemo(() => {
 const ql = q.trim().toLowerCase();
 return listings.filter(l => {
 if (country !== "all" && l.country !== country) return false;
 if (activeCat !== "all" && l.category_id !== activeCat) return false;
 if (ql) {
 const hay = [l.title, l.seller_company, l.country, l.category?.name].filter(Boolean).join(" ").toLowerCase();
 if (!hay.includes(ql)) return false;
 }
 return true;
 });
 }, [listings, country, activeCat, q]);

 const onConnect = (l: ListingCardData) => {
 setConnectListing({
 id: (l as FullListing).id,
 title: l.title,
 description: l.description ?? null,
 country: l.country,
 seller_company: l.seller_company ?? null,
 seller_email: l.seller_email ?? null,
 seller_phone: l.seller_phone ?? null,
 });
 };

 return (
 <Layout
 seoTitle="ECOWAS Trade Network Marketplace"
 seoDescription="Discover verified West African SMEs and connect directly with sellers across the 12 ECOWAS member states."
 >
 {/* Hero */}
 <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-ecowas-yellow/30 text-primary-foreground">
 <div className="absolute inset-0 opacity-20" style={{
 backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--ecowas-yellow)) 0, transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--secondary)) 0, transparent 40%)"
 }} />
 <div className="container relative z-10 py-16 md:py-24">
 <AnimatedSection>
 <div className="inline-flex items-center gap-2 bg-background/15 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
 <ShieldCheck className="h-3.5 w-3.5" /> ECOWAS Trade Network
 </div>
 <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
 West African SMEs. <span className="text-ecowas-yellow">One trusted marketplace.</span>
 </h1>
 <p className="mt-5 text-lg md:text-xl text-primary-foreground/85 max-w-2xl">
 Connect directly with verified sellers across 12 ECOWAS member states.
 </p>
 <div className="mt-8 flex flex-wrap gap-3">
 <Button size="lg" variant="secondary" onClick={() => setSellerOpen(true)}>
 <Plus className="h-4 w-4 mr-2" />List Your Product
 </Button>
 <Button size="lg" variant="secondary" onClick={() => setBuyerOpen(true)}>
 <Users className="h-4 w-4 mr-2" />Register as Buyer
 </Button>
 <Button asChild size="lg" variant="outline" className="bg-background/10 border-background/30 text-primary-foreground hover:bg-background/20">
 <a href="#listings"><ShoppingBag className="h-4 w-4 mr-2" />Browse Marketplace</a>
 </Button>
 </div>
 {/* Search */}
 <div className="mt-8 max-w-2xl relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
 <Input
 value={q}
 onChange={e => setQ(e.target.value)}
 placeholder="Search products, businesses, categories, countries…"
 className="pl-12 h-14 text-base bg-background text-foreground rounded-xl border-0 shadow-lg"
 />
 </div>
 </AnimatedSection>
 </div>
 </section>

 {/* Filter strip */}
 <section className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
 <div className="container py-4 flex flex-col gap-3">
 <div className="flex items-center justify-between gap-3 flex-wrap">
 <div className="flex flex-wrap gap-2">
 <button
 onClick={() => setActiveCat("all")}
 className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition ${activeCat === "all" ? "bg-ecowas-yellow text-foreground border-ecowas-yellow" : "bg-background border-border hover:border-ecowas-yellow"}`}
 >All</button>
 {cats.map(c => (
 <button key={c.id} onClick={() => setActiveCat(c.id)}
 className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition ${activeCat === c.id ? "bg-ecowas-yellow text-foreground border-ecowas-yellow" : "bg-background border-border hover:border-ecowas-yellow"}`}>
 {c.name}
 </button>
 ))}
 </div>
 <div className="flex items-center gap-3">
 <Select value={country} onValueChange={setCountry}>
 <SelectTrigger className="w-44 h-9"><Globe2 className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All countries</SelectItem>
 {ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
 </SelectContent>
 </Select>
 <Badge variant="secondary">{filtered.length} listings</Badge>
 </div>
 </div>
 </div>
 </section>

 {/* Grid */}
 <section id="listings" className="container py-10 md:py-14">
 {loading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
 {Array.from({ length: 8 }).map((_, i) => (
 <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
 ))}
 </div>
 ) : filtered.length === 0 ? (
 <div className="text-center py-16 border border-dashed rounded-2xl">
 <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
 <p className="text-muted-foreground">No listings match your filters yet.</p>
 <Button variant="outline" className="mt-4" onClick={() => { setQ(""); setCountry("all"); setActiveCat("all"); }}>Clear filters</Button>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
 {filtered.map(l => <ListingCard key={l.id} listing={l} onConnect={onConnect} />)}
 </div>
 )}
 </section>

 <SellerListingDrawer open={sellerOpen} onOpenChange={setSellerOpen} />
 <BuyerRegistrationDrawer open={buyerOpen} onOpenChange={setBuyerOpen} />
 <ConnectionRequestModal listing={connectListing} open={!!connectListing} onOpenChange={(v) => !v && setConnectListing(null)} />
 </Layout>
 );
}
