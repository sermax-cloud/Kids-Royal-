-- Add 'original_price' column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price text;

-- (Optional) If you want to use numeric types later, we can cast, but for now text "GHS 100.00" is fine matching your existing schema.
