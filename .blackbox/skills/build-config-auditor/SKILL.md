---
name: build-config-auditor
description: Verify that both apps build independently and share a consistent Supabase configuration. Use this to address the open TODO items — auditing independent build scripts, env templates, shared DB contract, and data flow between admin (write) and web (read). Outputs a TODO.md-style checklist.
---

## Instructions

### 1. Dependency audit
Read both `apps/admin/package.json` and `apps/web/package.json`.
- Diff `dependencies` and `devDependencies` between the two
- Flag any version mismatches for shared packages (especially `@supabase/supabase-js`, React, TanStack Query)
- Flag any packages present in one app but not the other that should be shared
- Output: table of divergences

### 2. Env template audit
Check for env template files in both apps:
- Look for `.env.example`, `.env.template`, `.env.local.example`
- If missing from either app, create `.env.example` with the standard variables:
  ```
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  ```
- Verify both templates point to the same Supabase project (same URL variable names)
- Verify no actual secret values are in any committed file

### 3. Supabase client consistency
Read both:
- `apps/admin/src/integrations/supabase/client.ts`
- `apps/web/src/integrations/supabase/client.ts`

Check:
- [ ] Both use the same env variable names (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] Both initialize with `staleTime: 5 * 60 * 1000` and `refetchOnWindowFocus: false`
- [ ] Neither uses hardcoded URLs or keys

Read both `types.ts` files and check:
- [ ] Table definitions are compatible (web can only read what admin writes)
- [ ] Any type drift is flagged (a table in admin types but not web types)

### 4. Data flow verification
Identify admin-write paths:
- Scan `apps/admin/src/` for `.insert()`, `.update()`, `.upsert()`, `.delete()` calls
- For each table written by admin, verify a corresponding RLS `select` policy exists for web/public access
- Cross-reference against `apps/web/src/` query patterns to confirm the read path exists

### 5. Build verification
Run in sequence:
```bash
# From apps/admin/
npm run build

# From apps/web/
npm run build
```
Capture stdout and stderr. Report any TypeScript errors, missing imports, or Vite build failures.

### 6. Output checklist (mirrors TODO.md format)
```markdown
Build Config Audit — <date>
===========================
- [x] apps/admin builds successfully
- [ ] apps/web builds successfully — ERROR: <details>
- [x] Dependency versions aligned (no divergence found)
- [ ] .env.example added to apps/web (was missing)
- [x] Supabase client.ts files use same env variable names
- [ ] types.ts drift detected: table `budget_items` missing from apps/web/types.ts
- [x] Admin-write tables have matching web-read RLS policies (checked 12 tables)
- [ ] Data flow gap: `parliament_content` has no public-read policy for web app
```

## Example

**Prompt:** "Run the build config audit — check all 7 TODO items."

**Output:** Full checklist with pass/fail for each item, details on failures, and specific remediation steps for each gap found.
