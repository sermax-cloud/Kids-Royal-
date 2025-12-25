/* 
    DATABASE CONNECTION (Supabase)
    ------------------------------
    This file handles all data operations. 
    1. It tries to connect to Supabase.
    2. If keys are missing, it falls back to Local Storage (for demo/testing).
*/

// CONSTANTS - REPLACE THESE WITH YOUR KEYS FROM SUPABASE DASHBOARD
// 1. URL: Go to Settings -> API -> Copy "Project URL"
const SUPABASE_URL = "https://iilbckohmseoroypzxra.supabase.co";

// 2. Key: Go to Settings -> API -> Copy "anon" / "public" key (Starts with 'eyJ...')
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbGJja29obXNlb3JveXB6eHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjQ5MTQsImV4cCI6MjA4MjI0MDkxNH0.fBVsMdXetkvywo5Fo8MBfpSOG5ufYdApehluGwuubzw"; // <--- PASTE THE LONG 'eyJ...' KEY HERE

// Initialize client if keys exist
// Initialize client if keys exist
let supabaseClient = null;

// Check for global Supabase library (exposed as window.supabase by the CDN)
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    if (SUPABASE_URL && SUPABASE_KEY) {
        // Initialize client
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        // Expose globally for other scripts (blog.html, script.js)
        window.supabaseClient = supabaseClient;
    }
}

window.db = {
    // --- READ ---
    async getAllProducts() {
        try {
            if (supabaseClient) {
                // Try lowercase 'products' first
                let { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });

                if (error) {
                    console.warn("Supabase Error (Switching to local):", error);
                    return this.getLocalProducts();
                }
                return data || [];
            }
        } catch (err) {
            console.error("DB Fetch Error:", err);
            return this.getLocalProducts();
        }
        return this.getLocalProducts();
    },

    tableName: 'products', // Default

    async getProductById(id) {
        if (supabaseClient) {
            // Use the table name we detected (or default)
            let { data, error } = await supabaseClient.from(this.tableName).select('*').eq('id', id).single();

            // Fallback check if we haven't detected table name yet
            if (error && this.tableName === 'products') {
                const res = await supabaseClient.from('Products').select('*').eq('id', id).single();
                if (!res.error) {
                    this.tableName = 'Products';
                    data = res.data;
                    error = null;
                }
            }

            if (error) return null;
            return data;
        } else {
            const local = this.getLocalProducts();
            return local.find(p => p.id === id) || null;
        }
    },

    // --- WRITE ---
    async saveProduct(product) {
        // Ensure created_at exists
        if (!product.created_at) product.created_at = new Date().toISOString();

        if (supabaseClient) {
            // 1. Try Normal Save
            const { error } = await supabaseClient.from(this.tableName).upsert(product);

            // 2. Handle specific errors
            if (error) {
                // Table doesn't exist? Try 'Products'
                if (error.code === '42P01' && this.tableName === 'products') {
                    this.tableName = 'Products';
                    return this.saveProduct(product); // Retry with new name
                }

                // Column doesn't exist? (e.g. description/benefit/original_price missing)
                // Error code 42703 is "undefined_column"
                if (error.code === '42703') {
                    // Attempt 2: Try without 'original_price', but KEEP description/benefit
                    // This handles the case where users haven't run the SQL for the new column yet
                    const { original_price, ...productWithoutPrice } = product;

                    const retry1 = await supabaseClient.from(this.tableName).upsert(productWithoutPrice);

                    if (retry1.error) {
                        // Attempt 3: Fail-safe (Minimal data only)
                        // If it still fails (maybe description is missing?), go to minimal
                        const minimal = {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            category: product.category,
                            created_at: product.created_at
                        };

                        const retry2 = await supabaseClient.from(this.tableName).upsert(minimal);

                        if (retry2.error) {
                            alert("Cloud Save Failed: " + retry2.error.message);
                            throw retry2.error;
                        } else {
                            // Success on minimal
                            console.warn("Saved with minimal columns (original_price/description/benefit dropped)");
                            alert("Saved partially! (Column mismatch). Please run the SQL script to fix DB schema.");
                        }
                    } else {
                        // Success on Attempt 2
                        console.warn("Saved without original_price (Column missing in DB)");
                        // We don't alert here to avoid spamming, just silent compatibility
                    }
                } else {
                    alert("Error saving to cloud: " + error.message);
                    throw error;
                }
            }
        }

        // Always save to local as backup
        this.saveLocal(product);
        return true;
    },

    async deleteProduct(id) {
        if (supabaseClient) {
            const { error } = await supabaseClient.from(this.tableName).delete().eq('id', id);
            if (error) {
                if (error.code === '42P01' && this.tableName === 'products') {
                    this.tableName = 'Products';
                    return this.deleteProduct(id);
                }
                alert("Error deleting from cloud: " + error.message);
                throw error;
            }
        }

        this.deleteLocal(id);
        return true;
    },

    // --- STORAGE (Images) ---
    async uploadImage(file) {
        if (!supabaseClient) {
            alert("Cloud database not connected. Cannot upload files.");
            return null;
        }

        try {
            const fileName = 'uploads/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');

            // 1. Upload
            const { data, error } = await supabaseClient.storage.from('images').upload(fileName, file);

            if (error) {
                if (error.message.includes('Bucket not found')) {
                    alert("SETUP REQUIRED: You need to create a public storage bucket named 'images' in your Supabase dashboard first.");
                } else {
                    alert("Upload Failed: " + error.message);
                }
                throw error;
            }

            // 2. Get Public URL
            const { data: publicData } = supabaseClient.storage.from('images').getPublicUrl(fileName);
            return publicData.publicUrl;

        } catch (err) {
            console.error("Upload Error:", err);
            return null;
        }
    },

    // --- LOCAL STORAGE FALLBACK HELPERS ---
    getLocalProducts() {
        try {
            const stored = localStorage.getItem('kids_royal_products');
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.error("Local Storage Parse Error:", e);
            // If corrupt, clear it? Or just ignore.
        }

        // Use default static data if nothing in storage
        // (Assuming 'products' is loaded from products.js as a global backup)
        if (typeof products !== 'undefined') {
            // Seed local storage with defaults so we can edit them
            localStorage.setItem('kids_royal_products', JSON.stringify(products));
            return products;
        }
        return [];
    },

    saveLocal(product) {
        let items = this.getLocalProducts();
        const index = items.findIndex(p => p.id === product.id);
        if (index >= 0) {
            items[index] = product;
        } else {
            items.unshift(product);
        }
        localStorage.setItem('kids_royal_products', JSON.stringify(items));
    },

    deleteLocal(id) {
        let items = this.getLocalProducts();
        items = items.filter(p => p.id !== id);
        localStorage.setItem('kids_royal_products', JSON.stringify(items));
    }
};
