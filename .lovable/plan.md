

## CRM Full CRUD, Permissions & Public Page Enhancements

This is a large, multi-phase implementation. Here's the breakdown:

---

### Database Migrations Required

**1. `site_settings` table** -- new table for global site configuration
- Columns: `id`, `key` (unique text), `value` (jsonb), `updated_at`, `updated_by`
- RLS: public SELECT, admin/super_admin ALL

**2. `news_articles` -- add `external_links` column**
- `external_links jsonb DEFAULT '[]'::jsonb` -- array of `{title, url}` objects for related press/media links

**3. `role_permissions` table** -- new table for granular permission system
- Columns: `id`, `role` (app_role), `module` (text), `can_view` (bool), `can_create` (bool), `can_edit` (bool), `can_delete` (bool)
- RLS: super_admin ALL, authenticated SELECT (to check own permissions)
- Seed default permissions for all existing roles

**4. `events` -- add `related_event_ids` column**
- `related_event_ids uuid[] DEFAULT '{}'::uuid[]` -- for showing related events on detail page

---

### Phase 1: Permission System

**Files: 2 new, 3 modified**

1. **Create `src/hooks/usePermissions.ts`** -- hook that queries `role_permissions` for the current user's roles and returns `canView(module)`, `canCreate(module)`, `canEdit(module)`, `canDelete(module)` helpers. Super_admin bypasses all checks.

2. **Create Permission Manager UI in `SettingsModule.tsx`** -- new "Permissions" tab (super_admin only) showing a matrix grid of roles x modules with toggles for view/create/edit/delete. Saves to `role_permissions` table.

3. **Update all CRM modules** to use `usePermissions` to conditionally show/hide Create buttons, Edit/Delete icons based on the user's role permissions.

---

### Phase 2: Events & News Public Page Fixes

**Events card image (1080x1350 Instagram portrait ratio)**

4. **Update `Events.tsx`** -- change card image container from `aspect-square` to `aspect-[4/5]` (1080:1350 = 4:5 ratio), ensure `object-cover` fills fully. Also show `object-position: center`.

5. **Update `EventDetail.tsx`** -- add "Other Events" section at bottom querying other published events (excluding current), displayed in a horizontal scroll or 3-column grid.

**News card image (1080x1350)**

6. **Update `News.tsx`** -- change card image from `aspect-square` to `aspect-[4/5]` for Instagram post ratio.

7. **Update `NewsDetail.tsx`** -- add "External Media Links" section below content, rendering `external_links` from the article as styled link cards. Also change cover image from `aspect-video` to natural height with max constraint.

8. **Update `NewsEditorModule.tsx`** -- add "External Links" repeater field in the article dialog (add/remove `{title, url}` pairs), saved to the new `external_links` column.

---

### Phase 3: Site Settings Panel

9. **Create site_settings seed data** via migration with default keys: `site_name`, `site_logo_url`, `contact_email`, `social_facebook`, `social_twitter`, `social_instagram`, `social_linkedin`, `social_youtube`, `footer_text`.

10. **Add "Site Settings" tab to `SettingsModule.tsx`** (super_admin only) -- form that loads all `site_settings` rows, edits values, and saves. Grouped into "General", "Social Links", "Footer" sections.

11. **Create `useSiteSettings.ts` hook** -- fetches all site_settings and returns them as a key-value map. Used by Navbar, Footer, and other components.

12. **Update `Footer.tsx` and `Navbar.tsx`** to read from `useSiteSettings` for logo, site name, social links, and contact info with current values as fallbacks.

---

### Phase 4: Full CRUD Enhancements Across CRM Modules

All CRM modules already have Create, Read, Update, Delete. The enhancements needed:

13. **Add search/filter to EventsManagerModule** -- search by title, filter by published/draft status, programme filter.

14. **Add search/filter to NewsEditorModule** -- search by title, filter by status.

15. **Add search/filter to SponsorsManagerModule** -- already has tabs, add text search.

16. **Add bulk actions to Events, News, Sponsors** -- checkbox per row, bulk delete, bulk publish/unpublish.

17. **Add pagination** to all list modules (Events, News, Sponsors, Contact Submissions, Newsletter) using `range(from, to)` with page controls.

18. **Ensure image loading** -- audit all modules to confirm images use proper Supabase storage public URLs and render correctly in both CRM list views and public pages. Add fallback placeholders for missing images.

---

### Technical Notes

- Permission system uses a DB table rather than hardcoded logic, allowing super_admin to customize per-role access without code changes
- `usePermissions` hook caches with react-query (5min staleTime) to avoid excessive DB calls
- All mutations use `toast()` from sonner for success/error feedback
- Bulk operations use `Promise.all` with optimistic UI updates
- Instagram 4:5 ratio = `aspect-[4/5]` in Tailwind (`aspect-ratio: 4/5`)
- No changes to auth flow or RLS on existing tables beyond new tables

### Files Summary

- **New files (~5):** `usePermissions.ts`, `useSiteSettings.ts`, 3 migration files
- **Modified files (~10):** `SettingsModule.tsx`, `Events.tsx`, `EventDetail.tsx`, `News.tsx`, `NewsDetail.tsx`, `NewsEditorModule.tsx`, `EventsManagerModule.tsx`, `SponsorsManagerModule.tsx`, `Footer.tsx`, `Navbar.tsx`

