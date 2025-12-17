-- Add is_public column to banners table
ALTER TABLE banners
ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow public access to public banners

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own banners" ON banners;

-- Create new SELECT policy: users can view their own banners OR public banners
CREATE POLICY "Users can view own or public banners" ON banners
FOR SELECT
USING (
  auth.uid() = user_id OR is_public = TRUE
);

-- Keep other policies unchanged (INSERT, UPDATE, DELETE remain user-specific)
