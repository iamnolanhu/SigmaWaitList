/*
  # Handle Authentication Edge Cases and Improve Reliability
  
  This migration addresses additional edge cases that can cause auth failures:
  1. Handle cases where auth.uid() is null during signup
  2. Add better error handling for profile creation
  3. Ensure data consistency during concurrent operations
  4. Add fallback mechanisms for failed profile creation
*/

-- =======================
-- Create a more robust profile creation function
-- =======================

CREATE OR REPLACE FUNCTION ensure_user_profile(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Try to create profile if it doesn't exist
  INSERT INTO public.user_profiles (id)
  VALUES (user_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Return true if profile exists now
  RETURN EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id);
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Failed to ensure user profile for %: %', user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION ensure_user_profile TO authenticated, service_role;

-- =======================
-- Improve the trigger to be more resilient
-- =======================

CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Use the more robust function
  PERFORM ensure_user_profile(NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Always return NEW to not block user creation
    RAISE WARNING 'Profile creation failed for user %, but user creation will continue: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- Add a function to handle delayed profile creation
-- =======================

CREATE OR REPLACE FUNCTION create_missing_user_profiles()
RETURNS INTEGER AS $$
DECLARE
  created_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Find users without profiles
  FOR user_record IN 
    SELECT au.id 
    FROM auth.users au 
    LEFT JOIN public.user_profiles up ON au.id = up.id 
    WHERE up.id IS NULL
  LOOP
    -- Try to create missing profile
    IF ensure_user_profile(user_record.id) THEN
      created_count := created_count + 1;
    END IF;
  END LOOP;
  
  RETURN created_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role only (for maintenance)
GRANT EXECUTE ON FUNCTION create_missing_user_profiles TO service_role;

-- =======================
-- Add better error handling for user context
-- =======================

CREATE OR REPLACE FUNCTION safe_update_user_context(
  p_user_id UUID,
  p_context_yaml TEXT DEFAULT NULL,
  p_context_json JSONB DEFAULT NULL,
  p_context_hash TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_size_bytes INT;
  v_max_size INT := 51200; -- 50KB limit
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL THEN
    RAISE WARNING 'Cannot update context: user_id is null';
    RETURN FALSE;
  END IF;
  
  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE WARNING 'Cannot update context: user % does not exist', p_user_id;
    RETURN FALSE;
  END IF;
  
  -- Use defaults if not provided
  p_context_yaml := COALESCE(p_context_yaml, '# User context not yet generated');
  p_context_json := COALESCE(p_context_json, '{}'::jsonb);
  p_context_hash := COALESCE(p_context_hash, md5(p_context_yaml));
  
  -- Calculate size
  v_size_bytes := length(p_context_yaml) + length(p_context_json::text);
  
  -- Check size limit
  IF v_size_bytes > v_max_size THEN
    RAISE WARNING 'Context size (% bytes) exceeds limit of 50KB for user %', v_size_bytes, p_user_id;
    RETURN FALSE;
  END IF;
  
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
    
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to update user context for %: %', p_user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION safe_update_user_context TO authenticated, service_role;

-- =======================
-- Add policies for anon users in edge cases
-- =======================

-- Sometimes signup process involves anon users briefly
CREATE POLICY "Allow anon profile creation during signup" ON user_profiles
  FOR INSERT TO anon
  WITH CHECK (
    -- Only allow if the ID corresponds to a user that exists in auth.users
    id IN (SELECT id FROM auth.users)
  );

-- =======================
-- Add helpful utility views
-- =======================

-- View to check profile completion status
CREATE OR REPLACE VIEW user_profile_status AS
SELECT 
  au.id,
  au.email,
  au.created_at as user_created_at,
  up.id IS NOT NULL as has_profile,
  up.completion_percentage,
  up.created_at as profile_created_at,
  ucm.id IS NOT NULL as has_context,
  ucm.last_updated as context_updated_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN user_context_master ucm ON au.id = ucm.user_id;

-- Grant access to authenticated users for their own data
CREATE POLICY "Users can view their own status" ON user_profile_status
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Grant full access to service role
GRANT SELECT ON user_profile_status TO service_role;

-- =======================
-- Add maintenance functions
-- =======================

-- Function to clean up orphaned records
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS TEXT AS $$
DECLARE
  profiles_cleaned INTEGER;
  context_cleaned INTEGER;
  result_text TEXT;
BEGIN
  -- Clean up user_profiles for non-existent users
  DELETE FROM user_profiles 
  WHERE id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS profiles_cleaned = ROW_COUNT;
  
  -- Clean up user_context_master for non-existent users
  DELETE FROM user_context_master 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS context_cleaned = ROW_COUNT;
  
  result_text := format('Cleaned up %s orphaned profiles and %s orphaned contexts', 
                       profiles_cleaned, context_cleaned);
  
  RAISE NOTICE '%', result_text;
  RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant to service role only
GRANT EXECUTE ON FUNCTION cleanup_orphaned_data TO service_role;

-- =======================
-- Add comments for documentation
-- =======================

COMMENT ON FUNCTION ensure_user_profile IS 'Safely creates a user profile if it does not exist, with proper error handling';
COMMENT ON FUNCTION safe_update_user_context IS 'Updates user context with validation and error handling';
COMMENT ON FUNCTION create_missing_user_profiles IS 'Maintenance function to create profiles for users who are missing them';
COMMENT ON FUNCTION cleanup_orphaned_data IS 'Maintenance function to remove orphaned profile and context data';

RAISE NOTICE 'Authentication edge case handling has been improved';