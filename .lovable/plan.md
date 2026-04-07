

# Plan: Fix Email System, User Management & Admin Email Control

## Summary
Three major areas need work: (1) fix the broken email system to properly use Zoho IMAP/SMTP, (2) enhance user management with delete/bulk operations, and (3) allow super admins to connect email accounts for other users.

## Current Issues Found

1. **Build error**: `EmailInboxModule.tsx` line 629 — `session.session.access_token` should be `session?.access_token` (double-nested)
2. **Email system is disconnected from Zoho properly**: The `send-email` and `sync-emails` edge functions reference `zoho_account_id` column on `email_accounts` which does not exist. The `validate-email-credentials` function uses raw IMAP connections (a different approach entirely). The system needs a unified Zoho Mail API approach.
3. **Email config settings** (`EmailConfigSettings.tsx`) saves SMTP/IMAP settings to `site_settings` but the edge functions use hardcoded Zoho OAuth — these are disconnected.
4. **`UserManagementSettings`** queries `role` and `is_active` columns on `profiles` table — neither column exists. Roles are in the `user_roles` table.
5. **No delete/bulk operations** for invited users or user management.
6. **No admin-controlled email connection** for other users.

---

## Implementation Steps

### Step 1: Database Migration — Add `zoho_account_id` to `email_accounts`

Add column `zoho_account_id TEXT` to `email_accounts` table. This is needed by the Zoho Mail API to send/sync emails per account.

### Step 2: Update Email Config Settings — Store Zoho IMAP/SMTP Config

Update `EmailConfigSettings.tsx` to include IMAP fields (`imap_host`, `imap_port`, `ssl_enabled`) alongside SMTP fields, and save them all under the `smtp` key in `site_settings`. Pre-populate with Zoho EU defaults:
- IMAP: `imappro.zoho.eu:993` (SSL)
- SMTP: `smtppro.zoho.eu:465` (SSL) or `587` (TLS)

### Step 3: Fix `validate-email-credentials` Edge Function

Update to use the IMAP config from `site_settings["smtp"]` properly — it already reads `imap_host`/`imap_port` from there so this should work once the admin saves the correct values. No code change needed here if config is correct.

### Step 4: Create `resolve-zoho-account-id` Edge Function

After a user's email credentials are validated, we need their Zoho account ID for API calls. Create a function that:
- Authenticates with Zoho OAuth (using the org-level refresh token)
- Calls `GET /api/organization/{orgId}/accounts` to find the account ID matching the user's email
- Stores the `zoho_account_id` on the `email_accounts` row

### Step 5: Update `send-email` Edge Function

The function already uses Zoho Mail API correctly. Just needs to handle the case where `zoho_account_id` is missing (call resolve function) and ensure the account lookup includes the new column.

### Step 6: Update `sync-emails` Edge Function

Same as send-email — ensure it resolves `zoho_account_id` when needed. Also fix the Zoho folder ID mapping (currently uses folder names like "inbox" but Zoho API uses numeric folder IDs — need to fetch folder list first).

### Step 7: Fix Build Error in `EmailInboxModule.tsx`

Line 629: Change `session?.session?.access_token` to `session?.access_token`. The `getSession()` returns `{ data: { session } }`, so after destructuring it's already the session object.

### Step 8: Add Connection Status Indicator to Email Module

Add a connection status badge in the email sidebar (below compose button or above account info):
- **Green dot + "Connected"** — when account exists and credentials validated this session
- **Red dot + "Not Connected"** — when no account exists
- **Amber dot + "Revalidate"** button — when credentials need re-verification
Track status via existing `sessionStorage` validation key and account presence.

### Step 9: Fix `UserManagementSettings` — Use `user_roles` Table

Rewrite the query to join `profiles` with `user_roles` instead of reading non-existent `role`/`is_active` columns. Role updates should go to `user_roles` table (insert/update/delete). Remove `is_active` toggle or add the column via migration.

### Step 10: Add Delete & Bulk Operations to User Management

- Add checkbox column for bulk selection
- Add "Delete Selected" button that deletes users via Supabase Admin API (edge function needed)
- Add "Bulk Invite" button with a textarea for comma-separated emails + role selector
- Add individual delete button per row
- Create `delete-user` edge function using `serviceClient.auth.admin.deleteUser()`
- Create `bulk-invite` edge function that loops through emails

### Step 11: Add Invitation Management (Delete Invitations)

Add a separate section or tab in UserManagementSettings showing pending invitations from the `invitations` table, with ability to delete individual or bulk-delete invitations.

### Step 12: Super Admin Email Connection for Other Users

Add an "Email" column/action in the user management table. When clicked, opens a modal where the super admin can enter email credentials (email + password) for that specific user. This calls `validate-email-credentials` with an additional `target_user_id` parameter, and the edge function saves credentials to that user's `user_email_settings` and `email_accounts` rows (using service role client).

Update the `validate-email-credentials` edge function to accept optional `target_user_id` (only allowed for super_admin callers).

---

## Technical Details

### Edge Functions Modified/Created
- `validate-email-credentials` — add `target_user_id` support for admin
- `send-email` — fix `zoho_account_id` resolution
- `sync-emails` — fix `zoho_account_id` resolution + folder ID mapping
- `delete-user` (new) — admin user deletion
- `bulk-invite` (new) — batch invitation sending

### Database Changes
- Add `zoho_account_id TEXT` to `email_accounts`
- Add `is_active BOOLEAN DEFAULT true` to `profiles` (for the toggle feature)

### Files Modified
- `src/components/crm/modules/EmailInboxModule.tsx` — fix TS error, add connection status
- `src/views/admin/settings/UserManagementSettings.tsx` — rewrite to use `user_roles`, add bulk ops, add admin email connect
- `src/views/admin/settings/EmailConfigSettings.tsx` — add IMAP fields

