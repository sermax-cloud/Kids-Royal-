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
});
