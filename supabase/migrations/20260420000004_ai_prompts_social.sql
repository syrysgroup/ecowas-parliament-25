-- Add social_ig AI prompt to existing ai_prompts site setting
UPDATE public.site_settings
SET value = value || '{"social_ig": "Write an Instagram caption for this ECOWAS Parliament update. Tone: informative and civic. Include 4-6 relevant hashtags at the end (e.g. #ECOWASParliament #WestAfrica #Governance). Max 2200 chars. Do not use markdown. Summary: {summary_en}"}'::jsonb
WHERE key = 'ai_prompts';
