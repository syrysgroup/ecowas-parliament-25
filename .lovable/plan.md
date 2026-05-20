## Goal
Restore the preview, verify the 360° chamber panorama loads on `/parliament-tour`, and apply small viewer polish (mobile-resolution panorama + asset preload).

## 1. Fix preview (dev server down)
Dev-server logs show repeated `node_modules/.bin/vite: No such file or directory` — `apps/web/node_modules` was wiped. Reinstall:
- `cd apps/web && npm install --no-audit --no-fund`
- Poll `http://localhost:8080/` until 200.

## 2. Verify panorama asset delivery
With the server back up, probe:
- `GET /panorama/chamber-main.jpg` (desktop, ~1.4 MB) → expect 200
- `GET /panorama/chamber-main-mobile.jpg` (~860 KB) → expect 200
- `GET /panorama/chamber-main-preview.jpg` (LQIP, ~780 B) → expect 200
- `GET /parliament-tour` → expect 200 HTML

Also confirm the DB scene row's `panorama_url` points at `/panorama/chamber-main.jpg` (via `usePanoramaScenes`) so the viewer resolves the file.

## 3. Viewer polish

### 3a. Mobile variant
In `apps/web/src/components/parliament/PanoramaViewer.tsx`:
- Pick lower-res panorama on small/low-DPR devices to cut load time and avoid GPU texture limits.
- Resolution: if `window.matchMedia('(max-width: 768px)').matches` AND `scene.panorama_url` ends in `chamber-main.jpg`, swap to `chamber-main-mobile.jpg`. Generalize via a `mobile_panorama_url` field on the scene when present (fallback to the desktop URL otherwise) — the hook already returns the raw row, so extend the `PanoramaScene` type with an optional `mobile_panorama_url` and read it in `usePanoramaScenes`.
- Show `chamber-main-preview.jpg` as the viewer container `background-image` while PSV loads, so users see something immediately instead of a black box.

### 3b. Preload
In `apps/web/src/pages/ParliamentTour.tsx`:
- Add a `<link rel="preload" as="image" href={scene.panorama_url} fetchpriority="high">` via a `useEffect` that injects/removes the tag, so the panorama starts downloading in parallel with the lazy PSV chunk.
- Keep the existing `lazy(() => import("@/components/parliament/PanoramaViewer"))` — only the image preload is added.

No DB migration needed for step 3 unless we want a per-scene mobile URL; if so, add a follow-up migration adding `mobile_panorama_url text` to `parliament_panorama_scenes` (optional, defer unless requested).

## 4. Final verification
- Re-hit `/parliament-tour` in the preview and confirm: preview image visible immediately, full panorama swaps in, mobile viewport (430×667) serves the mobile JPG (check Network tab via browser tools).
- Confirm no console errors from PSV.

## Files touched
- `apps/web/src/components/parliament/PanoramaViewer.tsx` — mobile URL swap + LQIP background
- `apps/web/src/hooks/usePanoramaScenes.ts` — expose `mobile_panorama_url`
- `apps/web/src/pages/ParliamentTour.tsx` — preload `<link>` injection
- (env) reinstall `apps/web/node_modules`