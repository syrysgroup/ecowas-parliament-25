import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/shared/AnimatedSection";
import FlagImg from "@/components/shared/FlagImg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InterestForm from "@/components/marketplace/InterestForm";
import { supabase } from "@/integrations/supabase/client";
import placeholder from "@/assets/parliament-25-logo.png";
import { ArrowLeft, MapPin, Package, DollarSign, Building2, Loader2 } from "lucide-react";

interface Listing {
  id: string; slug: string; title: string; description: string | null;
  country: string | null; image_url: string | null;
  seller_name: string; seller_company: string | null;
  unit: string; moq: number | null; available_quantity: number | null;
  price_min: number | null; price_max: number | null; currency: string;
  category: { name: string } | null;
}

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase.from("marketplace_listings")
        .select("id, slug, title, description, country, image_url, seller_name, seller_company, unit, moq, available_quantity, price_min, price_max, currency, category:marketplace_categories(name)")
        .eq("slug", slug).eq("status", "approved").maybeSingle();
      setListing(data as never);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <Layout><div className="container py-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!listing) return <Layout><div className="container py-32 text-center"><h1 className="text-2xl font-bold">Listing not found</h1><Button asChild className="mt-4"><Link to="/marketplace">Back to marketplace</Link></Button></div></Layout>;

  const priceText = listing.price_min && listing.price_max
    ? `${listing.currency} ${listing.price_min}–${listing.price_max} / ${listing.unit}`
    : "On request";

  return (
    <Layout seoTitle={`${listing.title} — Marketplace`} seoDescription={listing.description?.slice(0, 160)}>
      <div className="container py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/marketplace"><ArrowLeft className="h-4 w-4 mr-1" />Back to marketplace</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <AnimatedSection className="lg:col-span-3 space-y-6">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-muted shadow-lg">
              <img src={listing.image_url || placeholder} alt={listing.title} className="w-full h-full object-cover" loading="eager" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {listing.category && <Badge variant="secondary">{listing.category.name}</Badge>}
                {listing.country && (
                  <Badge variant="outline" className="gap-1.5">
                    <FlagImg country={listing.country} className="h-3 w-4" />{listing.country}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{listing.title}</h1>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{listing.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {[
                { icon: DollarSign, label: "Price", value: priceText },
                { icon: Package, label: "MOQ", value: `${listing.moq ?? "—"} ${listing.unit}` },
                { icon: Package, label: "Available", value: `${listing.available_quantity ?? "—"} ${listing.unit}` },
                { icon: MapPin, label: "Origin", value: listing.country || "—" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-border/60 p-3 bg-card">
                  <s.icon className="h-4 w-4 text-primary mb-1.5" />
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">{s.label}</div>
                  <div className="text-sm font-semibold">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/60 p-5 bg-muted/30 flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase text-muted-foreground">Seller</div>
                <div className="font-semibold">{listing.seller_company || listing.seller_name}</div>
                <div className="text-xs text-muted-foreground">Verified West Africa SME</div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150} className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-1">Express interest</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Tell us exactly what you need — quantity, size and timeline. The seller and our trade team will follow up.
              </p>
              <InterestForm listingId={listing.id} listingUnit={listing.unit} />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
}