const products = [
    // Baby Care
    {
        id: 'bc1',
        name: "Aveeno Baby Daily Moisture Lotion",
        category: "baby-care",
        price: "GHS 120.00",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=500&auto=format&fit=crop",
        benefit: "Nourishes sensitive skin for 24 hours.",
        description: "Fragrance-free formula with natural colloidal oatmeal."
    },
    {
        id: 'bc2',
        name: "Johnson's Head-to-Toe Wash",
        category: "baby-care",
        price: "GHS 85.00",
        image: "johnsons-wash.png",
        benefit: "No more tears formula.",
        description: "Ultra-mild cleanser for delicate skin and hair."
    },
    {
        id: 'bc3',
        name: "Baby Grooming Kit",
        category: "baby-care",
        price: "GHS 65.00",
        image: "grooming-kit.jpg",
        benefit: "Complete set for nail and hair care.",
        description: "Includes scissors, brush, comb, and nail file."
    },

    // Mother Care
    {
        id: 'mc1',
        name: "Bio-Oil Skincare Oil",
        category: "mother-care",
        price: "GHS 150.00",
        image: "bio-oil.png",
        benefit: "Improves appearance of stretch marks.",
        description: "Specialist skincare for scars, stretch marks, and uneven skin tone."
    },
    {
        id: 'mc2',
        name: "Postpartum Recovery Belt",
        category: "mother-care",
        price: "GHS 200.00",
        image: "postpartum-belt.png",
        benefit: "Support for abdominal recovery.",
        description: "Breathable, adjustable support for postpartum healing."
    },
    {
        id: 'mc3',
        name: "Nursing Pillow",
        category: "mother-care",
        price: "GHS 180.00",
        image: "nursing-pillow.png",
        benefit: "Comfortable support for breastfeeding.",
        description: "Ergonomic design to reduce back and neck strain."
    },

    // Feeding Essentials
    {
        id: 'fe1',
        name: "Philips Avent Natural Baby Bottle",
        category: "feeding",
        price: "GHS 95.00",
        image: "philips-avent-bottle.png",
        benefit: "Natural latch-on for easy combination.",
        description: "Anti-colic valve designed to reduce colic and discomfort."
    },
    {
        id: 'fe2',
        name: "Silicone Baby Bibs (Set of 2)",
        category: "feeding",
        price: "GHS 55.00",
        image: "silicone-bibs.png",
        benefit: "Waterproof and easy to clean.",
        description: "Soft silicone with crumb catcher pocket."
    },

    // Skincare
    {
        id: 'sc1',
        name: "Cetaphil Baby Wash & Shampoo",
        category: "skincare",
        price: "GHS 110.00",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=500&auto=format&fit=crop",
        benefit: "Tear-free formula with organic calendula.",
        description: "Gently cleanses baby's soft skin without drying."
    },
    {
        id: 'sc2',
        name: "Sudocrem Antiseptic Healing Cream",
        category: "skincare",
        price: "GHS 75.00",
        image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=500&auto=format&fit=crop",
        benefit: "Effective relief for diaper rash.",
        description: "Soothes sore skin and protects against irritants."
    },

    // Diapers
    {
        id: 'dp1',
        name: "Pampers Premium Care (Size 2)",
        category: "diapers",
        price: "GHS 185.00",
        image: "https://images.unsplash.com/photo-1594828198751-2475475355a2?q=80&w=500&auto=format&fit=crop",
        benefit: "Softest comfort and best skin protection.",
        description: "Silky soft materials and absorbent channels."
    },
    {
        id: 'dp2',
        name: "Huggies Natural Care Wipes",
        category: "diapers",
        price: "GHS 35.00",
        image: "https://images.unsplash.com/photo-1574519967652-3269d7890aa3?q=80&w=500&auto=format&fit=crop",
        benefit: "99% water, fragrance-free.",
        description: "Thick and soft wipes for gentle cleaning."
    },

    // Gifts
    {
        id: 'gf1',
        name: "Newborn Starter Set",
        category: "gifts",
        price: "GHS 250.00",
        image: "https://images.unsplash.com/photo-1522771753062-811c79cb5f44?q=80&w=500&auto=format&fit=crop",
        benefit: "The perfect welcome home gift.",
        description: "Includes onesies, socks, cap, and mittens."
    },
    {
        id: 'gf2',
        name: "Plush Elephant Toy",
        category: "gifts",
        price: "GHS 90.00",
        image: "https://images.unsplash.com/photo-1556956291-a67b55d7870a?q=80&w=500&auto=format&fit=crop",
        benefit: "Soft, cuddly companion.",
        description: "Safe for all ages, ultra-soft material."
    }
];

// Helper to get products by category
function getProductsByCategory(category) {
    if (!category || category === 'all') return products;
    return products.filter(product => product.category === category);
}
