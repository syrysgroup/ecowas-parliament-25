

## Plan: Fix Sponsors/Partners, Chat, Profile, Email Settings, and Branding Upload

This plan addresses 7 interconnected issues. The root cause of most problems is a missing database function overload.

---

### Root Cause: `is_crm_staff()` Function Missing Zero-Arg Overload

The function `is_crm_staff(_user_id uuid)` exists but all RLS policies on `channels`, `channel_messages`, `channel_members`, `programme_pillars`, `media_kit_items`, `stakeholder_profiles`, and `team_members` call `is_crm_staff()` without arguments. PostgreSQL cannot resolve the call, so every operation on these tables silently fails. This also affects sponsors/partners since the save mutations don't check for Supabase errors properly.

---

### Changes

**1. Database Migration: Create zero-arg `is_crm_staff()` overload + `direct_messages` table + `branding` bucket**

A single migration that:
- Creates `is_crm_staff()` (no args) that calls `is_crm_staff(auth.uid())`
- Creates `direct_messages` table with proper columns (`id`, `sender_id`, `recipient_id`, `body`, `sent_at`, `deleted_at`) and RLS policies
- Creates the `branding` storage bucket (the admin logo upload targets this bucket but it doesn't exist)
- Adds the table to realtime publication

**2. Fix Sponsors/Partners save mutations (SponsorsManagerModule.tsx)**

The `save` mutation in both `SponsorDialog` and `PartnerDialog` doesn't check for errors from Supabase. The mutations call `.update()` / `.insert()` but ignore the returned `{ error }`. Add error checking and toast notifications on failure so users see what went wrong.

**3. Fix Chat / Messaging (MessagingModule.tsx)**

- The `direct_messages` table doesn't exist — once created via the migration, DMs will work
- The foreign key references `direct_messages_recipient_id_fkey` and `direct_messages_sender_id_fkey` used in `.select()` joins need to match the actual FK constraint names
- Add a user profile viewing dialog: clicking the avatar or the three-dot menu in chat header opens a dialog showing the user's profile (name, email, role, country, bio, avatar)
- Use the Parliament 25 logo as the default avatar fallback throughout the messaging module

**4. Improve Profile Module (ProfileModule.tsx)**

- Show user's email address in the About card (currently missing)
- Fix the profile banner layout to prevent visual glitches — ensure the avatar-to-name section displays correctly on all screen sizes (show name/title on mobile too, not just `hidden sm:block`)
- Use Parliament 25 logo (`/images/logo/logo.png`) as the default avatar fallback instead of initials when no avatar is set
- Populate the Overview card with real data (task count, connections, etc.) or show cleaner placeholders

**5. Email Settings — Hide SMTP/IMAP fields for non-admins (SettingsModule.tsx)**

Currently non-super-admin users see read-only SMTP/IMAP host/port fields. Per the user's request, these should be completely hidden for regular users since they're auto-applied from the global config. Only super admins see the Server Configuration section.

**6. Add "Test Connection" to Server Config before saving**

Add a test button in the super admin Server Configuration section that validates the SMTP/IMAP settings work before saving, by calling a lightweight validation endpoint.

**7. Create `branding` storage bucket**

The admin branding settings page tries to upload to a `branding` bucket that doesn't exist. Create it in the migration.

---

### Files to Modify

- **New migration SQL** — `is_crm_staff()` overload, `direct_messages` table, `branding` bucket
- `src/components/crm/modules/SponsorsManagerModule.tsx` — Add error handling to save mutations
- `src/components/crm/modules/MessagingModule.tsx` — Use default avatar, add profile view dialog on avatar/menu click, fix DM query FK names
- `src/components/crm/modules/ProfileModule.tsx` — Show email, fix banner layout, use default avatar
- `src/components/crm/modules/SettingsModule.tsx` — Hide server config section for non-admins entirely

### Technical Details

The `is_crm_staff()` overload is critical — it unblocks sponsors, partners, channels, media kit, programme pillars, stakeholders, and team members tables. This single migration fix resolves most of the reported issues.

The `direct_messages` table schema:
```text
id          uuid PK
sender_id   uuid NOT NULL -> auth.users(id)
recipient_id uuid NOT NULL -> auth.users(id)
body        text NOT NULL
sent_at     timestamptz DEFAULT now()
deleted_at  timestamptz
```

RLS: authenticated users can read messages where they are sender or recipient, insert where sender_id = auth.uid(), and soft-delete (update deleted_at) on own messages.

