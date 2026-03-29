

## Plan: Hero Background, Speaker CTAs, Stakeholders Update & Dashboard Roadmap

### 1. Hero Section — Background Image
- Copy `Parl.png` to `src/assets/parliament-chamber.png`
- Add it as a full-bleed background image behind the Hero section with a dark overlay to maintain text readability
- The existing gradient, orbs, and particles layer on top of the image

### 2. Speaker Section — CTA Buttons
- Add two `Button` components below the existing tags in `SpeakerSection.tsx`:
  - **"About the Speaker"** → links to `https://www.parl.ecowas.int/the-speaker-6th-legislature/` (opens in new tab)
  - **"Official Site"** → links to `https://www.parl.ecowas.int` (opens in new tab)

### 3. Stakeholders Page — Speaker Prominence
- Copy `Parl.png` to `src/assets/parliament-chamber.png` (shared with Hero)
- Restructure the ECOWAS Parliament leadership section:
  - Pull the Speaker (Rt. Hon. Hadja Mémounatou Ibrahima) out of the 3-column grid
  - Display her as a **featured full-width card** with the `Parl.png` image as a large hero-style banner, with her name/title overlaid
  - Keep the remaining two stakeholders (Mrs. Uche Duru, Dr. Kabeer Garba) in a 2-column grid below

### 4. Dashboard Expansion Roadmap (Reference Only)
The uploaded Platform Master Map defines the full architecture for future implementation. Key areas it covers that will guide upcoming work:
- **12 roles across 3 tiers** (Super Admin → Programme Staff → External)
- **12 CRM modules** (contacts, sponsors, events, tasks, documents, finances, etc.)
- **Permissions matrix** per role
- **Email provisioning system**
- **Onboarding flows** for each role tier
- **Route map** for all pages including admin dashboards

No code changes for this item now — it serves as the architectural blueprint for incremental dashboard features.

### Technical Details
- **Files modified**: `HeroSection.tsx`, `SpeakerSection.tsx`, `Stakeholders.tsx`
- **Files added**: `src/assets/parliament-chamber.png` (copied from upload)
- The Hero background uses `object-cover` with a dark gradient overlay (~60-70% opacity) to preserve the existing green gradient aesthetic while showing the parliament chamber

