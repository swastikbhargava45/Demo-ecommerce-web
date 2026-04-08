// Main App Orchestration
const App = {
    async init() {
        // Fetch all JSON data
        try {
            const [configRes, contentRes, productsRes] = await Promise.all([
                fetch('data/config.json'),
                fetch('data/content.json'),
                fetch('data/products.json')
            ]);

            window.StoreData = {
                config: await configRes.json(),
                content: await contentRes.json(),
                products: await productsRes.json()
            };

            this.setupGlobalUI();
            Cart.updateBadge();
            
            // Listen to route changes
            window.addEventListener('hashchange', () => this.router());
            // Initial route
            this.router();

        } catch (error) {
            console.error("Error loading data. Ensure you are running a local server.", error);
            document.getElementById('app-root').innerHTML = `<p style="padding:20px; text-align:center; color:red;">Failed to load store data. If viewing via file://, please use a local web server.</p>`;
        }
    },

    setupGlobalUI() {
        // Set dynamic store name and footer
        const storeName = window.StoreData.config.storeName;
        document.title = storeName;
        document.getElementById('site-logo').textContent = storeName;
        document.getElementById('footer-text').innerHTML = `&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

        // Mobile menu toggle logic
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            const nav = document.getElementById('main-nav');
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            nav.style.flexDirection = 'column';
            nav.style.position = 'absolute';
            nav.style.top = '60px';
            nav.style.left = '0';
            nav.style.width = '100%';
            nav.style.background = '#fff';
            nav.style.padding = '20px';
            nav.style.borderBottom = '1px solid var(--color-gray)';
        });

        // Hide mobile menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    document.getElementById('main-nav').style.display = 'none';
                }
            });
        });
    },

    router() {
        const hash = window.location.hash.slice(1) || 'home';
        window.scrollTo(0, 0); // Reset scroll on navigation

        if (hash === 'home') UI.renderHome();
        else if (hash === 'shop') UI.renderShop();
        else if (hash.startsWith('product/')) UI.renderProduct(hash.split('/')[1]);
        else if (hash === 'cart') UI.renderCart();
        else if (hash === 'checkout') UI.renderCheckout();
        else if (hash === 'contact') UI.renderContact();
        else UI.renderHome(); // Fallback
    },

    // Global Handlers triggered from HTML onclicks
    handleAddToCart(productId) {
        const product = window.StoreData.products.find(p => p.id === productId);
        Cart.add(product);
        
        // Brief UI feedback
        const btn = document.querySelector('.btn-add-cart');
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        setTimeout(() => btn.textContent = originalText, 1000);
    },

    handleUpdateQty(productId, delta) {
        Cart.updateQty(productId, delta);
        UI.renderCart(); // Re-render cart UI
    }
};

// Start application
document.addEventListener('DOMContentLoaded', () => App.init());
