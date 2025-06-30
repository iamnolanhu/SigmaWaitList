-- Create sub_module_completions table for tracking individual sub-module progress
CREATE TABLE IF NOT EXISTS sub_module_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id VARCHAR(10) NOT NULL, -- e.g., 'MOD_101'
  sub_module_id VARCHAR(15) NOT NULL, -- e.g., 'SUB_101_1'
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  data JSONB DEFAULT '{}'::jsonb, -- Sub-module specific data (form values, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, sub_module_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sub_module_completions_user_id ON sub_module_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_module_completions_module_id ON sub_module_completions(module_id);
CREATE INDEX IF NOT EXISTS idx_sub_module_completions_user_module ON sub_module_completions(user_id, module_id);

-- Enable RLS
ALTER TABLE sub_module_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own sub-module completions" ON sub_module_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sub-module completions" ON sub_module_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sub-module completions" ON sub_module_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sub-module completions" ON sub_module_completions
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_sub_module_completions_updated_at 
  BEFORE UPDATE ON sub_module_completions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();