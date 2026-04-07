

## Plan: Fix CRM Edit Dialogs & Add Team Categories

### Problems Identified

1. **CRM edit dialogs don't pre-fill data**: Both `StakeholderDialog` and `TeamMemberDialog` use `useState(prop)` for initial values. React only sets initial state on first mount -- since the dialog component stays mounted, switching from "create" to "edit" (or between edits) shows stale/blank fields. The user has to re-enter everything including re-uploading photos.

2. **Stakeholders not visible on public page**: The CRM stakeholder categories are `["leadership", "team", "advisory"]`, but the public Stakeholders page (`/stakeholders`) only queries `category = "leadership"`. Stakeholders added with other categories never appear.

3. **Team page needs categorization**: Team members should be grouped into Leadership, Implementing Team, Consultants, and Volunteers -- with empty categories hidden.

---

### Changes

#### 1. Fix StakeholderDialog state reset on edit
**File**: `src/components/crm/modules/StakeholdersModule.tsx`
- Add `useEffect` to reset all form state when the `stakeholder` prop changes (or use a `key` prop on the dialog to force remount)
- Simplest fix: add `key={editing?.id ?? "new"}` on the `<StakeholderDialog>` component so React creates a fresh instance each time

#### 2. Fix TeamMemberDialog state reset on edit
**File**: `src/components/crm/modules/PeopleModule.tsx`
- Same fix: add `key={editTarget?.id ?? "new"}` on the `<TeamMemberDialog>` component

#### 3. Add `category` column to `team_members` table
**Migration**: Add a `category` text column with default `'implementing_team'` and allowed values: `leadership`, `implementing_team`, `consultant`, `volunteer`

#### 4. Update TeamMemberDialog with category selector
**File**: `src/components/crm/modules/PeopleModule.tsx`
- Add a category dropdown to the team member form (Leadership, Implementing Team, Consultants, Volunteers)
- Include category in the save payload

#### 5. Update Team page to group by category
**File**: `src/pages/Team.tsx`
- Query team members and group them by category
- Display sections in order: Leadership, Implementing Team, Consultants, Volunteers
- Hide sections with no members

#### 6. Fix Stakeholders page to show all categories
**File**: `src/pages/Stakeholders.tsx`
- The leadership section already works. Ensure any "team" or "advisory" stakeholder profiles also appear (or align the CRM categories with what the page renders)

#### 7. Update translation keys
**Files**: `src/lib/translations/en.ts`, `fr.ts`, `pt.ts`
- Add keys for team category headings

---

### Technical Details

- Using `key` prop on dialog components is the cleanest React pattern to force state re-initialization -- no `useEffect` needed
- The `team_members.category` column will use a text type with a default of `'implementing_team'` so existing rows are automatically categorized
- The public Team page will query all active team members in one request, then group client-side by category

