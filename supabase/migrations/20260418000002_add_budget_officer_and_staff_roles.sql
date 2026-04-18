-- Extend app_role enum with new roles.
-- Must be committed in its own transaction before the enum values can be
-- referenced in policies, functions, or inserts (PostgreSQL 55P04 restriction).
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'budget_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';
