-- Create user_context_master table for storing AI-optimized user context
CREATE TABLE IF NOT EXISTS user_context_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  context_version INT DEFAULT 1,
  
  -- Structured context in YAML format for AI readability
  context_yaml TEXT NOT NULL,
  
  -- JSON backup for programmatic access
  context_json JSONB NOT NULL,
  
  -- Metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  update_count INT DEFAULT 0,
  
  -- Optimization fields
  context_hash TEXT, -- To detect changes
  size_bytes INT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for performance
CREATE INDEX idx_user_context_master_user_id ON user_context_master(user_id);
CREATE INDEX idx_user_context_master_updated ON user_context_master(last_updated);

-- Enable RLS
ALTER TABLE user_context_master ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own context" ON user_context_master
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user context" ON user_context_master
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update user context" ON user_context_master
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_context_master_updated_at 
  BEFORE UPDATE ON user_context_master 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to safely update context (with size limits)
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_context TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE user_context_master IS 'Stores AI-optimized user context in YAML format for the chatbot to understand user state, progress, and preferences';
COMMENT ON COLUMN user_context_master.context_yaml IS 'Human and AI readable YAML format of user context';
COMMENT ON COLUMN user_context_master.context_json IS 'Machine-readable JSON format for programmatic access';
COMMENT ON COLUMN user_context_master.context_hash IS 'MD5 hash of context to detect changes and avoid unnecessary updates';