## Goal

Reposition the marketplace so **ECOWAS Parliament Initiatives** is the listed distributor/guarantor on every product, while still capturing real seller info internally. Add a secure buyer↔seller inquiry workflow, CRM-side analytics with charts + CSV, and advanced filters on the public marketplace.

---

## 1. Reposition seller identity (ECOWAS as distributor)

**Public-facing changes (`apps/web`)**
- `ListingCard` and `ListingDetail`: remove `seller_company / seller_name` from the visible UI. Always render:
  - Seller block: "ECOWAS Parliament Initiatives" + tagline "Verified Distributor & Guarantor" + Parliament 25 logo as avatar.
  - Add a small "Sourced from a verified ECOWAS SME in {country}" line so origin/country is still surfaced.
- Update copy on `/marketplace` hero: emphasise ECOWAS as the **trusted intermediary, distributor and guarantor** between SMEs and buyers across the 15 member states.
- Remove `/marketplace/sell` self-service form. Replace with `/marketplace/list-with-us` — a *contact form* for sellers who want ECOWAS to list/distribute their goods (writes to a new `marketplace_seller_requests` table, status pending).
- Navbar + Trade page CTAs updated: "List your goods with ECOWAS" instead of "Sell".

**CRM changes (`apps/admin` → `MarketplaceModule`)**
- Listings tab becomes the *primary creation surface*: "New listing" dialog (CRM staff only) — captures internal seller details (name, company, phone, email, country) plus product details, image upload to `marketplace-media`. Status defaults to `approved` when created from CRM.
- New "Seller Requests" tab — review/approve incoming requests, convert a request → listing in one click (pre-fills the new-listing form).
- Existing public-submitted listings keep the `pending` workflow.

---

## 2. Buyer ↔ Seller inquiry / messaging workflow

Buyers must never see seller contact info directly. ECOWAS brokers the conversation.

**Data model (new tables)**
- `marketplace_inquiries` — one record per buyer enquiry thread tied to a listing. Columns: id, listing_id, interest_id (nullable link), buyer_name, buyer_email, buyer_phone, buyer_country, subject, status (`open|in_review|forwarded|closed`), assigned_to, created_at.
- `marketplace_inquiry_messages` — thread messages. Columns: id, inquiry_id, sender_type (`buyer|crm|seller`), sender_name, sender_email, body, attachment_url, created_at, is_internal (bool — internal CRM notes hidden from buyer).
- `marketplace_seller_requests` — incoming "list with us" applications.

**RLS**
- Public `INSERT` allowed on `marketplace_inquiries`, `marketplace_inquiry_messages` (only with `sender_type='buyer'` and matching email token), and `marketplace_seller_requests`.
- `SELECT/UPDATE` restricted to `is_crm_staff()` or `assigned_to = auth.uid()`.
- Buyers retrieve their own thread via a signed magic link emailed to them (token stored on the inquiry row, validated by an edge function — no auth required).

**Edge functions**
- `marketplace-inquiry-create` — validates input, creates inquiry + first message, emails buyer a thread link, notifies assigned CRM staff via `send-email`.
- `marketplace-inquiry-thread` — public GET with `?token=` returns sanitized thread (no internal notes); public POST appends a buyer reply.
- `marketplace-inquiry-reply` — CRM staff reply (auth required); optionally forwards a sanitized version to the real seller via Zoho.

**Public UI**
- On `ListingDetail`, "Express Interest" form (existing) gets a second tab: **"Send a secure message"** → opens an `InquiryDialog` with subject + message + optional file. Submitting calls the edge function; buyer gets a confirmation email with a thread link.
- New page `/marketplace/inquiries/:token` — read-only thread + reply box for the buyer.

**CRM UI**
- New "Inquiries" tab in `MarketplaceModule`: list view (filter by status/listing/country), detail drawer with full thread, reply composer, internal-notes toggle, "Forward to seller" action, status workflow, assign-to dropdown.

