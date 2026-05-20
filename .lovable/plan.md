## Fix `/parliament-tour` panorama stitching

### Root cause
The viewer code is correct. The source files `apps/web/public/panorama/chamber-main.jpg` (4096×2048) and `chamber-main-mobile.jpg` (3072×1536) are valid 2:1 equirectangular, but the image's left/right edges do not match, so the 360° wrap creates a visible "overlap" — and the seam currently lands across the Speaker's area at default yaw 0.

### Fix (blend now)
Run an ImageMagick script that, for both desktop and mobile panoramas:

1. **Roll horizontally by 50% (image-width ÷ 2)** so the seam moves behind the viewer (yaw 180°). The Speaker's podium then sits cleanly at default yaw 0.
2. **Feather-blend a 256 px wrap band** across the new seam: copy a strip from one side, mirror onto the other with a horizontal alpha gradient, so left and right edges become pixel-identical.
3. **Re-export** at original dimensions and quality (JPEG q90), overwriting the existing files. The preview JPG and DB rows do not need to change.

```bash
# chamber-main.jpg (4096x2048)
magick chamber-main.jpg -roll +2048+0 \
  \( +clone -crop 256x2048+0+0 +repage \) \
  \( -clone 0 -crop 256x2048+3840+0 +repage -flop \) \
  -compose blend -define compose:args=50 -composite \
  -quality 90 chamber-main.jpg

# Same with width/2 = 1536 and band 192 for the mobile file
```

After running, verify by opening `/parliament-tour` and rotating 360° to confirm no visible seam in the Speaker area or behind.

### Follow-up (regenerate later)
Queue a fresh equirectangular generation with a prompt tuned for the ECOWAS chamber (Speaker's podium centered, hemicycle seating wrapping, matching edges). Track as a separate task — not part of this change.

### Files touched
- `apps/web/public/panorama/chamber-main.jpg` (overwritten)
- `apps/web/public/panorama/chamber-main-mobile.jpg` (overwritten)

No code, DB, or component changes.