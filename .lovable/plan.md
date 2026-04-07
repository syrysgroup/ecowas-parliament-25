

## Plan: Redesign CRM Email Module to Match Vuexy Template + Fix Build Error

### Overview
Redesign the `EmailInboxModule.tsx` (the real Zoho-connected email in the CRM) to match the Vuexy email template layout exactly. Also fix the unrelated `PermissionsSettings.tsx` build error.

### Build Error Fix (Quick)
**File**: `src/views/admin/settings/PermissionsSettings.tsx`
- Line 28-30: The `stored` variable is typed as `{}` but accessed with `.admin` and `.user`. Fix by casting `stored` properly or adding a fallback type assertion.

### Email Redesign — Vuexy Layout Structure

The Vuexy email has a distinct 3-column layout inside a single card:

```text
┌──────────────────────────────────────────────────────────┐
│ Card with rounded corners, border, shadow               │
│ ┌─────────┬──────────────────────┬──────────────────────┐│
│ │ Sidebar │   Email List         │   Email Detail View  ││
│ │         │                      │                      ││
│ │ Compose │ Search bar           │ Subject + Badge      ││
│ │ btn     │ ──────────────────── │ ──────────────────── ││
│ │         │ ☐ ★ [avatar] Name   │ Trash/Mail/Folder/   ││
│ │ Inbox 21│   Subject     [dot] │ Tag/Star/More        ││
│ │ Sent    │ ☐ ★ [avatar] Name   │ ──────────────────── ││
│ │ Draft  2│   Subject     [dot] │ [avatar] Sender Name ││
│ │ Starred │ ☐ ★ [initials] Name │  email@addr          ││
│ │ Spam   4│   Subject     [dot] │  Date                ││
│ │ Trash   │                      │                      ││
│ │         │  Hover: mail/trash/  │ Email body content   ││
│ │ Labels: │  info icons          │                      ││
│ │ ● Persl │                      │ ── Attachments ──    ││
│ │ ● Compny│                      │ 📎 report.xlsx      ││
│ │ ● Imprt │                      │                      ││
│ │ ● Privt │                      │ Reply card           ││
│ └─────────┴──────────────────────┴──────────────────────┘│
│ Compose Modal (bottom-right, draggable-style)            │
└──────────────────────────────────────────────────────────┘
```

### Key Vuexy Design Differences to Implement

**1. Sidebar**
- Full-width "Compose" button at top (primary color)
- Folder list with icons + badges (Inbox: 21, Draft: 2, Spam: 4)
- Labels section below with colored dots (Personal/green, Company/primary, Important/warning, Private/danger)
- Clean spacing, no heavy borders

**2. Email List**
- Search bar with icon (no border on input, merged input group style)
- Horizontal divider below search
- Action bar: select-all checkbox, trash, mail-opened, folder dropdown, label dropdown, refresh, more-options dropdown
- Each email row: checkbox, star icon, avatar (image or initials circle), sender name + subject inline (on wider screens), label dots, time
- Hover state reveals action icons (mail/trash/info) overlaying the time/label area
- Unread emails have bolder text (h6 weight)

**3. Email Detail View**
- Back arrow + subject title + badge (e.g., "Important")
- Action bar: prev/next chevrons, trash, mail, folder dropdown, label dropdown, star, more-options
- Stacked email cards for thread view (previous messages collapsible, latest message expanded)
- Each card: avatar + sender name + email + date + attachment/star/more icons in header, then body content
- Reply card at bottom with rich text toolbar (bold/italic/underline/list/link/image) + attachments button + send button

**4. Compose Modal**
- Bottom-right modal dialog (not centered) — minimize/close buttons
- To field with tag-style select, CC/BCC toggle links
- Subject field
- Rich text editor area
- Footer: attachments + send button

### Files Modified

1. **`src/components/crm/modules/EmailInboxModule.tsx`** — Complete UI overhaul:
   - Restructure sidebar with Compose button, folder items with proper icons/badges, labels section
   - Redesign email list with Vuexy-style search bar, action toolbar, email rows with checkbox + star + avatar/initials + inline sender/subject + label dots + time, hover action icons
   - Redesign detail panel with subject + badge header, dual action bars (nav + actions), threaded card layout, inline reply card with toolbar
   - Redesign compose modal to bottom-right positioned with minimize, CC/BCC toggles

2. **`src/views/admin/settings/PermissionsSettings.tsx`** — Fix TS2339 build error on lines 29-30

### Technical Details
- All styling uses Tailwind classes matching the existing `crm-*` design tokens
- Zoho integration logic (queries, mutations, sync) remains unchanged
- Only UI/layout components are rewritten
- Avatar initials fallback when no image (colored circle with initials, matching Vuexy)
- Hover-reveal action icons on email list items using group/group-hover pattern

