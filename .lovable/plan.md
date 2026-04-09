

## Plan: Fix Email Accounts Save + Add Incoming/Outgoing Status Lights

### Problem 1: Save fails — missing unique constraint on `user_id`
The `save-email-password` edge function uses `upsert(..., { onConflict: "user_id" })`, but there is no unique index on `email_accounts.user_id`. This causes the upsert to fail silently or error out.

**Fix:** Add a unique constraint on `email_accounts.user_id` via migration.

### Problem 2: UI references `zoho_account_id` but column doesn't exist
The `EmailAccountRow` interface and table column reference `zoho_account_id`, but this column was removed from the schema. This causes query errors or null values.

**Fix:** Remove `zoho_account_id` from the query and interface. Remove the "Zoho" column from the table.

### Problem 3: Add validation status + incoming/outgoing indicator lights
Add two colored indicator dots per row:
- **Incoming (IMAP):** Green if `imap_valid === true` and recently synced, red if failed, amber if untested
- **Outgoing (SMTP):** Green if last send succeeded (we can derive this from IMAP valid + active status since they share the same Zoho credentials)

Replace the current separate IMAP/Validated columns with a cleaner consolidated row showing:
- Password status (stored or not)
- IMAP validation status with timestamp
- Two signal lights: **IN** (incoming/IMAP) and **OUT** (outgoing/SMTP)

### Changes

| File | Change |
|---|---|
| Migration | Add `UNIQUE` constraint on `email_accounts.user_id` |
| `save-email-password/index.ts` | Already correct, just needs the DB constraint |
| `EmailConfigSettings.tsx` | Remove `zoho_account_id` references; add incoming/outgoing status lights; consolidate validation display |

### Technical Details

**Migration SQL:**
```sql
ALTER TABLE public.email_accounts
  ADD CONSTRAINT email_accounts_user_id_key UNIQUE (user_id);
```

**UI Status Lights:**
Each row will show two small colored dots labeled "IN" and "OUT":
- IN (green): `imap_valid === true`; (red): `imap_valid === false`; (gray): untested
- OUT (green): `is_active && imap_valid === true` (same credentials); (red): `imap_valid === false`; (gray): untested

The table columns will be: User | Email | Password | Status | IN | OUT | Validated | Actions

