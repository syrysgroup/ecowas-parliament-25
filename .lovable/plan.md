

## Plan: Email Save Refactor, Migration, and Favicon Fix

### 1. Update `handleSave` in EmailConfigSettings.tsx
Replace the `handleSave` function to call the `save-email-password` edge function instead of direct DB writes. The new function uses `supabase.functions.invoke("save-email-password", ...)` as provided.

**File:** `src/views/admin/settings/EmailConfigSettings.tsx` (lines ~96-119)

### 2. Create `save-email-password` Edge Function
A new edge function is needed since it doesn't exist yet. It will:
- Validate the caller is a super_admin (JWT check)
- Accept `target_user_id`, `email_address`, and optional `app_password`
- Upsert into `email_accounts` table using the service role key
- Encrypt/store the app_password securely

**File:** `supabase/functions/save-email-password/index.ts`

### 3. Database Migration
A single migration to add the tasks FK constraint. The `is_global` column on `crm_calendar_events` already exists, so we skip that. The calendar RLS policy update is still needed.

```sql
-- Tasks FK to profiles
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_assignee_id_fkey
  FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update calendar RLS
DROP POLICY IF EXISTS "CRM staff can view calendar events" ON public.crm_calendar_events;
CREATE POLICY "CRM staff can view calendar events"
  ON public.crm_calendar_events FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR is_global = true OR public.is_crm_staff(auth.uid()));
```

### 4. Fix Favicon Upload "No Bucket Found" Error
The `branding` bucket exists and is public with correct RLS policies for super_admin/admin. The error is likely caused by the Supabase client not sending proper auth headers. The fix: ensure the upload path in `BrandingSettings.tsx` handles the error more gracefully and checks authentication state before uploading.

However, since the bucket and policies are correctly configured, the most likely cause is the user's session not having the `super_admin` role recognized by the `has_role` function at the storage policy level. We should verify the upload works by adding a session check and providing a clearer error message. If the issue persists, we can add an `authenticated` fallback policy scoped to admins.

### Technical Details

| Change | File(s) |
|---|---|
| Replace `handleSave` | `src/views/admin/settings/EmailConfigSettings.tsx` |
| New edge function | `supabase/functions/save-email-password/index.ts` |
| DB migration | 1 migration file (tasks FK + calendar RLS) |
| Favicon fix | `src/views/admin/settings/BrandingSettings.tsx` — add auth check before upload |

