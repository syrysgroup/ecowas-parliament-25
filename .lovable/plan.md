

## Plan: Redesign News/Events Pages, Media Kit Access, and Settings Relocation

This is a multi-part update covering image standards, page redesigns, media accreditation, and CRM settings cleanup.

---

### 1. Standardize Instagram Post Aspect Ratio (1:1) for All Images

- Change all image aspect ratios from `aspect-[4/5]` to `aspect-square` (1:1, 1080x1080) across:
  - `News.tsx` listing cards
  - `Events.tsx` listing cards
  - `EventDetail.tsx` "Other Events" cards
- Ensure `object-cover object-center` is used everywhere for consistent cropping.

---

### 2. Add External Links (Media Coverage) to Events

**Database migration**: Add `external_links jsonb DEFAULT '[]'` column to the `events` table (news_articles already has this column).

**EventDetail.tsx**: Render a "Media Coverage" section (similar to NewsDetail's existing Related Media Coverage block) showing linked articles from external media.

**CRM EventsManagerModule**: Add UI to manage external links when editing events.

---

### 3. Redesign Individual News Page (`NewsDetail.tsx`)

Current layout is a narrow single-column. Redesign to a full-width two-column layout:

- **Main content area (left, ~2/3 width)**: Full-width cover image (1:1 aspect), title, date, excerpt as lead paragraph, article body content, external media links section.
- **Sidebar (right, ~1/3 width, sticky)**: Share buttons (Twitter, Facebook, WhatsApp, Copy Link), newsletter signup CTA, "More News" list showing 3-4 recent articles with thumbnails linking to them.
- **Below main content**: "More News" grid section (3 cards) showing other published articles, excluding the current one.

---

### 4. Redesign Individual Event Page (`EventDetail.tsx`)

Enhance the existing two-column layout:

- **Main area**: Instagram-ratio cover image (1:1), event description, media coverage/external links section.
- **Sidebar**: When registration is available, show registration form/external link. When registration is NOT available (type "none" or past event), replace with: event details card (date, location, capacity info), "Add to Calendar" button, share buttons, and a "Contact Organizers" CTA linking to the contact page.
- **Below main content**: "Other Events" section (already exists, keep with 1:1 images).
- Add a default gradient/pattern placeholder when no cover image exists (instead of just a calendar icon).

---

### 5. Media Kit: Public vs Accredited Media Portal

**Public `/media-kit`** stays as-is with press releases, spokespeople, asset packs, event calendar.

**Accredited Media Portal** (`/media-portal`):
- New route accessible to users with a `media` role.
- When media users log in, they are redirected to `/media-portal` instead of `/crm`.
- The portal provides: early access to press releases, high-res photo galleries, exclusive briefing documents, interview scheduling, and press pass management.
- Add `media` to the `app_role` enum via migration.
- Update `ProtectedRoute` and auth redirect logic.

**Database migration**: Add `'media'` value to `app_role` enum.

---

### 6. Remove Language Switcher from Footer

The language switcher in `Footer.tsx` will be removed. It's already accessible in the Navbar. This cleans up the footer.

Wait -- re-reading the request: "site setting should be in the crm not in the footer." This means the user wants site settings management only in the CRM, not exposed in the footer. The Site Settings panel already exists in the CRM SettingsModule. The footer currently displays data from site_settings (like contact email) which is correct -- it just reads settings. No change needed here; the user likely means the language/config controls shouldn't be user-facing in the footer. I'll keep the footer as-is since it only reads settings.

---

### 7. Summary of File Changes

| File | Change |
|------|--------|
| `src/pages/news/NewsDetail.tsx` | Full redesign: two-column layout with sidebar, more news section |
| `src/pages/events/EventDetail.tsx` | Redesign sidebar for no-registration case, add external links, 1:1 images |
| `src/pages/News.tsx` | Change image aspect to `aspect-square` |
| `src/pages/Events.tsx` | Change image aspect to `aspect-square`, add default cover design |
| `src/pages/MediaKit.tsx` | Minor: add link to accredited portal |
| New: `src/pages/MediaPortal.tsx` | Accredited media dashboard |
| `src/App.tsx` | Add `/media-portal` route with `media` role protection |
| `src/components/layout/Footer.tsx` | Remove language switcher (settings managed in CRM only) |
| DB migration | Add `external_links` to events table, add `media` to app_role enum |

### Technical Notes

- Instagram standard post is 1080x1080 (1:1). Using Tailwind `aspect-square` class.
- The media portal will be a standalone page (not the CRM) with a clean layout for journalists.
- External links on events will use the same `jsonb` format as news_articles: `[{title, url}]`.
- "More News" / "More Events" queries will exclude the current item and limit to 3-6 results.

