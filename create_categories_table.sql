-- 4. CREATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    icon text DEFAULT 'fa-star',
    is_custom boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public Access Policy
DROP POLICY IF EXISTS "Public Access Categories" ON categories;
CREATE POLICY "Public Access Categories"
ON categories FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Categories (so they are always there)
INSERT INTO categories (id, name, icon, is_custom) VALUES
('baby-care', 'Baby Care', 'fa-baby-carriage', false),
('mother-care', 'Mother Care', 'fa-heart', false),
('feeding', 'Feeding Essentials', 'fa-mug-hot', false),
('skincare', 'Skincare', 'fa-soap', false),
('diapers', 'Diapers & Hygiene', 'fa-layer-group', false),
('gifts', 'Gifts', 'fa-gift', false)
ON CONFLICT (id) DO NOTHING;
