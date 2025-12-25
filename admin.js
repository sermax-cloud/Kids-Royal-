const admin = {
    products: [],

    gallery: [], // Gallery Items

    async init() {
        // Check Auth
        if (!sessionStorage.getItem('kids_royal_auth')) {
            // Not logged in, stop init (overlay is visible by default)
            return;
        }
        // Logged in, hide overlay
        document.getElementById('login-overlay').classList.add('hidden');
        console.log("Admin Initialized. Loading data...");

        // Fetch Products
        this.products = await db.getAllProducts();

        // Fetch Gallery (Mock for now, or new table later)
        // this.gallery = await db.getAllGalleryItems(); 

        this.renderTable();
        this.updateStats();
        this.renderTable();
        this.updateStats();
        this.renderGallery();
        this.renderCollections(); // Init Collections

        if (supabase) {
            const header = document.querySelector('.header');
            // If DB is empty, highlight the Upload button
            if (this.products.length === 0) {
                const alert = document.createElement('div');
                alert.style.padding = '10px';
                alert.style.marginBottom = '20px';
                alert.style.background = '#d1e7dd';
                alert.style.color = '#0f5132';
                alert.style.borderRadius = '8px';
                alert.innerHTML = '<i class="fa-solid fa-info-circle"></i> <strong>Database Connected!</strong> It looks empty. Click "Upload Defaults" to push your starter products to the cloud.';
                header.parentNode.insertBefore(alert, header.nextSibling);
            }
        } else {
            const header = document.querySelector('.header');
            const alert = document.createElement('div');
            alert.style.padding = '10px';
            alert.style.marginBottom = '20px';
            alert.style.background = '#fff3cd';
            alert.style.borderRadius = '8px';
            alert.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <strong>Offline Mode:</strong> Set your Supabase URL & Key in <code>db.js</code> to go live. Changes currently save to browser only.';
            header.parentNode.insertBefore(alert, header.nextSibling);
        }

        // Form Listener
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
    },

    renderTable() {
        const tbody = document.getElementById('product-table-body');
        tbody.innerHTML = this.products.map(p => `
            <tr>
                <td><img src="${p.image}" class="prod-img-thumb" alt="img" onerror="this.src='https://via.placeholder.com/40'"></td>
                <td><strong>${p.name}</strong></td>
                <td><span style="text-transform: capitalize;">${(p.category || '').replace('-', ' ')}</span></td>
                <td>${p.price}</td>
                <td>
                    <button class="action-btn edit" onclick="admin.editProduct('${p.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete" onclick="admin.deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    updateStats() {
        document.getElementById('total-products').textContent = this.products.length;
        document.getElementById('active-products').textContent = this.products.length;
    },

    openModal(id = null) {
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');

        if (id) {
            const p = this.products.find(x => x.id === id);
            document.getElementById('prodId').value = p.id;
            document.getElementById('prodName').value = p.name;
            document.getElementById('prodCategory').value = p.category;
            document.getElementById('prodPrice').value = p.price;
            document.getElementById('prodOriginalPrice').value = p.original_price || '';
            document.getElementById('prodBenefit').value = p.benefit;
            document.getElementById('prodImage').value = p.image;
            document.getElementById('prodDesc').value = p.description;
        } else {
            form.reset();
            document.getElementById('prodId').value = '';
        }

        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('productModal').classList.remove('active');
    },

    async saveProduct() {
        const btn = document.querySelector('#productForm button[type="submit"]');
        const oldText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
            const id = document.getElementById('prodId').value;
            const newProduct = {
                id: id || 'prod_' + Date.now(),
                name: document.getElementById('prodName').value,
                category: document.getElementById('prodCategory').value,
                price: document.getElementById('prodPrice').value,
                original_price: document.getElementById('prodOriginalPrice').value,
                benefit: document.getElementById('prodBenefit').value,
                image: document.getElementById('prodImage').value,
                description: document.getElementById('prodDesc').value,
                created_at: new Date().toISOString()
            };

            await db.saveProduct(newProduct);

            // Refresh Data
            this.products = await db.getAllProducts();
            this.renderTable();
            this.updateStats();
            this.closeModal();

        } catch (error) {
            console.error(error);
        } finally {
            btn.disabled = false;
            btn.innerHTML = oldText;
        }
    },

    editProduct(id) {
        this.openModal(id);
    },

    async deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            await db.deleteProduct(id);
            this.products = await db.getAllProducts(); // Refresh
            this.renderTable();
            this.updateStats();
        }
    },

    async seedDatabase() {
        if (!confirm('This will upload all items from "products.js" to your database. Continue?')) return;

        const btn = document.querySelector('button[onclick="admin.seedDatabase()"]');
        const oldText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

        try {
            // "products" variable comes from products.js loaded in HTML
            if (typeof products === 'undefined') {
                alert('No default products found to upload.');
                return;
            }

            for (const p of products) {
                // We clone it to avoid modifying the original static array if we add props
                const toUpload = { ...p, created_at: new Date().toISOString() };
                await db.saveProduct(toUpload);
            }

            alert('Upload Complete!');
            this.products = await db.getAllProducts();
            this.renderTable();
            this.updateStats();

        } catch (err) {
            console.error(err);
            alert('Error uploading: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = oldText;
        }
    },

    switchView(viewName) {
        // Update Sidebar Active State
        const links = document.querySelectorAll('.nav-item');
        links.forEach(l => l.classList.remove('active'));

        // Find the link that was clicked (approximate match)
        const activeLink = Array.from(links).find(l => l.getAttribute('onclick').includes(viewName));
        if (activeLink) activeLink.classList.add('active');

        // Hide all views
        document.querySelectorAll('.admin-view').forEach(el => el.style.display = 'none');

        // Show selected view
        if (viewName === 'dashboard') {
            document.getElementById('view-dashboard').style.display = 'block';
        } else if (viewName === 'products') {
            document.getElementById('view-products').style.display = 'block';
        } else if (viewName === 'collections') {
            document.getElementById('view-collections').style.display = 'block';
        } else if (viewName === 'orders') {
            document.getElementById('view-orders').style.display = 'block';
        } else if (viewName === 'gallery') {
            document.getElementById('view-gallery').style.display = 'block';
        }
    },

    // --- COLLECTIONS LOGIC ---
    renderCollections() {
        // Render in BOTH the main collections view AND the dashboard overview
        const grids = [
            document.getElementById('collections-grid'),
            document.getElementById('dashboard-collections-grid')
        ];

        // Fixed List of Collections
        const collections = [
            { id: 'baby-care', name: 'Baby Care', icon: 'fa-baby-carriage' },
            { id: 'mother-care', name: 'Mother Care', icon: 'fa-heart' },
            { id: 'feeding', name: 'Feeding Essentials', icon: 'fa-mug-hot' },
            { id: 'skincare', name: 'Skincare', icon: 'fa-soap' },
            { id: 'diapers', name: 'Diapers & Hygiene', icon: 'fa-layer-group' },
            { id: 'gifts', name: 'Gifts', icon: 'fa-gift' }
        ];

        const html = collections.map(col => {
            const count = this.products.filter(p => p.category === col.id).length;
            return `
                <div style="background:white; padding: 20px; border-radius:12px; text-align:center; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.05); transition: transform 0.2s;"
                     onmouseover="this.style.transform='translateY(-5px)'" 
                     onmouseout="this.style.transform='translateY(0)'"
                     onclick="admin.switchView('products'); document.querySelector('input[type=search]').value='${col.id}'; admin.filterTable('${col.id}')">
                    <i class="fa-solid ${col.icon}" style="font-size:2.5rem; color:#FFD700; margin-bottom:15px;"></i>
                    <h3 style="margin:0; font-size:1.1rem;">${col.name}</h3>
                    <p style="color:#666; margin-top:5px;">${count} items</p>
                </div>
            `;
        }).join('');

        grids.forEach(grid => {
            if (grid) grid.innerHTML = html;
        });
    },

    // Quick filter helper (optional, if search input exists)
    filterTable(term) {
        // Simple client-side filter for demo purposes
        const rows = document.querySelectorAll('#product-table-body tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term.toLowerCase()) ? '' : 'none';
        });
    },

    // --- UPLOAD HANDLERS ---
    uploadContext: null, // 'gallery' or 'product'

    triggerUpload(context) {
        this.uploadContext = context;
        document.getElementById('global-upload').click();
    },

    async handleFileSelect(input) {
        const file = input.files[0];
        if (!file) return;

        // Show loading state (simple alert for now)
        // In a real app, you'd use a toast or spinner
        const originalText = document.body.style.cursor;
        document.body.style.cursor = 'wait';

        try {
            const url = await db.uploadImage(file);

            if (url) {
                if (this.uploadContext === 'gallery') {
                    this.addGalleryImageFromUrl(url);
                } else if (this.uploadContext === 'product') {
                    document.getElementById('prodImage').value = url;
                    alert("Image Uploaded!");
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            document.body.style.cursor = originalText;
            // Reset input
            input.value = '';
            this.uploadContext = null;
        }
    },

    addGalleryImageFromUrl(url) {
        const newImg = {
            id: 'img_' + Date.now(),
            url: url,
            created_at: new Date().toISOString()
        };
        const current = JSON.parse(localStorage.getItem('kids_royal_gallery')) || [];
        current.unshift(newImg);
        localStorage.setItem('kids_royal_gallery', JSON.stringify(current));
        this.renderGallery();
    },

    // --- GALLERY LOGIC ---
    renderGallery() {
        // Using local storage for gallery demo until specific DB table is made
        const storedGallery = JSON.parse(localStorage.getItem('kids_royal_gallery')) || [];
        this.gallery = storedGallery;

        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        if (this.gallery.length === 0) {
            grid.innerHTML = '<p style="grid-column:1/-1; color:#999; text-align:center;">No images in gallery.</p>';
        } else {
            grid.innerHTML = this.gallery.map(img => `
                <div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <img src="${img.url}" style="width:100%; height:100%; object-fit: cover;" alt="Gallery Image">
                    <button onclick="admin.deleteGalleryImage('${img.id}')" style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">&times;</button>
                </div>
            `).join('');
        }
    },

    addGalleryImage() {
        this.triggerUpload('gallery');
    },

    deleteGalleryImage(id) {
        if (confirm('Delete this image?')) {
            let current = JSON.parse(localStorage.getItem('kids_royal_gallery')) || [];
            current = current.filter(x => x.id !== id);
            localStorage.setItem('kids_royal_gallery', JSON.stringify(current));
            this.renderGallery();
        }
    },

    checkLogin(e) {
        e.preventDefault();
        const input = document.getElementById('admin-password');
        const pass = input.value;

        // Simple client-side check (Default: "admin123")
        // You can change this string to whatever you want
        if (pass === 'admin123') {
            sessionStorage.setItem('kids_royal_auth', 'true');
            document.getElementById('login-overlay').classList.add('hidden');
            this.init(); // Load data now
        } else {
            alert('Incorrect Password');
            input.value = '';
        }
    },

    logout() {
        sessionStorage.removeItem('kids_royal_auth');
        window.location.reload();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    admin.init();
});
