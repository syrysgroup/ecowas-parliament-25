

## Plan: CRM Email, Inbox, Stakeholders & Spam Improvements

This plan covers 5 changes you've requested.

---

### 1. Add Email Server Configuration (CRUD) to Super Admin Hub

Currently `EmailConfigSettings` exists in settings but isn't wired into the Super Admin area. We'll add a dedicated "Email Server Config" tab/section in the SuperAdminModule where the super admin can create, read, update, and delete SMTP/IMAP server settings (Zoho host, port, credentials, from-name, from-email). This will use the existing `site_settings` table (key: `smtp`) and the `user_email_settings` table for per-user config.

**Files to modify:**
- `src/components/crm/modules/SuperAdminModule.tsx` — Add a new "Email Config" tab with full CRUD for global SMTP settings (host, port, username, password, from_name, from_email) stored in `site_settings`

---

### 2. CRM Email Notifications (Internal + External)

Currently the notification email is only for external alerts. We'll add a check for new emails in the CRM `emails` table and surface an unread badge / notification indicator in the CRM sidebar for the Email module. The refresh button will be updated to invalidate the React Query cache with `refetchType: 'active'` so it always queries fresh data from Supabase rather than serving stale cache.

**Files to modify:**
- `src/components/crm/modules/EmailInboxModule.tsx` — Ensure the refresh/sync button calls `syncEmails()` AND explicitly invalidates queries with `{ refetchType: 'all' }` so fresh data is fetched
- `src/components/crm/CRMSidebar.tsx` — Add an unread email count badge next to the Email module link (query `emails` table for unread count)

---

### 3. Remove the "Inbox" Module (Duplicate)

The "Inbox" module (`InboxModule.tsx`) uses `crm_messages` table and is a simpler duplicate of the full "Email" module. We'll remove it from the sidebar and module registry.

**Files to modify:**
- `src/components/crm/crmModules.ts` — Remove the `inbox` entry from `CRM_MODULES` and `ModuleId`
- `src/components/crm/modules/InboxModule.tsx` — Delete this file

---

### 4. Add Spam Folder to Email UI

The Email module currently has inbox, sent, drafts, starred, and trash. We'll add a "spam" folder so users can view spam emails synced from Zoho.

**Files to modify:**
- `src/components/crm/modules/EmailInboxModule.tsx` — Add `"spam"` to the `Folder` type and `FOLDERS` array with `AlertOctagon` icon
- `supabase/functions/sync-emails/index.ts` — Add `"spam"` to the folders array so spam is synced from Zoho

---

### 5. Implementing Partners — Already Editable via CRM

The Stakeholders page on the frontend pulls implementing partners from the `partners` table. These are already fully editable (CRUD) from the CRM under **Sponsors & Partners → Partners tab** in `SponsorsManagerModule.tsx`. No code changes needed — just awareness that the "Partners" tab in Sponsors & Partners is where implementing partners are managed. I can add a note/link in the Stakeholders module pointing users to Sponsors & Partners for editing implementing partners if that would help.

---

### Technical Summary

| Change | Files | DB Migration |
|--------|-------|-------------|
| Email server CRUD in Super Admin | SuperAdminModule.tsx | None |
| Fresh email refresh + CRM notifications | EmailInboxModule.tsx, CRMSidebar.tsx | None |
| Remove duplicate Inbox | crmModules.ts, delete InboxModule.tsx | None |
| Add spam folder | EmailInboxModule.tsx, sync-emails/index.ts | None |
| Implementing partners | No changes (already in SponsorsManagerModule) | None |

