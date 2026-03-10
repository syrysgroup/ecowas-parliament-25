## ECOWAS Parliament @25 — Full Implementation Plan

### 1. Revamp Announcement Gallery with Category Filters

Replace the current flat gallery with a **categorized, filterable gallery page/section**:

- **Categories**: "Dignitaries & Leadership", "Media Briefing", "Panel Discussions", "Cultural Moments", "Group Photos", "Event Highlights"
- Show a **curated selection** (not all 50) on the homepage (~12-16 images), with a "View Full Gallery" button linking to a dedicated gallery page
- Add **tab/filter buttons** at the top to switch between categories
- Keep the lightbox for full-size viewing
- Create a new `/gallery` route for the full gallery experience

### 2. Tiered Sponsors Section

Build a new **SponsorsSection** component on the homepage (replacing the old PartnersStrip) with **four tiers**, each visually distinct:

- **Implementing Partners** (largest logos, premium placement — Duchess NL, CMD, Borderless Trade)
- **Platinum Sponsors** (large logos — demo: 2-3 placeholder sponsors)
- **Gold Sponsors** (medium logos — demo: 3-4 placeholder sponsors)
- **Sponsors** (smaller logos in a row — demo: 4-6 placeholder sponsors)

Each tier gets a label, appropriate sizing, and generated placeholder logos. The Footer will also be updated to reflect the tiered structure.

### 3. Update Stakeholders Page with Sponsor Tiers

Expand the Stakeholders page to include the full sponsor directory, organized by tier with descriptions and contact-style cards for each.

### 4. Improve Button Visibility Across the Site

- Make all CTA buttons more prominent with **stronger contrast, shadows, and clear borders**
- Ensure the mobile hamburger menu button is clearly visible
- Make Download buttons on Documents page bolder
- Add hover effects and consistent styling to all filter buttons (News, Gallery)

### 5. Better Image Usage Across Pages

- Use **more varied announcement photos** across News, About, Team, and Programme pages
- Add announcement photos to the **Timeline page** (one per event where appropriate)
- Ensure all hero sections use relevant background images from the announcement folder

### 6. Polish & Completeness

- Add the Gallery link to the navigation menu
- Ensure responsive design works well across all new sections
- Populate all demo data with realistic placeholder content  


7. Stakeholders
  Add image place holders for all the stakeholders 

### Files to Create

- `src/pages/Gallery.tsx` — Full gallery page with categories
- `src/components/home/SponsorsSection.tsx` — Tiered sponsors component

### Files to Modify

- `src/pages/Index.tsx` — Add SponsorsSection, update gallery to show curated subset
- `src/components/home/AnnouncementGallery.tsx` — Add category filters, curate selection, add "View Full Gallery" link
- `src/components/layout/Navbar.tsx` — Add Gallery to navigation
- `src/components/layout/Footer.tsx` — Update partner section to reflect sponsor tiers
- `src/pages/Stakeholders.tsx` — Add sponsor tiers
- `src/pages/Timeline.tsx` — Add event images
- `src/App.tsx` — Add /gallery route
- `src/components/ui/button.tsx` — Enhance visibility with stronger default styles
- Various programme/page files — Better image usage