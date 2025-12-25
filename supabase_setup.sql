-- 1. FIX TABLE PERMISSIONS (Fixes "violates row-level security policy")
-- This allows anyone (public) to Read, Add, Edit, and Delete products.
-- Required because we are using a simple shared admin password, not Supabase Auth.

-- Enable RLS just to be safe, then add the open policy
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON products;
DROP POLICY IF EXISTS "Allow public access" ON products;

-- Create the specific policy that allows EVERYTHING
CREATE POLICY "Public Access"
ON products
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. FIX STORAGE PERMISSIONS (Fixes Image Uploads)
-- This allows uploading images to the 'images' bucket

-- Make sure the bucket exists (You still need to create it in the dashboard if it doesn't exist, but this helps)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to images bucket
CREATE POLICY "Public Images Access"
ON storage.objects
FOR ALL
USING ( bucket_id = 'images' )
WITH CHECK ( bucket_id = 'images' );
