-- Add the missing FK constraint so user deletion cascades to user_roles.
-- The original user_roles table was created with a plain uuid column (no REFERENCES),
-- meaning deleted auth users leave orphaned role rows. This fixes that.

-- Step 1: Remove any orphaned rows whose user_id no longer exists in auth.users.
-- These are left over from users deleted before the FK constraint existed.
DELETE FROM public.user_roles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 2: Add the FK constraint so future deletions cascade automatically.
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
