-- Add profile wizard completion tracking and module activation fields

-- Add wizard completion fields to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wizard_completed boolean DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wizard_step integer DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wizard_data jsonb DEFAULT '{}'::jsonb;

-- Add business interests fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_goals text[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skill_level text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- Create module activation tracking table
CREATE TABLE IF NOT EXISTS module_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_name text NOT NULL,
  activated_at timestamptz DEFAULT NOW(),
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'completed', 'paused')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  metadata jsonb DEFAULT '{}'::jsonb,
  last_activity timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, module_name)
);

-- Create daily goals tracking table
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
  goal_name text NOT NULL,
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  date date NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achieved_at timestamptz DEFAULT NOW(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE module_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for module_activations
CREATE POLICY "Users can view their own module activations"
  ON module_activations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module activations"
  ON module_activations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module activations"
  ON module_activations FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for user_goals
CREATE POLICY "Users can view their own goals"
  ON user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON user_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON user_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update completion percentage based on wizard completion
CREATE OR REPLACE FUNCTION update_profile_completion_on_wizard()
RETURNS TRIGGER AS $$
BEGIN
  -- If wizard is completed, ensure profile completion is at least 80%
  IF NEW.wizard_completed = true AND NEW.completion_percentage < 80 THEN
    NEW.completion_percentage = 80;
  END IF;
  
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wizard completion
CREATE TRIGGER update_profile_completion_on_wizard_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (OLD.wizard_completed IS DISTINCT FROM NEW.wizard_completed)
  EXECUTE FUNCTION update_profile_completion_on_wizard();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_activations_user_id ON module_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_module_activations_status ON module_activations(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_date ON user_goals(date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Update module_activations timestamp trigger
CREATE OR REPLACE FUNCTION update_module_activations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER module_activations_updated_at_trigger
  BEFORE UPDATE ON module_activations
  FOR EACH ROW
  EXECUTE FUNCTION update_module_activations_updated_at();

-- Update user_goals timestamp trigger
CREATE OR REPLACE FUNCTION update_user_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_goals_updated_at_trigger
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_user_goals_updated_at();