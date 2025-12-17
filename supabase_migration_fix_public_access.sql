-- Fix RLS policy to allow everyone to view public banners

DROP POLICY IF EXISTS "Users can view own or public banners" ON banners;

-- Anyone can view public banners
-- Logged-in users can also view their own private banners
CREATE POLICY "Anyone can view public banners, users can view own banners" ON banners
FOR SELECT
USING (
  is_public = TRUE OR auth.uid() = user_id
);
