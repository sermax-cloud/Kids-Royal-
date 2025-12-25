-- Insert Default Blog Posts
INSERT INTO blog_posts (id, title, content, category) VALUES
(
    'post_baby_care',
    'Essential Baby Care Tips',
    'Caring for your little one can be overwhelming at first. Here are some golden rules to keep them happy and healthy: 
    - Sleep Safety: Always place your baby on their back to sleep to reduce SIDS risk. Keep the crib free of pillows and toys.
    - Bathing: You don''t need to bathe your newborn every day; 2-3 times a week is enough to protect their delicate skin barrier.
    - Bonding: Skin-to-skin contact isn''t just for the hospital. It regulates baby''s heart rate and builds a secure attachment.',
    'fa-solid fa-baby'
),
(
    'post_pregnancy',
    'A Healthy Pregnancy Guide',
    'Growing a life is hard work! Prioritize these pillars for a smoother journey:
    - Hydration: Drink at least 8-10 glasses of water daily. It helps form amniotic fluid and reduces swelling.
    - Nutrition: Focus on iron-rich foods (spinach, lean meat) and calcium for baby''s developing bones.
    - Rest: Listen to your body. If you''re tired, sleep. Your body is running a marathon every single day.',
    'fa-solid fa-person-pregnant'
),
(
    'post_checklist',
    'The Ultimate Newborn Checklist',
    'Don''t buy everything! Here are the absolute must-haves for the first 3 months:
    - Clothing: 6-10 onesies (zippers are better than buttons for night changes!), 4-6 sleepers, and socks.
    - Diapering: A generous supply of newborn diapers, gentle wipes, and a good barrier cream.
    - Must-Haves: A reliable digital thermometer, nasal aspirator, and burp cloths—lots of them!',
    'fa-solid fa-list-check'
),
(
    'post_wellness',
    'Mother Wellness & Recovery',
    'You cannot pour from an empty cup. Taking care of yourself is part of taking care of your baby.
    - Ask for Help: Accept meals, cleaning help, or babysitting. It takes a village.
    - Postpartum Checkups: Don''t skip your 6-week checkup. Discuss any mood changes openly with your doctor.
    - Grace: Your body changed for 9 months to grow a human; give it time to recover. You are doing a great job.',
    'fa-solid fa-heart-pulse'
)
ON CONFLICT (id) DO NOTHING;
