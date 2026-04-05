

## Plan: CRM Enhancements — User Management, Geo Analytics, Email Settings & Notifications

This plan covers three major feature areas across the Super Admin CRM.

---

### 1. Enhanced User Management with "Show on Team Page" Toggle

**What changes:**
- Add a `show_on_website` boolean column to the `profiles` table (default `false`)
- Add fields for `title` and `organisation` to the invite/add-user form in SuperAdminModule (these already exist on profiles table)
- Add a toggle switch per user row in the Super Admin Users tab: "Show on Team page"
- When toggled on, update `profiles.show_on_website = true` and require `title` + `organisation` to be filled
- Update the public **Team page** (`src/pages/Team.tsx`) to fetch from Supabase `profiles` where `show_on_website = true`, replacing the current hardcoded array

**Database migration:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_on_website boolean NOT NULL DEFAULT false;
```

**Files modified:**
- `supabase/migrations/` — new migration for `show_on_website`
- `src/components/crm/modules/SuperAdminModule.tsx` — add toggle + inline edit for title/org per user
- `src/pages/Team.tsx` — replace hardcoded data with Supabase query

---

### 2. Geo Analytics Dashboard

**What changes:**
- Create a new `site_visitors` table to store visitor analytics (country, IP, page focus, referrer, device, timestamp)
- Create a `contact_submissions` table for contact form leads (name, email, phone, message, visitor_id link)
- Build a new **GeoAnalyticsModule** component with:
  - World map or country breakdown chart showing visitor origins
  - Table of recent visitors with IP, country, most-viewed page, device info
  - Contact submissions linked to visitor data when available
  - Filterable by date range
- Add it as a sub-tab inside SuperAdminModule or as a new CRM section
- Add a lightweight client-side tracker (using a Supabase edge function) that logs page views with geo data derived from IP

**Database migration:**
```sql
CREATE TABLE site_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text,
  country text,
  city text,
  device text,
  browser text,
  current_page text,
  referrer text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES site_visitors(id),
  name text,
  email text,
  phone text,
  message text,
  source_page text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```
Plus RLS policies (super_admin/admin can SELECT; anonymous can INSERT into site_visitors; authenticated can INSERT into contact_submissions).

**Files created/modified:**
- `supabase/migrations/` — new migration
- `src/components/crm/modules/GeoAnalyticsModule.tsx` — new module with charts (recharts) and tables
- `src/components/crm/crmModules.ts` — register new module
- `src/pages/CRMDashboard.tsx` — add route case
- `supabase/functions/track-visitor/index.ts` — edge function that receives page view + uses IP geolocation
- `src/components/layout/Layout.tsx` or `src/App.tsx` — add lightweight tracker call on page load
- Update `src/pages/Contact.tsx` — link contact form submissions to `contact_submissions` table

---

### 3. Simplified Email Settings + CRM Password Change + Personal Notification Email

**What changes:**

**A. Preset Email Settings (simplified)**
- Pre-fill SMTP/IMAP settings for `ecowasparliamentinitiatives.org` (Zoho) in SettingsModule
- User only enters their email address and password; all host/port/from fields are preset and read-only
- Save credentials to `email_accounts` table per user

**B. Password Change from CRM**
- Already partially implemented in SecuritySettings — ensure all CRM users (not just those with Zoho accounts) can change password inline
- Use `supabase.auth.updateUser({ password })` for Supabase auth password change
- Keep the Zoho sync via `sync-password` edge function for users with email accounts

**C. Personal Notification Email**
- Add a `notification_email` column to `profiles` table
- In SettingsModule, add a field "Personal email for notifications" where users enter an external email
- When CRM notifications fire (new message, task, etc.), also send an email to this address via the `send-email` edge function

**Database migration:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_email text;
```

**Files modified:**
- `supabase/migrations/` — add `notification_email`
- `src/components/crm/modules/SettingsModule.tsx` — simplify email form (preset fields), add notification email field, ensure password change works for all users
- Optionally update notification logic in CRMLayout's `useNotifications` hook or create a database trigger that sends email on new `crm_messages` insert

---

### Technical Details

- All new tables get RLS policies restricting reads to admin roles and writes appropriately
- The geo tracker edge function uses request headers (`x-forwarded-for`, `cf-ipcountry`) for country detection without external API calls
- The Team page will use a `useQuery` hook fetching public profiles, with a loading skeleton
- Charts in GeoAnalyticsModule use recharts (already installed) — bar chart for country distribution, line chart for visitor trends
- Total estimated files: ~4 new files, ~6 modified files, 2-3 migrations

