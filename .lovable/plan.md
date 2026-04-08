

# Implementation Plan

This is a large, multi-part request covering email fixes, CRM improvements, chat enhancements, profile redesign, translations, and more. Here's the plan organized by priority.

---

## Part 1: Fix Email Sync and Functionality (Critical)

**Current state:** The edge functions (`send-email`, `sync-emails`, `update-email`, `fetch-email-body`) already have the bug fixes applied in code. The `EmailInboxModule` correctly queries Supabase. The issue is likely that the edge functions need redeployment, or the `sync-emails` function is failing silently.

**Actions:**
- Redeploy all four email edge functions: `sync-emails`, `send-email`, `update-email`, `fetch-email-body`
- Check edge function logs after deployment to verify sync works
- Verify the email account exists in `email_accounts` table for the logged-in user

---

## Part 2: Fix 404 Errors (Missing Tables)

**`user_notification_prefs` (404):** Table doesn't exist. Create migration:
```sql
CREATE TABLE public.user_notification_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_new_message boolean NOT NULL DEFAULT true,
  notify_task_assigned boolean NOT NULL DEFAULT true,
  notify_event_reminder boolean NOT NULL DEFAULT true,
  notify_system_updates boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_notification_prefs ENABLE ROW LEVEL SECURITY;
-- Users can read/write own prefs
CREATE POLICY "Users manage own prefs" ON public.user_notification_prefs
  FOR ALL TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**`tasks` table (400 on join):** The tasks table likely exists but the `assignee_id` foreign key relationship to `profiles` isn't set up, causing the `!assignee_id` join hint to fail. Fix by adding the FK if missing, or adjusting the query.

---

## Part 3: Default Avatar — Parliament 25 Logo

**Current:** `DEFAULT_AVATAR` in `src/lib/constants.ts` points to `/images/logo/logo.png`.

**Action:** Ensure this file exists and is the Parliament 25 logo. Audit all avatar usages across the project to confirm they use `DEFAULT_AVATAR` from constants. Files to check/update:
- `ProfileModule.tsx` (already uses it)
- `MessagingModule.tsx` (already uses it)
- `CRMSidebar.tsx`, `CRMLayout.tsx`, navbar, team cards, etc.

---

## Part 4: Profile Redesign (All-Inclusive)

**Current:** Profile has a banner, about card, stats, and edit form in tabs. Already fairly complete but user reports glitchy design.

**Improvements:**
- Fix layout overflow/visibility issues in the banner and form sections
- Ensure email address is prominently visible (already partially done)
- Make the profile fully responsive with proper spacing
- Add missing fields display: date of birth formatted, all social links visible
- Improve the "Overview Stats" section with real data queries (tasks done, connections, etc.)
- Clean up tab styling and ensure consistent CRM theme

---

## Part 5: Chat Improvements

### 5a. User Profile from Avatar/Three-Dot Menu
**Current:** `ProfileViewDialog` already exists in `MessagingModule.tsx` and shows name, email, phone, country, org, LinkedIn, Twitter.

**Improvements:**
- Ensure clicking avatar opens profile dialog
- Add profile view option to the three-dot (`MoreVertical`) menu
- Display users by full name (first + last), not email

### 5b. Delivery/Read Status and Timestamps
- Add delivered/read indicators (checkmarks) to messages — single check for sent, double check for delivered, blue double check for read
- Show timestamps on each message
- Use the existing `delivered_at`, `read_at` columns on `direct_messages` and `channel_messages`

### 5c. Collapsible/Searchable Contacts
- Make the contacts sidebar collapsible
- Add search input to filter contacts by name

### 5d. Multilingual Text Input
- This is a complex feature (real-time translation). Suggest using browser's built-in input methods for now, and potentially integrating a translation API later.

---

## Part 6: Full CRM Translation (3 Languages)

**Current:** Translation system exists with `en.ts`, `fr.ts`, `pt.ts` using a `useTranslation` hook.

**Action:** Audit all CRM modules for hardcoded English strings and add translation keys. This is a large effort spanning ~20+ module files. Key files:
- All modules in `src/components/crm/modules/`
- `CRMSidebar.tsx`, `CRMLayout.tsx`
- Add missing keys to `fr.ts` and `pt.ts`

---

## Part 7: Logo/Favicon Setup in Settings

**Current:** `LOGO_RECOMMENDED` and `FAVICON_RECOMMENDED` constants exist with size guidance.

**Action:**
- In CRM Settings (BrandingSettings), display recommended sizes: Logo 180×60px (retina 360×120px), Favicon 32×32px (Apple Touch 180×180px)
- Connect upload to `global_settings` table so uploaded logo/favicon reflect on the public website
- Add URL input option alongside file upload

---

## Part 8: URL Option for All Image Uploads

**Action:** Create a reusable `ImageUploadOrUrl` component (file already exists at `src/components/shared/ImageUploadOrUrl.tsx`). Ensure it's used in:
- Profile avatar (already done)
- Event cover images, news article covers, partner logos, sponsor logos, media kit items
- Any other upload fields

---

## Technical Details

**Files to create/modify:**
- 1 new migration for `user_notification_prefs` table (+ potentially fix `tasks` FK)
- 4 edge functions to redeploy (no code changes needed — already fixed)
- `src/lib/constants.ts` — verify DEFAULT_AVATAR path
- `src/components/crm/modules/ProfileModule.tsx` — redesign
- `src/components/crm/modules/MessagingModule.tsx` — chat improvements
- `src/components/crm/modules/SettingsModule.tsx` — logo/favicon guidance
- `src/lib/translations/fr.ts`, `src/lib/translations/pt.ts` — CRM translations
- Multiple CRM module files for translation key usage

**Estimated scope:** ~15-20 files modified, 1 migration, 4 edge function redeployments.

