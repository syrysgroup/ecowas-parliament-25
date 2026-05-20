## Fix Amplify build error in `apps/web/src/pages/ParliamentTour.tsx`

Two issues in the same file:

1. **Default import of `SEOHead`** — `SEOHead.tsx` only exports `SEOHead` as a named export, not default. This breaks the build.
2. **Duplicate `Badge` import** — `Badge` is imported twice (lines 5 and 8).

### Change

Replace lines 8–9:
```tsx
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
```
with:
```tsx
import { SEOHead } from "@/components/SEOHead";
```

That's the only edit needed. Build will pass.