/*
  # Initial Schema Setup for Sigma Platform

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `email` (text, nullable)
      - `created_at` (timestamp with timezone)
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, nullable)
      - `email` (text, nullable)
      - `image` (text, nullable)
      - `customer_id` (text, nullable) - Stripe customer ID
      - `price_id` (text, nullable) - Stripe price ID
      - `has_access` (boolean, default false)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on both tables
    - Public insert policy for leads (waitlist signups)
    - User-specific CRUD policies for profiles

  3. Functions & Triggers
    - `update_updated_at()` function for timestamp updates
    - `handle_new_user()` function for automatic profile creation
    - Triggers for profile management

  4. Performance
    - Indexes on frequently queried columns
*/

-- Create leads table for waitlist signups
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  name text,
  email text,
  image text,
  customer_id text,
  price_id text,
  has_access boolean DEFAULT false,
  created_at timestamptz DEFAULT (now() AT TIME ZONE 'UTC'::text),
  updated_at timestamptz DEFAULT (now() AT TIME ZONE 'UTC'::text)
);

-- Add foreign key constraint to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "insert_lead" ON leads;
DROP POLICY IF EXISTS "read_own_profile_data" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile_data" ON profiles;
DROP POLICY IF EXISTS "update_own_profile_data" ON profiles;
DROP POLICY IF EXISTS "delete_own_profile_data" ON profiles;

-- RLS Policies for leads table
CREATE POLICY "insert_lead" ON leads
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- RLS Policies for profiles table  
CREATE POLICY "read_own_profile_data" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "insert_own_profile_data" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_profile_data" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "delete_own_profile_data" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_has_access ON profiles(has_access);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);