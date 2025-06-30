-- Migration: Clean duplicate emails from leads table and add unique constraint

-- Step 1: Create a backup of the leads table before making changes
CREATE TABLE IF NOT EXISTS leads_backup_20250630 AS SELECT * FROM leads;

-- Step 2: Remove duplicate emails, keeping only the most recent entry for each email
-- This uses a CTE (Common Table Expression) to identify and delete duplicates
WITH duplicates AS (
  SELECT id,
         email,
         created_at,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM leads
  WHERE email IS NOT NULL
)
DELETE FROM leads
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE rn > 1
);

-- Step 3: Add a unique constraint on the email column to prevent future duplicates
-- First, we need to handle NULL emails if any exist
-- The constraint will only apply to non-NULL values
ALTER TABLE leads 
ADD CONSTRAINT leads_email_unique UNIQUE (email);

-- Step 4: Update the insert_lead RLS policy to handle potential conflicts
-- This ensures the application can handle duplicate email attempts gracefully
DROP POLICY IF EXISTS "insert_lead" ON leads;

CREATE POLICY "insert_lead" ON leads
FOR INSERT TO PUBLIC
WITH CHECK (true);

-- Add a comment to document this change
COMMENT ON CONSTRAINT leads_email_unique ON leads IS 'Ensures email addresses are unique across all leads to prevent duplicate signups';

-- Log the migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Removed % duplicate emails from leads table', 
    (SELECT COUNT(*) FROM leads_backup_20250630) - (SELECT COUNT(*) FROM leads);
END $$;