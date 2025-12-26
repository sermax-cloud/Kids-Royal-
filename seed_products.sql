-- Add 'original_price' column if not exists (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'original_price') THEN
        ALTER TABLE products ADD COLUMN original_price text;
    END IF;
END
$$;

-- Add 'is_featured' column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured') THEN
        ALTER TABLE products ADD COLUMN is_featured boolean DEFAULT false;
    END IF;
END
$$;

-- Add 'is_sold_out' column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_sold_out') THEN
        ALTER TABLE products ADD COLUMN is_sold_out boolean DEFAULT false;
    END IF;
END
$$;

-- Clear existing data to avoid duplicates/conflicts before re-seeding
DELETE FROM products;

-- Insert Default Products
INSERT INTO products (id, name, category, price, original_price, image, benefit, description, is_featured) VALUES
(
    'bc1',
    'Aveeno Baby Daily Moisture Lotion',
    'baby-care',
    'GHS 120.00',
    'GHS 140.00',
    'https://images.unsplash.com/photo-1594828198751-2475475355a2?q=80&w=500&auto=format&fit=crop',
    'Nourishes sensitive skin for 24 hours.',
    'Fragrance-free formula with natural colloidal oatmeal.',
    true
),
(
    'bc2',
    'Johnson''s Head-to-Toe Wash',
    'baby-care',
    'GHS 85.00',
    NULL,
    'https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=500&auto=format&fit=crop',
    'No more tears formula.',
    'Ultra-mild cleanser for delicate skin and hair.',
    false
),
(
    'bc3',
    'Baby Grooming Kit',
    'baby-care',
    'GHS 65.00',
    'GHS 80.00',
    'https://images.unsplash.com/photo-1515488042361-25f468213b6e?q=80&w=500&auto=format&fit=crop',
    'Complete set for nail and hair care.',
    'Includes scissors, brush, comb, and nail file.',
    false
),
(
    'mc1',
    'Bio-Oil Skincare Oil',
    'mother-care',
    'GHS 150.00',
    NULL,
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=500&auto=format&fit=crop',
    'Improves appearance of stretch marks.',
    'Specialist skincare for scars, stretch marks, and uneven skin tone.',
    true
),
(
    'mc2',
    'Postpartum Recovery Belt',
    'mother-care',
    'GHS 200.00',
    'GHS 250.00',
    'https://images.unsplash.com/photo-1518449942765-bde3a26a5754?q=80&w=500&auto=format&fit=crop',
    'Support for abdominal recovery.',
    'Breathable, adjustable support for postpartum healing.',
    false
),
(
    'mc3',
    'Nursing Pillow',
    'mother-care',
    'GHS 180.00',
    NULL,
    'https://images.unsplash.com/photo-1629858348630-6d4329cf827c?q=80&w=500&auto=format&fit=crop',
    'Comfortable support for breastfeeding.',
    'Ergonomic design to reduce back and neck strain.',
    false
),
(
    'fe1',
    'Philips Avent Natural Baby Bottle',
    'feeding',
    'GHS 95.00',
    'GHS 110.00',
    'https://plus.unsplash.com/premium_photo-1681284562547-0e6259074ed2?q=80&w=400&auto=format&fit=crop',
    'Natural latch-on for easy combination.',
    'Anti-colic valve designed to reduce colic and discomfort.',
    true
),
(
    'fe2',
    'Silicone Baby Bibs (Set of 2)',
    'feeding',
    'GHS 55.00',
    NULL,
    'https://images.unsplash.com/photo-1594918739194-e3c79c32df4c?q=80&w=500&auto=format&fit=crop',
    'Waterproof and easy to clean.',
    'Soft silicone with crumb catcher pocket.',
    false
),
(
    'sc1',
    'Cetaphil Baby Wash & Shampoo',
    'skincare',
    'GHS 110.00',
    NULL,
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=500&auto=format&fit=crop',
    'Tear-free formula with organic calendula.',
    'Gently cleanses baby''s soft skin without drying.',
    false
),
(
    'sc2',
    'Sudocrem Antiseptic Healing Cream',
    'skincare',
    'GHS 75.00',
    NULL,
    'https://images.unsplash.com/photo-1556228392-6284f33b1297?q=80&w=500&auto=format&fit=crop',
    'Effective relief for diaper rash.',
    'Soothes sore skin and protects against irritants.',
    false
),
(
    'dp1',
    'Pampers Premium Care (Size 2)',
    'diapers',
    'GHS 185.00',
    NULL,
    'https://images.unsplash.com/photo-1594828198751-2475475355a2?q=80&w=500&auto=format&fit=crop',
    'Softest comfort and best skin protection.',
    'Silky soft materials and absorbent channels.',
    true
),
(
    'dp2',
    'Huggies Natural Care Wipes',
    'diapers',
    'GHS 35.00',
    NULL,
    'https://images.unsplash.com/photo-1574519967652-3269d7890aa3?q=80&w=500&auto=format&fit=crop',
    '99% water, fragrance-free.',
    'Thick and soft wipes for gentle cleaning.',
    false
),
(
    'gf1',
    'Newborn Starter Set',
    'gifts',
    'GHS 250.00',
    'GHS 300.00',
    'https://images.unsplash.com/photo-1522771753062-811c79cb5f44?q=80&w=500&auto=format&fit=crop',
    'The perfect welcome home gift.',
    'Includes onesies, socks, cap, and mittens.',
    false
),
(
    'gf2',
    'Plush Elephant Toy',
    'gifts',
    'GHS 90.00',
    NULL,
    'https://images.unsplash.com/photo-1556956291-a67b55d7870a?q=80&w=500&auto=format&fit=crop',
    'Soft, cuddly companion.',
    'Safe for all ages, ultra-soft material.',
    false
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    benefit = EXCLUDED.benefit,
    description = EXCLUDED.description,
    is_featured = EXCLUDED.is_featured;
