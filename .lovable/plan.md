

# Plan: Fix Remaining Bugs, Redesign Profile & Chat, Add Translations

This plan addresses all outstanding issues: email sync, 404 errors, avatar defaults, profile redesign, chat improvements, branding settings, and CRM translations.

---

## Part 1: Database Migration — Fix `tasks` FK

The `tasks.assignee_id` references `auth.users(id)` but the query joins to `profiles!assignee_id`. PostgREST can't resolve this because there's no FK from `tasks` to `profiles`.

**Fix:** Drop the existing FK and re-add it pointing to `profiles(id)`.

```sql
ALTER TABLE public.tasks DROP CONSTRAINT tasks_assignee_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_assignee_id_fkey
  FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
```

The `user_notification_prefs` table already exists — that 404 is likely a stale cache or deploy issue.

---

## Part 2: Fix Email Edge Functions (4 bugs)

All four edge functions need updates and redeployment:

### 2a. `send-email/index.ts`
Already has the correct `/api/accounts` resolver. However, add a **probe-and-revalidate** step (like sync-emails does) where if the cached `zoho_account_id` fails a `/folders` probe, clear it and re-resolve. Currently send-email trusts the cache blindly if present.

### 2b. `sync-emails/index.ts`
The resolver currently trusts `acct.zoho_account_id` without probing first (line 47: `if (acct.zoho_account_id) return acct.zoho_account_id`). The main loop already handles re-resolve on folder fetch failure (lines 116-124), so this is partially covered but the resolver itself should probe first for robustness.

### 2c. `update-email/index.ts`
Already uses the correct `PUT /api/accounts/{accountId}/messages/{messageId}` endpoint and correct field names (`mode`, `isflagged`). No changes needed — just needs redeployment.

### 2d. `fetch-email-body/index.ts`
Already has the `zoho_message_id` null guard. No changes needed — just needs redeployment.

**Action:** Redeploy all 4 functions to ensure latest code is live.

---

## Part 3: Default Avatar — Parliament 25 Logo

Audit all components using avatar images. Currently `DEFAULT_AVATAR = "/images/logo/logo.png"`. Ensure every avatar fallback uses this constant:
- `ProfileModule.tsx` — already uses it
- `MessagingModule.tsx` — already uses it
- `CRMSidebar.tsx` — check and fix
- `CRMLayout.tsx` — check and fix
- `Navbar.tsx` — check and fix
- `PeopleCard.tsx`, `TeamModule.tsx` — check and fix

---

## Part 4: Profile Redesign

Current profile has a banner + tabs but user reports "glitchy" design. Redesign with:
- **Banner:** Clean gradient, larger avatar, prominent name/email/roles display
- **Overview tab:** Stats cards (tasks completed, messages, connections), bio, social links all visible
- **Details tab:** Full form with all fields including DOB, phone, social URLs
- **Settings tab:** Notification prefs, privacy toggles
- Fix overflow issues and ensure full responsiveness
- Show email address prominently in the banner area (already partially done)

---

## Part 5: Chat Improvements

### 5a. Profile from Avatar/Three-dot menu
- Avatar click → open `ProfileViewDialog`
- Add "View Profile" option to the `MoreVertical` dropdown
- Display users by `full_name` not email throughout chat

### 5b. Delivery/Read Status + Timestamps
- Show timestamps on every message bubble
- Single check = sent, double check = delivered (`delivered_at` exists), blue double check = read (`read_at` exists)
- Use existing DB columns

### 5c. Collapsible/Searchable Contacts
- Add a toggle button to collapse the contacts sidebar
- Add search input at top to filter contacts by name

### 5d. Multilingual (deferred)
- Note in UI that browser input methods support multilingual typing
- Full translation API integration is a separate future feature

---

## Part 6: Branding Settings — Logo/Favicon Guidance

In `BrandingSettings.tsx`:
- Show recommended sizes inline: Logo 180×60px (retina 360×120px), Favicon 32×32px
- Add URL input option alongside file upload
- Connect to `global_settings` table so uploaded logo/favicon appears on public site

---

## Part 7: URL Option for Image Uploads

The `ImageUploadOrUrl` component already exists. Ensure it's used in:
- Event cover images (EventsManagerModule)
- News article covers (NewsEditorModule)
- Partner logos (StakeholdersModule)
- Sponsor logos (SponsorsManagerModule)
- Media kit items (MediaKitModule)

---

## Part 8: Full CRM Translation

Audit all ~20 CRM module files for hardcoded English strings. Add translation keys to `en.ts`, `fr.ts`, `pt.ts`. Priority modules:
- EmailInboxModule, MessagingModule, ProfileModule, SettingsModule
- TaskBoardModule, CalendarModule, DashboardModule
- All sidebar labels in CRMSidebar

---

## Technical Summary

| Action | Files |
|--------|-------|
| Migration: fix tasks FK | 1 SQL migration |
| Edge functions: redeploy | 4 functions (send-email, sync-emails, update-email, fetch-email-body) |
| Avatar audit | ~6 component files |
| Profile redesign | ProfileModule.tsx |
| Chat improvements | MessagingModule.tsx |
| Branding settings | BrandingSettings.tsx |
| ImageUploadOrUrl adoption | ~5 module files |
| Translations | en.ts, fr.ts, pt.ts + ~20 module files |

**Estimated scope:** 1 migration, 4 edge function redeployments, ~30 files modified.

