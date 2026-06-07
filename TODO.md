# TODO

- [x] Update `apps/admin/src/components/crm/modules/NewsEditorModule.tsx`
  - [x] Add flyer upload field (`flyer_image_url`) in article dialog
  - [x] Persist `flyer_image_url` in save payload
  - [x] Keep existing cover image behavior unchanged
  - [x] Ensure event tagging remains available and clear

- [x] Update `apps/web/src/pages/news/NewsDetail.tsx`
  - [x] Load linked event details from `event_id`
  - [x] Display a clear tagged-event panel on read page
  - [x] Display flyer automatically on article page when present
  - [x] Add open-flyer action while keeping inline Instagram-style preview

- [ ] Fix TS errors in `apps/admin/src/components/crm/modules/NewsEditorModule.tsx`
  - [ ] Add safe parser for `external_links` (`Json | null` -> `ExternalLink[]`)
  - [ ] Replace unsafe cast in dialog state initialization
  - [ ] Normalize Supabase query rows into `NewsRow` without incompatible map callback typing

- [ ] Validate changes
  - [ ] Run targeted checks/build for admin and web
  - [ ] Mark completed items
