const admin = {
    products: [],

    gallery: [], // Gallery Items

    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Check Auth
        if (!sessionStorage.getItem('kids_royal_auth')) {
            // Not logged in, stop init (overlay is visible by default)
            return;
        }
        // Logged in, hide overlay
        document.getElementById('login-overlay').classList.add('hidden');
        console.log("Admin Initialized. Loading data...");

        document.getElementById('product-table-body').innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:var(--primary-color);"></i></td></tr>';

        // Fetch Products
        try {
            this.products = await db.getAllProducts();
        } catch (e) {
            console.error("Failed to load products:", e);
            this.products = [];
        }

        // Fetch Gallery (Mock for now, or new table later)
        // this.gallery = await db.getAllGalleryItems(); 

        this.renderTable();
        this.updateStats();
        this.renderGallery();
        this.renderCollections();

        // Init New Sections
        if (this.loadBlog) this.loadBlog();
        if (this.loadConfig) this.loadConfig();

        if (window.supabaseClient) {
            // Database Connected silently.
        } else {
            const header = document.querySelector('.header');
            if (header) {
                const alert = document.createElement('div');
                alert.style.padding = '10px';
                alert.style.marginBottom = '20px';
                alert.style.background = '#fff3cd';
                alert.style.borderRadius = '8px';
                alert.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <strong>Offline Mode:</strong> Set your Supabase URL & Key in <code>db.js</code> to go live. Changes currently save to browser only.';
                header.parentNode.insertBefore(alert, header.nextSibling);
            }
        }

        // Form Listener
        const form = document.getElementById('productForm');
        if (form) {
            // Remove existing listeners to be safe (clone node trick)
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }
    },

    renderTable() {
        const tbody = document.getElementById('product-table-body');
        if (!tbody) return;
        tbody.innerHTML = this.products.map(p => `
            <tr>
                <td><img src="${p.image}" width="40" height="40" style="object-fit: cover; border-radius: 4px;" class="prod-img-thumb" alt="img" onerror="this.src='https://via.placeholder.com/40'"></td>
                <td><strong>${p.name}</strong></td>
                <td><span style="text-transform: capitalize;">${(p.category || '').replace('-', ' ')}</span></td>
                <td>${p.price}</td>
                <td>
                    <i class="fa-${p.is_featured ? 'solid' : 'regular'} fa-star" 
                       style="color: gold; cursor: pointer;" 
                       onclick="admin.toggleFeatured('${p.id}', ${!p.is_featured})"></i>
                </td>
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
            document.getElementById('prodSoldOut').checked = p.is_sold_out || false;
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
            // Get Featured State from existing status or default false
            const existing = this.products.find(x => x.id === id);

            const newProduct = {
                id: id || 'prod_' + Date.now(),
                name: document.getElementById('prodName').value,
                category: document.getElementById('prodCategory').value,
                price: document.getElementById('prodPrice').value,
                original_price: document.getElementById('prodOriginalPrice').value,
                benefit: document.getElementById('prodBenefit').value,
                image: document.getElementById('prodImage').value,
                description: document.getElementById('prodDesc').value,
                is_featured: existing ? existing.is_featured : false, // Preserve Featured State
                is_sold_out: document.getElementById('prodSoldOut').checked,
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
        } else if (viewName === 'blog') {
            document.getElementById('view-blog').style.display = 'block';
        } else if (viewName === 'settings') {
            document.getElementById('view-settings').style.display = 'block';
        } else if (viewName === 'orders') {
            document.getElementById('view-orders').style.display = 'block';
        } else if (viewName === 'gallery') {
            document.getElementById('view-gallery').style.display = 'block';
        }
    },

    // --- FEATURED LOGIC ---
    async toggleFeatured(id, newState) {
        if (!supabaseClient) return alert("Connect Supabase to use this feature.");

        // Optimistic UI Update
        const p = this.products.find(x => x.id === id);
        if (p) p.is_featured = newState;
        this.renderTable();

        const { error } = await supabaseClient.from('products').update({ is_featured: newState }).eq('id', id);

        if (error) {
            // Revert if failed (missing column?)
            alert("Failed to update: " + error.message);
            p.is_featured = !newState;
            this.renderTable();

            if (error.code === '42703') {
                alert("NOTE: Run the 'feature_upgrade.sql' script to enable Featured items.");
            }
        }
    },

    // --- BLOG LOGIC ---
    async loadBlog() {
        if (!supabaseClient) return;
        const { data } = await supabaseClient.from('blog_posts').select('*');
        if (data) {
            const grid = document.getElementById('blog-grid');
            grid.innerHTML = data.map(post => `
                <div style="background:white; padding:20px; border-radius:8px; border:1px solid #eee;">
                    <h4><i class="${post.category || 'fa-solid fa-star'}"></i> ${post.title}</h4>
                    <p style="color:#666; font-size:0.9rem; height: 60px; overflow:hidden;">${post.content}</p>
                    <button class="btn-secondary" style="margin-top:10px; font-size:0.8rem;" onclick="admin.deleteBlog('${post.id}')">Delete</button>
                </div>
             `).join('');
        }
    },

    openBlogModal() {
        document.getElementById('blogModal').classList.add('active');
    },

    async saveBlogPost(e) {
        e.preventDefault();
        const title = document.getElementById('blogTitle').value;
        const content = document.getElementById('blogContent').value;
        const icon = document.getElementById('blogIcon').value;

        if (supabaseClient) {
            await supabaseClient.from('blog_posts').insert([{
                id: 'post_' + Date.now(),
                title: title,
                content: content,
                category: icon
            }]);
            document.getElementById('blogForm').reset();
            document.getElementById('blogModal').classList.remove('active');
            this.loadBlog();
            alert("Post Published!");
        } else {
            alert("Connect Supabase to publish posts.");
        }
    },

    async deleteBlog(id) {
        if (confirm("Delete this post?")) {
            await supabaseClient.from('blog_posts').delete().eq('id', id);
            this.loadBlog();
        }
    },

    // --- CONFIG LOGIC ---
    async loadConfig() {
        if (!supabaseClient) return;
        const { data } = await supabaseClient.from('site_config').select('*');
        if (data) {
            const map = {};
            data.forEach(item => map[item.key] = item.value);

            if (map['hero_headline']) document.getElementById('conf-headline').value = map['hero_headline'];
            if (map['hero_sub']) document.getElementById('conf-sub').value = map['hero_sub'];
            if (map['announcement']) document.getElementById('conf-announcement').value = map['announcement'];
        }
    },

    async saveSiteConfig() {
        const headline = document.getElementById('conf-headline').value;
        const sub = document.getElementById('conf-sub').value;
        const announce = document.getElementById('conf-announcement').value;

        if (!supabaseClient) return alert("Connect Supabase first.");

        const upserts = [
            { key: 'hero_headline', value: headline },
            { key: 'hero_sub', value: sub },
            { key: 'announcement', value: announce }
        ];

        const { error } = await supabaseClient.from('site_config').upsert(upserts);
        if (!error) alert("Site Settings Saved!");
        else alert("Error: " + error.message);
    },

    // --- COLLECTIONS LOGIC ---
    async renderCollections() {
        // Render in BOTH the main collections view AND the dashboard overview
        const grids = [
            document.getElementById('collections-grid'),
            document.getElementById('dashboard-collections-grid')
        ];

        let allCols = [];

        if (supabaseClient) {
            // Fetch from DB
            const { data, error } = await supabaseClient.from('categories').select('*');
            if (data && data.length > 0) {
                allCols = data;
            } else {
                // Fallback if table empty (first run before SQL script)
                allCols = [
                    { id: 'baby-care', name: 'Baby Care', icon: 'fa-baby-carriage', is_custom: false },
                    { id: 'mother-care', name: 'Mother Care', icon: 'fa-heart', is_custom: false },
                    { id: 'feeding', name: 'Feeding Essentials', icon: 'fa-mug-hot', is_custom: false },
                    { id: 'skincare', name: 'Skincare', icon: 'fa-soap', is_custom: false },
                    { id: 'diapers', name: 'Diapers & Hygiene', icon: 'fa-layer-group', is_custom: false },
                    { id: 'gifts', name: 'Gifts', icon: 'fa-gift', is_custom: false }
                ];
            }
        } else {
            // Offline fallback
            allCols = [
                { id: 'baby-care', name: 'Baby Care', icon: 'fa-baby-carriage' }
            ];
        }

        // Update product dropdown
        this.updateCategoryDropdown(allCols);

        const html = allCols.map(col => {
            const count = this.products.filter(p => p.category === col.id).length;
            const isCustom = col.is_custom;

            return `
                <div style="background:white; padding: 20px; border-radius:12px; text-align:center; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.05); transition: transform 0.2s; position:relative;"
                     onmouseover="this.style.transform='translateY(-5px)'" 
                     onmouseout="this.style.transform='translateY(0)'"
                     onclick="if(!event.target.classList.contains('action-btn-sm')) { admin.switchView('products'); document.querySelector('input[type=search]').value='${col.id}'; admin.filterTable('${col.id}'); }">
                    
                    <div style="position:absolute; top:5px; right:5px; display:flex; gap:5px;">
                        <button class="action-btn-sm" onclick="event.stopPropagation(); admin.openCollectionModal('${col.id}', '${col.name}', '${col.icon}')" style="border:none; background:none; color:#aeaeae; cursor:pointer;" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        ${isCustom ? `<button class="action-btn-sm" onclick="event.stopPropagation(); admin.deleteCollection('${col.id}')" style="border:none; background:none; color:#f00; cursor:pointer;" title="Delete">&times;</button>` : ''}
                    </div>
                    
                    <i class="fa-solid ${col.icon || 'fa-folder'}" style="font-size:2.5rem; color:#FFD700; margin-bottom:15px;"></i>
                    <h3 style="margin:0; font-size:1.1rem;">${col.name}</h3>
                    <p style="color:#666; margin-top:5px;">${count} items</p>
                </div>
            `;
        }).join('');

        grids.forEach(grid => {
            if (grid) grid.innerHTML = html;
        });
    },

    openCollectionModal(id = '', name = '', icon = '') {
        const form = document.getElementById('collectionForm');
        form.reset();

        document.getElementById('colId').value = id;
        if (id) {
            document.getElementById('colName').value = name;
            document.getElementById('colIcon').value = icon;
            document.querySelector('#collectionModal h3').textContent = 'Edit Collection';
            document.querySelector('#collectionModal button[type="submit"]').textContent = 'Save Changes';
        } else {
            document.querySelector('#collectionModal h3').textContent = 'New Collection';
            document.querySelector('#collectionModal button[type="submit"]').textContent = 'Create Collection';
        }

        document.getElementById('collectionModal').classList.add('active');
    },

    async saveCollection(e) {
        e.preventDefault();
        const id = document.getElementById('colId').value;
        const name = document.getElementById('colName').value;
        const icon = document.getElementById('colIcon').value;

        if (name && supabaseClient) {
            let error;

            if (id) {
                // UPDATE existing
                const res = await supabaseClient.from('categories').update({ name: name, icon: icon }).eq('id', id);
                error = res.error;
            } else {
                // CREATE new
                const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                // Ensure unique ID (fail gracefully handled by DB usually, but good to know)
                const res = await supabaseClient.from('categories').insert([{
                    id: newId,
                    name: name,
                    icon: icon || 'fa-folder-open',
                    is_custom: true
                }]);
                error = res.error;
            }

            if (error) {
                alert("Error: " + error.message);
            } else {
                this.renderCollections();
                document.getElementById('collectionModal').classList.remove('active');
                alert(id ? "Collection Updated!" : "Collection Created!");
            }
        }
    },

    async deleteCollection(id) {
        if (confirm("Delete this collection? Products will remain but lose their category label.")) {
            if (supabaseClient) {
                await supabaseClient.from('categories').delete().eq('id', id);
                this.renderCollections();
            }
        }
    },

    updateCategoryDropdown(cols) {
        const select = document.getElementById('prodCategory');
        if (!select) return;
        select.innerHTML = cols.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
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
                <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <div style="position: relative; aspect-ratio: 1;">
                        <img src="${img.url}" style="width:100%; height:100%; object-fit: cover;" alt="Gallery Image">
                        <button onclick="admin.deleteGalleryImage('${img.id}')" style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">&times;</button>
                    </div>
                    <div style="padding: 10px; display: flex; gap: 5px; align-items: center; border-top: 1px solid #f0f0f0;">
                        <input type="text" value="${img.url}" readonly style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid #eee; border-radius: 4px; color: #666; background: #fafafa;" onclick="this.select()">
                        <button onclick="navigator.clipboard.writeText('${img.url}').then(() => alert('Link Copied!'))" style="border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: var(--primary-color);" title="Copy Link">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
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
