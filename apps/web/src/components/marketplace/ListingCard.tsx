import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FlagImg from "@/components/shared/FlagImg";
import placeholder from "@/assets/parliament-25-logo.png";
import { Handshake } from "lucide-react";

export interface ListingCardData {
  id?: string;
  slug: string;
  title: string;
  country: string | null;
  image_url: string | null;
  price_min?: number | null;
  price_max?: number | null;
  currency?: string;
  unit?: string;
  moq?: number | null;
  is_featured: boolean;
  description?: string | null;
  seller_company?: string | null;
  seller_email?: string | null;
  seller_phone?: string | null;
  category?: { name: string } | null;
}

export default function ListingCard({
  listing,
  onConnect,
}: {
  listing: ListingCardData;
  onConnect?: (l: ListingCardData) => void;
}) {
  return (
    <Card className="group overflow-hidden h-full flex flex-col rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-ecowas-yellow hover:ring-1 hover:ring-ecowas-yellow/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={listing.image_url || placeholder}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {listing.category && (
          <Badge className="absolute top-3 left-3 bg-ecowas-yellow text-foreground border-0 font-semibold">
            {listing.category.name}
          </Badge>
        )}
        {listing.is_featured && (
          <Badge className="absolute top-3 right-3 bg-background/90 text-foreground border-0">
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-base leading-snug line-clamp-2">{listing.title}</h3>
        {listing.seller_company && (
          <div className="text-xs font-semibold text-muted-foreground line-clamp-1">{listing.seller_company}</div>
        )}
        {listing.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{listing.description}</p>
        )}
        {listing.country && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto pt-1">
            <FlagImg country={listing.country} className="h-3 w-4" />
            <span>{listing.country}</span>
          </div>
        )}
        <Button
          onClick={() => onConnect?.(listing)}
          className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Handshake className="h-4 w-4 mr-2" />Connect with Seller
        </Button>
      </CardContent>
    </Card>
  );
}
