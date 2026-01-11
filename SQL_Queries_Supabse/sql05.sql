-- Add display_order column to categories table
ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update existing categories with initial order based on creation date
UPDATE categories 
SET display_order = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at) 
  FROM (SELECT id, created_at FROM categories) AS ordered_cats 
  WHERE ordered_cats.id = categories.id
);
