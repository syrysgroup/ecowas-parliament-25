

## Plan: Fix Email Sending, Improve Settings, and Remove Captcha Delay

This plan addresses multiple issues: email send failures, settings UX improvements, server config applying globally, and removing unnecessary captcha delays.

---

### Technical Details

**Root Cause of Email Send Error**

The `send-email` edge function requires the user to have an active `email_accounts` row with a valid `zoho_account_id`. The error "non-2xx status code" likely comes from:
1. The Zoho OAuth token refresh failing (secrets misconfigured or expired refresh token)
2. No matching Zoho account for the user's email address
3. The `send-email` function returning a 403 ("No active email account") because the user hasn't connected their email via the credential validation flow

The fix needs better error propagation and a connection status indicator.

---

### Changes

**1. Fix send-email edge function error handling**
- Add detailed error logging and return the actual Zoho API error in the response body (not just "Internal server error")
- Check if the Zoho API response is non-200 and return a meaningful message (e.g., "Zoho rejected the send: {reason}")
- Update CORS headers to include all required Supabase client headers

**2. Add email connection status indicator to Settings**
- In the CRM Settings Email tab, show a green/red/yellow status light next to "Your Email Account" section
- Query `email_accounts` and `user_email_settings` to determine: no account (red), account exists but not validated (yellow), validated this session (green)
- Add a "Test Connection" button that calls `validate-email-credentials` with `checkStored: true` and shows result inline

**3. Settings: Users enter email + password (not just email address)**
- Replace the current "Your Email Account" section (which only has an email address field) with the same email + password connect flow used in EmailInboxModule
- When saved, call `validate-email-credentials` to verify and store credentials
- Show confirmation status light (green check = connected, red = failed)

**4. Remove "From Name" and "From Email" from server config**
- Remove these two fields from the Server Configuration section in SettingsModule (lines 159-163)
- Remove them from the `handleServerSave` payload
- The from address is already derived from each user's `email_accounts.email_address`

**5. Server config applies to all users**
- The server config is already stored in `site_settings` key "smtp" and read globally by edge functions
- Add a confirmation toast that says "Server configuration saved and applied to all users"
- No structural change needed — it already works globally

**6. Remove/reduce Cloudflare captcha delay**
- Check the Auth page for any captcha configuration and either remove it or reduce its impact
- If using Supabase's built-in captcha, consider disabling it or switching to an invisible mode

**7. Update EmailConfigSettings (admin settings page)**
- Remove "From Name" and "From Email" fields to match the CRM settings changes

---

### Files to Modify

- `src/components/crm/modules/SettingsModule.tsx` — Rewrite EmailSettings section with email+password connect flow, status indicator, remove from_name/from_email from server config
- `supabase/functions/send-email/index.ts` — Improve error handling, check Zoho response status, return detailed errors
- `src/views/admin/settings/EmailConfigSettings.tsx` — Remove from_name and from_email fields
- `src/pages/Auth.tsx` — Check and address captcha configuration

### Files to Read (before implementation)
- `src/pages/Auth.tsx` — to understand captcha setup

