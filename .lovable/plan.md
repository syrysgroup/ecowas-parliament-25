

# Fix CRM Sponsors, Partners, Chat, Email Config, Profile & Avatars

## Root Causes Identified

1. **Sponsors INSERT/UPDATE fail silently**: The code sends columns `acronym`, `about`, `is_ecowas_sponsor` but these columns do NOT exist in the `sponsors` table. Supabase silently ignores the insert/update when unknown columns are sent, resulting in no error shown but no data saved.

2. **Partners INSERT/UPDATE fail silently**: Same issue -- code sends `long_description` (text[]) and `social_links` (jsonb) but these columns don't exist in the `partners` table.

3. **Chat completely broken**: The `channels`, `channel_members`, and `channel_messages` tables do not exist in the database. The MessagingModule queries these tables, causing all channel operations to fail. Only `direct_messages` and `chat_messages` tables exist.

4. **"No bucket found" for logo uploads**: The `branding` bucket exists and has upload policies, but the policies may restrict to specific admin roles. Need to verify the exact USING/WITH CHECK expressions match the current user's role.

5. **Email config shows SMTP/IMAP host/port to per-user setup**: The EmailConfigTab in SuperAdminModule exposes server fields that should auto-populate from global settings.

6. **Profile design glitchy + missing email**: The ProfileModule layout needs polish; email is in the About card but may not be visible due to layout issues.

7. **Default avatar**: Currently `/images/logo/logo.png` -- should be the Parliament 25 logo consistently.

---

## Part 1: Database Migration -- Add Missing Columns + Chat Tables

**New migration** to:

- Add missing columns to `sponsors`: `acronym text`, `about text`, `is_ecowas_sponsor boolean DEFAULT false`
- Add missing columns to `partners`: `long_description text[]`, `social_links jsonb DEFAULT '{}'`
- Create `channels` table (id, name, description, type, created_by, is_archived, created_at)
- Create `channel_members` table (id, channel_id, user_id, joined_at)
- Create `channel_messages` table (id, channel_id, sender_id, body, sent_at, deleted_at)
- Add RLS policies for all three chat tables (CRM staff can read/write, users see their own messages)
- Add storage upload policy for `branding` bucket if missing for `super_admin`

---

## Part 2: Fix SponsorsManagerModule

- No code changes needed for sponsor/partner dialogs -- the column additions will make existing code work
- Verify the `sort_order` default and `updated_at` handling

---

## Part 3: Email Config -- Hide Server Fields for Per-User Setup

**File**: `src/components/crm/modules/SuperAdminModule.tsx` (EmailConfigTab)

- The global email config (SMTP host, port, IMAP host, port, SSL) is set by the super admin once
- When setting up per-user email credentials (via validate-email-credentials), the SMTP/IMAP host/port should auto-fill from the saved `smtp` site_settings and not be editable by the user
- Add a "Test Connection" button that calls `validate-email-credentials` edge function to verify the configuration before saving

---

## Part 4: Chat Module Fix

**File**: `src/components/crm/modules/MessagingModule.tsx`

- With the new `channels`, `channel_members`, `channel_messages` tables created, the existing code should work
- Fix the foreign key reference in the channel_messages query (`profiles!channel_messages_sender_id_fkey`) -- will need to ensure the FK exists or adjust the query to use a manual join
- Add profile view dialog when clicking avatar or three-dot menu (already partially implemented -- verify it works)

---

## Part 5: Profile Module Polish

**File**: `src/components/crm/modules/ProfileModule.tsx`

- Ensure email address is prominently visible in the banner area (not just in the About card)
- Fix layout spacing issues (the `space-y-0` on the wrapper causes elements to overlap)
- Improve the Overview card with actual data queries instead of placeholder dashes

---

## Part 6: Default Avatar

- Update `DEFAULT_AVATAR` constant across all modules to use `/images/logo/logo.png` (the Parliament 25 logo) -- this is already the case but verify the image file exists and renders correctly
- Ensure the avatar fallback is consistent in ProfileModule, MessagingModule, PeopleModule

---

## Technical Summary

| Task | Type | Files |
|------|------|-------|
| Add sponsor columns (acronym, about, is_ecowas_sponsor) | Migration | DB |
| Add partner columns (long_description, social_links) | Migration | DB |
| Create channels/channel_members/channel_messages + RLS | Migration | DB |
| Fix branding storage policy if needed | Migration | DB |
| Hide SMTP/IMAP fields in per-user email setup + add test connection | Code | SuperAdminModule.tsx |
| Polish profile layout, show email prominently | Code | ProfileModule.tsx |
| Fix chat foreign key query | Code | MessagingModule.tsx |
| Consistent default avatar | Code | Multiple modules |

