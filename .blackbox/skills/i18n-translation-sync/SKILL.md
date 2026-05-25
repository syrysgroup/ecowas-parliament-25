---
name: i18n-translation-sync
description: Keep the three translation files (en.ts, fr.ts, pt.ts) in sync. Use this after adding new UI strings, before a release, or when a translation key is missing at runtime. Scans all .tsx files, diffs against all three language files, and adds stubs for missing keys.
---

## Instructions

### 1. Extract all translation keys in use
Scan every `.tsx` file in `apps/admin/src/` and `apps/web/src/` for `t('...')` calls:
- Pattern to match: `t\(['"]([^'"]+)['"]\)`
- Collect all unique keys into a sorted list
- Note the file and line number for each key (for reporting)

### 2. Load current translation files
Read all three files:
- `apps/admin/src/lib/translations/en.ts`
- `apps/admin/src/lib/translations/fr.ts`
- `apps/admin/src/lib/translations/pt.ts`

Extract the key names from each exported object.

### 3. Compute the diff
For each direction:
- **Missing from code** (in translation files but no `t()` call): flag as potentially orphaned — do NOT delete automatically, report for human review
- **Missing from en.ts**: critical — the English source is the reference; must be added
- **Missing from fr.ts or pt.ts**: add with `[NEEDS_TRANSLATION]` prefix
- **Present in en.ts but empty string**: flag as incomplete

### 4. Apply fixes
For each missing key:
- In `en.ts`: derive a reasonable placeholder from the key name (e.g. `crm.tasks.title` → `'Tasks'`) — flag it as `[NEEDS_REVIEW]` so a human confirms it
- In `fr.ts` and `pt.ts`: add `'[NEEDS_TRANSLATION] <english_value>'`
- Maintain alphabetical key order within each namespace
- Do NOT remove any existing keys

### 5. Report output
```
Translation Sync Report — <date>
================================
Total keys in use:        <n>
Keys in en.ts:            <n>  (+<added> added, <orphaned> orphaned)
Keys in fr.ts:            <n>  (+<added> added)
Keys in pt.ts:            <n>  (+<added> added)

New keys added this run:
  [NEEDS_REVIEW]        en.ts — crm.budget-tracker.title
  [NEEDS_TRANSLATION]   fr.ts — crm.budget-tracker.title
  [NEEDS_TRANSLATION]   pt.ts — crm.budget-tracker.title

Potentially orphaned keys (in files but no t() call found):
  nav.oldPage  — last seen: (no .tsx reference found)
```

## Example

**Prompt:** "I just added the BudgetTrackerModule and used 3 new t() keys. Sync the translations."

**Output:**
- Scans all .tsx files, finds 3 new keys
- Adds them to en.ts with `[NEEDS_REVIEW]` values
- Adds stubs to fr.ts and pt.ts with `[NEEDS_TRANSLATION]` prefixes
- Reports the summary
