---
name: role-permission-validator
description: Validate that the 16 AppRoles are consistently applied across the module registry, RLS policies, and edge functions. Use this when adding a new role, a new module, or a new migration to catch access control gaps before they reach production. Outputs a role × module access matrix.
---

## Instructions

### 1. Extract module roles from crmModules.ts
Read `apps/admin/src/components/crm/crmModules.ts`.
For each entry in `CRM_MODULES[]`, extract:
- `id`, `section`, `group`, `allowedRoles[]`

Build a map: `module_id → Set<AppRole>`.

### 2. Extract RLS policies from migrations
Scan all files in `supabase/migrations/` for:
- `create policy` statements
- Extract: table name, operation (select/insert/update/delete), role being granted
- Pattern to parse: `has_role(auth.uid(), '<role>'::app_role)`

Build a map: `table_name → { operation → Set<AppRole> }`.

### 3. Extract role checks from edge functions
Scan all `supabase/functions/*/index.ts` for:
- `has_role` RPC calls
- Extract: function name, role being checked

Build a map: `function_name → Set<AppRole>`.

### 4. Cross-reference
For each module:
- Identify which Supabase tables it queries (grep the module file for `.from('table_name')`)
- For each table+operation, check that every role in `allowedRoles[]` has a matching RLS policy
- Flag any role in `allowedRoles[]` that has no corresponding RLS select policy on the tables the module reads

For each edge function called by a module:
- Check the function's role check includes all roles from the module's `allowedRoles[]`
- Flag if the function restricts to fewer roles than the module allows

### 5. Detect orphaned roles
- Find any role that appears in RLS policies but in no module's `allowedRoles[]`
- Find any role that appears in `allowedRoles[]` but has no RLS policies on any table

### 6. Output: role × module access matrix
```
Role × Module Access Matrix
============================

Module                | super_admin | admin | finance_coordinator | budget_officer | ...
----------------------|-------------|-------|---------------------|----------------|----
dashboard             |      ✓      |   ✓   |          ✓          |       ✓        |
budget-tracker        |      ✓      |   ✗   |          ✓          |       ✓        |
finance               |      ✓      |   ✓   |          ✓          |       ✗        |
...

GAPS FOUND:
[G1] Module budget-tracker: finance_coordinator has module access but NO RLS insert policy on budget_items
[G2] Edge function export-finance-report: allows super_admin only, but budget-tracker module also allows finance_coordinator
[G3] Role budget_officer: present in 2 module allowedRoles but no RLS policies found in any migration

CONSISTENT:
✓ All 16 roles defined in AppRole are accounted for in crmModules.ts allowedRoles or explicitly excluded
✓ super_admin has _all policy on every table with RLS enabled
```

## Example

**Prompt:** "I added a new budget_officer role and a BudgetTrackerModule. Validate the role coverage end-to-end."

**Output:** Full matrix showing where budget_officer has access, plus a gap report for any table the module reads that has no RLS policy for budget_officer.
