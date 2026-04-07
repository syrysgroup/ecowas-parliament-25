---
name: Email System Architecture
description: Zoho Mail EU integration via IMAP/SMTP with per-user accounts and OAuth API
type: feature
---
- Global IMAP/SMTP config stored in site_settings key "smtp" (imap_host, imap_port, ssl_enabled, host, port)
- Per-user credentials in user_email_settings (smtp_user, smtp_password)
- email_accounts table has zoho_account_id for Zoho Mail API calls
- resolve-zoho-account-id edge function auto-resolves via Zoho org API
- validate-email-credentials supports target_user_id for super_admin connecting emails for others
- sync-emails fetches Zoho folder list first to map folder names to IDs
