

## Plan: Seed Demo Data to Database, Fix Smart Challenge UI, and Optimize Images

This plan addresses three requests: (1) populate the database with all hardcoded demo data so the CRM has full control, (2) fix the Smart Challenge button/text transparency issue, and (3) optimize large images.

---

### Current State

**Data flow**: Many homepage sections already read from the database (site_content, events, news_articles, sponsors, partners) with hardcoded fallbacks. However, the database tables are mostly empty (all API responses return `[]`), so users only see fallback/translated content. The CRM already has editors for site content, news, events, sponsors, and partners.

**Smart Challenge button**: The "Register Your School" and "Watch Trailer" buttons on `/programmes/youth/smart` use `bg-accent text-accent-foreground` and `border-primary-foreground/30 text-primary-foreground` respectively over a dark overlay. The issue is that the hero overlay uses `from-foreground/95` which in light mode is near-white, making white text invisible.

**Images**: The `parliament-chamber.png` is 2MB. Several PNGs (logos) are 100-400KB. Most JPGs are already reasonably sized.

---

### Step 1: Seed Demo Data into Database

Insert initial demo data into the following tables using SQL INSERT statements via the insert tool:

**a) `site_content`** -- seed all template sections (hero, stats, speaker, quote, countdown, pillars, did_you_know, anniversary, newsletter, sponsor_cta, implementing_partners, sponsor_portal_stats) with the current hardcoded English values so the CRM can edit them immediately.

**b) `events`** -- insert 5 sample events (e.g., "25th Anniversary Ceremony", "Trade Summit", "Smart Challenge National Finals", "Innovators Pitch Day", "Women's Leadership Forum") with realistic dates, locations, tags, and `is_published = true`.

**c) `news_articles`** -- insert 4 sample articles with titles, slugs, excerpts, content, and `status = 'published'` using the existing news image assets as cover URLs (relative paths won't work from DB, so we'll use placeholder descriptions and leave cover_image_url null or use a generic placeholder).

**d) `sponsors`** -- insert the hardcoded sponsor names (AfDB, UNDP, NASENI, SMEDAN, Canada, SYRYS Technologies, Resident Technology, Duchess, WATH, EU Delegation) with appropriate tiers and programme associations, `is_published = true`.

**e) `partners`** -- insert institutional partners (ECOWAS Commission, AWALCO) and implementing partners with `is_published = true`.

---

### Step 2: Fix Smart Challenge Button and Text Visibility

**Problem**: The hero section uses `bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/50` as an overlay. In light theme, `foreground` is near-black so this works. But the buttons use classes that may render transparent in certain themes.

**Fix in `SmartChallenge.tsx`**:
- Change the "Back to Youth" button to use explicit dark colors instead of theme-dependent `primary-foreground`
- Ensure the "Register Your School" button has explicit opaque background: `bg-[hsl(50,87%,45%)] text-black` instead of theme-variable `accent`
- Ensure the "Watch Trailer" outline button has visible border/text: `border-white/30 text-white hover:bg-white/10`
- Fix text colors in hero to use explicit `text-white` instead of `text-primary-foreground` which varies by theme

---

### Step 3: Fix StatsSection 406 Error

The `StatsSection` uses `.single()` which fails with 406 when no row exists. Change to `.maybeSingle()` to match the pattern used elsewhere.

---

### Step 4: Optimize Large Images

**a) Convert `parliament-chamber.png` (2MB)** to optimized WebP or compressed JPEG using a build script. We'll use sharp/imagemagick to compress it to ~200KB.

**b) Compress `ecowas-parliament-logo.png` (403KB)** and other large PNGs.

**c) Add `loading="lazy"` and explicit `width`/`height` attributes to all `<img>` tags that don't already have them to prevent layout shifts and enable lazy loading.

**d) For the hero background image (`parliament-chamber.png`), add `fetchpriority="high"` since it's above the fold, while marking below-fold images as `loading="lazy"`.

---

### Step 5: Ensure CRM Full CRUD Control

The CRM already has:
- `SiteContentModule` -- edit all site_content sections
- `NewsEditorModule` -- CRUD news articles
- `EventsManagerModule` -- CRUD events
- `SponsorsManagerModule` -- CRUD sponsors/partners

Verify that delete operations work for events, news, and sponsors (they already have admin RLS policies with ALL command). No new CRM modules needed -- the existing ones provide full control once data is seeded.

---

### Technical Details

**Files to modify**:
- `src/components/home/StatsSection.tsx` -- change `.single()` to `.maybeSingle()`
- `src/pages/programmes/SmartChallenge.tsx` -- fix hero button/text colors
- Multiple component files -- add `loading="lazy"`, `width`, `height` to images
- Image assets -- compress large files via build script

**Database operations** (insert tool):
- ~12 INSERT statements across site_content, events, news_articles, sponsors, partners tables

**No schema changes needed** -- all tables already exist with proper columns and RLS policies.

