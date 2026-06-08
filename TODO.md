# Admin-Web Parity + Bulk Operations TODO

## Phase 1 — Full web/admin parity audit
- [x] Audit all `apps/web/src/pages/*` and key web components for Supabase-backed content sources.
- [x] Map each web content source to an admin module.
- [x] Identify confirmed parity gaps (CRUD/hide/show/reorder/preview, editable text coverage).

## Phase 2 — Programme behavior verification/hardening
- [ ] Verify program auto-menu inclusion from admin-created programme rows.
- [ ] Verify alphabetical sort for programmes in navbar.
- [ ] Verify hidden programmes are excluded from menu and web programme listings/details.
- [ ] Apply hardening edits if any edge case is found.

### Phase 2 execution breakdown
- [x] Confirm navbar programme query only includes `is_active=true`.
- [x] Confirm navbar programme ordering is alphabetical by title/slug.
- [x] Confirm dynamic programme detail route (`PillarPage`) rejects inactive programmes.
- [ ] Add shared programme visibility guard hook for static programme pages.
- [ ] Apply visibility guard to static programme pages under `apps/web/src/pages/programmes/*` (except `PillarPage.tsx`).
- [ ] Run `npm run build` in `apps/web`.
- [ ] Mark Phase 2 completed after verification/build passes.

## Phase 3 — Bulk checkbox operations in admin modules
- [x] Add multi-select checkbox pattern to `ProgrammePillarsModule.tsx`.
- [x] Add multi-select checkbox pattern to `NewsEditorModule.tsx`.
- [x] Add multi-select checkbox pattern to `EventsManagerModule.tsx`.
- [ ] Add multi-select checkbox pattern to `StakeholdersModule.tsx`.
- [x] Add multi-select checkbox pattern to `SponsorsManagerModule.tsx`.
- [ ] Add multi-select checkbox pattern to `DocumentsModule.tsx`.
- [ ] Add multi-select checkbox pattern to `MarketplaceModule.tsx`.
- [ ] Add multi-select checkbox pattern to `MediaKitModule.tsx`.
- [ ] Add multi-select checkbox pattern to `TeamModule.tsx`.
- [ ] Add multi-select checkbox pattern to `VolunteerModule.tsx`.
- [ ] Add bulk actions (hide/show/delete where permitted) to each module.

## Phase 4 — Validation
- [ ] Run admin typecheck/build and fix strict TS issues.
- [ ] Run web typecheck/build and fix strict TS issues.
- [ ] Final pass: confirm parity requirements satisfied.
