---
name: admin-web-parity
description: Enforce complete admin CRM control over every web-facing feature. Use this when building a new web page or section, auditing existing web pages for admin coverage gaps, or adding admin controls for a feature that currently has none. Ensures every piece of web content can be created, edited, hidden, deleted, reordered, and previewed from the admin dashboard by a super_admin — with no orphaned web content that cannot be controlled from the back end.
---

## The Parity Principle

**Every piece of content visible on the public website must have a corresponding admin control surface.**
No web feature ships without its admin panel. No content type exists without CRUD + hide/show.

The Panorama module (`PanoramaModule.tsx`) is the gold standard for this pattern:
- Scene list with create/edit/delete/reorder/visibility toggle
- Hotspot editor with visual placement (HotspotPicker) + CRUD
- Page copy editor (hero text, subtitles, section headings)
- Live preview link to the public page
- All controlled by `super_admin` and scoped roles; public sees only `is_active = true` records

Every new web feature must reach this same level of admin coverage.

---

## Standard Admin Control Interface (required for every content type)

| Control       | Implementation                                              | DB requirement                                   |
|---------------|-------------------------------------------------------------|--------------------------------------------------|
| **CREATE**    | Dialog or slide-over form with Zod validation               | `insert` RLS policy for allowed roles            |
| **READ**      | Data table with search/filter; shows ALL records (incl. hidden) | `select` RLS policy; admin sees hidden records |
| **UPDATE**    | Edit dialog pre-filled from row; same Zod schema            | `update` RLS policy                              |
| **DELETE**    | Confirmation dialog ("This cannot be undone"); soft-delete preferred | `delete` or `update is_deleted` policy    |
| **HIDE/SHOW** | Toggle switch in the table row; instant update              | `is_active boolean default true` column          |
| **REORDER**   | Drag-and-drop or up/down arrows where list order matters    | `display_order integer` column                   |
| **PREVIEW**   | "View on site" link → opens web page in new tab             | No DB change needed                              |
| **PUBLISH**   | `status` field: `draft → published → archived`              | `status text` column if workflow is needed       |

---

## Web Page → Admin Module Mapping

This is the authoritative map. Any cell marked `[GAP]` means admin control does not exist and must be built.

### Homepage (`Index.tsx`)
| Section                  | Admin module          | Controls needed                                      |
|--------------------------|-----------------------|------------------------------------------------------|
| Hero section             | SiteContentModule     | Edit headline, subtitle, CTA button text/url         |
| Programme spotlight      | ProgrammePillarsModule| Hide/show individual programmes on homepage          |
| Parliament tour spotlight| PanoramaModule ✓      | Toggle spotlight via `is_featured` flag on scene     |
| News feed (latest 3)     | NewsEditorModule ✓    | Controlled by publish date + is_active               |
| Events feed              | EventsManagerModule ✓ | Controlled by publish date + is_active               |
| Partner logos strip      | SponsorsManagerModule ✓ | Hide/show per sponsor, reorder                     |

### News (`News.tsx`, `news/NewsDetail.tsx`)
| Control needed     | Admin module        | Status |
|--------------------|---------------------|--------|
| Create article     | NewsEditorModule ✓  | Exists |
| Edit article       | NewsEditorModule ✓  | Exists |
| Delete article     | NewsEditorModule ✓  | Exists |
| Hide/show article  | NewsEditorModule ✓  | Exists (`is_published` toggle) |
| Set featured image | NewsEditorModule ✓  | Exists |
| i18n per article   | NewsEditorModule — check fr/pt fields | Verify |

### Events (`Events.tsx`, `events/EventDetail.tsx`)
| Control needed     | Admin module           | Status |
|--------------------|------------------------|--------|
| Create event       | EventsManagerModule ✓  | Exists |
| Edit event         | EventsManagerModule ✓  | Exists |
| Delete event       | EventsManagerModule ✓  | Exists |
| Hide/show event    | EventsManagerModule — verify `is_active` toggle | Verify |
| Manage registration| EventsManagerModule — verify capacity/RSVP controls | Verify |

