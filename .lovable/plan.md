

# Comprehensive CRM Enhancement Plan

This is a large set of interconnected improvements spanning profile redesign, chat enhancements, multilingual CRM support, avatar standardization, and upload improvements. Here's the breakdown:

---

## 1. Standardize Default Avatar to Parliament 25 Logo

**What changes**: Replace all `DEFAULT_AVATAR = "/images/logo/logo.png"` references across the project with the Parliament 25 logo asset (`/assets/parliament-25-logo.png`). Create a shared constant (e.g. `src/lib/constants.ts`) so every component imports the same default.

**Files affected**: `MessagingModule.tsx`, `ProfileModule.tsx`, `CRMSidebar.tsx`, `Team.tsx`, and any other component displaying user avatars.

---

## 2. Redesign CRM Profile Module

**What changes**: Completely redesign `ProfileModule.tsx` into a comprehensive, polished profile page with:
- **Header banner** with avatar, name, email, role badges, and join date (fix current glitchy layout)
- **Contact Details section**: email (visible), phone number, organisation, country, date of birth, social links
- **General Info section**: full name, title, bio
- **Tabbed layout**: Profile, Contact, Security, Activity
- **Avatar upload with URL option**: users can either upload a file OR paste an image URL
- Phone number field requires a **migration** to add `phone` column to `profiles` table

**Database migration needed**:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url text;
```

---

## 3. Chat Module Enhancements

**What changes** to `MessagingModule.tsx`:

- **User profile from avatar/three-dots**: Already partially working — ensure clicking avatar or "View Profile" in the MoreVertical dropdown opens an enhanced profile dialog showing full name, title, organisation, country, phone, email, bio, and social links
- **Display by name, not email**: Contacts sidebar already shows `full_name` — ensure DM conversations and message bubbles always show first+last name (already largely done, just clean up fallback logic)
- **Message status indicators**: Add delivered (single check), read (double check), and timestamp display beneath each message bubble
- **Collapsible contacts list**: Wrap Channels, Direct Messages, and Contacts sections in collapsible accordion sections with search filtering
- **Multilingual text input**: Add a translate button in the message input area that auto-translates typed text. This would use a translation API or browser-based approach

**Note**: Read receipts require a DB migration to add `read_at` and `delivered_at` columns to `direct_messages` and `channel_messages`.

**Database migration**:
```sql
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS delivered_at timestamptz DEFAULT now();
ALTER TABLE public.channel_messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE public.channel_messages ADD COLUMN IF NOT EXISTS delivered_at timestamptz DEFAULT now();
```

---

## 4. Full CRM Multilingual Support (EN/FR/PT)

**What changes**: The CRM currently has no i18n integration — all labels are hardcoded in English.

- Add ~200+ CRM translation keys to `en.ts`, `fr.ts`, `pt.ts` covering all sidebar labels, module titles, form labels, buttons, and status messages
- Import `useTranslation` into CRM modules and replace hardcoded strings with `t("crm.key")` calls
- Add a language switcher to the CRM sidebar or header
- This is a **large effort** spanning every CRM module — will be done progressively starting with the sidebar, profile, and messaging modules

---

## 5. Logo & Favicon Setup with Connected Uploads

**Suggested sizes**:
- **Logo**: 180×60px (displayed) / provide 360×120px for retina. PNG or SVG.
- **Favicon**: 32×32px `.ico` or `.png`, plus 180×180px Apple touch icon, and 192×192px + 512×512px for PWA manifest.

**What changes**: In the CRM Settings (BrandingSettings), connect the logo/favicon upload so:
- Uploaded logo updates `global_settings` table and is immediately reflected in the Navbar/Footer
- Uploaded favicon updates `index.html` dynamically (or via a settings-driven approach)
- Add URL input option alongside file upload for both logo and favicon

---

## 6. URL Option for All Image Uploads

**What changes**: Across all CRM modules that have image uploads (sponsors, team members, news, events, media library, profile avatars), add an alternative "Paste URL" input field alongside the file upload button. This avoids duplicating images already hosted elsewhere.

**Pattern**: A shared `ImageUploadOrUrl` component that provides both a file upload button and a URL text input, returning the final URL.

---

## Technical Summary

| Item | Files | DB Migration |
|------|-------|-------------|
| Default avatar constant | New `constants.ts` + ~5 files | No |
| Profile redesign | `ProfileModule.tsx` | Yes (phone, social links) |
| Chat enhancements | `MessagingModule.tsx` | Yes (read_at, delivered_at) |
| CRM i18n | All translation files + CRM modules | No |
| Logo/favicon setup | `BrandingSettings.tsx`, `Navbar.tsx` | No |
| URL option for uploads | New shared component + ~8 modules | No |

This is a substantial body of work. Implementation will proceed in order of priority: avatar standardization and profile redesign first, then chat enhancements, then i18n, then upload improvements.

