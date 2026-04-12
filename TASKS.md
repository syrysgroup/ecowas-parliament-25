# ECOWAS Parliament CRM — Build Tasks for Claude Code

> Run with: `claude` (Claude Code CLI) in project root
> Priority: HIGH > MEDIUM > LOW

---

## ✅ COMPLETED (do not redo)
- Email mobile compose (full-screen modal on mobile, bottom panel on desktop)
- Email body fetch (MIME parser with QP decoding)
- Sponsor logo-only display (no card wrapper)
- CRM Vuexy dark theme tokens in index.css
- CRMAvatar with status dots
- CRMTour (Shepherd.js guided tour)
- ProgrammeTimeline (milestone tracker per pillar)
- CRMSidebar redesign (Vuexy style)
- Auto-calendar sync when events created
- Background email notifications (global realtime watcher)
- send-email reply-to fix + HTML wrapping
- Stakeholders page 4-column grid

---

## 🔴 HIGH — Fix now

### 1. Email list mobile — sidebar hidden, list/detail toggle
**File:** `src/components/crm/modules/EmailInboxModule.tsx`
**Issue:** On mobile the left sidebar (folders) still shows, taking space from the email list
**Fix:** The sidebar div already has `hidden md:flex` — verify. Add a top bar on mobile with hamburger icon `≡` that opens sidebar as a slide-in drawer (like Gmail mobile). The email detail should slide in full-screen over the list.

### 2. Chat mobile — contact list vs chat panel toggle
**File:** `src/components/crm/modules/MessagingModule.tsx`
**Issue:** On mobile, both sidebar and chat panel stack instead of toggling
**Fix already in last session** — verify `mobileShowChat` state controls visibility correctly.

### 3. CRM Sidebar — add data-tour attributes
**File:** `src/components/crm/CRMSidebar.tsx`
**Issue:** Tour steps reference `data-tour="email-inbox"` etc but sidebar nav buttons lack these
**Fix:** Add `data-tour={mod.section}` to each nav button. Already done in CRMSidebar.tsx from last session — verify it's in the deployed file.

### 4. CRM Tour import path
**File:** `src/components/crm/CRMLayout.tsx`
**Issue:** CRMTour is imported but CRMLayout may not have the import
**Fix:** Ensure `import CRMTour from "@/components/crm/CRMTour"` is present

---

## 🟡 MEDIUM — Build these next

### 5. ProgrammeTimeline — add to CRM modules
**File:** `src/components/crm/crmModules.ts`
**Task:** Add ProgrammeTimeline as a module:
```typescript
{
  id: "programme-timeline",
  section: "programme-timeline",
  label: "Programme Timeline",
  icon: GitBranch,
  group: "Programmes",
  roles: ["super_admin", "admin", "moderator", "project_director", "programme_lead"],
}
```
Then in `src/pages/CRMDashboard.tsx`, import and render `<ProgrammeTimeline />` for section `"programme-timeline"`.

### 6. Sponsor logos — ImplementingPartnersSection match
**File:** `src/components/home/ImplementingPartnersSection.tsx`
**Task:** Apply same pure-logo treatment — no card, logo floats at natural size in a responsive grid. Name below in muted text. Already done last session but verify it's deployed.

### 7. Email — mark synced sent emails with body
**File:** `supabase/functions/sync-emails/index.ts`
**Issue:** Synced emails save `body_html: ""` — the fetch-email-body function fetches on demand but should pre-populate during sync for speed
**Fix:** In sync-emails, for the last 5 emails synced, call parseMime inline and save body_html immediately.

### 8. Avatar across CRM — replace all raw `<img>` avatar patterns
**Files:** All modules with `img src={avatar_url || DEFAULT_AVATAR}`
**Task:** Replace with `<CRMAvatar src={avatar_url} name={full_name} size="sm" status={isOnline ? "online" : "offline"} />`
Import: `import CRMAvatar from "@/components/crm/CRMAvatar"`

### 9. CRM Dashboard — connect real data
**File:** `src/components/crm/modules/DashboardModule.tsx`
**Task:** Replace static numbers (24,983 / 12 / $48.5k / 15) with real Supabase queries:
- Total Registrations: count from `applications` table
- Active Events: count from `events` where `is_published = true` and `date >= today`
- Countries: count distinct `country` from `applications`
- Revenue: sum from `invoices` table (or keep static if no finance data)

### 10. ProfileModule — use CRMAvatar
**File:** `src/components/crm/modules/ProfileModule.tsx`
**Task:** Import CRMAvatar, replace profile photo display with `<CRMAvatar src={avatarUrl} name={fullName} size="xl" status="online" />`

---

## 🟢 LOW — Polish

### 11. Sponsor page — ensure title is SEO-friendly
**File:** `src/pages/sponsors/SponsorPage.tsx`
**Task:** Add `<title>{sponsor.name} | ECOWAS Parliament Initiatives</title>` using React Helmet or the existing head management approach.

### 12. Partner page — same SEO treatment
**File:** `src/pages/partners/PartnerPage.tsx`

### 13. Email signature — test and confirm logo URL renders
**File:** `supabase/functions/send-email/index.ts`
**Check:** Logo URL `https://xahuyraommtfopnxrjvz.supabase.co/storage/v1/object/public/branding/logos/sing.png` — confirm it's a public bucket (no auth required). If not, set bucket policy to public in Supabase Storage.

### 14. Tour — trigger from topbar Help button
**File:** `src/components/crm/CRMLayout.tsx`
**Task:** Add a Help icon (?) button to the topbar that calls `startTour()` from `useCRMTour()`.

### 15. Mobile: Add bottom nav bar for CRM on phones
**File:** New component `src/components/crm/CRMBottomNav.tsx`
**Task:** On screens < md, show a fixed bottom bar with 4-5 most-used modules:
Dashboard / Email / Calendar / Chat / Profile — using icon buttons with unread badges.

---

## 📋 Claude Code — How to use this file

Run in project root:
```bash
claude "Read TASKS.md and complete task #5 (ProgrammeTimeline module registration)"
claude "Read TASKS.md and complete task #8 (replace avatar img patterns with CRMAvatar)"
claude "Read TASKS.md and complete all HIGH priority tasks"
```

Claude Code will read the file, find the affected files, make the changes, and confirm.
