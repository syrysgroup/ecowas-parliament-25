# Batch 1 — Home sections CMS wiring

The homepage hero is already DB-backed via `useSiteContent("hero")` and editable in the admin Site Content module — nothing to change there. This batch covers the two still-hardcoded home areas in scope:

1. **People-Oriented Mandate section** (`PeopleMandateSection.tsx`) — currently all `t()` translations, no DB override.
2. **Partner strips** — `ImplementingPartnersSection` and `InstitutionalPartnersSection` headers are all `t()`.

## Changes

### 1. New `mandate` template (PeopleMandateSection)

Add `mandate` entry to `SECTION_TEMPLATES` in `apps/admin/src/components/crm/modules/SiteContentModule.tsx` with fields:

- `badge`, `title`, `title_accent`, `description`, `cta_label`, `cta_href`, `image_caption`
- `pillar1_title`, `pillar1_desc` … `pillar4_title`, `pillar4_desc`
- `quote`, `quote_attr`

Wire `PeopleMandateSection.tsx`:
- `const { data: cms } = useSiteContent("mandate")`
- Replace each `t("mandate.X")` with `cms?.x ?? t("mandate.X")` so the translation stays as fallback.
- CTA link uses `cms?.cta_href ?? "/ecowas-parliament"`.

### 2. Extend `implementing_partners` template + wire it

Template already exists with `title`, `description`. Add `badge`, `title_accent`, `subtitle` to it.

Wire `ImplementingPartnersSection.tsx`:
- `const { data: cms } = useSiteContent("implementing_partners")`
- `t("implPartners.badge")` → `cms?.badge ?? t(...)`, same for `title`, `titleAccent` (mapped to `title_accent`), `subtitle`.

### 3. New `institutional_partners` template

Add entry with `badge`, `title`, `title_accent`, `subtitle`.

Wire `InstitutionalPartnersSection.tsx` identically to #2 with `useSiteContent("institutional_partners")`.

## Notes

- **No DB migration.** All three keys live in the existing `site_content` table and will be created by the admin "Add section" flow on first save.
- **No visual change** when admin hasn't created a row — translation fallbacks preserve current copy.
- **No new packages.**
- After this batch, I'll ship Batch 2 (Layout chrome: nav CTA + footer).
- Files touched: `apps/admin/src/components/crm/modules/SiteContentModule.tsx`, `apps/web/src/components/home/PeopleMandateSection.tsx`, `apps/web/src/components/home/ImplementingPartnersSection.tsx`, `apps/web/src/components/home/InstitutionalPartnersSection.tsx`.
