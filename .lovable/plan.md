# Phase 3 — Scope for 5 New Gap Modules

Detailed spec for the modules that fill the public-web ↔ admin coverage gaps. Build order runs **after Phase 2 batches 1–5** (so they land on the new shell + tokens). Each module is independently shippable: one Supabase migration + one module file in `crmModules.ts` + optional edge function.

All RLS uses the existing helpers: `is_crm_staff(auth.uid())` for staff access, `has_role(auth.uid(), 'super_admin')` where elevated. All new public-schema tables get the standard `GRANT` block (authenticated for staff-write tables, anon SELECT only where the public site reads directly, always `service_role` for edge functions).

---

## M1 — VolunteerModule (group: CONTENT)

**Public surface:** `/volunteer` form on `apps/web`.

**Tables**

- `volunteer_form_fields` — ordered schema for the public form. Fields: `key`, `label`, `field_type` (`text|textarea|select|multiselect|email|phone|date|checkbox`), `options jsonb`, `required bool`, `position int`, `active bool`.
- `volunteer_applications` — submissions. Fields: `full_name`, `email`, `phone`, `country`, `interests text[]`, `availability`, `motivation`, `extra jsonb` (catches dynamic fields), `status` (`pending|approved|rejected|archived`), `reviewed_by uuid`, `reviewed_at`, `review_notes`.

**RLS**

- `volunteer_form_fields`: anon SELECT where `active`; staff full write.
- `volunteer_applications`: anon INSERT only; staff full read/update/delete; applicant cannot read back.

**Edge functions**

- `notify-volunteer-application` (trigger on insert via DB webhook or app-side call) — sends ack email to applicant + Slack/email to staff inbox. Reuses `send-notification`.

**UI (module file `VolunteerModule.tsx`)**

- `PageHeader` with "Export CSV" + "Edit form" actions.
- Tabs: Inbox (default) / Form builder.
- Inbox: `DataTable` with filters (status, country, date), bulk approve/reject, side panel detail with full submission + review notes, status badge.
- Form builder: drag-reorder list of fields, inline edit, add/remove, preview pane mirroring public form.

---

## M2 — MediaAccreditationModule (group: CONTENT)

**Public surface:** `/media-portal` press-pass request form.

**Tables**

- `media_accreditations` — `full_name`, `outlet`, `outlet_type` (`tv|radio|print|online|freelance`), `country`, `email`, `phone`, `coverage_event_id uuid null references events`, `id_document_url`, `bio`, `status` (`pending|approved|revoked|rejected`), `badge_number text unique null`, `badge_issued_at`, `expires_at`, `reviewed_by`, `review_notes`.
- Reuse existing `documents` bucket for uploaded press IDs; no new bucket.

**RLS**

- anon INSERT; staff full read/update; staff with `communications_officer` or higher can approve/revoke.

**Edge function**

- `issue-media-badge` — on approve: generates sequential `badge_number` (similar to `next_invoice_number`), emails PDF badge to applicant, logs to `admin_activity_logs`.

**UI**

- `PageHeader` with "Issue badge" primary.
- Queue view: pending / approved / revoked tabs.
- Side panel: applicant detail + ID doc preview + approve / revoke actions + badge preview.
- Contact-list tab: flat directory of all approved accreditations, export CSV.

---

## M3 — LegalPagesModule (group: ADMINISTRATION)

**Public surface:** `/privacy`, `/terms`, `/cookies` (likely to be added to `apps/web` routing as part of this).

**Storage**

- No new table — store as rows in existing `site_content` (or `cms_pages` if richer). Key naming: `legal.privacy`, `legal.terms`, `legal.cookies`. Each row holds rich-text HTML + `last_published_at` + `version int`.
- Add column `legal_version int` to a new tiny `legal_page_versions` table for history (id, page_key, html, edited_by, created_at) so legal changes are auditable.

**RLS**

- `site_content` already has anon SELECT + staff write — no change.
- `legal_page_versions`: staff read/write only.

**Edge function**

- None required. Cookie consent already lives on `apps/web` and reads `site_content`.

**UI**

- Three-tab editor (Privacy / Terms / Cookies).
- Existing rich-text editor component (reused from NewsEditor / CMS).
- "Save draft" vs "Publish" — publish writes to `site_content` AND appends to `legal_page_versions`.
- History drawer with diff between versions.

---

## M4 — YouthSubPillarsModule (group: CONTENT) — *or* extend existing ProgrammePillars

**Public surface:** `/programmes/youth/innovators`, `/programmes/youth/smart`.

