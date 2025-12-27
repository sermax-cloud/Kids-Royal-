-- Speed up filtering by Category (Backend Optimization)
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

-- Speed up filtering by Featured status
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (is_featured);

-- Speed up sorting by creation date
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);
