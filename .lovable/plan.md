# Plan: Visual hotspot management in Admin Panorama

The admin already supports create / edit / delete / hide / reorder for hotspots, plus a click-to-place picker inside the edit dialog. The gap is that admins can't **see all hotspots on the panorama at once** or click a marker on the panorama to identify/edit it.

## Changes

### 1. New `SceneHotspotMap` component
`apps/admin/src/components/crm/modules/panorama/SceneHotspotMap.tsx`
- Embeds a Photo Sphere Viewer for the scene's panorama with the MarkersPlugin.
- Renders every saved hotspot as a numbered green dot with the title as tooltip; hidden hotspots show as a dashed grey dot.
- Click a marker → calls `onEdit(hotspot)` (opens the existing edit dialog).
- Empty-state hint overlay: "Click 'Add Hotspot' then click in the panorama to place it."

### 2. Wire it into `PanoramaModule.tsx`
- Inside the expanded scene card (where the hotspot list lives today), add the `SceneHotspotMap` above the list when `scene.panorama_url` exists.
- Pass the active scene's panorama URL, the `hotspotsQ.data` array, and an `onEdit` handler that sets `hotspotDialog`.
- Keep the list view underneath for batch actions (reorder, toggle, delete) — it stays the source of truth, the map is the visual identifier.

### 3. Enhance `HotspotPicker` to show context
- Accept an optional `otherHotspots` prop (id, yaw, pitch, title).
- Render them as faint grey markers so admins can see neighbours while placing a new one and avoid overlaps.
- The active picker marker stays green and is the one that updates on click.
- `PanoramaModule.tsx` passes the other scene hotspots (excluding the one being edited) into the picker.

### 4. Small UX polish in the hotspot row
- Add an "Identify" button (eye icon) on each list row that scrolls to / pulses the matching marker in the `SceneHotspotMap` via a transient `highlightId` state.

## Files touched

- `apps/admin/src/components/crm/modules/panorama/SceneHotspotMap.tsx` (new)
- `apps/admin/src/components/crm/modules/panorama/HotspotPicker.tsx` (add `otherHotspots`, render context markers)
- `apps/admin/src/components/crm/modules/PanoramaModule.tsx` (mount the map, pass other hotspots to the picker, add Identify button)

## Notes

- No schema changes — `parliament_panorama_hotspots` already has all needed fields.
- The map uses the existing public panorama URL, so no new permissions or buckets are needed.
- Re-uses Photo Sphere Viewer already bundled — no new dependencies.
