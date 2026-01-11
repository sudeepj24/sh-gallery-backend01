ALTER TABLE products ADD COLUMN product_id TEXT;
ALTER TABLE products ADD CONSTRAINT unique_product_id UNIQUE (product_id);
