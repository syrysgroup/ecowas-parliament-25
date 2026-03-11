

# Plan: Enhance Stakeholders Page, Improve Programme Pages & Verify Site

## 1. Stakeholders Page Enhancement

The current `Stakeholders.tsx` uses generic `User` icons instead of photos. Will redesign with:

- **Hero section**: Add a background photo from the announcement event (`/announcement/1.jpg`)
- **Leadership section**: Replace icon placeholders with announcement photos showing dignitaries (e.g., `/announcement/2.jpg`, `/announcement/3.jpg`, `/announcement/7.jpg`)
- **Partners section**: Add a photo gallery strip below partners showing event moments
- **New "Event Highlights" section**: Grid of 6-8 announcement photos showing key dignitaries and partners at the event, with captions

**File**: `src/pages/Stakeholders.tsx`

## 2. Programme Pages Design Upgrade

The current `ProgrammePageTemplate` is minimal — just text sections with bullet points. Will significantly enhance it:

### Template Changes (`ProgrammePageTemplate.tsx`):
- **Hero**: Increase hero image opacity from 15% to 25%, add a gradient overlay for depth, increase padding
- **New "Key Highlights" section**: Accept `highlights` prop — array of `{icon, title, description}` rendered as a visually rich 2-column card grid
- **Photo gallery strip**: Accept `galleryImages` prop — array of 3-4 photos displayed in a horizontal strip between sections
- **CTA section**: Add a closing call-to-action with a "Back to Programmes" link and related programme links
- **Objectives**: Style as numbered cards instead of plain bullet list
- **Countries**: Add flag emoji or color-coded badges

### Each Programme Page Updates:
Add `highlights` and `galleryImages` props with relevant content and photos:

- **Women.tsx**: Photos `/announcement/13.jpg`, `/announcement/30.jpg`, `/announcement/42.jpg`; highlights about trade platforms, workshops, networking
- **Trade.tsx**: Photos `/announcement/11.jpg`, `/announcement/28.jpg`, `/announcement/40.jpg`; highlights about B2B forums, trade corridors, policy dialogue
- **Youth.tsx**: Photos `/announcement/9.jpg`, `/announcement/33.jpg`, `/announcement/44.jpg`; highlights about Smart Challenge, mentorship, regional finale
- **Culture.tsx**: Photos `/announcement/21.jpg`, `/announcement/35.jpg`, `/announcement/46.jpg`; highlights about festivals, creative industries, cultural showcase
- **Civic.tsx**: Photos `/announcement/17.jpg`, `/announcement/37.jpg`, `/announcement/48.jpg`; highlights about Caravan, TV Game Show, digital outreach
- **Parliament.tsx**: Photos `/announcement/15.jpg`, `/announcement/31.jpg`, `/announcement/50.jpg`; highlights about simulation, youth reports, institutional pathway

## 3. Button Visibility Audit

- Lightbox close button: Add a visible background (`bg-white/20 rounded-full p-2`) for better contrast
- Lightbox navigation: Add left/right arrow buttons to navigate between images
- Mobile nav hamburger: Already has border — verify it renders well

## Files to Modify
1. `src/components/shared/ProgrammePageTemplate.tsx` — Major redesign with new props and sections
2. `src/pages/Stakeholders.tsx` — Add photos, event highlights gallery
3. `src/pages/programmes/Women.tsx` — Add highlights + gallery images
4. `src/pages/programmes/Trade.tsx` — Add highlights + gallery images
5. `src/pages/programmes/Youth.tsx` — Add highlights + gallery images
6. `src/pages/programmes/Culture.tsx` — Add highlights + gallery images
7. `src/pages/programmes/Civic.tsx` — Add highlights + gallery images
8. `src/pages/programmes/Parliament.tsx` — Add highlights + gallery images
9. `src/components/home/AnnouncementGallery.tsx` — Add lightbox navigation arrows + better close button

