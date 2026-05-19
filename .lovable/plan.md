# Finish the Parliament 360° Tour — Stitch & Wire Live Assets

The viewer, route, homepage spotlight, navbar link, CRM module, and DB tables are already shipped (currently showing a placeholder scene). All 35 photos `DJI_0001.JPG`–`DJI_0035.JPG` are now in the `parliament-panorama` Supabase bucket. This plan covers only what remains: turn those 35 photos into a real 360° panorama and put it live.

## 1. Stitch the panorama (sandbox, one-off)

1. Download all 35 originals from the `parliament-panorama` bucket into `/tmp/pano/`.
2. Inspect EXIF (yaw/pitch/gimbal angles DJI embeds) to detect whether the set is:
   - a single full sphere (typical 34-shot DJI "Sphere" pattern + 1 nadir → matches the 35 count), or
   - multiple scenes.
   Expectation: one full sphere.
3. Run OpenCV `Stitcher.create(Stitcher.PANORAMA)` on the full set. If seam/exposure issues appear, fall back to Hugin CLI (`pto_gen → cpfind --multirow → cpclean → autooptimiser -a -m -l -s → pano_modify --canvas=AUTO --projection=2 → nona → enblend`) which is purpose-built for spherical pano stitching.
4. Reproject the result to **equirectangular 2:1** at **6144×3072** (desktop) and **3072×1536** (mobile fallback). Generate a 32×16 blurred preview for the loading shimmer.
5. Auto-crop/feather any nadir/zenith gaps; if a hard hole remains, fill with a neutral patch sampled from surrounding pixels.
6. QA: open both renders, verify horizon is level, seams are clean, no doubled people/objects at stitch boundaries.

## 2. Publish the panorama

1. Upload the final files into `parliament-panorama/scenes/`:
   - `chamber-main.jpg` (6144×3072, progressive JPEG ~quality 85)
   - `chamber-main@mobile.jpg` (3072×1536)
   - `chamber-main-preview.jpg` (blurred 32×16)
2. Insert/update one row in `parliament_panorama_scenes`:
   - `slug = 'chamber-main'`, `name = 'Parliament Chamber'`, `panorama_url` = public URL of `chamber-main.jpg`, `preview_url` set, `default_yaw/pitch = 0`, `is_active = true`, `display_order = 0`.
3. Remove (or deactivate) the placeholder scene so visitors only see the real chamber.

## 3. Seed starter hotspots

Insert 6 rows into `parliament_panorama_hotspots` for `scene_id = chamber-main`, all `is_active = true`. Coordinates are best-guess starting positions — CRM staff can drag-refine in the existing Panorama module:

| Title | yaw (rad) | pitch (rad) |
|---|---|---|
| Speaker's Chair | 0.0 | 0.05 |
| The Mace | 0.15 | -0.20 |
| Member Benches (Left) | -1.3 | -0.05 |
| Member Benches (Right) | 1.3 | -0.05 |
| Public Gallery | 3.1 | 0.30 |
| ECOWAS Emblem | 0.0 | 0.55 |

Each gets a 1–2 sentence description aligned with existing Parliament copy.

## 4. Viewer polish (small follow-ups)

- Add `panoData` width/height to the `PanoramaViewer` call so PSV doesn't have to probe.
- Wire the mobile variant via a `useIsMobile()` check in `usePanoramaScenes` (pick `*@mobile.jpg` under 768px).
- Add `<link rel="preload" as="image">` for the preview JPG on `/parliament-tour` so the shimmer never flashes blank.
- Ensure the homepage `ParliamentTourSpotlight` uses `chamber-main-preview.jpg` instead of `parliamentChamber` static asset.

## 5. Verification

- Hit `/parliament-tour` → real chamber loads, drag/zoom works, autorotate engages after 2s, fullscreen + VR + gyroscope buttons present.
- Click each hotspot → dialog opens with title/description.
- Open the CRM "Virtual Tour" module → see the `chamber-main` scene, can edit hotspots, can toggle active.
- Homepage spotlight → real preview thumbnail visible, CTA navigates.

## Technical notes

- Stitching runs in the sandbox via Python + OpenCV (already available). Hugin only invoked as fallback (`nix run nixpkgs#hugin`).
- Uploads use the Supabase storage REST API with the service role key (sandbox-only) so the bucket's existing RLS for staff-only writes is preserved.
- Scene + hotspot rows are inserted via the insert tool (data, not schema). No new migrations required — tables already exist from the previous step.
- No frontend code changes needed beyond the small polish in §4; everything else is data.

## What I need from you

Just approval. Photos are in place; I'll run the stitch, upload, seed hotspots, and verify.
