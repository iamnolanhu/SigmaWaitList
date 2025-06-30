-- Create module_activations table if it doesn't exist
CREATE TABLE IF NOT EXISTS module_activations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id VARCHAR(10) NOT NULL, -- Fixed module ID like 'MOD_101'
  module_name TEXT NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'completed', 'paused')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  outputs JSONB DEFAULT '{}'::jsonb, -- Documents, integrations, etc.
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, module_id)
);

-- Add/modify columns if table already exists
DO $$ 
BEGIN
  -- Handle module_id column (convert from UUID to VARCHAR if needed)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'module_activations' 
    AND column_name = 'module_id'
    AND data_type = 'uuid'
  ) THEN
    -- Drop the old constraint if it exists
    ALTER TABLE module_activations DROP CONSTRAINT IF EXISTS module_activations_user_id_module_name_key;
    -- Convert UUID to VARCHAR
    ALTER TABLE module_activations ALTER COLUMN module_id TYPE VARCHAR(10) USING module_id::text;
    -- Add new unique constraint
    ALTER TABLE module_activations ADD CONSTRAINT module_activations_user_id_module_id_key UNIQUE(user_id, module_id);
  ELSIF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'module_activations' 
    AND column_name = 'module_id'
  ) THEN
    ALTER TABLE module_activations 
    ADD COLUMN module_id VARCHAR(10) NOT NULL DEFAULT 'MOD_000';
  END IF;
  
  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'module_activations' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE module_activations 
    ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add completed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'module_activations' 
    AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE module_activations 
    ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add outputs column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'module_activations' 
    AND column_name = 'outputs'
  ) THEN
    ALTER TABLE module_activations 
    ADD COLUMN outputs JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_module_activations_user_id ON module_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_module_activations_module_name ON module_activations(module_name);
CREATE INDEX IF NOT EXISTS idx_module_activations_status ON module_activations(status);
CREATE INDEX IF NOT EXISTS idx_module_activations_metadata ON module_activations USING gin(metadata);

-- Enable RLS
ALTER TABLE module_activations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own module activations" ON module_activations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module activations" ON module_activations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module activations" ON module_activations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own module activations" ON module_activations
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_module_activations_updated_at ON module_activations;
CREATE TRIGGER update_module_activations_updated_at 
  BEFORE UPDATE ON module_activations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();