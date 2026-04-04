

# Complete Multilingual Support — Implementation Plan

## Current State

The i18n infrastructure is already production-ready in `src/lib/i18n.tsx`: React context with `locale`/`setLocale`/`t()`, browser detection, localStorage persistence under `preferredLanguage`, string interpolation with `{var}` syntax, `formatDate()`/`formatNumber()` helpers, and dynamic `document.documentElement.lang`.

**English (`en.ts`)**: ~540 keys — covers everything including programme pages, sponsor portal, sponsor dashboard, set password, media kit, etc.

**French (`fr.ts`) and Portuguese (`pt.ts`)**: ~470 keys each — missing ~540 keys. They stop at the `common.*` section and are missing all programme page keys (`youth.*`, `trade.*`, `women.*`, `civic.*`, `culture.*`, `awards.*`, `parliament.*`), sponsor keys (`sponsor.*`, `sponsorDash.*`), set password keys (`setPw.*`), and several other sections.

**13 page/component files** still have hardcoded English strings instead of using `t()`:
- 7 programme pages: Youth, Trade, Women, Civic, Culture, Awards, Parliament
- SponsorPortal, SponsorDashboard, MediaKit, SetPassword, Timeline, Auth

## Implementation Steps

### Step 1: Add ~540 missing keys to `fr.ts`
Translate all keys from `en.ts` line 500+ that are missing in `fr.ts`:
- Programme pages: `youth.*`, `trade.*`, `women.*`, `civic.*`, `culture.*`, `awards.*`, `parliament.*`
- Events section items: `eventsSection.*`
- Partner descriptions: `implPartners.*`, `instPartners.*`
- Programme template: `common.ecowasParliament` through `common.inProgress`
- Sponsor portal: `sponsor.*` (~55 keys)
- Sponsor dashboard: `sponsorDash.*` (~15 keys)
- Set password: `setPw.*` (~23 keys)

All translations in natural, grammatically correct institutional-register French.

### Step 2: Add ~540 missing keys to `pt.ts`
Same scope as Step 1, in natural Portuguese (pt-PT register, appropriate for institutional/parliamentary context).

### Step 3: Wire 13 pages to use `t()`
For each file:
- Import `useTranslation`
- Move static data arrays inside the component body
- Replace every hardcoded string with `t("key")`
- Keep non-translatable data (icons, amounts, colors, URLs) as-is

Files: `Youth.tsx`, `Trade.tsx`, `Women.tsx`, `Civic.tsx`, `Culture.tsx`, `Awards.tsx`, `Parliament.tsx`, `SponsorPortal.tsx`, `SponsorDashboard.tsx`, `MediaKit.tsx`, `SetPassword.tsx`, `Timeline.tsx`, `Auth.tsx`

### Step 4: Fix hardcoded string in Parliament25Section
The heading "Parliament at **25**" on line ~13 of `Parliament25Section.tsx` is hardcoded — needs a translation key.

### Step 5: Verify remaining components
Quick audit of Footer, Navbar, and any other component for stray hardcoded strings.

## Technical Notes

- No architectural changes needed — existing `t()` with interpolation and English fallback handles everything
- Translation files grow from ~470 to ~1,010 keys each for FR/PT
- Country names and proper nouns remain untranslated per convention
- Prize amounts (USD) remain as-is
- `formatDate()` and `formatNumber()` already use `Intl` with correct locale mapping
- Language switcher already present in navbar with EN/FR/PT, accessible and keyboard-navigable

## Estimated Scope
- 2 translation files expanded (~540 new keys each)
- 13 component files modified to use `t()`
- 1 component fix (Parliament25Section hardcoded heading)
- 0 new files, 0 architectural changes

