import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FlagImg from "@/components/shared/FlagImg";
import placeholder from "@/assets/parliament-25-logo.png";
import { MapPin, Package } from "lucide-react";

export interface ListingCardData {
  slug: string;
  title: string;
  country: string | null;
  image_url: string | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  unit: string;
  moq: number | null;
  is_featured: boolean;
  category?: { name: string } | null;
}

export default function ListingCard({ listing }: { listing: ListingCardData }) {
  const priceText = listing.price_min && listing.price_max
    ? `${listing.currency} ${listing.price_min}–${listing.price_max}`
    : listing.price_min ? `${listing.currency} ${listing.price_min}+` : "On request";

  return (
    <Link
      to={`/marketplace/listings/${listing.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      <Card className="overflow-hidden h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-border/60">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={listing.image_url || placeholder}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {listing.is_featured && (
            <Badge className="absolute top-3 left-3 bg-ecowas-yellow text-foreground border-0">Featured</Badge>
          )}
          {listing.category && (
            <Badge variant="secondary" className="absolute top-3 right-3">{listing.category.name}</Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {listing.country && <FlagImg country={listing.country} className="h-3 w-4" />}
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />Sourced from {listing.country || "West Africa"}
            </span>
          </div>
          <div className="text-[10px] uppercase font-bold text-primary/80">
            Distributed by ECOWAS Parliament Initiatives
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <span className="text-sm font-bold text-primary">{priceText}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" />MOQ {listing.moq ?? "—"} {listing.unit}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}