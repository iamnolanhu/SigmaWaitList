/*
  # Fix Dual Table RLS Issues - Comprehensive Solution
  
  This migration addresses the core issue: there are TWO profile tables
  1. `profiles` - basic profile data (created first)
  2. `user_profiles` - extended profile data (created later)
  
  The frontend code queries BOTH tables, but RLS policies are blocking access.
  This migration ensures both tables work properly together.
  
  Issues being fixed:
  - 401 Unauthorized errors for both tables
  - RLS policies blocking legitimate operations
  - Conflicting triggers between tables
  - Missing service role policies
*/

-- =======================
-- Fix profiles table RLS policies (the original table)
-- =======================

-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "read_own_profile_data" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile_data" ON profiles;
DROP POLICY IF EXISTS "update_own_profile_data" ON profiles;
DROP POLICY IF EXISTS "delete_own_profile_data" ON profiles;

-- Create comprehensive policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is authenticated and creating their own profile
    (auth.uid() = id) 
    OR 
    -- Allow service role for system operations (triggers, etc.)
    (auth.role() = 'service_role')
    OR
    -- Allow during signup process when auth.uid() might not be immediately available
    (id IN (SELECT id FROM auth.users))
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR 
    auth.role() = 'service_role'
  )
  WITH CHECK (
    auth.uid() = id 
    OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE 
  USING (
    auth.uid() = id 
    OR 
    auth.role() = 'service_role'
  );

-- Add service role full access policy for profiles
CREATE POLICY "Service role full access" ON profiles
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =======================
-- Fix user_profiles table RLS policies (enhanced table)
-- =======================

-- Drop existing policies for user_profiles (they may conflict)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- Create comprehensive policies for user_profiles table
CREATE POLICY "Users can view own user_profile" ON user_profiles
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Allow user_profile creation" ON user_profiles
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is authenticated and creating their own profile
    (auth.uid() = id) 
    OR 
    -- Allow service role for system operations (triggers, etc.)
    (auth.role() = 'service_role')
    OR
    -- Allow during signup process when auth.uid() might not be immediately available
    (id IN (SELECT id FROM auth.users))
  );

CREATE POLICY "Users can update own user_profile" ON user_profiles
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR 
    auth.role() = 'service_role'
  )
  WITH CHECK (
    auth.uid() = id 
    OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can delete own user_profile" ON user_profiles
  FOR DELETE 
  USING (
    auth.uid() = id 
    OR 
    auth.role() = 'service_role'
  );

-- Add service role full access policy for user_profiles
CREATE POLICY "Service role user_profiles access" ON user_profiles
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =======================
-- Fix the trigger functions to handle both tables properly
-- =======================

-- Update the original handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set service role for this operation
  PERFORM set_config('role', 'service_role', true);
  
  -- Insert into profiles table (basic profile)
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  -- Reset role
  PERFORM set_config('role', 'authenticated', true);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Reset role in case of error
    PERFORM set_config('role', 'authenticated', true);
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create basic profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user_profile function to work better
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Set service role for this operation
  PERFORM set_config('role', 'service_role', true);
  
  -- Insert into user_profiles table (extended profile)
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Reset role
  PERFORM set_config('role', 'authenticated', true);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Reset role in case of error
    PERFORM set_config('role', 'authenticated', true);
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create extended profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- Ensure both triggers are properly set up
-- =======================

-- Drop existing triggers to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Create trigger for basic profiles table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create trigger for extended user_profiles table
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_profile();

-- =======================
-- Add policies for anon users during signup edge cases
-- =======================

-- Sometimes signup process involves anon users briefly
CREATE POLICY "Allow anon basic profile creation during signup" ON profiles
  FOR INSERT TO anon
  WITH CHECK (
    -- Only allow if the ID corresponds to a user that exists in auth.users
    id IN (SELECT id FROM auth.users)
  );

CREATE POLICY "Allow anon extended profile creation during signup" ON user_profiles
  FOR INSERT TO anon
  WITH CHECK (
    -- Only allow if the ID corresponds to a user that exists in auth.users
    id IN (SELECT id FROM auth.users)
  );

-- =======================
-- Grant necessary permissions
-- =======================

-- Ensure service role has full access to both tables
GRANT ALL ON profiles TO service_role;
GRANT ALL ON user_profiles TO service_role;

-- Ensure authenticated users can access both tables
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;

-- =======================
-- Create utility functions for profile management
-- =======================

-- Function to ensure both profile records exist for a user
CREATE OR REPLACE FUNCTION ensure_complete_user_profile(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Ensure basic profile exists
  INSERT INTO public.profiles (id)
  VALUES (user_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Ensure extended profile exists
  INSERT INTO public.user_profiles (id)
  VALUES (user_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Return true if both profiles exist now
  RETURN (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) AND
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id)
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Failed to ensure complete profile for %: %', user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION ensure_complete_user_profile TO authenticated, service_role;

-- =======================
-- Add helpful comments
-- =======================

COMMENT ON POLICY "Allow profile creation" ON profiles IS 'Allows basic profile creation by users and system operations including triggers';
COMMENT ON POLICY "Allow user_profile creation" ON user_profiles IS 'Allows extended profile creation by users and system operations including triggers';
COMMENT ON FUNCTION ensure_complete_user_profile IS 'Ensures both basic and extended profile records exist for a user';

-- =======================
-- Final verification and cleanup
-- =======================

-- Create missing indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_auth_lookup ON profiles(id) WHERE id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_lookup ON user_profiles(id) WHERE id = auth.uid();

RAISE NOTICE 'Dual table RLS policies have been fixed. Both profiles and user_profiles tables should now work properly during signup and normal operations.';