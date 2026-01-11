-- Enable authentication
-- This should already be enabled in Supabase

-- Create admin_users table to track who can access admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to read their own data
CREATE POLICY "Admins can read own data" ON admin_users
FOR SELECT USING (auth.uid() = id);

-- Update existing RLS policies to require admin authentication
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
DROP POLICY IF EXISTS "Allow all operations on products" ON products;

-- Categories policies - require admin authentication
CREATE POLICY "Admins can read categories" ON categories
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can insert categories" ON categories
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can update categories" ON categories
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can delete categories" ON categories
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);

-- Products policies - require admin authentication for write, public read
CREATE POLICY "Public can read products" ON products
FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON products
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can update products" ON products
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can delete products" ON products
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);

-- Storage policies for gallery-images bucket
-- Allow public read access to images
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery-images');

-- Allow authenticated admins to upload/delete images
CREATE POLICY "Admins can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-images' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery-images' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);