### Parliament Tour (`ParliamentTour.tsx`)
| Control needed            | Admin module       | Status   |
|---------------------------|--------------------|----------|
| Scene CRUD + reorder      | PanoramaModule ✓   | Exists   |
| Hotspot CRUD + placement  | PanoramaModule ✓   | Exists   |
| Scene hide/show           | PanoramaModule ✓   | Exists   |
| Page copy (hero text)     | PanoramaModule ✓   | Exists   |
| Mobile image variants     | PanoramaModule ✓   | Exists   |

### Programme Pages (`programmes/*.tsx`, `programmes/PillarPage.tsx`)
| Control needed                    | Admin module             | Status     |
|-----------------------------------|--------------------------|------------|
| Edit programme pillar content     | ProgrammePillarsModule ✓ | Exists     |
| Hide/show individual pillars      | ProgrammePillarsModule ✓ | Exists     |
| Edit programme page hero copy     | SiteContentModule        | Verify     |
| Edit programme timeline           | ProgrammeTimeline ✓      | Exists     |
| Manage programme registrations    | EventsManagerModule      | [GAP - verify] |

### Stakeholders (`Stakeholders.tsx`)
| Control needed       | Admin module         | Status |
|----------------------|----------------------|--------|
| CRUD stakeholders    | StakeholdersModule ✓ | Exists |
| Hide/show per entry  | StakeholdersModule — verify `is_active` | Verify |
| Reorder display      | StakeholdersModule — verify `display_order` | Verify |

### Documents (`Documents.tsx`)
| Control needed     | Admin module      | Status |
|--------------------|-------------------|--------|
| Upload documents   | DocumentsModule ✓ | Exists |
| Edit metadata      | DocumentsModule ✓ | Exists |
| Delete documents   | DocumentsModule ✓ | Exists |
| Hide/show          | DocumentsModule — verify `is_active` | Verify |

### Media Kit (`MediaKit.tsx`)
| Control needed         | Admin module      | Status     |
|------------------------|-------------------|------------|
| Manage kit assets      | MediaKitModule ✓  | Exists     |
| Edit kit sections      | MediaKitModule — verify full CRUD | Verify |
| Hide/show kit sections | MediaKitModule — verify `is_active` | Verify |

### Marketplace (`marketplace/*.tsx`)
| Control needed            | Admin module         | Status       |
|---------------------------|----------------------|--------------|
| View/moderate listings    | MarketplaceModule ✓  | Exists       |
| Approve/reject listings   | MarketplaceModule — verify approve/reject | Verify |
| Hide listing              | MarketplaceModule — verify `is_active` toggle | Verify |
| Delete listing            | MarketplaceModule — verify delete action | Verify |
| Manage categories         | MarketplaceModule    | [GAP - verify] |

### Sponsors/Partners (`sponsors/SponsorPage.tsx`, `partners/PartnerPage.tsx`)
| Control needed         | Admin module              | Status |
|------------------------|---------------------------|--------|
| CRUD sponsors          | SponsorsManagerModule ✓   | Exists |
| CRUD partners          | SponsorsManagerModule — verify partner vs sponsor split | Verify |
| Hide/show sponsor      | SponsorsManagerModule — verify `is_active` | Verify |
| Reorder sponsor logos  | SponsorsManagerModule — verify `display_order` | Verify |

### About / Contact / Team / Volunteer (static/semi-static pages)
| Control needed           | Admin module        | Status     |
|--------------------------|---------------------|------------|
| Edit page copy           | SiteContentModule ✓ | Exists     |
| Manage team members      | TeamModule ✓        | Exists     |
| Manage contact form leads| ContactSubmissionsModule ✓ | Exists |
| Edit team member bio     | TeamModule — verify full CRUD | Verify |

---

