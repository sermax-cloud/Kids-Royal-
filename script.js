// Force scroll to top on load and clear hash
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// Clear hash from URL to prevent automatic jumping
if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname);
}

// Force scroll to top immediately and after a small delay to override browser behavior
window.scrollTo(0, 0);
setTimeout(() => {
    window.scrollTo(0, 0);
}, 10);
setTimeout(() => {
    window.scrollTo(0, 0);
}, 100);

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navHamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.mobile-menu-overlay');
const closeBtn = document.querySelector('.close-menu');
const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

function toggleMenu() {
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
}

if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
}

if (navHamburger) {
    navHamburger.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent # jump
        toggleMenu();
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', toggleMenu);
}

if (overlay) {
    overlay.addEventListener('click', toggleMenu);
}

// Close menu when a link is clicked
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
        navbar.style.background = "rgba(255, 255, 255, 0.98)";
    } else {
        navbar.style.boxShadow = "none";
        navbar.style.background = "rgba(255, 255, 255, 0.95)";
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Select all elements with animation classes
// Note: In CSS we set initial opacity to 0. JS handles the trigger.
document.querySelectorAll('.fade-in-up, .hero-image').forEach(el => {
    observer.observe(el);
});

// Auto-update copyright year
const yearSpan = document.querySelector('.footer-bottom p');
if (yearSpan) {
    const currentYear = new Date().getFullYear();
    yearSpan.innerHTML = `&copy; ${currentYear} KIDS ROYAL. All rights reserved.`;
}

/* --- CART LOGIC --- */

class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('kidsRoyalCart')) || [];
        this.init();
    }

    init() {
        this.renderCart();
        this.updateCount();
        this.bindEvents();
    }

    save() {
        localStorage.setItem('kidsRoyalCart', JSON.stringify(this.items));
        this.updateCount();
        this.renderCart();
    }

    add(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.save();
        this.openCart(); // Optional: open cart when added
    }

    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    }

    updateQuantity(id, change) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.remove(id);
            } else {
                this.save();
            }
        }
    }

    clear() {
        this.items = [];
        this.save();
    }

    updateCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const countBadges = document.querySelectorAll('.cart-count');
        countBadges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    parsePrice(priceStr) {
        // Remove currency symbols (GHS, $) and commas, return float
        return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    }

    renderCart() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const totalEl = document.getElementById('cart-total-amount');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fa-solid fa-cart-shopping" style="font-size: 3rem; color: #eee; margin-bottom: 10px;"></i>
                    <p>Your cart is empty.</p>
                </div>`;
            if (totalEl) totalEl.textContent = 'GHS 0.00';
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = this.items.map(item => {
            const itemTotal = this.parsePrice(item.price) * item.quantity;
            total += itemTotal;
            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">${item.price}</span>
                        <div class="cart-item-controls">
                            <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <i class="fa-solid fa-trash remove-item" onclick="cart.remove('${item.id}')"></i>
                </div>
            `;
        }).join('');

        if (totalEl) totalEl.textContent = `GHS ${total.toFixed(2)}`;
    }

    checkout() {
        if (this.items.length === 0) return;

        let message = "Hello KIDS ROYAL, I would like to place an order:\n\n";
        let total = 0;

        this.items.forEach(item => {
            const itemTotal = this.parsePrice(item.price) * item.quantity;
            total += itemTotal;
            message += `• ${item.quantity}x ${item.name} (${item.price}/ea)\n`;
        });

        message += `\n*Total Estimate: GHS ${total.toFixed(2)}*\n\n`;
        message += "I'm ready to confirm delivery details.";

        // Proper encoding ensures the list displays correctly
        const whatsappUrl = `https://wa.me/233242943446?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    bindEvents() {
        const triggers = document.querySelectorAll('.cart-trigger'); // Floating button, nav icons etc
        const closeBtns = document.querySelectorAll('.close-cart, .cart-overlay-bg');

        triggers.forEach(btn => btn.addEventListener('click', () => this.openCart()));
        closeBtns.forEach(btn => btn.addEventListener('click', () => this.closeCart()));
    }

    openCart() {
        const sidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.cart-overlay-bg'); // We need to add this to HTML
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        const sidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.cart-overlay-bg');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize Cart globally
const cart = new Cart();

// Hero Background Slider Logic
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000; // 5 seconds per slide

        setInterval(() => {
            // Remove active class from current slide
            slides[currentSlide].classList.remove('active');

            // Move to next slide
            currentSlide = (currentSlide + 1) % slides.length;

            // Add active class to next slide
            slides[currentSlide].classList.add('active');
        }, slideInterval);
    }

    // FETCH LIVE SITE CONFIG (Headlines/Announcements)
    if (typeof supabase !== 'undefined' || typeof window.supabaseClient !== 'undefined') {
        fetchSiteConfig();
        fetchFeaturedProducts();
        fetchCategories(); // Fetch dynamic categories
    }
});

async function fetchCategories() {
    try {
        const container = document.querySelector('.categories-grid');
        if (!container) return;

        // 1. Try Cache First
        const cached = localStorage.getItem('kids_royal_cache_categories');
        if (cached) renderCategories(JSON.parse(cached), container);

        if (!window.supabaseClient) return;

        // 2. Fetch Fresh
        const { data, error } = await window.supabaseClient.from('categories').select('*');
        if (error || !data) return;

        // 3. Update Cache & UI
        const freshId = JSON.stringify(data);
        if (cached && freshId === cached) return; // No change, no re-render

        localStorage.setItem('kids_royal_cache_categories', freshId);
        renderCategories(data, container);

    } catch (e) {
        console.warn("Category Fetch Error:", e);
    }
}

function renderCategories(data, container) {
    const imageMap = {
        'baby-care': 'baby-care.png',
        'mother-care': 'mother-care.png',
        'feeding': 'feeding-essentials.png',
        'skincare': 'baby-skincare.png',
        'diapers': 'diapers-hygiene.png',
        'gifts': 'gifts-accessories.png'
    };

    container.innerHTML = data.map(cat => {
        const isStandard = imageMap[cat.id];
        if (isStandard) {
            return `
            <a href="catalog.html?category=${cat.id}" class="category-card">
                <div class="cat-image-wrapper">
                    <img src="${imageMap[cat.id]}" alt="${cat.name}" loading="lazy">
                </div>
                <div class="cat-content">
                    <h3>${cat.name}</h3>
                    <p>Browse collection</p>
                    <span class="link-arrow">Browse <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </a>`;
        } else {
            return `
            <a href="catalog.html?category=${cat.id}" class="category-card" style="text-align: center;">
                <div class="cat-image-wrapper" style="background: #f0f6ff; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid ${cat.icon || 'fa-folder-open'}" style="font-size: 5rem; color: var(--primary-color);"></i>
                </div>
                <div class="cat-content">
                    <h3>${cat.name}</h3>
                    <p>New Collection</p>
                    <span class="link-arrow" style="justify-content: center;">Browse <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </a>`;
        }
    }).join('');
}

async function fetchFeaturedProducts() {
    try {
        const container = document.getElementById('featured-grid');
        if (!container) return;

        // 1. Try Cache
        const cached = localStorage.getItem('kids_royal_cache_featured');
        if (cached) renderFeatured(JSON.parse(cached), container);

        if (!window.supabaseClient) return;

        // 2. Fetch Fresh
        const { data, error } = await window.supabaseClient
            .from('products')
            .select('id, name, price, original_price, image, category, is_sold_out')
            .eq('is_featured', true)
            .limit(4);

        if (error || !data) return;

        // 3. Update Cache & UI
        const freshId = JSON.stringify(data);
        if (cached && freshId === cached) return; // No change, no re-render (Stop Jitter)

        localStorage.setItem('kids_royal_cache_featured', freshId);
        renderFeatured(data, container);

    } catch (e) {
        console.warn("Featured Fetch Error:", e);
    }
}

function renderFeatured(data, container) {
    if (data.length === 0) {
        const section = document.getElementById('featured-products');
        if (section) section.style.display = 'none';
        return;
    }

    container.innerHTML = data.map(product => {
        let badgeHTML = '';
        if (product.original_price) {
            try {
                const orig = parseFloat(String(product.original_price).replace(/[^0-9.]/g, ''));
                const curr = parseFloat(String(product.price).replace(/[^0-9.]/g, ''));
                if (orig > curr) {
                    const off = Math.round(((orig - curr) / orig) * 100);
                    badgeHTML = `<span style="position: absolute; top: 10px; left: 10px; background: #FF4D4F; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; z-index: 2;">-${off}% OFF</span>`;
                }
            } catch (e) { }
        }

        return `
        <div class="product-card fade-in-up" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div class="prod-image" style="position: relative; height: 250px; overflow: hidden; background: #f9f9f9;">
                ${badgeHTML}
                <a href="product.html?id=${product.id}">
                    <img src="${product.image}" loading="lazy" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                </a>
            </div>
            <div class="prod-details" style="padding: 20px;">
                <span class="prod-category" style="color: #888; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">${product.category || 'General'}</span>
                <h3 class="prod-title" style="font-size: 1.1rem; margin: 10px 0;">
                    <a href="product.html?id=${product.id}" style="color: #333; text-decoration: none;">${product.name}</a>
                </h3>
                <div class="prod-bottom" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <div class="price-block">
                            ${product.original_price ? `<span style="text-decoration: line-through; color: #aaa; font-size: 0.9rem; margin-right: 5px;">${product.original_price}</span>` : ''}
                            <span class="price" style="font-weight: 700; color: var(--primary-color); font-size: 1.2rem;">${product.price}</span>
                    </div>
                    <button class="add-btn" onclick='cart.add(${JSON.stringify(product).replace(/'/g, "&#39;")})' style="background: var(--primary-color); color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

