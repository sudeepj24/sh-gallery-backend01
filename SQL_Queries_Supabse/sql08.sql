-- Migration: Add display_order column to products table
-- Run this in your Supabase SQL editor

-- Add display_order column with default values
ALTER TABLE products 
ADD COLUMN display_order INTEGER DEFAULT 999;

-- Update existing products with sequential display_order based on created_at
WITH ordered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM products
)
UPDATE products 
SET display_order = ordered_products.row_num
FROM ordered_products 
WHERE products.id = ordered_products.id;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);

-- Update the products table to make display_order NOT NULL
ALTER TABLE products 

ALTER COLUMN display_order SET NOT NULL;
