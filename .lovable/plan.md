

# Project Review & Implementation Plan

## Current State

The project is a well-structured ECOWAS Parliament @25 anniversary website with:
- 13 pages (Home, About, Timeline, News, Documents, Stakeholders, Team, 6 Programme pages)
- ECOWAS-themed design system (green/gold/red)
- All content is hardcoded placeholder data
- **The connected Supabase database has no tables** -- it's completely empty
- **50 announcement pictures** exist in `Announcement Pictures/` folder but are unused
- **Duplicate "Implementing Partners" section** appears both in the `PartnersStrip` component on the homepage AND inside the `Footer` -- this is the repetition the user flagged earlier

## Plan

### 1. Fix Duplicate Implementing Partners
Remove `PartnersStrip` from the homepage `Index.tsx` since the Footer already shows implementing partners on every page. This eliminates the repetition.

### 2. Create Announcement Pictures Gallery on Homepage
Add a new `AnnouncementGallery` component to the homepage that displays a curated grid of the announcement pictures (using images from the `Announcement Pictures/` folder). These will be imported as static assets and displayed in a visually appealing masonry/grid layout with hover effects.

### 3. Use Announcement Pictures Across Pages
- **Hero sections**: Replace gradient placeholders with actual event photos as background images
- **News cards**: Use announcement photos instead of the Calendar icon placeholder
- **Team page**: Use relevant photos for team member avatars
- **About page**: Add imagery to break up text content
- **Programme pages**: Add relevant photos to each programme pillar page

### 4. Improve Button Visibility
Audit all buttons across the site:
- Ensure CTA buttons have strong contrast (gold on dark, green on light)
- Add visible borders/shadows to outline-variant buttons
- Make the "Download" buttons on Documents page more prominent
- Ensure mobile nav trigger button is clearly visible

### 5. Database Setup (Optional -- No Tables Exist)
Since the Supabase database is empty, all current content will remain as static data (which is appropriate for a commemorative programme site with fixed content). If dynamic content management is needed later, tables can be added.

### Files to Modify
- `src/pages/Index.tsx` -- Remove PartnersStrip, add AnnouncementGallery
- `src/components/home/AnnouncementGallery.tsx` -- New photo gallery component
- `src/components/home/HeroSection.tsx` -- Add announcement photo background
- `src/components/home/LatestNews.tsx` -- Use announcement photos on news cards
- `src/pages/About.tsx` -- Add photos between content sections
- `src/pages/Team.tsx` -- Use photos for team members
- `src/pages/News.tsx` -- Use photos on news cards
- `src/components/shared/ProgrammePageTemplate.tsx` -- Add photo support
- Various programme pages -- Add relevant images
- Button styling updates across multiple components

