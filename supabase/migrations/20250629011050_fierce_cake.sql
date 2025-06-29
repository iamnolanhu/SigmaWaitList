/*
  # Enhanced User Profiles for BasedSigma Platform

  1. New Tables
    - `user_profiles` - Extended user profile data
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `language` (text, default 'en')
      - `region` (text)
      - `stealth_mode` (boolean, default false)
      - `sdg_goals` (text array) - UN Sustainable Development Goals
      - `low_tech_access` (boolean, default false)
      - `business_type` (text)
      - `time_commitment` (text)
      - `capital_level` (text)
      - `completion_percentage` (integer, default 0)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on user_profiles table
    - Add user-specific CRUD policies
    
  3. Functions & Triggers
    - Auto-update updated_at timestamp on profile changes
    - Auto-create user_profile when new user signs up
*/

-- Create user_profiles table for enhanced user management
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY,
  name text,
  language text DEFAULT 'en',
  region text,
  stealth_mode boolean DEFAULT false,
  sdg_goals text[], -- UN Sustainable Development Goals
  low_tech_access boolean DEFAULT false,
  business_type text,
  time_commitment text,
  capital_level text,
  completion_percentage integer DEFAULT 0,
  created_at timestamptz DEFAULT (now() AT TIME ZONE 'UTC'::text),
  updated_at timestamptz DEFAULT (now() AT TIME ZONE 'UTC'::text),
  
  -- Foreign key to Supabase auth.users
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles table  
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration - create user_profile
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at on user_profile changes
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Trigger to create user_profile on user signup
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_profile();

-- Add useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_completion ON user_profiles(completion_percentage);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_type ON user_profiles(business_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON user_profiles(region);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at DESC);