/*
  # Create profile trigger for new users
  
  This migration creates a trigger that automatically creates a profile
  record when a new user signs up via auth.users
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at, has_access)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW(),
    false  -- Default to no access until payment/approval
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create profiles for any existing users who don't have one
INSERT INTO public.profiles (id, email, created_at, updated_at, has_access)
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.created_at,
  false
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);