const App = {
    async init() {
        try {
            // Using relative paths to ensure Vercel/Netlify compatibility
            const [configRes, contentRes, productsRes] = await Promise.all([
                fetch('./data/config.json'),
                fetch('./data/content.json'),
                fetch('./data/products.json')
            ]);

            window.StoreData = {
                config: await configRes.json(),
                content: await contentRes.json(),
                products: await productsRes.json()
            };

            this.setupGlobalUI();
            Cart.updateBadge();
            
            window.addEventListener('hashchange', () => this.router());
            this.router();

        } catch (error) {
            console.error("Error loading data:", error);
            document.getElementById('app-root').innerHTML = `
                <div class="container text-center" style="padding: 100px 20px;">
                    <h2 style="color: #dc2626; margin-bottom: 10px;">Unable to load store data</h2>
                    <p>Please ensure you are running this project via a local web server (not file://) or check deployment settings.</p>
                </div>
            `;
        }
    },

    setupGlobalUI() {
        const storeName = window.StoreData.config.storeName;
        document.title = storeName;
        document.getElementById('site-logo').textContent = storeName;
        document.getElementById('footer-text').innerHTML = `&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

        // Mobile Menu Logic
        const menuBtn = document.getElementById('mobile-menu-btn');
        const nav = document.getElementById('main-nav');
        
        menuBtn.addEventListener('click', () => {
            const isExpanded = nav.style.display === 'flex';
            if (isExpanded) {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '70px';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = '#fff';
                nav.style.padding = '20px';
                nav.style.borderBottom = '1px solid var(--color-border)';
                nav.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
            }
        });

        // Close menu on link click (mobile)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    nav.style.display = 'none';
                }
            });
        });
    },

    router() {
        const hash = window.location.hash.slice(1) || 'home';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (hash === 'home') UI.renderHome();
        else if (hash === 'shop') UI.renderShop();
        else if (hash.startsWith('product/')) UI.renderProduct(hash.split('/')[1]);
        else if (hash === 'cart') UI.renderCart();
        else if (hash === 'checkout') UI.renderCheckout();
        else if (hash === 'contact') UI.renderContact();
        else UI.renderHome();
    },

    // Handlers
    handleAddToCart(productId) {
        const product = window.StoreData.products.find(p => p.id === productId);
        const qtyInput = document.getElementById('pd-qty');
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
        
        Cart.add(product, quantity);
        
        // Button feedback
        const btn = document.getElementById('add-to-cart-btn');
        if(btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="ph ph-check"></i> Added to Cart`;
            btn.style.backgroundColor = 'var(--color-success)';
            btn.style.borderColor = 'var(--color-success)';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
            }, 1500);
        }
    },

    handleUpdateQty(productId, delta) {
        Cart.updateQty(productId, delta);
        UI.renderCart();
    },

    handlePdQtyChange(delta) {
        const input = document.getElementById('pd-qty');
        let val = parseInt(input.value) + delta;
        if (val < 1) val = 1;
        input.value = val;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
