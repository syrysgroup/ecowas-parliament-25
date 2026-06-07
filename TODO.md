# Admin-Web Parity Audit & Implementation TODO

## Scope
- Audit `apps/web` pages/content sources and verify matching CRUD/hide/show control in `apps/admin`.
- Implement programme menu auto-sync:
  - New programme added in admin appears automatically in web menu
  - Hidden programme in admin is hidden on web (including menu)
  - Programme menu sorted alphabetically

## Plan Steps
- [x] 1. Implement dynamic programme menu in `apps/web/src/components/layout/Navbar.tsx` using `programme_pillars` (active only, alphabetical sort, route fallback)
- [ ] 2. Build/Typecheck `apps/web` to validate changes
- [ ] 3. Complete parity audit mapping (web pages/tables -> admin modules) and identify any remaining CRUD gaps
- [ ] 4. Summarize findings and implemented parity behavior