---

## 3. Marketplace analytics (CRM)

**Tracking**
- New table `marketplace_listing_views` (id, listing_id, country, referrer, session_id, created_at). Lightweight insert on each `ListingDetail` mount via the anon client (RLS: anon insert allowed, select restricted to CRM).
- Reuse `marketplace_interests` and new `marketplace_inquiries` for funnel metrics.

**Analytics tab in `MarketplaceModule`**
- KPI cards: total views, total interests, total inquiries, approved listings, **view→interest conversion %**, **interest→closed conversion %**.
- Charts (Recharts — already used in CRM dashboards):
  - Line: views & interests over time (7/30/90 day toggle).
  - Bar: approvals by country (ECOWAS 15).
  - Bar: top categories by interest volume.
  - Donut: interest status breakdown (new/contacted/closed).
- Filter bar: date range, country, category.
- "Export CSV" buttons for: listings, interests, inquiries, raw views — respecting current filters.

---

## 4. Advanced search on `/marketplace`

Extend the filter bar above the grid:
- **Search** (existing) — extend to also match description.
- **Country** multi-select (chips).
- **Category** multi-select.
- **Price range** dual slider (uses min/max across listings, currency-aware; defaults USD).
- **MOQ / available qty** numeric input ("I need at least N units").
- **Size / spec** keyword field — matches against `description` and a new optional `spec_tags text[]` column on `marketplace_listings`.
- **Sort**: Featured · Newest · Price ↑ · Price ↓ · MOQ ↑.
- Filters reflected in the URL query string (shareable links) and a "Clear all" chip.
- Mobile: filters collapse into a slide-over Sheet.

---

## 5. Outstanding fixes carried over (still required for robustness)

- Favicon link to `global_settings.favicon_url` on the public site.
- `send-email` error surfaced in CRM toasts; SMTP/IMAP status indicators.
- Cloudflare Turnstile → `execution="execute"` mode.
- RLS audit for `sponsors` / `partners` using `is_crm_staff()`.
- Chat profile drawer + CRM profile layout polish.
- Parliament 25 logo as universal avatar fallback.

---

## Technical Details

**New migrations**
- Add `spec_tags text[]` to `marketplace_listings`.
- Create `marketplace_inquiries`, `marketplace_inquiry_messages`, `marketplace_seller_requests`, `marketplace_listing_views` with RLS as described.
- Trigger: when a `marketplace_seller_request` is approved, optionally insert a draft listing.

**New files**
- `apps/web/src/components/marketplace/InquiryDialog.tsx`
- `apps/web/src/pages/marketplace/InquiryThread.tsx`
- `apps/web/src/pages/marketplace/ListWithUs.tsx` (replaces `SellForm.tsx`)
- `apps/web/src/lib/validation/marketplace.ts` — extend with inquiry & seller-request schemas.
- `apps/admin/src/components/crm/modules/marketplace/{ListingsTab,InterestsTab,InquiriesTab,SellerRequestsTab,AnalyticsTab,NewListingDialog}.tsx` — split current monolithic module.
- `supabase/functions/marketplace-inquiry-create/index.ts`
- `supabase/functions/marketplace-inquiry-thread/index.ts`
- `supabase/functions/marketplace-inquiry-reply/index.ts`

**Edited files**
- `apps/web/src/pages/marketplace/{Marketplace,ListingDetail}.tsx` — new filters, ECOWAS seller block, inquiry CTA, view tracking.
- `apps/web/src/components/marketplace/ListingCard.tsx` — drop seller surface.
- `apps/web/src/components/layout/Navbar.tsx` + `programmes/Trade.tsx` — updated CTAs.
- `apps/admin/src/components/crm/modules/MarketplaceModule.tsx` — refactored into tabs.

**Validation**: All form inputs validated with Zod on client + edge function. Tokens for buyer thread access are 32-byte random, stored hashed.
