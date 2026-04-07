

# CRM UI Redesign + Programme Pillars Fix

## Problem Summary

1. **Programme Pillars table missing**: The `programme_pillars` table was never created because migration `20260406200001` calls `is_crm_staff()` without arguments, but the function signature is `is_crm_staff(_user_id uuid)`. This caused the migration to fail silently, so the PillarsGrid on the homepage shows nothing.

2. **CRM modules need Vuexy-style UI redesign**: Four CRM modules need to be redesigned to match the uploaded Vuexy Bootstrap template designs.

---

## Part 1: Fix Programme Pillars (Database)

**New migration** to:
- Create a no-argument `is_crm_staff()` overload that calls `is_crm_staff(auth.uid())`
- Create the `programme_pillars` table (if not exists) with RLS policies
- Seed the 7 programme pillars (Youth, Trade, Parliament, Women, Culture, Awards, Civic)
- Also create `stakeholder_profiles` and `media_kit_items` tables that were in the same failed migration

This fixes the 404 errors on the homepage and gives the CRM full control over programme data.

---

## Part 2: Profile Module Redesign (Vuexy style)

**File**: `src/components/crm/modules/ProfileModule.tsx`

Redesign to match the Vuexy profile page layout:
- **Banner header** with profile image overlay, name, title, location, join date
- **Tab navigation**: Profile, Teams, Projects, Connections
- **Left column**: About card (full name, status, role, country, languages) + Overview card (tasks completed, projects, connections)
- **Right column**: Activity Timeline with styled timeline items
- Keep all existing Supabase functionality (avatar upload, profile save, password change)

---

## Part 3: Calendar Module Redesign (Vuexy style)

**File**: `src/components/crm/modules/CalendarModule.tsx`

Redesign to match the Vuexy calendar layout:
- **Left sidebar**: "Add Event" button, mini inline calendar picker, event filter checkboxes by color category (Personal/Business/Family/Holiday/ETC)
- **Main area**: Full-width calendar grid (keep existing month view with event dots)
- **Right offcanvas/sheet**: Event form with title, label/category select, start/end dates, URL, description, guests, all-day toggle
- Keep all existing CRUD operations against `crm_calendar_events` table

---

## Part 4: Chat Module Redesign (Vuexy style)

**File**: `src/components/crm/modules/MessagingModule.tsx`

Rename from "Channels & Chat" to "Chat". Redesign to match Vuexy chat layout:
- **Left sidebar**: Current user avatar + search input at top, "Chats" section (recent conversations with last message preview + time), "Contacts" section (all team members with role)
- **Empty state**: Centered icon + "Select a contact to start a conversation" message
- **Chat history**: Messages with sender avatar on left (received) or right (sent), timestamp below each message group, chat header with contact name/status and action icons (phone, video, search, kebab menu)
- **Message input**: Text input + send button + attachment icon at bottom
- Merge channels and DM into a unified chat interface
- Keep all existing Supabase functionality (channel messages, direct messages)

---

## Part 5: People/User List Redesign (Vuexy style)

**File**: `src/components/crm/modules/PeopleModule.tsx`

Redesign the user list view to match Vuexy user list:
- **4 stat cards at top**: Total Users (with icon), Active Users, Pending Invitations, Total Roles -- computed from actual DB data
- **Filter bar**: Role dropdown, Country dropdown, Status dropdown
- **DataTable-style list**: Columns for User (avatar + name + email), Role (badge), Country, Status (active/pending badge), Joined date, Actions (view/edit/delete)
- **Add User offcanvas/sheet**: Full Name, Email, Contact, Organisation, Country select, Role select
- Keep all existing user management CRUD + invite functionality

---

## Technical Details

| Task | Files Modified | Migration |
|------|---------------|-----------|
| Fix programme_pillars | -- | New migration: create `is_crm_staff()` overload, create tables, seed data |
| Profile redesign | `ProfileModule.tsx` | None |
| Calendar redesign | `CalendarModule.tsx` | None |
| Chat redesign | `MessagingModule.tsx` | None |
| User list redesign | `PeopleModule.tsx` | None |

**Estimated scope**: 1 migration + 4 large component rewrites (~400-600 lines each)

