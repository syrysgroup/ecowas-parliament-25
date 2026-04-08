

# Plan: Zoho Org-Level Email Integration + Chat Online Status

## Overview
Two main workstreams: (1) migrate all Zoho Mail API calls from personal-level to org-level endpoints, add admin email management panel, and improve sync feedback; (2) add online/offline presence tracking to the messaging module.

---

## Part A: Zoho Org-Level Email Fix

### A1. Database Migration
Add two columns to `email_accounts`:
- `app_password text` (nullable)
- `last_synced_at timestamptz` (nullable)

Add a new `user_presence` table for online status (see Part B).

### A2. Update `supabase/functions/sync-emails/index.ts`
- Replace `resolveZohoAccountId` to use org-level API: `https://mail.zoho.eu/api/organization/${ZOHO_ORG_ID}/accounts`
- Change folders URL to org-level: `/api/organization/${orgId}/accounts/${accountId}/folders`
- Change messages URL to org-level: `/api/organization/${orgId}/accounts/${accountId}/messages/view?...`
- Remove the fallback re-resolution block (lines 116-125)
- Add `last_synced_at` update after successful sync

### A3. Update `supabase/functions/send-email/index.ts`
- Replace `resolveZohoAccountId` with same org-level version
- Change send URL to org-level: `/api/organization/${orgId}/accounts/${accountId}/messages`

### A4. Update `supabase/functions/fetch-email-body/index.ts`
- Change content URL to org-level: `/api/organization/${orgId}/accounts/${accountId}/messages/${messageId}/content`

### A5. Replace `EmailConfigSettings.tsx`
Replace the SMTP/IMAP config form with a superadmin-only Email Accounts management panel:
- Table showing all email accounts with profile info, status badges, sync timestamps
- "Add Email Account" button with modal (user dropdown, email, app password)
- Per-row: Edit, Test Sync, Activate/Deactivate buttons
- Loading skeletons and empty state
- Only visible to `super_admin` role users

### A6. Improve sync feedback in `EmailInboxModule.tsx`
- Show success toast with email count ("3 new email(s) received" or "Inbox is up to date")
- Show destructive toast on errors
- Ensure `setSyncing(false)` in finally block
- Only invalidate queries on success

---

## Part B: Chat Online/Offline Status

### B1. Database Migration — `user_presence` table
```sql
CREATE TABLE public.user_presence (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  is_online boolean NOT NULL DEFAULT false
);
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
-- All authenticated users can read presence
-- Users can only upsert their own row
```

### B2. Presence Heartbeat Logic
Add a custom hook `usePresence` that:
- On mount (when user is logged in): upserts `user_presence` with `is_online = true`
- Sends a heartbeat every 60 seconds updating `last_seen_at`
- On unmount / beforeunload: sets `is_online = false`
- Integrate this hook in the main app layout or auth context

### B3. Update MessagingModule
- Fetch `user_presence` data for all contacts
- Show green dot (online) or red/gray dot (offline) next to each contact avatar in:
  - DM conversations list (left sidebar)
  - Contacts list (left sidebar)
  - Chat header (when viewing a DM)
- Consider users "online" if `is_online = true` AND `last_seen_at` is within last 2 minutes
- Replace the hardcoded "Online" text in chat header (line 524) with actual status

---

## Files Modified
1. `supabase/functions/sync-emails/index.ts` — org-level API URLs
2. `supabase/functions/send-email/index.ts` — org-level API URLs
3. `supabase/functions/fetch-email-body/index.ts` — org-level content URL
4. `src/views/admin/settings/EmailConfigSettings.tsx` — full rewrite to admin panel
5. `src/components/crm/modules/EmailInboxModule.tsx` — sync feedback improvement
6. `src/components/crm/modules/MessagingModule.tsx` — online/offline indicators
7. `src/hooks/usePresence.ts` — new heartbeat hook
8. `src/App.tsx` or auth context — integrate presence hook
9. Database migration — `email_accounts` columns + `user_presence` table

## Files NOT Modified
- Authentication/session logic
- Supabase secrets or env vars
- Other edge functions (validate-email-credentials, create-email-account, etc.)
- Any UI outside email module, EmailConfigSettings, and MessagingModule

