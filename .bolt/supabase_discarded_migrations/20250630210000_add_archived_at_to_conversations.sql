-- Add archived_at column to chat_conversations table
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Create an index for archived conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_archived_at 
ON public.chat_conversations(archived_at) 
WHERE archived_at IS NOT NULL;

-- Update the updated_at trigger to also update when archived
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chat_conversations_updated_at') THEN
    CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;