**Decision:** extend `ProgrammePillarsModule` rather than spawn a sibling. Add a "Sub-pillars" tab inside the Youth pillar editor; tables are new but the module entry stays one.

**Tables**

- `youth_sub_pillars` — `slug` (`innovators|smart`), `title`, `tagline`, `hero_image_url`, `intro_html`, `cta_label`, `cta_url`, `active bool`.
- `youth_milestones` — `sub_pillar_id`, `title`, `date`, `description`, `position int`.
- `youth_submissions` — public submissions for each challenge: `sub_pillar_id`, `applicant_name`, `email`, `country`, `project_title`, `project_summary`, `link_url`, `attachment_url`, `status` (`new|shortlisted|rejected|winner`), `score int null`.

**RLS**

- `youth_sub_pillars`, `youth_milestones`: anon SELECT (public site reads); staff write.
- `youth_submissions`: anon INSERT; staff full read/update; applicants cannot read.

**Edge function**

- None required for v1. Email ack handled via `send-notification` from app code on insert (same pattern as Volunteer).

**UI (inside ProgrammePillars → Youth → Sub-pillars tab)**

- Two sub-tabs (Innovators / Smart), each with: content editor (hero/intro/CTA), milestone list (sortable), submissions inbox (`DataTable` with status filter + side panel detail).

---

## M5 — SponsorPortalConfigModule (group: ADMINISTRATION)

**Public surface:** `/sponsor-dashboard` (apps/web). Today shows fixed widgets; this module controls visibility per sponsor and globally.

**Tables**

- `sponsor_portal_widgets` — registry of available widgets. Fields: `key` (`metrics|downloads|invoices|events|messages|reports`), `label`, `description`, `default_enabled bool`, `position int`. Seed on migration.
- `sponsor_portal_settings` — per-sponsor overrides. Fields: `sponsor_id references sponsors`, `enabled_widgets text[]`, `custom_message_html`, `branding_logo_url`, `updated_by`.
- Optional `sponsor_portal_downloads` — `sponsor_id`, `title`, `file_url`, `category`, `visible bool` — files surfaced in the sponsor dashboard's downloads widget.

**RLS**

- `sponsor_portal_widgets`: anon SELECT (sponsor dashboard reads); staff write.
- `sponsor_portal_settings`: sponsor can SELECT their own row; staff full write.
- `sponsor_portal_downloads`: sponsor can SELECT their own visible rows; staff full write.

**Edge function**

- None.

**UI**

- Two-pane: left list of sponsors (search + filter), right config panel.
- Config panel: toggle-list of widgets (from `sponsor_portal_widgets`), per-sponsor message editor, logo override uploader, downloads manager (add/remove files into `sponsor_portal_downloads`).
- "Apply to all sponsors" bulk action for widget defaults.

---

## Registry + permissions wiring (single small change once all five land)

- `apps/admin/src/components/crm/crmModules.ts`: add 5 entries (Volunteer, MediaAccreditation, LegalPages, YouthSubPillars *only if we pick the standalone path — otherwise nothing*, SponsorPortalConfig). Roles:
  - Volunteer: `super_admin, admin, moderator, communications_officer`
  - MediaAccreditation: `super_admin, admin, communications_officer, marketing_manager`
  - LegalPages: `super_admin, admin`
  - YouthSubPillars (if standalone): `super_admin, admin, programme_lead, project_director`
  - SponsorPortalConfig: `super_admin, admin, sponsor_manager`
- `role_permissions` rows seeded for non-superadmin roles.
- All entries lazy-loaded.

## Build sequencing

1. M3 LegalPages first — smallest, reuses `site_content`, validates the new-shell pattern end-to-end.
2. M1 Volunteer — most-requested public form.
3. M2 MediaAccreditation — depends on `events` (already exists); badge edge function adds complexity.
4. M4 Youth sub-pillars — extends existing ProgrammePillars (no new sidebar entry if extended).
5. M5 SponsorPortalConfig — last; touches the public sponsor dashboard, needs `apps/web` changes to consume new settings.

Each migration is submitted via the migration tool for your approval **before** code lands.

## Out of scope for Phase 3

- Redesigning the public `/volunteer`, `/media-portal`, `/sponsor-dashboard` pages beyond what's needed to read the new tables.
- Multi-step volunteer workflow (interviews, contracts) — current scope is application intake + approve/reject.
- Badge print/export beyond PDF email.
- Sponsor self-serve editing of their own portal (staff-controlled only).

## Open question

Do you want Phase 3 entries to ship behind their own feature flag (`?phase3=1`) during build, or appear in the sidebar immediately once each module is approved?
