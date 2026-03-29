

## Plan: Hero Text Visibility & Cleanup

### Changes to `src/components/home/HeroSection.tsx`

1. **Remove the 25th Anniversary logo block** — Delete the entire right side of the dual logo row (the divider line + anniversary logo + "25th Anniversary" + "EP25 · 2025" text). Keep only the ECOWAS Parliament logo.

2. **Change eyebrow pill text color to white** — Change `text-primary` to `text-white` and `border-primary/50` to `border-white/50`, `bg-primary/10` to `bg-white/10` on line 103. Also change the pulse dot to `bg-white`.

3. **Change stats numbers to white** — Line 143: change `text-primary` to `text-white`.

4. **Change stats labels to white** — Line 146-147: change `text-primary-foreground/40` to `text-white/70`.

