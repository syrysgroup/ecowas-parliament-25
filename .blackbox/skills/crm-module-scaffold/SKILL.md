---
name: crm-module-scaffold
description: Generate a complete new CRM module for the admin portal. Use this when asked to add a new section, feature, or page to the CRM dashboard. Produces the module file, registry entry, dashboard render case, i18n keys, and optional form schema — all in one pass.
---

## Instructions

### 1. Gather requirements
Ask for (or infer from context):
- Module name (PascalCase, e.g. `BudgetTracker`)
- URL section slug (kebab-case, e.g. `budget-tracker`)
- Which roles should have access (reference `AppRole` in `AuthContext.tsx`)
- Module group: WORKSPACE | COMMUNICATION | PEOPLE | CONTENT | ANALYTICS & FINANCE | MARKETING | ADMINISTRATION
- Whether it needs a create/edit form
- Usage frequency: high-frequency modules are eagerly imported; low-frequency ones use `lazy()`

### 2. Create the module file
Path: `apps/admin/src/components/crm/modules/<ModuleName>Module.tsx`

Template structure:
```tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
// Add TanStack Query imports if data fetching is needed
// import { useQuery, useMutation } from '@tanstack/react-query';
// import { supabase } from '@/integrations/supabase/client';

export function <ModuleName>Module() {
  const { isSuperAdmin, hasRole } = useAuthContext();
  const { t } = useI18n();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('crm.<section>.title')}</h1>
        <p className="text-muted-foreground">{t('crm.<section>.description')}</p>
      </div>
      {/* module content */}
    </div>
  );
}
```

Rules:
- Named export, not default export
- Use `useI18n()` for all visible strings
- Data fetching via TanStack Query (`useQuery`) with `staleTime: 5 * 60 * 1000`
- Mutations use `useMutation` with `onSuccess` toast via `useToast()`
- No direct `fetch()` or `axios` calls — use the shared `supabase` client

### 3. Register in crmModules.ts
File: `apps/admin/src/components/crm/crmModules.ts`

Add to the `ModuleId` union type and to `CRM_MODULES[]`:
```ts
{
  id: '<module-id>',
  label: '<Human Label>',
  icon: <LucideIcon>,
  section: '<url-section>',
  allowedRoles: [/* roles array */],
  group: '<GROUP>',
}
```

### 4. Add render case in CRMDashboard.tsx
File: `apps/admin/src/pages/CRMDashboard.tsx`

For eager import (high-frequency):
```tsx
import { <ModuleName>Module } from '@/components/crm/modules/<ModuleName>Module';
// In the render switch:
case '<url-section>': return <ModuleName>Module />;
```

For lazy import (low-frequency):
```tsx
const <ModuleName>Module = lazy(() =>
  import('@/components/crm/modules/<ModuleName>Module')
    .then(m => ({ default: m.<ModuleName>Module }))
);
```

### 5. Add i18n keys
Add to all three files — `en.ts`, `fr.ts`, `pt.ts` — in `apps/admin/src/lib/translations/`:

```ts
'crm.<section>.title': '<English title>',
'crm.<section>.description': '<English description>',
// Add all other t() keys used in the module
```

For `fr.ts` and `pt.ts`: if the translation is not available, prefix the value with `[NEEDS_TRANSLATION]`.

### 6. Add Zod form schema (if the module has a create/edit form)
```ts
import { z } from 'zod';

export const <moduleName>Schema = z.object({
  // fields
});

export type <ModuleName>FormData = z.infer<typeof <moduleName>Schema>;
```

Wire to `react-hook-form` with `zodResolver`.

## Example

**Prompt:** "Add a Budget Tracker module, accessible to finance_coordinator and budget_officer, in the ANALYTICS & FINANCE group."

**Output files:**
- `apps/admin/src/components/crm/modules/BudgetTrackerModule.tsx`
- Updated `crmModules.ts` (new entry in ModuleId union + CRM_MODULES array)
- Updated `CRMDashboard.tsx` (lazy import + render case)
- Updated `en.ts`, `fr.ts`, `pt.ts` (new keys under `crm.budget-tracker.*`)
