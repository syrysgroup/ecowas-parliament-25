---
name: supabase-migration-writer
description: Generate a correctly formatted, RLS-consistent Supabase SQL migration. Use this when adding new tables, columns, policies, indexes, or seed data. Follows the established has_role() pattern and realtime publication conventions used throughout this project.
---

## Instructions

### 1. Determine the migration type
Ask for (or infer):
- Schema change: new table, new column, alter column, drop column
- Policy change: new RLS policy, update existing policy
- Data change: insert seed data, backfill
- Index: new index for query performance

### 2. Generate the file
Path: `supabase/migrations/YYYYMMDDHHMMSS_<snake_case_description>.sql`

Use the CURRENT timestamp in UTC for the filename prefix. Never reuse an existing timestamp.

**New table template:**
```sql
-- Create <table_name> table
create table public.<table_name> (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- additional columns
);

-- Enable RLS
alter table public.<table_name> enable row level security;

-- Policies
-- Super admin: full access
create policy "<table_name>_super_admin_all"
  on public.<table_name>
  for all
  using (has_role(auth.uid(), 'super_admin'::app_role))
  with check (has_role(auth.uid(), 'super_admin'::app_role));

-- CRM staff: read access (adjust as needed)
create policy "<table_name>_staff_read"
  on public.<table_name>
  for select
  using (is_crm_staff());

-- Realtime (if the table needs live updates)
alter publication supabase_realtime add table public.<table_name>;
```

### 3. RLS policy rules
- ALWAYS use `has_role(auth.uid(), 'role_name'::app_role)` — never raw role string comparisons
- Use `is_crm_staff()` for broad staff read access
- Public read (web app): `using (true)` only on tables that are genuinely public
- Write policies always include both `using` and `with check`
- Never grant `for all` to non-admin roles without explicit approval

### 4. Column conventions
- Primary key: `id uuid primary key default gen_random_uuid()`
- Timestamps: `created_at timestamptz not null default now()`
- Foreign keys to `profiles`: `user_id uuid references public.profiles(id) on delete cascade`
- Foreign keys to `auth.users`: only for tables that need direct user ownership

### 5. After writing the migration
Remind the user to run:
```bash
supabase db push
supabase gen types typescript --local > apps/admin/src/integrations/supabase/types.ts
# Then copy to apps/web if the table is shared
```

## Example

**Prompt:** "Add a `budget_items` table with name, amount, category, and a foreign key to profiles. Finance coordinators can read, super admin has full access."

**Output:**
- `supabase/migrations/20260525120000_add_budget_items_table.sql` with full table definition, RLS enabled, two policies, no realtime (not needed for budget data)
