

## Complete Multilingual Support — Implementation Plan

### Current State

The i18n system is already well-architected:
- `src/lib/i18n.tsx` has a React context with `locale`, `setLocale`, `t()` with interpolation, browser detection, localStorage persistence under `preferredLanguage`, and `document.documentElement.lang` sync.
- Three translation files exist: `en.ts` (~1011 keys), `fr.ts` (~922 keys), `pt.ts` (~922 keys).
- The `t()` function already supports `{var}` interpolation and falls back to English.
- `formatDate()` and `formatNumber()` locale-aware helpers already exist.
- Language switcher already exists in the Navbar.

However, **15+ files have zero i18n wiring** — all strings are hardcoded in English. These need ~300+ new translation keys across all three languages.

---

### Files Requiring Full Translation Wiring

**Pages with NO `useTranslation` import (all strings hardcoded):**

1. `src/pages/MediaKit.tsx` — ~80 hardcoded strings (press releases, spokespeople, key facts, asset packs, event calendar, accreditation notice, media contact)
2. `src/pages/SponsorPortal.tsx` — ~70 strings (why-sponsor points, tier names/benefits, stats, partner descriptions, impact reporting)
3. `src/pages/SponsorDashboard.tsx` — ~40 strings (metrics, placements, event schedule, quarterly progress, account manager)
4. `src/pages/SetPassword.tsx` — ~20 strings (form labels, error messages, strength hints, loading/expired/success states)
5. `src/pages/Timeline.tsx` — ~100 strings (11 timeline events with titles/descriptions/deliverables, filters, stats, launch highlights section)
6. `src/pages/partners/PartnerPage.tsx` — ~30 strings (5 partner long descriptions, labels like "Back to Stakeholders", "Implementing Partner", "Visit Partner Website")
7. `src/pages/Index.tsx` — just needs import (components already translated)
8. `src/pages/programmes/Youth.tsx` — ~50 strings (phases, tracks, countries, prizes, objectives, all section headings)
9. `src/pages/programmes/Trade.tsx` — ~50 strings
10. `src/pages/programmes/Women.tsx` — ~50 strings
11. `src/pages/programmes/Civic.tsx` — ~40 strings
12. `src/pages/programmes/Culture.tsx` — ~40 strings
13. `src/pages/programmes/Awards.tsx` — ~40 strings
14. `src/pages/programmes/Parliament.tsx` — ~40 strings

**Pages that USE `useTranslation` but have remaining hardcoded strings:**

15. `src/pages/Auth.tsx` — toast messages, button labels, form text (~15 strings)
16. `src/pages/Events.tsx` — event data objects, toast messages (~30 strings)
17. `src/pages/Documents.tsx` — document titles/types (~10 strings)
18. `src/pages/Stakeholders.tsx` — titles, org names, section headings (~15 strings)
19. `src/pages/Team.tsx` — role titles, org names (~15 strings)
20. `src/pages/News.tsx` — any remaining hardcoded article content

**Components with no i18n:**

21. `src/components/home/SponsorsSection.tsx` — programme labels in sponsor data
22. `src/components/shared/SocialMediaBar.tsx` — "Follow us" labels

---

### Implementation Steps

**Step 1: Add ~300 new keys to `en.ts`**

Add keys for every hardcoded string across the 22 files listed above. Groups include:
- `mediaKit.*` — all MediaKit page strings
- `sponsorPortal.*` — all SponsorPortal strings
- `sponsorDash.*` — all SponsorDashboard strings
- `setPw.*` — SetPassword form strings
- `timeline.*` — all Timeline page content
- `partnerPage.*` — partner detail page strings
- `youth.*`, `trade.*`, `women.*`, `civic.*`, `culture.*`, `awards.*`, `parl.*` — programme page content
- `auth.*` — auth form labels and messages
- `events.*` — remaining Events page strings
- `docs.*` — Documents page strings

**Step 2: Add matching keys to `fr.ts` and `pt.ts`**

All ~300 new keys translated into natural, formal-register French and Portuguese appropriate for a parliamentary/institutional context.

**Step 3: Wire all 22 files to use `t()`**

For each file:
- Import `useTranslation` from `@/lib/i18n`
- Replace every string literal with `t("key")`
- For arrays of objects (events, phases, tracks, tiers, etc.), change hardcoded text fields to use `t()` calls — either by using key references in the data or by restructuring arrays to call `t()` at render time

**Step 4: Ensure FR/PT keys for existing partially-translated pages**

Check that `fr.ts` and `pt.ts` have translations for the ~90 keys that exist in `en.ts` but may be missing in FR/PT (en has 1011 keys, fr/pt have ~922 — there's a gap of ~89 keys).

**Step 5: Language switcher in Footer**

Add the same EN | FR | PT language switcher to `Footer.tsx`, with translated `aria-label`.

**Step 6: Accessibility audit**

- Verify `<html lang>` attribute updates dynamically (already implemented)
- Add translated `aria-label` to the language switcher buttons
- Ensure all `alt` text on images uses `t()` keys

### Estimated scope

- ~300 new translation keys × 3 languages = ~900 new translated strings
- ~22 component/page files modified to use `t()`
- 3 translation files expanded
- 1 footer file updated (language switcher)

### Quality notes

All French and Portuguese translations will use formal institutional register appropriate for ECOWAS Parliament. No machine-translation artifacts — proper grammar, natural phrasing, and culturally appropriate terminology.

