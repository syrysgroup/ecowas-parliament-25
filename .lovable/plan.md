# Phase 3 — 5 New Admin Modules

Build order, sequencing, and visibility resolved per your answers:

- **Visibility:** Each module appears in the sidebar immediately on merge (role-gated). No `?phase3=1` flag.
- **Sequencing:** Locked. M3 → M1 → M2 → M4 → M5 (after Phase 2 batches 1–5).
- **Youth sub-pillars:** Standalone module, not a tab inside ProgrammePillars.
- **Migrations:** One consolidated migration per module (table + GRANTs + RLS + seeds together).

Each module is independently shippable: one migration, one `*Module.tsx` file, one entry in `apps/admin/src/components/crm/crmModules.ts`, optional edge function. All RLS uses `is_crm_staff(auth.uid())` for staff and `has_role(auth.uid(), 'super_admin')` where elevated. Every new public-schema table gets the standard 4-step block (CREATE → GRANT → ENABLE RLS → CREATE POLICY) with `service_role` always granted and `anon` granted only where a policy permits anonymous reads/inserts.

---

## M3 — LegalPagesModule (group: ADMINISTRATION) — first

**Public surface:** `/privacy`, `/terms`, `/cookies` on `apps/web`.

**Storage:** Reuse existing `site_content` rows with keys `legal.privacy`, `legal.terms`, `legal.cookies` (HTML body + `last_published_at` + `version int` in the row's JSON). Add new audit table `legal_page_versions(id, page_key, html, edited_by, created_at)` — staff read/write only.

**RLS:** `site_content` unchanged. `legal_page_versions` staff-only via `is_crm_staff()`.

**Edge function:** none.

**UI:** Three-tab editor (Privacy / Terms / Cookies) reusing the existing rich-text editor from NewsEditor. Save Draft vs Publish — Publish writes to `site_content` AND appends a row to `legal_page_versions`. History drawer lists versions with restore.

**Roles:** `super_admin, admin`.

**Why first:** smallest module, reuses existing infrastructure, validates the new-shell pattern end-to-end before larger modules land.

---

## M1 — VolunteerModule (group: CONTENT)

**Public surface:** `/volunteer` form on `apps/web`.

**Tables (1 migration):**
- `volunteer_form_fields` — `key`, `label`, `field_type` (`text|textarea|select|multiselect|email|phone|date|checkbox`), `options jsonb`, `required bool`, `position int`, `active bool`. Seeded with the current static form.
- `volunteer_applications` — `full_name`, `email`, `phone`, `country`, `interests text[]`, `availability`, `motivation`, `extra jsonb`, `status` (`pending|approved|rejected|archived`), `reviewed_by`, `reviewed_at`, `review_notes`.

**RLS:**
- `volunteer_form_fields`: anon SELECT where `active=true`; staff full write.
- `volunteer_applications`: anon INSERT only; staff full read/update/delete; applicants cannot read back.

**Edge function:** `notify-volunteer-application` — applicant ack email + staff inbox notification via existing `send-notification`.

**UI:** `PageHeader` with Export CSV + Edit Form actions. Tabs: Inbox (default) / Form Builder. Inbox = `DataTable` with status/country/date filters, bulk approve/reject, side-panel detail with full submission + review notes + status badge. Form Builder = drag-reorder field list, inline edit, add/remove, live preview pane mirroring the public form.

**Roles:** `super_admin, admin, moderator, communications_officer`.

---

## M2 — MediaAccreditationModule (group: CONTENT)

**Public surface:** `/media-portal` press-pass request form.

**Tables (1 migration):**
- `media_accreditations` — `full_name`, `outlet`, `outlet_type` (`tv|radio|print|online|freelance`), `country`, `email`, `phone`, `coverage_event_id uuid null references events`, `id_document_url`, `bio`, `status` (`pending|approved|revoked|rejected`), `badge_number text unique null`, `badge_issued_at`, `expires_at`, `reviewed_by`, `review_notes`.
- Reuse existing `documents` bucket for uploaded press IDs — no new bucket.

**RLS:** anon INSERT; staff full read/update; only `communications_officer` or higher can approve/revoke (enforced in policy via `has_role`).

**Edge function:** `issue-media-badge` — on approve, generates sequential `badge_number` (pattern from `next_invoice_number`), emails PDF badge to applicant, writes to `admin_activity_logs`.

**UI:** `PageHeader` with "Issue Badge" primary. Queue tabs: Pending / Approved / Revoked. Side panel = applicant detail + ID doc preview + approve/revoke actions + badge preview. Contact-List tab = flat directory of approved accreditations with CSV export.

**Roles:** `super_admin, admin, communications_officer, marketing_manager`.

---

## M4 — YouthSubPillarsModule (group: CONTENT) — standalone

**Public surface:** `/programmes/youth/innovators`, `/programmes/youth/smart`.

**Tables (1 migration):**
- `youth_sub_pillars` — `slug` (`innovators|smart`), `title`, `tagline`, `hero_image_url`, `intro_html`, `cta_label`, `cta_url`, `active bool`. Seeded with both rows.
- `youth_milestones` — `sub_pillar_id`, `title`, `date`, `description`, `position int`.
- `youth_submissions` — `sub_pillar_id`, `applicant_name`, `email`, `country`, `project_title`, `project_summary`, `link_url`, `attachment_url`, `status` (`new|shortlisted|rejected|winner`), `score int null`.

**RLS:**
- `youth_sub_pillars`, `youth_milestones`: anon SELECT; staff write.
- `youth_submissions`: anon INSERT; staff full read/update; applicants cannot read.

**Edge function:** none in v1; ack email handled via app-side call to existing `send-notification` on insert.

**UI:** Standalone sidebar entry. Two sub-tabs (Innovators / Smart), each with content editor (hero/intro/CTA), sortable milestone list, and submissions inbox `DataTable` with status filter + side-panel detail.

**Roles:** `super_admin, admin, programme_lead, project_director`.

---

## M5 — SponsorPortalConfigModule (group: ADMINISTRATION)

**Public surface:** `/sponsor-dashboard` on `apps/web`.

**Tables (1 migration):**
- `sponsor_portal_widgets` — registry: `key` (`metrics|downloads|invoices|events|messages|reports`), `label`, `description`, `default_enabled bool`, `position int`. Seeded.
- `sponsor_portal_settings` — per-sponsor: `sponsor_id references sponsors`, `enabled_widgets text[]`, `custom_message_html`, `branding_logo_url`, `updated_by`.
- `sponsor_portal_downloads` — `sponsor_id`, `title`, `file_url`, `category`, `visible bool`.

**RLS:**
- `sponsor_portal_widgets`: anon SELECT (sponsor dashboard reads); staff write.
- `sponsor_portal_settings`: sponsor SELECT own row (via `sponsors.owner_user_id = auth.uid()`); staff full write.
- `sponsor_portal_downloads`: sponsor SELECT own visible rows; staff full write.

**Edge function:** none.

**UI:** Two-pane — left list of sponsors (search + filter), right config panel: widget toggle list, per-sponsor message editor, logo override uploader (to `sponsor-logos` bucket), downloads manager. "Apply to all sponsors" bulk action for widget defaults.

**Roles:** `super_admin, admin, sponsor_manager`.

---

## Registry + permissions wiring (single change after all 5 land)

Add 5 entries to `apps/admin/src/components/crm/crmModules.ts`, all lazy-loaded, with the role lists above. Seed corresponding rows in `role_permissions` for the non-superadmin roles in each module. `CRMDashboard.tsx` gets the matching `case` blocks.

## Out of scope for Phase 3

- Redesigning the public `/volunteer`, `/media-portal`, `/sponsor-dashboard` pages beyond what's needed to read the new tables.
- Multi-step volunteer workflow (interviews, contracts).
- Badge print/export beyond PDF email.
- Sponsor self-serve editing of their own portal.

## Technical notes

- All migrations follow the mandatory 4-step block: CREATE TABLE → GRANT (anon only where a policy allows anonymous access; always service_role; authenticated for staff writes) → ENABLE RLS → CREATE POLICY.
- Each migration is submitted via the migration tool for approval before its module code lands.
- All module files use the new Phase 1 shell primitives: `PageHeader`, `DataTable`, `SidePanel`, `EmptyState`.
- Edge functions reuse the standard CORS + `anonClient.auth.getUser()` + `has_role` RPC pattern; privileged writes through a `serviceClient`.
- No changes to `usePermissions`, `is_crm_staff()`, or routing scheme.