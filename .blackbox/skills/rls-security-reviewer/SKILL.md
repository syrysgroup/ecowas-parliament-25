---
name: rls-security-reviewer
description: Audit code changes and migrations for RLS gaps and auth vulnerabilities. Use this before merging any PR that touches Supabase queries, edge functions, or database migrations. Reports findings as Critical / High / Low with remediation steps.
---

## Instructions

### 1. Determine scope
Identify changed files in the current branch or PR:
- `.sql` migration files → audit RLS policies
- Edge function `index.ts` files → audit auth flow
- `.tsx` files with `supabase.from(...)` calls → audit client-side query safety
- `AuthContext.tsx` or permission hooks → audit role enforcement

### 2. Audit SQL migrations
For each new or modified migration:
- [ ] Every new table has `enable row level security` before any policy
- [ ] No table has policies that use raw string role comparisons — must use `has_role(auth.uid(), 'role'::app_role)` or `is_crm_staff()`
- [ ] `for all` policies are only granted to `super_admin`
- [ ] Write policies (`insert`, `update`, `delete`) all have both `using` and `with check` clauses
- [ ] Tables with public read have `using (true)` only and no write exposure

### 3. Audit edge functions
For each new or modified edge function:
- [ ] CORS preflight (`OPTIONS`) is handled first and returns before any auth logic
- [ ] `Authorization` header is extracted and checked for null before `getUser()`
- [ ] `getUser()` is called on `anonClient` (user's own credentials), NOT `serviceClient`
- [ ] Role check via `has_role` RPC happens BEFORE any DB read or write
- [ ] `serviceClient` is only instantiated AFTER auth + role check pass
- [ ] No secrets (API keys, tokens) are logged or returned in error responses
- [ ] All error paths return appropriate HTTP status codes (401, 403, 500)

### 4. Audit frontend queries
For each `supabase.from(...)` call in changed .tsx files:
- [ ] The table has a corresponding RLS policy for the operation being performed (select/insert/update/delete)
- [ ] The calling component checks roles before rendering (UI gate) — but also confirm the RLS policy enforces server-side
- [ ] No use of `serviceClient` or service role key on the client side
- [ ] `isSuperAdmin` UI flags never grant data access that isn't also enforced by RLS

### 5. Cross-check role consistency
- [ ] If a module's `allowedRoles` includes a role, that role has a matching RLS `select` policy on every table the module queries
- [ ] If a module can write data, the write policy exists for the same roles

### 6. Report format
```
RLS Security Review — <date>
============================

CRITICAL (must fix before merge):
  [C1] edge-function export-finance-report: serviceClient created before role check (line 23)
       Fix: Move role check to before serviceClient instantiation

HIGH (fix soon):
  [H1] budget_items table: no RLS policy for finance_coordinator insert
       Fix: Add insert policy using has_role(auth.uid(), 'finance_coordinator'::app_role)

LOW (consider fixing):
  [L1] BudgetTrackerModule.tsx: isSuperAdmin gate has no server-side enforcement
       Note: Confirm RLS super_admin_all policy exists on budget_items

PASSED:
  ✓ Migration 20260525120000_add_budget_items_table.sql — RLS enabled, policies correct
  ✓ CORS preflight handling in export-finance-report
```

## Example

**Prompt:** "Review the changes I made for the budget tracker feature — new migration, new edge function, new module."

**Output:** Full audit report covering the migration, edge function auth flow, and frontend queries — with numbered findings and remediation steps.
