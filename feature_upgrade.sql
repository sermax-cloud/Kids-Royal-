-- 1. ADD 'FEATURED' COLUMN TO PRODUCTS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- 2. CREATE 'BLOG_POSTS' TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
    id text PRIMARY KEY,
    title text NOT NULL,
    summary text,
    content text,
    image text,
    category text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Blog
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public Access Policy for Blog (Same as products)
DROP POLICY IF EXISTS "Public Access Blog" ON blog_posts;
CREATE POLICY "Public Access Blog"
ON blog_posts FOR ALL USING (true) WITH CHECK (true);

-- 3. CREATE 'SITE_CONFIG' TABLE (For Banners/Headlines)
CREATE TABLE IF NOT EXISTS site_config (
    key text PRIMARY KEY,
    value text
);

-- Enable RLS for Config
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Public Access Policy for Config
DROP POLICY IF EXISTS "Public Access Config" ON site_config;
CREATE POLICY "Public Access Config"
ON site_config FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Config Values (so it's not empty)
INSERT INTO site_config (key, value) VALUES
('hero_headline', 'Give Your Baby the Royal Start in Life'),
('hero_sub', 'Welcome to a world of comfort, safety, and love.'),
('announcement', 'Free Delivery on Orders over GHS 500!')
ON CONFLICT (key) DO NOTHING;
