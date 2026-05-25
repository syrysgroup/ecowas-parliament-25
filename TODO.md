# Fix All Problems — Execution TODO

## Phase 1: Critical runtime/security
- [x] Investigate and fix `supabase/functions/track-visitor/index.ts` 500 on POST
- [x] Re-test `track-visitor` with curl (OPTIONS + POST)
- [ ] Audit selected high-impact edge functions for auth/RLS guard consistency
- [x] Verify `admin-reset-password` deployment status against hosted Supabase project

## Phase 2: Code quality stabilization
- [x] Run and capture lint error categories for `apps/web`
- [ ] Fix `apps/web` lint **errors** (then warnings)
- [ ] Re-run `apps/web` lint + build
- [x] Run and capture lint error categories for `apps/admin`
- [ ] Fix `apps/admin` lint **errors** (then warnings)
- [ ] Re-run `apps/admin` lint + build

## Phase 3: Test coverage
- [ ] Add baseline admin smoke tests
- [ ] Run `apps/admin` tests and ensure they execute
- [ ] Re-run `apps/web` tests to ensure no regressions

## Phase 4: Integration verification
- [~] Re-test key edge functions (happy/error/edge where auth allows)
- [x] Re-verify independent run/build for web + admin
- [ ] Summarize resolved issues and remaining blockers (if any)

## Notes from current run
