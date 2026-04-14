-- Allow create-user edge function to insert profiles without requiring
-- country and full_name (they'll be filled in during CompleteProfile).
ALTER TABLE public.profiles ALTER COLUMN country   SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';
