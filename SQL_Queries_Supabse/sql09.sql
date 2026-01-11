-- Fix: Allow public read access to categories for the gallery
-- This allows anonymous users to see category buttons in the public gallery
-- while keeping write operations restricted to admins only

CREATE POLICY "Public can read categories" ON categories
FOR SELECT USING (true);
