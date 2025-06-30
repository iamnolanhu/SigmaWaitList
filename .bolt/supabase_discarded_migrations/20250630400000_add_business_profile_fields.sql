-- Add missing business profile fields to user_profiles table
-- These fields are used in BusinessProfileTab.tsx but were missing from the database

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS business_model TEXT,
ADD COLUMN IF NOT EXISTS business_stage TEXT,
ADD COLUMN IF NOT EXISTS target_market TEXT,
ADD COLUMN IF NOT EXISTS revenue_goal TEXT;

-- Add comments to document the purpose of each field
COMMENT ON COLUMN public.user_profiles.business_model IS 'How the business generates revenue (e.g., subscription, one-time purchase, marketplace)';
COMMENT ON COLUMN public.user_profiles.business_stage IS 'Current stage of the business (e.g., idea, MVP, growing, scaling)';
COMMENT ON COLUMN public.user_profiles.target_market IS 'Target customer segment or market description';
COMMENT ON COLUMN public.user_profiles.revenue_goal IS 'Revenue targets or financial goals';