async function fetchSiteConfig() {
    try {
        // 1. Try Cache
        const cached = localStorage.getItem('kids_royal_cache_config');
        if (cached) applySiteConfig(JSON.parse(cached));

        if (!window.supabaseClient) return;

        // 2. Fetch Fresh
        const { data, error } = await window.supabaseClient.from('site_config').select('*');
        if (data && data.length > 0) {
            const freshId = JSON.stringify(data);
            if (cached && freshId === cached) return; // No change

            localStorage.setItem('kids_royal_cache_config', freshId);
            applySiteConfig(data);
        }
    } catch (e) {
        console.warn("Config Fetch Error:", e);
    }
}

function applySiteConfig(data) {
    const config = {};
    data.forEach(item => config[item.key] = item.value);

    // Update Headlines
    const titleEl = document.querySelector('.hero-text h1');
    const subEl = document.querySelector('.hero-text p.lead-text');

    if (config.hero_headline && titleEl) {
        titleEl.innerHTML = config.hero_headline.replace(/\n/g, '<br>');
    }
    if (config.hero_sub && subEl) {
        subEl.textContent = config.hero_sub;
    }

    // Announcement Bar
    if (config.announcement) {
        // Avoid duplicates
        if (!document.querySelector('.announcement-bar')) {
            const bar = document.createElement('div');
            bar.className = 'announcement-bar';
            bar.style.background = '#000';
            bar.style.color = 'white';
            bar.style.textAlign = 'center';
            bar.style.padding = '8px';
            bar.style.fontSize = '0.9rem';
            bar.style.fontWeight = '500';
            bar.innerHTML = config.announcement;
            document.body.insertBefore(bar, document.body.firstChild);
        }
    }
}
