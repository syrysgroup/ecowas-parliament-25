

## Plan: Four Fixes

### 1. Parliament Page — Vision & Impact Messaging Redesign
The Parliament page (lines 148-155, 184-213, 30-35, 278-286) already contains the updated messaging from a previous iteration. **No changes needed** — the hero, "Why This Matters" section, objectives, and Vision 2050 quote block already match the requested content.

### 2. Stakeholders Module — Create Missing Table & Storage Bucket
**Root cause**: The `stakeholder_profiles` table does not exist in the database, and the code uploads to an `avatars` storage bucket that also doesn't exist.

**Fix**:
- Create a migration for the `stakeholder_profiles` table with columns: `id`, `name`, `title`, `image_url`, `category`, `display_order`, `is_active`, `created_at`, `updated_at`
- Enable RLS with policies: admins/super_admins have full CRUD, public can SELECT where `is_active = true`
- Create the `avatars` storage bucket (or switch the upload code to use the existing `team-avatars` bucket instead — simpler approach)
- Update `StakeholdersModule.tsx` to use `team-avatars` bucket instead of `avatars`

### 3. Site Content CRM Module — Add Delete (CRUD) Functionality
**Current state**: The module supports Create (new sections) and Update (save), but lacks Delete.

**Fix**:
- Add a delete button to each `SectionEditor` card with confirmation dialog
- Add a delete mutation that removes the row from `site_content`
- The existing save-on-click pattern is already in place; no auto-save changes needed

### 4. News & Event Images — Fit Properly in Placeholders
**Current state**: Both pages use `aspect-[4/5]` with `object-cover`, which crops landscape images badly.

**Fix**:
- Change the image aspect ratio from `aspect-[4/5]` to `aspect-video` (16:9) on both News and Events pages — this better accommodates typical uploaded photos
- Keep `object-cover` so images fill the container without distortion

### Technical Details

**Migration SQL** (stakeholder_profiles):
```sql
CREATE TABLE public.stakeholder_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  image_url text,
  category text NOT NULL DEFAULT 'leadership',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stakeholder_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage stakeholders" ON public.stakeholder_profiles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active stakeholders" ON public.stakeholder_profiles
  FOR SELECT TO public
  USING (is_active = true);
```

**Files modified**:
- `src/components/crm/modules/StakeholdersModule.tsx` — change bucket from `avatars` to `team-avatars`
- `src/components/crm/modules/SiteContentModule.tsx` — add delete button + mutation per section
- `src/pages/News.tsx` — change `aspect-[4/5]` to `aspect-video`
- `src/pages/Events.tsx` — change `aspect-[4/5]` to `aspect-video`

