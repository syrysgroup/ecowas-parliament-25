

# Complete Multilingual Support — Implementation Plan

## Current State

The i18n infrastructure is already solid: `src/lib/i18n.tsx` provides a React context with `locale`, `setLocale`, `t()` (with interpolation), browser detection, localStorage persistence (`preferredLanguage`), `formatDate()`, `formatNumber()`, and dynamic `document.documentElement.lang`. Three translation files exist with ~540 keys each covering: navbar, footer, hero, speaker, countdown, marquee, countries, anniversary, pillars, events, stats, did-you-know, news, newsletter, sponsor CTA, partners, about, contact, auth, documents, news, media kit headers, team, timeline, stakeholders, volunteer, events page, and common strings.

**What's missing:** ~15 pages still have hardcoded English strings in their component bodies and static data arrays. These need ~400+ new translation keys across all three languages.

## Files With Hardcoded Strings to Fix

### Programme Pages (7 files, ~1,800 lines total)
Each has hardcoded: hero text, overview paragraphs, phase/track titles & descriptions, country statuses, prize tiers/benefits, objectives, CTA text.

- `src/pages/programmes/Youth.tsx` — phases, tracks, countries, prizes, objectives, all section headings
- `src/pages/programmes/Trade.tsx` — similar structure
- `src/pages/programmes/Women.tsx` — similar structure
- `src/pages/programmes/Civic.tsx` — similar structure
- `src/pages/programmes/Culture.tsx` — similar structure
- `src/pages/programmes/Awards.tsx` — similar structure
- `src/pages/programmes/Parliament.tsx` — similar structure

### Other Pages (5 files)
- `src/pages/MediaKit.tsx` (330 lines) — press releases, spokespeople, key facts, event calendar, asset packs, all section text (hero badge already has translation keys but uses hardcoded strings)
- `src/pages/SponsorPortal.tsx` (414 lines) — all sponsor tier info, form labels, section headings
- `src/pages/SponsorDashboard.tsx` (164 lines) — dashboard labels
- `src/pages/News.tsx` — news item titles, excerpts, dates in the `allNews` array
- `src/pages/Events.tsx` — event item content

### Components with partial hardcoding
- `src/components/home/LatestNews.tsx` — news card titles/excerpts/dates
- `src/components/layout/Footer.tsx` — verify all strings use `t()`
- `src/pages/SetPassword.tsx` — form labels

## Implementation Steps

### Step 1: Add ~400 new keys to `en.ts`
Organized by section:
- `youth.*` — ~40 keys (hero, overview, phases, tracks, countries, prizes, objectives, CTA)
- `trade.*` — ~40 keys
- `women.*` — ~40 keys
- `civic.*` — ~40 keys
- `culture.*` — ~40 keys
- `awards.*` — ~40 keys
- `parliament.*` — ~40 keys (programme page, not the institution)
- `mediaKit.*` — ~40 keys (press releases, spokespeople, facts, calendar, assets)
- `sponsorPortal.*` — ~30 keys
- `sponsorDashboard.*` — ~15 keys
- `news.item*` — ~20 keys (news content)
- `events.item*` — ~15 keys
- `setPassword.*` — ~5 keys

### Step 2: Add matching keys to `fr.ts` and `pt.ts`
Natural, grammatically correct institutional-register translations for all new keys.

### Step 3: Wire each component to use `t()`
For each of the ~15 files:
- Import `useTranslation`
- Move static arrays inside the component (after `const { t } = useTranslation()`)
- Replace every hardcoded string with `t("key")`
- For data arrays (phases, tracks, prizes, etc.), use `t()` for each translatable field while keeping non-translatable data (icons, amounts, colors) as-is

### Step 4: Verify `index.html`
Already has `lang="en"` on `<html>` — confirmed the i18n provider updates it dynamically via `document.documentElement.lang = locale`.

### Step 5: Verify language switcher
Already present in navbar and mobile menu with EN/FR/PT, aria-label translated, keyboard navigable. No changes needed.

## Technical Notes

- Translation files will grow from ~540 to ~940 keys each (~400 new keys)
- No architectural changes needed — the existing `t()` with interpolation and fallback-to-English already handles everything
- `formatDate()` and `formatNumber()` already exist in `i18n.tsx` with proper locale mapping
- Country names (Nigeria, Ghana, etc.) and proper nouns remain untranslated per convention
- Prize amounts ($10,000 etc.) remain as-is since they're USD values

## Estimated Changes
- 3 translation files modified (~400 new keys each)
- ~15 component/page files modified to use `t()`
- 0 new files created
- 0 architectural changes

