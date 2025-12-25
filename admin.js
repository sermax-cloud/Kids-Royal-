const admin = {
    products: [],

    async init() {
        // Fetch from DB (Supabase or Local)
        this.products = await db.getAllProducts();

        this.renderTable();
        this.updateStats();

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
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    admin.init();
});
