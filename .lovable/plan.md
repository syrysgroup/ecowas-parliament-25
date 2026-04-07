

## Plan: CRM Email Login, Sponsors Bulk Actions, and People & Access Fixes

This plan covers three areas of improvement in the CRM.

---

### 1. Email Module: User Self-Service Login

**Current state:** When a user has no email account, they see "No email account assigned — contact your admin." There is no way for non-super-admins to connect their own email. The server config (SMTP/IMAP settings) is visible to super admins in the People module's Edit User dialog.

**Changes:**

- **EmailInboxModule.tsx** — Replace the empty-state with a two-step flow:
  1. Show "No email account connected" message with a "Connect Email" button
  2. Clicking the button opens a simple dialog asking only for **email address** and **password** (no SMTP/IMAP server fields — those are admin-only)
  3. On submit, upsert a row into `email_accounts` with the user's credentials, creating/activating their account
  
- **EmailConfigSettings.tsx** — Keep as-is (super admin only for server-level SMTP config)

- **PeopleModule.tsx** — The Email Credentials section in EditUserDialog already gates behind `isSuperAdmin`. No changes needed there.

- **Database:** May need to ensure `email_accounts` table allows authenticated users to insert their own row (check RLS). If the table doesn't exist or lacks self-service insert policy, add a migration.

### 2. Sponsors & Partners: Inline Publish Toggle + Bulk Actions

**Current state:** The published toggle pill is already inline next to the name (Live/Draft). The bulk action bar only has "Delete selected."

**Changes to SponsorsManagerModule.tsx:**

- **Move the publish toggle button** into the action buttons group (alongside Eye, Pencil, Trash2) instead of next to the name, for better UX consistency
- **Expand bulk actions bar** when items are selected to include:
  - Bulk Publish (set `is_published = true` for all selected)
  - Bulk Unpublish (set `is_published = false` for all selected)  
  - Bulk Delete (already exists)
- Add two new mutations: `bulkPublish` and `bulkUnpublish` that update the relevant table for all selected IDs

### 3. People & Access: End-to-End Team Member Flow

**Current state:** PeopleModule has two tabs — system users and website team members. The Team.tsx page fetches from both `profiles` (where `show_on_website = true`) and `team_members` (manual entries). Need to verify the full flow works.

**Changes:**

- **Check `team_members` table exists** — The code references it but it may not be in the schema. If missing, create migration with columns: `id`, `full_name`, `title`, `organisation`, `avatar_url`, `bio`, `display_order`, `is_active`, `created_at`
- **Add RLS policies** for `team_members`: admins can manage, public can read active members
- **Verify avatar upload** works with `team-avatars` bucket (already public)
- **Ensure the "Show on website" toggle** in EditUserDialog properly updates `profiles.show_on_website` and the Team page query picks it up
- **Fix any issues** in the TeamMemberDialog create/edit flow to ensure new manual members appear on `/team`

---

### Technical Details

**Files to modify:**
1. `src/components/crm/modules/EmailInboxModule.tsx` — Add connect-email dialog in empty state
2. `src/components/crm/modules/SponsorsManagerModule.tsx` — Move publish toggle to action buttons, add bulk publish/unpublish
3. `src/components/crm/modules/PeopleModule.tsx` — Minor fixes if needed for team member flow

**Database migrations (if needed):**
- `team_members` table creation (if not already present)
- `email_accounts` RLS policy for self-service insert
- RLS for `team_members`

**No new dependencies required.**

