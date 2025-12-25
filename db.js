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
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY && typeof createClient !== 'undefined') {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

const db = {
    // --- READ ---
    async getAllProducts() {
        if (supabase) {
            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (error) {
                console.error("Supabase Error:", error);
                return this.getLocalProducts();
            }
            return data;
        } else {
            return this.getLocalProducts();
        }
    },

    async getProductById(id) {
        if (supabase) {
            const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
            if (error) return null;
            return data;
        } else {
            const local = this.getLocalProducts();
            return local.find(p => p.id === id) || null;
        }
    },

    // --- WRITE ---
    async saveProduct(product) {
        // Ensure created_at exists for sorting if new
        if (!product.created_at) product.created_at = new Date().toISOString();

        if (supabase) {
            // Upsert (Insert or Update) based on ID
            const { data, error } = await supabase.from('products').upsert(product);
            if (error) {
                alert("Error saving to cloud: " + error.message);
                throw error;
            }
        }

        // Always save to local as backup/immediate cache
        this.saveLocal(product);
        return true;
    },

    async deleteProduct(id) {
        if (supabase) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) {
                alert("Error deleting from cloud: " + error.message);
                throw error;
            }
        }

        this.deleteLocal(id);
        return true;
    },

    // --- LOCAL STORAGE FALLBACK HELPERS ---
    getLocalProducts() {
        const stored = localStorage.getItem('kids_royal_products');
        if (stored) return JSON.parse(stored);

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
