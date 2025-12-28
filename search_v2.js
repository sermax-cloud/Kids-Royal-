// Search Suggestions Logic
document.addEventListener('DOMContentLoaded', () => {

    // Helper: Debounce function to limit API calls
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Initialize Search Logic for a given Input and Results Container
    const initSearchAutocomplete = (inputSelector, containerSelector) => {
        const input = document.querySelector(inputSelector);

        // If input doesn't exist (e.g. desktop on mobile view possibly), return
        if (!input) return;

        // Create Results Container if not exists (we'll inject it)
        let resultsContainer = document.querySelector(containerSelector);
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-suggestions';
            // Append to the parent of the form or input
            // For nav-search, parent is .nav-search. For mobile, it's .mobile-search
            input.closest('div').appendChild(resultsContainer);
        }

        // Hide when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.classList.remove('active');
            }
        });

        // Hide on escape
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                resultsContainer.classList.remove('active');
                input.blur();
            }
        });

        // Handle Input
        const handleInput = async (e) => {
            const query = e.target.value.trim().toLowerCase();

            if (query.length < 2) {
                resultsContainer.classList.remove('active');
                resultsContainer.innerHTML = '';
                return;
            }

            // Fetch Data (using db.js global)
            if (window.db) {
                try {
                    // Fetch ALL products (lightweight enough) then filter
                    // Note: In a real large app, we'd use a specific search API.
                    const products = await window.db.getProductsGrid('all');

                    const matches = products.filter(p =>
                        (p.name || '').toLowerCase().includes(query) ||
                        (p.category || '').toLowerCase().includes(query)
                    ).slice(0, 5); // Limit to 5 suggestions

                    renderSuggestions(matches, query, resultsContainer);

                } catch (err) {
                    console.error("Search Fetch Error:", err);
                }
            }
        };

        input.addEventListener('input', debounce(handleInput, 300));

        // Show recent/all if focused? No, stick to typing.
    };

    const renderSuggestions = (products, query, container) => {
        if (products.length === 0) {
            container.innerHTML = `<div class="suggestion-empty">No matches found</div>`;
            container.classList.add('active');
            return;
        }

        const html = products.map(p => `
            <a href="product.html?id=${p.id}" class="suggestion-item">
                <img src="${p.image || 'https://via.placeholder.com/50'}" class="suggestion-thumb" alt="${p.name}" onerror="this.src='https://via.placeholder.com/50?text=IMG'">
                <div class="suggestion-info">
                    <div class="suggestion-title">${highlightMatch(p.name, query)}</div>
                    <div class="suggestion-meta">${p.price}</div>
                </div>
            </a>
        `).join('');

        // Add "See all results" link at bottom
        const seeAllHtml = `
            <a href="catalog.html?search=${encodeURIComponent(query)}" class="suggestion-item" style="justify-content:center; color: var(--primary-color); font-weight:600; background:#f5faff;">
                See all results <i class="fa-solid fa-arrow-right" style="font-size:0.8rem; margin-left:5px;"></i>
            </a>
        `;

        container.innerHTML = html + seeAllHtml;
        container.classList.add('active');
    };

    const highlightMatch = (text, query) => {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span style="color: var(--primary-color); background: rgba(77,128,228,0.1);">$1</span>');
    };

    // Attach to Desktop Search
    initSearchAutocomplete('.nav-search input', '.nav-search .search-suggestions');

    // Attach to Mobile Search
    initSearchAutocomplete('.mobile-search input', '.mobile-search .search-suggestions');

});
