

# Complete Multilingual Support (EN/FR/PT) — Implementation Plan

## Scope Assessment

The current i18n system (`src/lib/i18n.tsx`) already has the correct architecture: a React context with `locale`, `setLocale`, and `t()` function, browser detection, and localStorage persistence. However, only ~90 keys exist per language, covering navbar, footer, hero, volunteer, events, and speaker sections. The vast majority of the application — approximately **500+ strings across 30+ files** — remains hardcoded in English.

## What Needs to Change

### 1. Expand `src/lib/i18n.tsx` translation dictionaries (~400+ new keys)

Split the monolithic translation object into separate files for maintainability:

- Create `src/lib/translations/en.ts`, `fr.ts`, `pt.ts` — each exporting a flat Record of all keys
- Import and compose them in `src/lib/i18n.tsx`
- Add string interpolation support: modify `t()` to accept a second argument for variable substitution (e.g., `t("hello.user", { name })` → `"Hello, {name}!"`)

New keys needed for every file group:
- **Home page components** (HeroSection, CountdownTimer, MarqueeStrip, CountriesSection, AnniversarySection, PillarsGrid, EventsSection, StatsSection, DidYouKnow, LatestNews, NewsletterSection, SponsorCTA, SponsorPlaceholderSection, ImplementingPartnersSection, InstitutionalPartnersSection)
- **Pages** (About, Contact, Documents, News, MediaKit, Team, Timeline, Stakeholders, NotFound, Auth, Volunteer, Events, SponsorPortal)
- **Programme pages** (Youth, Trade, Women, Civic, Culture, Awards, Parliament) — these are content-heavy with paragraphs, stats, stream descriptions, quotes
- **Shared components** (SocialMediaBar, ProgrammePageTemplate)
- **CRM/admin** — lower priority but form labels, headers still need translation

### 2. Update `src/lib/i18n.tsx` core functionality

- Change localStorage key from `"locale"` to `"preferredLanguage"` per spec
- Add interpolation to `t()`: replace `{varName}` patterns in translated strings
- Add locale-aware date/number formatting helpers: `formatDate(date, locale)`, `formatNumber(num, locale)`
- Dynamically set `document.documentElement.lang` when locale changes

### 3. Update `index.html`

- Set initial `lang="en"` on `<html>` tag (will be overridden dynamically)

### 4. Wire every component to use `t()`

Each of the ~30+ files with hardcoded strings needs:
- Import `useTranslation`
- Replace every string literal with `t("key.name")`
- For arrays of objects (pillars, facts, events, partners, etc.), restructure to use `t()` for each translatable field

### 5. Language switcher enhancements

- Add `aria-label` translated as "Language" / "Langue" / "Idioma"
- Ensure keyboard navigability (already mostly works with buttons)
- Add language switcher in footer

### 6. Locale-aware formatting

- Dates: use `Intl.DateTimeFormat` with locale mapping (`en` → `en-GB`, `fr` → `fr-FR`, `pt` → `pt-PT`)
- Numbers: use `Intl.NumberFormat` with appropriate locale
- Apply in CountdownTimer, EventsSection, News dates, etc.

## Technical Architecture

```text
src/lib/
├── i18n.tsx              # Provider, context, t() with interpolation
├── translations/
│   ├── en.ts             # ~500 keys - English
│   ├── fr.ts             # ~500 keys - French  
│   └── pt.ts             # ~500 keys - Portuguese
└── formatters.ts         # formatDate(), formatNumber(), formatCurrency()
```

The `t()` function signature becomes:
```typescript
t(key: string, vars?: Record<string, string | number>): string
```

With interpolation: `t("greeting", { name: "Amina" })` where the translation is `"Hello, {name}!"` → `"Hello, Amina!"`

## Files to Modify (grouped by priority)

**Core infrastructure** (3 files):
- `src/lib/i18n.tsx` — refactor, add interpolation, lang attribute
- `src/lib/translations/en.ts` — new file, all English strings
- `src/lib/translations/fr.ts` — new file, all French strings  
- `src/lib/translations/pt.ts` — new file, all Portuguese strings
- `index.html` — add `lang="en"`

**Home page components** (15 files):
- HeroSection, SpeakerSection, MarqueeStrip, CountdownTimer, CountriesSection, AnniversarySection, PillarsGrid, EventsSection, StatsSection, DidYouKnow, LatestNews, NewsletterSection, SponsorCTA, SponsorPlaceholderSection, ImplementingPartnersSection, InstitutionalPartnersSection

**Public pages** (11 files):
- About, Contact, Documents, News, MediaKit, Team, Timeline, Stakeholders, NotFound, Events, Volunteer

**Programme pages** (7 files):
- Youth, Trade, Women, Civic, Culture, Awards, Parliament

**Layout/shared** (3 files):
- Navbar (minor updates — aria-label, footer switcher)
- Footer (add language switcher)
- SocialMediaBar

**Auth** (1 file):
- Auth.tsx — form labels, error messages

## Translation Quality

All French and Portuguese translations will be natural, grammatically correct, and culturally appropriate — not word-for-word literal translations. Proper use of formal register appropriate for a parliamentary/institutional context.

## Estimated Scope

- ~500 translation keys across 3 languages = ~1,500 translated strings
- ~35 component files modified to use `t()`
- 4 new files created (3 translation files + formatters)
- 1 core file refactored (i18n.tsx)

