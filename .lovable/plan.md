

# Comprehensive ECOWAS Parliament Initiatives Platform Upgrade

This plan covers fixing the build error, expanding to 12 member states, redesigning the Index page, adding social media presence, updating partners/sponsors, and ensuring the platform clearly represents ECOWAS Parliament Initiatives (not the Parliament itself).

---

## Phase 1: Fix Build Error

**File:** `supabase/functions/invite-user/index.ts`

Replace `anonClient.auth.getClaims()` (which doesn't exist in supabase-js v2) with `anonClient.auth.getUser()` to extract the user ID from the JWT token:

```typescript
const { data: userData, error: userError } = await anonClient.auth.getUser();
if (userError || !userData?.user) { return 401; }
const userId = userData.user.id;
```

---

## Phase 2: Extract & Add Flag Assets

Extract `flags.zip` to `src/assets/flags/` — one PNG per ECOWAS member state. These will be imported as ES6 modules in components instead of using emoji flags.

---

## Phase 3: Expand to 12 Member States

Update `CountriesSection.tsx` from 7 countries to all 12 ECOWAS Parliament member states using the uploaded flag images:

1. Nigeria, Ghana, Cote d'Ivoire, Senegal, Cabo Verde, Togo, Sierra Leone (existing)
2. Add: Benin, Burkina Faso, Guinea, Guinea-Bissau, Liberia, Mali, Niger, The Gambia

Each country card will use the real flag image instead of emoji.

Also update the `countries` table seed data if needed.

---

## Phase 4: Redesign Index Page

Restructure `Index.tsx` with a fresh, modern layout:

1. **Hero Section** — Rebrand from "@25" celebration to "ECOWAS Parliament Initiatives" as a recurring platform. Update tagline to reflect ongoing initiatives, not just a 25th anniversary. Keep the anniversary logo but position it as the current flagship initiative.

2. **Social Media Banner Strip** — New component showing initiative social media (@ecoparl_hub) with follow buttons for X, Instagram, Facebook, LinkedIn, YouTube. Clear label: "Follow ECOWAS Parliament Initiatives".

3. **"Did You Know?" Section** — New carousel/card component with interesting facts about the ECOWAS Parliament (e.g., founding year, number of seats, role, achievements).

4. **CountdownTimer** — Keep as-is.

5. **PillarsGrid** — Keep as-is.

6. **Countries Section** — Expanded to 12 states with flag images.

7. **Partners Strip** — Update to show AWALCO as partner.

8. **Sponsors Section** — Replace current placeholder sponsors with: NASENI, SMEDAN, Providus Bank, Alliance Economic Research and Ethics.

9. **QuoteStrip** — Keep as-is.

10. **LatestNews** — Keep as-is.

11. **Call-to-Action / Sponsor Banner** — Prominent section encouraging sponsorship with link to sponsor portal and social media.

---

## Phase 5: Social Media Integration Across Platform

### New shared component: `SocialMediaBar.tsx`

A reusable component showing social icons for @ecoparl_hub (initiatives) and a subtle link to the official ECOWAS Parliament accounts (@ecowas_parliament / parl.ecowas.int). This ensures visitors understand the distinction.

**Platforms for @ecoparl_hub:**
- X (Twitter): x.com/ecoparl_hub
- Instagram: instagram.com/ecoparl_hub
- Facebook: facebook.com/ecoparl_hub
- LinkedIn: linkedin.com/company/ecoparl_hub
- YouTube: youtube.com/@ecoparl_hub

### Placement:
- **Footer** — Social media icons with @ecoparl_hub links + "Official ECOWAS Parliament: parl.ecowas.int" separate line
- **Navbar** — Small social icons or a "Follow us" link
- **Hero Section** — Social links below CTA buttons
- **Sponsor Portal** — Social links for sponsors to see reach
- **Contact page** — Social media section

---

## Phase 6: Update Partners & Sponsors

### Partners:
- Replace or add **AWALCO** as a partner in `PartnersStrip.tsx` and `SponsorsSection.tsx`

### Sponsors & Supporters:
- Replace current placeholder sponsors (West African Development Bank, ECOWAS Commission, etc.) with actual sponsors:
  - NASENI
  - SMEDAN
  - Providus Bank
  - Alliance Economic Research and Ethics

Update `SponsorsSection.tsx` with these real sponsors. Remove tiered structure unless the user specifies tiers.

---

## Phase 7: Branding & Identity Clarification

Across all pages, ensure clear distinction:
- **This website:** ECOWAS Parliament Initiatives (ecowasparliamentinitiatives.org, @ecoparl_hub)
- **Official Parliament:** ECOWAS Parliament (parl.ecowas.int, @ecowas_parliament)

Update:
- Footer: Add "This is the official website of ECOWAS Parliament Initiatives" disclaimer
- Footer: Link to parl.ecowas.int as "ECOWAS Parliament Official Site"
- `index.html` meta tags: Update domain references to ecowasparliamentinitiatives.org
- Email addresses: info@ecowasparliamentinitiatives.org (already correct in Footer)

---

## Phase 8: "Did You Know?" Section

New component `DidYouKnow.tsx` with rotating/carousel facts about ECOWAS Parliament:
- Founded in 2000 in Abuja, Nigeria
- 115 seats across 12 member states
- First Speaker: Hon. Ali Nouhoum Diallo (Mali)
- The Parliament has observer status at the African Union
- Parliamentary diplomacy across West Africa
- etc.

Styled as an engaging card carousel or accordion on the Index page.

---

## Files Modified/Created

**Modified (~15 files):**
- `supabase/functions/invite-user/index.ts` (fix build error)
- `src/pages/Index.tsx` (redesigned layout)
- `src/components/home/HeroSection.tsx` (rebrand + social)
- `src/components/home/CountriesSection.tsx` (12 states + flag images)
- `src/components/home/SponsorsSection.tsx` (real sponsors)
- `src/components/home/PartnersStrip.tsx` (AWALCO)
- `src/components/layout/Footer.tsx` (social media + branding)
- `src/components/layout/Navbar.tsx` (social icons)
- `src/pages/Contact.tsx` (social media section)
- `src/pages/SponsorPortal.tsx` (social media)
- `index.html` (meta tags)
- `src/lib/i18n.tsx` (new translation keys)

**Created (~3-4 files):**
- `src/components/shared/SocialMediaBar.tsx`
- `src/components/home/DidYouKnow.tsx`
- `src/assets/flags/*.png` (12 flag images from uploaded zip)

---

## Implementation Order

1. Fix the build error in `invite-user/index.ts`
2. Extract flags from zip to `src/assets/flags/`
3. Create `SocialMediaBar.tsx` shared component
4. Create `DidYouKnow.tsx` component
5. Update `CountriesSection.tsx` to 12 states with flag images
6. Update `SponsorsSection.tsx` and `PartnersStrip.tsx` with real partners/sponsors
7. Redesign `HeroSection.tsx` and `Index.tsx` layout
8. Update Footer, Navbar, Contact with social media
9. Update `index.html` meta tags and i18n keys

