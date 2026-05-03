
# Plan: Homepage Marketplace Spotlight + Marketplace Modification + CRM/Invoice Flows

## Part 1 — Homepage: Add prominent Marketplace section

**File:** `apps/web/src/components/home/MarketplaceSpotlight.tsx` (new)
**File:** `apps/web/src/pages/Index.tsx` (insert after `PillarsGrid`, tagged as part of Trade & SME programmes)

A full-width visual section:
- Tag chip: "Linked to Trade & SME Programmes"
- Bold headline: "ECOWAS Trade Network Marketplace"
- Two-column layout (mobile-stacked): left = pitch + buttons (Browse Marketplace, List your Product, Register as Buyer); right = a 2×2 collage of latest 4 approved listings pulled live from `marketplace_listings` with country flag overlays and gold category pill
- Animated stats strip (15 nations · live listings count · ECOWAS-guaranteed)
- Deep green gradient background with gold accent

## Part 2 — Marketplace page redesign (modification, no rebuild)

### 2a. `ListingCard.tsx` (modify)
- REMOVE: MOQ row, "Sourced from…" label, price text
- KEEP: image, title, business name (we'll add `seller_company` to query), category pill (gold, top-left over image), country flag + name (compact, identity not origin), description excerpt (2 lines)
- ADD: full-width deep-green `Connect with Seller` CTA button at bottom that opens a Connection modal (passes listing data)
- Hover: gold border glow + lift transition

### 2b. `Marketplace.tsx` (modify)
- Remove sidebar `Slider` (price), `MIN AVAILABLE`, `SIZE/SPEC` filter blocks; remove price/MOQ sort options
- Replace sidebar with a **horizontal pill bar** above the grid: `All · Agriculture · Processed Foods · Textiles · Raw Materials · Crafts & Artisanry · Manufacturing · Services · Organic & Natural` (gold active fill)
- Country dropdown (12 ECOWAS states) above grid
- Hero search now searches: title, seller_company, category name, country
- Add two new top buttons in hero: `List Your Product` (opens Seller drawer) and `Register as Buyer` (opens Buyer drawer)
- Cards use new `ListingCard` and pass an `onConnect(listing)` to open Connection modal

### 2c. New components (in `apps/web/src/components/marketplace/`)
- `SellerListingDrawer.tsx` — side drawer (full-screen on mobile) capturing Business Name, ECOWAS state, Category, Product Name, Description (≤300 chars), Email, WhatsApp, Image upload → inserts into `marketplace_seller_requests` (status `pending`); calls `send-marketplace-notification` edge function for confirmation email
- `BuyerRegistrationDrawer.tsx` — captures Full Name, Organisation, Country (open), Categories of Interest (multi), Email, WhatsApp, Sourcing Intent → inserts into new `marketplace_buyers` table
- `ConnectionRequestModal.tsx` — shows seller business name + flag, product name + description, WhatsApp/email shortcuts, plus form (Buyer Name, Email, Message) → inserts into new `marketplace_connections` table; notifies seller via edge function

All forms: no `<form>` tags — `useState` + `onClick`; required fields highlight red on submit attempt; mobile = full-screen, desktop = side drawer; live filter updates (already state-driven).

## Part 3 — Database migrations

Create:
- `marketplace_buyers` (id, full_name, organisation, country, categories_of_interest text[], email, whatsapp, sourcing_intent, status default 'active', created_at). RLS: anon insert; CRM staff select/update.
- `marketplace_connections` (id, listing_id fk, seller_email, seller_company, product_name, buyer_name, buyer_email, buyer_whatsapp, message, status default 'new' [new|contacted|matched|closed], invoice_id fk nullable, created_at, updated_at). RLS: anon insert; CRM staff select/update.

Image uploads from Seller drawer go to existing `marketplace-media` bucket (already public).

## Part 4 — CRM integration (admin app)

**File:** `apps/admin/src/components/crm/modules/MarketplaceModule.tsx` (new) and register in `crmModules.ts`

Tabs: **Listings** (existing approved listings) · **Pending Sellers** (`marketplace_seller_requests`) · **Buyers** (`marketplace_buyers`) · **Connection Requests** (`marketplace_connections`) · **Invoices** (filtered to marketplace-linked).

Per Connection Request row: status select (new → contacted → matched → closed). When status changes to `matched`, action button "Generate Invoice" creates an `invoices` row prefilled from buyer/seller/product, navigates to existing invoice editor; the new invoice id is written back to `marketplace_connections.invoice_id`. Existing `invoices` table already supports number generation (`next_invoice_number()` exists — replace prefix call with format `ECOWAS-INV-YYYY-XXXX` via a small helper or update of the SQL function).

Filter by record type, country, date.

## Part 5 — Email notifications

New edge function `supabase/functions/marketplace-notify/index.ts` accepts `{ kind: 'seller_listing'|'buyer_registration'|'connection_request'|'invoice', payload }` and sends branded (green header + gold accent) email to relevant party using existing email infrastructure (`send-transactional-email` queue if available, otherwise direct Resend via existing `send-email` function — will reuse current pattern in repo).

Triggered from each drawer/modal after insert.

## Files Summary

| File | Type |
|---|---|
| `apps/web/src/components/home/MarketplaceSpotlight.tsx` | new |
| `apps/web/src/pages/Index.tsx` | modify |
| `apps/web/src/components/marketplace/ListingCard.tsx` | modify |
| `apps/web/src/pages/marketplace/Marketplace.tsx` | modify |
| `apps/web/src/components/marketplace/SellerListingDrawer.tsx` | new |
| `apps/web/src/components/marketplace/BuyerRegistrationDrawer.tsx` | new |
| `apps/web/src/components/marketplace/ConnectionRequestModal.tsx` | new |
| `apps/admin/src/components/crm/modules/MarketplaceModule.tsx` | new |
| `apps/admin/src/components/crm/crmModules.ts` | modify |
| `supabase/functions/marketplace-notify/index.ts` | new |
| Migration: `marketplace_buyers`, `marketplace_connections` tables + RLS | new |

Preserved: existing listings data/images, marketplace URLs, navigation, existing footer.
