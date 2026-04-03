

## Plan: Fix Captcha Issue, Redesign Login Page, and Correct Implementing Partners

### Problem Summary

1. **Captcha error**: Supabase has CAPTCHA verification enabled on the project, but the app doesn't send a `captcha_token` with auth requests, causing 500 errors on sign-in/sign-up.
2. **Login page design**: Needs a creative, modern, interactive redesign featuring only the ECOWAS Parliament logo prominently.
3. **Implementing Partners**: The homepage `ImplementingPartnersSection` shows incorrect placeholder data. It should match the real partners from the Stakeholders page: Duchess NL, Borderless Trade & Investment, and CMD Tourism & Trade Enterprises.

---

### Technical Details

#### 1. Fix CAPTCHA Verification

The Supabase project has CAPTCHA enabled (likely Cloudflare Turnstile or hCaptcha). Two options:

- **Option A (Recommended)**: Disable CAPTCHA in the Supabase dashboard (Auth > Settings > Bot and Abuse Protection) since this is an internal/org platform.
- **Option B**: Integrate a CAPTCHA widget (e.g., Cloudflare Turnstile) into the auth page, passing the `captchaToken` option to `signInWithPassword()`, `signUp()`, etc.

I will implement **Option B** using Cloudflare Turnstile (invisible mode) so CAPTCHA stays active. This requires:
- Installing `@marsidev/react-turnstile` package
- Adding the Turnstile site key (will need the user to provide it, or we can disable CAPTCHA in Supabase dashboard instead)

**Since we don't have the CAPTCHA site key and the project already has it enabled on Supabase's side, the cleanest fix is to ask the user to disable CAPTCHA in the Supabase dashboard.** I will also add error handling so the captcha error message is shown clearly.

> **Action needed from you**: Go to [Supabase Dashboard > Auth > Bot and Abuse Protection](https://supabase.com/dashboard/project/xahuyraommtfopnxrjvz/auth/rate-limits) and disable CAPTCHA verification. Alternatively, provide the Turnstile/hCaptcha site key so I can integrate the widget.

#### 2. Redesign Login Page

Complete redesign of `src/pages/Auth.tsx` with:
- **Full-screen split layout**: Left panel with ECOWAS Parliament logo displayed large/bold with animated gradient background using ECOWAS brand colors (green, yellow, deep red). Right panel with the auth form.
- **Mobile**: Single column, logo above form.
- **Interactive elements**: Subtle animated background particles or gradient shifts, smooth transitions between sign-in/sign-up/forgot modes.
- **Only ECOWAS Parliament logo** prominently (remove the 25th anniversary logo from this page).
- **Modern glass-morphism card** for the form area.
- Keep all existing functionality (sign-in, sign-up, forgot password, team mode, role-based redirect).

#### 3. Correct Implementing Partners on Homepage

Update `src/components/home/ImplementingPartnersSection.tsx` to use the correct three partners from the Stakeholders page:

| Partner | Lead | Role | Description |
|---------|------|------|-------------|
| Duchess NL | Dr. Victoria Akai IIPM | CEO | Leading implementing partner coordinating programme direction and executive partnerships |
| Borderless Trade & Investment | Dr. Olori Boye-Ajayi | Managing Partner | Driving trade diplomacy, regional engagement, and private-sector mobilisation |
| CMD Tourism & Trade Enterprises | Blessing Okpale | Lead | Supporting programming, event experience, and community-facing delivery |

Will update the partners array and adjust the grid to 3 columns for these three partners, labelling them as "Programme Co-Organisers" to match the Stakeholders page terminology.

---

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Full redesign with split layout, bold logo, modern styling, animations |
| `src/components/home/ImplementingPartnersSection.tsx` | Replace placeholder partners with correct 3 partners from Stakeholders page |

