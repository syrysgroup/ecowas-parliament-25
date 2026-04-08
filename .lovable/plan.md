

## Plan: CRM Improvements — Profile Redesign, Chat Enhancements, Translations, and Zoho Bug Fixes

This plan covers 8 areas across ~15 files plus 4 edge function fixes.

---

### 1. Default Avatar: Parliament 25 Logo Everywhere

**Current state:** `DEFAULT_AVATAR` in `src/lib/constants.ts` is already set to `"/images/logo/logo.png"`. Need to verify this file exists in `public/images/logo/` and that all avatar references use `DEFAULT_AVATAR` consistently.

**Changes:**
- Verify `public/images/logo/logo.png` exists; if not, set path to the actual Parliament 25 logo file
- Audit all avatar usages across components to ensure they fall back to `DEFAULT_AVATAR` (ProfileModule, MessagingModule, CRMSidebar, etc.)

---

### 2. Profile Module Redesign (All-Inclusive)

Redesign `src/components/crm/modules/ProfileModule.tsx` with a cleaner, more comprehensive layout:

- **Banner:** Keep gradient + avatar with upload/URL options; show email address prominently
- **Tabs restructured:** Merge "Profile" and "Contact" into a single view with two-column layout:
  - Left column: Read-only "About" card showing full name, email, phone, title, organisation, country, LinkedIn, Twitter, bio, date of birth, notification email
  - Right column: Edit form with all fields including `notification_email`, `date_of_birth`, `phone`, social links
- **Security tab:** Keep password change
- **Visibility toggle:** Show on website switch
- Fix any glitchy overflow/spacing issues with proper `overflow-hidden`, consistent padding, and responsive grid

---

### 3. Chat Enhancements (MessagingModule)

**File:** `src/components/crm/modules/MessagingModule.tsx`

- **Avatar/3-dot menu → View Profile:** Already has `ProfileViewDialog` and `onAvatarClick`. Ensure the three-dot `DropdownMenu` on messages includes "View Profile" option that opens the dialog.
- **Display names not emails:** Already using `full_name` from profiles. Verify `peer_name` in DM conversations falls back to `full_name`, not email.
- **Delivered/Read indicators:** Already implemented with `Check`/`CheckCheck` icons. Ensure timestamps are shown in locale-aware format.
- **Collapsible/searchable contacts:** Already has `CollapsibleSection` and search input. Verify contacts list is filterable by the search term.
- **Multilingual chat:** This is complex machine translation — not feasible as auto-translate. Instead, ensure the chat UI itself is fully translated via i18n keys and that users can type in any language (Unicode support is already there).

---

### 4. Branding: Logo & Favicon Size Guidance in UI

**File:** `src/views/admin/settings/BrandingSettings.tsx`

- Add recommended size hints next to upload fields using `LOGO_RECOMMENDED` and `FAVICON_RECOMMENDED` from constants
- Ensure uploaded logo propagates to Navbar via `site_settings` (already wired)
- Ensure favicon updates dynamically (already has `updateFavicon` logic)
- Add URL input option alongside upload (already partially implemented with `logoMode`/`faviconMode`)

---

### 5. ImageUploadOrUrl Everywhere

**File:** `src/components/shared/ImageUploadOrUrl.tsx` — already exists.

Audit and replace raw file inputs with `ImageUploadOrUrl` in:
- `SponsorsManagerModule` (sponsor/partner logos)
- `EventsManagerModule` (cover images)
- `NewsEditorModule` (cover images)
- `MediaKitModule` / `MediaLibraryModule`

This is a large sweep — prioritize the most-used editors first.

---

### 6. Full CRM Translation (3 Languages)

**Files:** `src/lib/translations/en.ts`, `fr.ts`, `pt.ts`

Add missing CRM translation keys for all modules. The CRM already uses `t()` in many places but likely has gaps. Key areas:
- All SuperAdmin tabs and labels
- All Chat/Messaging labels
- All Profile labels
- Email module labels
- Settings labels
- Common action words (save, cancel, delete, create, edit, etc.)

This is the largest single task — hundreds of new keys across 3 files.

---

### 7. Four Zoho Edge Function Bug Fixes

#### Bug 1: `send-email` — Wrong resolver (critical)
**File:** `supabase/functions/send-email/index.ts`
Replace `resolveZohoAccountId` to use `/api/accounts` (user-level) instead of `/api/organization/{orgId}/accounts`. Add cached ID validation with a probe request. Remove `?? match.zuid` fallback.

#### Bug 2: `sync-emails` — Silent wrong-mailbox fallback
**File:** `supabase/functions/sync-emails/index.ts` line 65
Remove `?? accounts[0]` fallback. Throw with list of visible accounts if no match found.

#### Bug 3: `update-email` — Wrong Zoho API endpoint
**File:** `supabase/functions/update-email/index.ts`
Replace `/updatemessage` with `PUT /api/accounts/{accountId}/messages/{messageId}`. Fix field names: `isread` → `mode: "markAsRead"/"markAsUnread"`, `flagid` → `isflagged: "true"/"false"`, move action needs `mode: "move"`.

#### Bug 4: `fetch-email-body` — Null zoho_message_id crash
**File:** `supabase/functions/fetch-email-body/index.ts`
Add guard: if `zoho_message_id` is null, return existing `body_html` (or empty string) immediately instead of making a nonsensical API call.

All 4 functions must be redeployed after changes.

---

### 8. Summary of Files

| Area | Files Modified |
|------|---------------|
| Default avatar | `src/lib/constants.ts` (verify), audit ~5 components |
| Profile redesign | `src/components/crm/modules/ProfileModule.tsx` |
| Chat enhancements | `src/components/crm/modules/MessagingModule.tsx` |
| Branding sizes | `src/views/admin/settings/BrandingSettings.tsx` |
| ImageUploadOrUrl | Multiple CRM module files |
| Translations | `src/lib/translations/en.ts`, `fr.ts`, `pt.ts` |
| Zoho fixes | 4 edge functions in `supabase/functions/` |

