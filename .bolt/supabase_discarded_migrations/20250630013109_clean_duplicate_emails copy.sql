/*
  # Clean Duplicate Emails Migration
  
  This migration handles cleanup of any duplicate email entries that may have been created
  during development and ensures data integrity going forward.
  
  1. Remove any duplicate entries from user_profiles if they exist
  2. Add constraints to prevent future duplicates
  3. Clean up any orphaned records
*/

-- First, let's identify and clean up any potential issues
DO $$
BEGIN
  -- Check if we have any orphaned user_profiles (profiles without corresponding auth users)
  DELETE FROM user_profiles 
  WHERE id NOT IN (
    SELECT id FROM auth.users
  );
  
  -- If there are multiple user_profiles for the same user (shouldn't happen but just in case)
  -- Keep only the most recent one
  DELETE FROM user_profiles p1 
  WHERE EXISTS (
    SELECT 1 FROM user_profiles p2 
    WHERE p2.id = p1.id 
    AND p2.created_at > p1.created_at
  );
  
  RAISE NOTICE 'Cleaned up any duplicate or orphaned user profiles';
END $$;

-- Add a comment for documentation
COMMENT ON TABLE user_profiles IS 'Extended user profile data with business and preference information';

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Add a constraint to ensure data integrity (this should already exist via foreign key but let's be explicit)
DO $$
BEGIN
  -- Check if we need to add any additional constraints
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_id_fkey' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;