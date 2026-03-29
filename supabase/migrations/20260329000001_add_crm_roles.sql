-- Migration: Expand app_role enum with CRM staff roles
-- Must run before add_crm_tables migration

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'project_director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'programme_lead';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'website_editor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'communications_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance_coordinator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'logistics_coordinator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sponsor_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'consultant';
