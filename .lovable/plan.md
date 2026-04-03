

## Plan: Fix CAPTCHA Integration and Login Reliability

### Issues Found

1. **Turnstile "loaded multiple times" warning** — The Turnstile script may be injected multiple times due to React strict mode or component re-renders, causing the widget to fail silently.
2. **Sign in button not properly disabled** — The disabled state needs to be more visually apparent and functionally enforced.
3. **CAPTCHA must be enabled on Supabase** — The Supabase project must have Cloudflare Turnstile CAPTCHA enabled in its auth settings for the `captchaToken` parameter to be validated server-side.

### Changes

#### 1. Verify Supabase CAPTCHA Configuration
- Check if Cloudflare Turnstile is enabled in the Supabase project's Auth settings (Auth > Settings > Bot Protection)
- The site key `0x4AAAAAAAczus4H6t9WSW6Oy` must match what's configured in Supabase, and the corresponding **secret key** must be set on the Supabase side
- Without this, the captchaToken is silently ignored by Supabase

#### 2. Fix Turnstile Widget Rendering (`src/pages/Auth.tsx`)
- Add `scriptOptions={{ appendTo: "body" }}` to the Turnstile component to prevent double-loading conflicts
- Add a key prop based on `mode` so the widget re-mounts cleanly when switching between sign-in/sign-up/forgot
- Add a visible loading/fallback state while the widget loads, so the area isn't blank

#### 3. Improve Button Disabled State (`src/pages/Auth.tsx`)
- Ensure the disabled styling is visually clear (opacity, cursor) when `captchaToken` is null
- Add explicit `opacity-50 cursor-not-allowed` classes when disabled to make it obvious

#### 4. Add Error Resilience
- Add an `onError` handler that shows a toast asking the user to refresh if Turnstile fails to load
- Add a timeout fallback: if CAPTCHA doesn't resolve within 10 seconds, show a "Retry CAPTCHA" button

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Fix Turnstile props, add loading state, improve disabled button styling, add error resilience |

### Supabase Action Required
- Verify Turnstile CAPTCHA is enabled in the Supabase Auth settings dashboard with the matching site key and secret key

