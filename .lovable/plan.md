

## Plan: Email Signature Settings, Reply Fix, and Notification Email System

This is a multi-part implementation covering three features: (1) Email Signature settings panel, (2) Reply click fix in EmailInboxModule, and (3) Personal Notification Email with notification templates.

---

### 1. Email Signature Settings Panel

**Location:** Add a new "Signature" tab in ProfileModule.tsx (visible to all CRM users)

**Database:** `email_signatures` table already exists with the right columns. Need to add a unique constraint on `user_id` for upsert support.

**Migration:**
```sql
ALTER TABLE public.email_signatures
  ADD CONSTRAINT email_signatures_user_id_key UNIQUE (user_id);
```

**New component:** `src/components/crm/modules/EmailSignaturePanel.tsx`
- Form fields: Title (dropdown: Mr., Mrs., Ms., Dr., Prof., Hon., Engr., Barr.), First Name, Last Name, Position, Mobile Number, Active toggle
- Fixed values: Organisation, Website, Tagline, Logo URL (not editable)
- Email: read-only, fetched from `email_accounts` where `user_id = user.id` and `is_active = true`
- On load: fetch existing signature, split `full_name` on first space into first/last name
- On save: upsert into `email_signatures` with `onConflict: "user_id"`
- Live preview card showing the exact signature layout with logo at bottom

**ProfileModule.tsx:** Add a third tab "Signature" alongside "Profile" and "Security"

### 2. Update `send-email` Edge Function

Add a `buildSignatureHtml` function that fetches the user's active signature from `email_signatures` and appends it to the email body. Includes the logo image at the bottom matching the preview layout exactly.

**File:** `supabase/functions/send-email/index.ts`
- Before sending, query `email_signatures` for the user where `is_active = true`
- Build HTML signature block and append to `bodyHtml`
- Signature HTML includes: name, org, position, mobile, email, website, tagline, logo

### 3. Fix Reply "Click to write your reply"

**File:** `src/components/crm/modules/EmailInboxModule.tsx` (lines ~594-619)

The reply card area currently shows a static "Click to write your reply..." text but the entire area isn't clickable — only the Reply button triggers compose.

**Fix:**
- Make the entire reply card area (the placeholder text div) clickable with an `onClick` handler that calls `onReply(email)`
- Add `cursor-pointer` styling to the clickable area
- The ComposeModal already handles reply mode correctly (pre-fills To, Subject with "Re:" prefix, includes quoted text)

### 4. Notification Email System

**Database migration:** Add a `notification_email` column check — already exists on `profiles` table.

**New edge function:** `supabase/functions/send-notification/index.ts`
- Accepts: `user_id`, `type` (new_email, new_task, upcoming_event, invitation_accepted), `payload` (details)
- Looks up user's `notification_email` from profiles and their notification preferences from `user_notification_prefs`
- If the preference for that type is enabled and notification_email is set, sends a templated email via Zoho from a do-not-reply address
- Templates for each notification type with consistent branding

**Notification types and templates:**
- **New Email:** "You have a new email from {sender} — {subject}"
- **New Task:** "A new task has been assigned to you — {task_title}"
- **Upcoming Event:** "Reminder: {event_title} starts in 24 hours"
- **Invitation Accepted:** "{user_name} has accepted your invitation"

**Integration points** (called from existing edge functions or via DB triggers):
- `send-email/sync-emails`: trigger notification when new email arrives
- Task assignment: trigger on task insert/update
- Event reminder: scheduled function or cron
- Invitation: trigger from `handle_invitation_role` or invite-user function

For now, we'll create the edge function and integrate it into `sync-emails` for the "new email" notification. Other triggers can be added incrementally.

---

### Files Changed

| File | Change |
|---|---|
| Migration | Add `UNIQUE` on `email_signatures.user_id` |
| `src/components/crm/modules/EmailSignaturePanel.tsx` | New — signature form + live preview |
| `src/components/crm/modules/ProfileModule.tsx` | Add "Signature" tab |
| `supabase/functions/send-email/index.ts` | Add `buildSignatureHtml`, append to outgoing emails |
| `src/components/crm/modules/EmailInboxModule.tsx` | Make reply placeholder clickable |
| `supabase/functions/send-notification/index.ts` | New — notification email dispatcher with templates |

