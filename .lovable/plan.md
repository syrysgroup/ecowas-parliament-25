

# Implementation Plan

This plan covers 5 distinct changes across the application.

---

## 1. Redesign People-Oriented Mandate Section for Portrait Image

**File**: `src/components/home/PeopleMandateSection.tsx`

The current hero image uses `object-cover` on a landscape-ratio container, which crops a portrait image badly. Redesign to a two-column layout: text/overlay on the left, portrait image on the right (or stack on mobile). The image container will use a portrait aspect ratio (`aspect-[3/4]`) so the portrait photo displays properly. On mobile, the image stacks above the text at a reduced height.

---

## 2. Add Sponsors Page to Navigation Menu

**File**: `src/components/layout/Navbar.tsx`

Add a "Sponsors" link to the navbar. The `/sponsors` route already exists (mapped to `SponsorPortal`). Add it as a top-level nav item or nest it under an existing dropdown (e.g., alongside Stakeholders). Will add as a sibling to the Stakeholders link or as a child in the same dropdown grouping.

---

## 3. Past Events: Disable Registration, Show Press/Briefings

**File**: `src/pages/events/EventDetail.tsx`

- Compare event date to current date (`new Date()`)
- If the event has passed, hide the registration form entirely
- Replace it with a "This event has concluded" notice
- Add a section for related press/briefings with placeholder external article links (title + URL format) that can be populated later

---

## 4. Add New Stakeholder Card Between Secretary General and Chief Communications Officer

**File**: `src/pages/Stakeholders.tsx`

Insert a new entry in the `ecowasStakeholders` array at index 2 (between "Hon. Alhaji Bah" and "Mrs. Uche Duru"). Will need a name, title, and image asset. Since no details were provided, will add a placeholder card with a generic title like "Director" using the existing `directorImage` asset that's already imported but unused in the current array.

---

## 5. Parliament Page: Restructure with Delegates Tab, Principal Officers, and Country Sub-Pages

**Files**: `src/pages/programmes/Parliament.tsx`, new file `src/pages/programmes/ParliamentCountry.tsx`, `src/App.tsx`

### 5a. Add explanatory section before Country Delegations
Add a brief section explaining that the youth parliament emulates the actual ECOWAS Parliament in representation structure.

### 5b. Principal Officers Section
Add a prominent section listing the 5 principal officers:
- Speaker — Togo
- 1st Deputy Speaker — Nigeria
- 2nd Deputy Speaker — Cote d'Ivoire
- 3rd Deputy Speaker — Ghana
- 4th Deputy Speaker — Gambia

Each displayed with placeholder ECOWAS Parliament logo image, blank name, and "6th Legislature" tagline.

### 5c. Delegates Tab/Section
Add a prominent "Delegates" tab or section on the Parliament page that shows:
1. Principal officers at the top
2. Below that, all country delegation slots with placeholder images (ECOWAS Parliament logo) and blank names, tagged "6th Legislature"

### 5d. Country Sub-Pages
- Add route `/programmes/parliament/:country` in `App.tsx`
- Create `ParliamentCountry.tsx` that displays:
  - Country name, flag, seat count
  - Nominations and voting specific to that country
  - Verified delegates for that country
- Make `CountryDelegationCard` link to this sub-page

### 5e. Move nominations/voting to country pages
The main Parliament page will no longer show the global nominee leaderboard and representatives grid. Instead, each country card links to its own page where nominations and voting are displayed.

---

## Technical Details

- Portrait image fix: Switch from full-width overlay layout to a `grid lg:grid-cols-2` with the image in a `aspect-[3/4]` container
- Event past check: `const isPast = new Date(event.date) < new Date()`
- Parliament tabs: Use existing `Tabs`/`TabsList`