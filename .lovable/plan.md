

## CRM Gap Analysis for Super Admin

### What's Already Working Well

The CRM has solid foundations. These are fully functional:

- **People & Access** -- Add/edit team members with photo upload, title, bio, organisation, "show on website" toggle
- **Events Manager** -- Full CRUD with cover image upload, registration type (none/external/form), tags, publish toggle
- **Sponsors & Partners Manager** -- Tabbed UI, logo upload, tier selection, programme assignment, publish toggle
- **News Editor** -- CRUD with cover image, slug, excerpt, content, draft/published workflow
- **Site Content Manager** -- Editable hero, stats, quote, about sections via database
- **Contact Submissions** -- Read-only viewer
- **Newsletter Subscribers** -- Subscriber list with counts
- **Public pages wired to DB** -- LatestNews, News page, EventsSection, SponsorsSection, Stakeholders (partners + sponsors), PartnersStrip, StatsSection, and NewsletterSection all query the database

### Remaining Gaps

#### Gap 1: HeroSection still hardcoded
The homepage hero (`HeroSection.tsx`) uses translation keys for all text (title, description, stats). It does NOT read from the `site_content` table. The Site Content Manager can edit a "hero" section, but the actual component ignores it.

#### Gap 2: QuoteStrip still hardcoded
`QuoteStrip.tsx` uses only translation keys. It does not read from the `site_content` table's "quote" section, even though the CRM module supports editing it.

#### Gap 3: AboutSection still hardcoded
`AboutSection.tsx` uses only translation keys. Does not read from the "about" section in `site_content`.

#### Gap 4: Programme page sponsor footers use hardcoded placeholder data
`ProgrammeSponsorsFooter.tsx` accepts hardcoded tier/sponsor arrays and renders `SponsorPlaceholderLogo` (grey boxes). Each programme page (Trade, Youth, Women, etc.) passes in hardcoded sponsor names. These should query the `sponsors` table filtered by programme.

#### Gap 5: Stakeholders page -- ECOWAS Leadership section is hardcoded
The leadership section at the top of `Stakeholders.tsx` has 4 hardcoded people with imported images. There's no CRM module to manage these VIP stakeholders. This could be handled by adding a "stakeholder" or "leadership" category to the profiles/people system.

#### Gap 6: No event registration form on the public site
Events with `registration_type = "form"` show "Register" on the public events page, but there's no actual form wired to the `event_registrations` table. The "built-in form" option in the CRM is non-functional on the frontend.

#### Gap 7: No event detail page
There's no `/events/:id` route for individual event pages. The events page only shows a list with no way to view full details, cover images, or register.

#### Gap 8: Site Content Manager is too limited
Only 4 section templates (hero, stats, quote, about). Missing templates for:
- Countdown timer section
- Pillars/Programmes grid
- "Did You Know" section
- Anniversary section
- Speaker section
- Implementing Partners section
- Any other homepage section the super admin may want to control

#### Gap 9: No media/image gallery management
No CRM module to manage general media assets (photos, design files) beyond the specific buckets tied to events/news/sponsors. The `cms-media` bucket exists but has no management UI.

#### Gap 10: No page/content preview from CRM
The super admin cannot preview how their changes will look on the website without navigating to the public site manually. No "preview" button or iframe in the CRM.

---

### Implementation Plan

**Phase 1 -- Wire remaining hardcoded homepage sections to `site_content` DB** (3 components)

1. Update `HeroSection.tsx` to query `site_content` for key "hero" and use DB values with translation keys as fallback
2. Update `QuoteStrip.tsx` to query `site_content` for key "quote" and use DB values with fallback
3. Update `AboutSection.tsx` to query `site_content` for key "about" and use DB values with fallback

**Phase 2 -- Programme sponsor footers from DB** (2 files)

4. Rewrite `ProgrammeSponsorsFooter.tsx` to accept a `programme` prop and query `sponsors` table where `programmes` array contains that programme and `is_published = true`, grouped by tier
5. Update each programme page to pass programme ID instead of hardcoded arrays

**Phase 3 -- Event detail page + registration form** (2 new files)

6. Create `/events/:id` route with full event detail page showing cover image, description, location, date
7. Add registration form component for events with `registration_type = "form"` that inserts into `event_registrations`

**Phase 4 -- Expand Site Content Manager** (1 file)

8. Add more section templates to `SiteContentModule.tsx`: countdown, pillars, did_you_know, anniversary, speaker, implementing_partners

**Phase 5 -- CRM enhancements** (2 files)

9. Add a Media Library module to manage `cms-media` bucket (upload, browse, delete images)
10. Add a "Leadership / VIPs" section to the People module or create a new `leadership` table for managing the Stakeholders page VIP section from the CRM

### Technical Notes

- No new database migrations needed for Phases 1-3 (all tables exist)
- Phase 5 (leadership) may need a new DB table or a `category` column on `profiles`
- All public components will use `useQuery` with current hardcoded/translation values as fallbacks
- Estimated: ~12 files modified, ~3 new files created