## Instructions — When adding a new web page

Follow these steps in order. Do NOT ship the web page without completing all steps.

### Step 1 — Identify every content type on the page
List every distinct type of content the page displays. Examples:
- Hero section (text/image)
- List of items from DB (cards, table rows, tiles)
- Individual item detail (single record)
- Static copy blocks (headings, body text, CTAs)
- Media (images, videos, documents)
- Interactive elements (forms, maps, 360° viewer)

### Step 2 — Check for existing admin coverage
For each content type:
- Does an admin module already manage this data? (check crmModules.ts)
- Does that module have CRUD + hide/show for this specific content type?
- If yes → verify the controls, add any missing operations
- If no → build a new module or extend the closest existing one

### Step 3 — Add `is_active` to every new table
Every table that feeds a web page must have:
```sql
is_active boolean not null default true,
display_order integer not null default 0,
```

Web app queries ALWAYS filter: `.eq('is_active', true).order('display_order')`
Admin queries NEVER filter on `is_active` — it shows all records with a toggle.

### Step 4 — Build the admin controls
For every content type, build or extend the admin module with:
1. **Data table** — all records, sortable, with search
2. **Create button** → opens dialog with Zod-validated form
3. **Edit action** per row → same dialog pre-filled
4. **Delete action** per row → confirmation dialog
5. **Hide/Show toggle** per row → instant `is_active` update
6. **Reorder** (if order matters) → drag handles or up/down arrows
7. **Preview link** → "View on site" opens the public page in new tab

### Step 5 — RLS for the new table
Web public read:
```sql
create policy "<table>_public_read"
  on public.<table>
  for select
  using (is_active = true);
```

Admin full access:
```sql
create policy "<table>_super_admin_all"
  on public.<table>
  for all
  using (has_role(auth.uid(), 'super_admin'::app_role))
  with check (has_role(auth.uid(), 'super_admin'::app_role));
```

Staff write (if applicable):
```sql
create policy "<table>_staff_write"
  on public.<table>
  for insert
  using (is_crm_staff())
  with check (is_crm_staff());
```

### Step 6 — Register in crmModules.ts
If a new CRM module was created:
- Add to `ModuleId` union type
- Add to `CRM_MODULES[]` with `allowedRoles: ['super_admin', 'admin', ...]`
- Add render case in `CRMDashboard.tsx`
- Add i18n keys in all three translation files

### Step 7 — Add a preview link in the admin module
Every admin module that manages web-visible content must include a link:
```tsx
<Button variant="outline" size="sm" asChild>
  <a href={`${import.meta.env.VITE_WEB_URL}/page-path`} target="_blank" rel="noopener">
    View on site
  </a>
</Button>
```

---

## Audit mode — checking existing pages for gaps

When asked to audit admin coverage for all web pages:

1. Read `apps/web/src/pages/` to list all pages
2. For each page, identify the Supabase tables it queries (`supabase.from(...)`)
3. Cross-reference each table against admin modules in `crmModules.ts`
4. For each table with no admin module: flag as `[GAP]`
5. For each admin module that exists: verify it has CRUD + `is_active` toggle
6. Output the mapping table above with verified vs gap status filled in
7. Prioritise gaps by: (a) super_admin-only content first, (b) publicly editable content second

---

## Example

**Prompt:** "I just built a new Volunteer page on the web with a `volunteer_applications` table. Make sure admin has full control."

**Output:**
- Audit: `volunteer_applications` table — no existing admin module found
- Creates `VolunteerModule.tsx` with: applications table, status toggle (pending/approved/rejected), delete with confirmation, export to CSV action
- Adds `is_active` and `display_order` to migration (if not present)
- Adds RLS: public can insert (submit form), super_admin has full access, staff can read + update status
- Registers in `crmModules.ts` under PEOPLE group
- Adds i18n keys
- Reports: "Volunteer page now has full admin coverage — CRUD, status management, and hide/show all wired."
