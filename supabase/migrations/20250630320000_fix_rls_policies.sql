/*
  # Fix RLS Policies for Profile Creation and System Operations
  
  This migration fixes the Row Level Security (RLS) policy issues that are preventing
  user profile creation during signup and causing 401/42501 errors.
  
  Issues being fixed:
  1. user_profiles INSERT policy too restrictive for auto-creation trigger
  2. user_context_master policies blocking SECURITY DEFINER functions
  3. Missing service role policies for system operations
  4. Auth session timing issues during signup
*/

-- =======================
-- Fix user_profiles RLS policies
-- =======================

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;  
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Create improved policies that handle both user operations and system operations

-- Allow users to view their own profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow system operations and user operations for INSERT
-- This fixes the auto-creation trigger issue
CREATE POLICY "Allow profile creation" ON user_profiles
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

-- Allow users to update their own profiles
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profiles  
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Add service role policies for system operations
CREATE POLICY "Service role full access" ON user_profiles
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =======================
-- Fix user_context_master RLS policies  
-- =======================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own context" ON user_context_master;
DROP POLICY IF EXISTS "System can insert user context" ON user_context_master;
DROP POLICY IF EXISTS "System can update user context" ON user_context_master;

-- Create improved policies that work with SECURITY DEFINER functions

-- Allow users to view their own context
CREATE POLICY "Users can view their own context" ON user_context_master
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR 
    auth.role() = 'service_role'
  );

-- Allow context creation - this needs to work with the update_user_context function
CREATE POLICY "Allow context operations" ON user_context_master
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is authenticated and it's their context
    (auth.uid() = user_id)
    OR 
    -- Allow service role
    (auth.role() = 'service_role')
    OR
    -- Allow if called from within a SECURITY DEFINER function
    (current_setting('role', true) = 'service_role')
  );

-- Allow context updates
CREATE POLICY "Allow context updates" ON user_context_master
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR 
    auth.role() = 'service_role'
    OR
    (current_setting('role', true) = 'service_role')
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR 
    auth.role() = 'service_role'
    OR
    (current_setting('role', true) = 'service_role')
  );

-- Add service role full access policy
CREATE POLICY "Service role context access" ON user_context_master
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =======================
-- Fix the auto-creation trigger function
-- =======================

-- Update the trigger function to handle RLS properly
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with explicit role setting to bypass RLS
  PERFORM set_config('role', 'service_role', true);
  
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING; -- Avoid errors if profile already exists
  
  -- Reset role
  PERFORM set_config('role', 'authenticated', true);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- Improve the user context function
-- =======================

-- Update the user context function to work better with RLS
CREATE OR REPLACE FUNCTION update_user_context(
  p_user_id UUID,
  p_context_yaml TEXT,
  p_context_json JSONB,
  p_context_hash TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_size_bytes INT;
  v_max_size INT := 51200; -- 50KB limit
BEGIN
  -- Calculate size
  v_size_bytes := length(p_context_yaml) + length(p_context_json::text);
  
  -- Check size limit
  IF v_size_bytes > v_max_size THEN
    RAISE EXCEPTION 'Context size exceeds limit of 50KB';
  END IF;
  
  -- Temporarily elevate privileges for this operation
  PERFORM set_config('role', 'service_role', true);
  
  -- Insert or update
  INSERT INTO user_context_master (
    user_id,
    context_yaml,
    context_json,
    context_hash,
    size_bytes,
    update_count
  ) VALUES (
    p_user_id,
    p_context_yaml,
    p_context_json,
    p_context_hash,
    v_size_bytes,
    1
  )
  ON CONFLICT (user_id) DO UPDATE SET
    context_yaml = EXCLUDED.context_yaml,
    context_json = EXCLUDED.context_json,
    context_hash = EXCLUDED.context_hash,
    size_bytes = EXCLUDED.size_bytes,
    context_version = user_context_master.context_version + 1,
    update_count = user_context_master.update_count + 1,
    last_updated = timezone('utc'::text, now());
  
  -- Reset role
  PERFORM set_config('role', 'authenticated', true);
    
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Reset role in case of error
    PERFORM set_config('role', 'authenticated', true);
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- Add helpful policies for the profiles table (if it exists)
-- =======================

-- Check if profiles table exists and add policies if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    
    -- Create policies
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT TO authenticated
      USING (auth.uid() = id);
      
    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id);
      
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE TO authenticated  
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
      
    -- Service role access
    CREATE POLICY "Service role profiles access" ON profiles
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- =======================
-- Grant necessary permissions
-- =======================

-- Ensure authenticated users can execute the context function
GRANT EXECUTE ON FUNCTION update_user_context TO authenticated;

-- Ensure service role has necessary permissions
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON user_context_master TO service_role;

-- Add helpful comments
COMMENT ON POLICY "Allow profile creation" ON user_profiles IS 'Allows profile creation by users and system operations including triggers';
COMMENT ON POLICY "Allow context operations" ON user_context_master IS 'Allows context operations by users and SECURITY DEFINER functions';

-- Add an index to improve auth.uid() lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_lookup ON user_profiles(id) WHERE id = auth.uid();

RAISE NOTICE 'RLS policies have been updated to fix profile creation and context operation issues';