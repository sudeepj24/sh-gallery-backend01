-- Drop existing policies
DROP POLICY IF EXISTS "Public read categories" ON categories;

-- Create new policies that allow both read and write
CREATE POLICY "Allow all operations on categories" ON categories 
FOR ALL USING (true) WITH CHECK (true);

-- Also update products table policies
DROP POLICY IF EXISTS "Public read products" ON products;

CREATE POLICY "Allow all operations on products" ON products 
FOR ALL USING (true) WITH CHECK (true);
