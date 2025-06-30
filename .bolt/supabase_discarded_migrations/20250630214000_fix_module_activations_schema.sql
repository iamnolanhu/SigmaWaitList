-- Fix module_activations table schema to match expected structure
-- Add missing columns that were in the original migration

-- Add status column (keeping is_active for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'module_activations' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE module_activations 
    ADD COLUMN status TEXT DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'completed', 'paused'));
    
    -- Populate status based on existing is_active column
    UPDATE module_activations 
    SET status = CASE 
      WHEN is_active = true THEN 'active'
      ELSE 'inactive'
    END;
  END IF;
END $$;

-- Add progress column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'module_activations' 
    AND column_name = 'progress'
  ) THEN
    ALTER TABLE module_activations 
    ADD COLUMN progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
  END IF;
END $$;

-- Add last_activity column (keeping last_used_at for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'module_activations' 
    AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE module_activations 
    ADD COLUMN last_activity TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    
    -- Populate last_activity based on existing last_used_at column
    UPDATE module_activations 
    SET last_activity = COALESCE(last_used_at, activated_at, created_at);
  END IF;
END $$;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_module_activations_status ON module_activations(status);
CREATE INDEX IF NOT EXISTS idx_module_activations_progress ON module_activations(progress);
CREATE INDEX IF NOT EXISTS idx_module_activations_last_activity ON module_activations(last_activity);

-- Ensure the unique constraint exists for user_id + module_name (if not already covered by user_id + module_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_module_activations_user_module_name 
ON module_activations(user_id, module_name);

-- Update trigger already exists, but let's ensure it's properly set
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  -- Also update last_activity when the record is updated
  IF TG_TABLE_NAME = 'module_activations' THEN
    NEW.last_activity = timezone('utc'::text, now());
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger to include last_activity update
DROP TRIGGER IF EXISTS update_module_activations_updated_at ON module_activations;
CREATE TRIGGER update_module_activations_updated_at 
  BEFORE UPDATE ON module_activations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 