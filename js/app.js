const App = {
    async init() {
        try {
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
            
            // Remove global loader after slight delay for smooth entry
            setTimeout(() => {
                const loader = document.getElementById('global-loader');
                if(loader) {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.remove(), 500);
                }
            }, 300);
            
            window.addEventListener('hashchange', () => this.router());
            this.router();

        } catch (error) {
            console.error("Error loading data:", error);
            document.getElementById('global-loader').style.display = 'none';
            document.getElementById('app-root').innerHTML = `
                <div class="container text-center" style="padding: 100px 20px;">
                    <h2 style="color: #dc2626; margin-bottom: 10px;">Connection Error</h2>
                    <p>Please ensure you are running this project via a local web server.</p>
                </div>
            `;
        }
    },

    setupGlobalUI() {
        const storeName = window.StoreData.config.storeName;
        document.title = storeName;
        document.getElementById('site-logo').textContent = storeName;
        document.getElementById('footer-logo').textContent = storeName;
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
                nav.style.position = 'absolute';
                nav.style.top = '72px';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = 'var(--color-surface)';
                nav.style.borderBottom = '1px solid var(--color-border)';
                nav.style.boxShadow = 'var(--shadow-md)';
                nav.style.zIndex = '999';
                
                const linksContainer = nav.querySelector('.nav-links');
                linksContainer.style.display = 'flex';
                linksContainer.style.flexDirection = 'column';
                linksContainer.style.padding = '20px';
                linksContainer.style.gap = '20px';
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
        
        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.site-header');
            if (window.scrollY > 10) {
                header.style.boxShadow = 'var(--shadow-md)';
            } else {
                header.style.boxShadow = 'var(--shadow-nav)';
            }
        });
    },

    router() {
        const hash = window.location.hash.slice(1) || 'home';
        const root = document.getElementById('app-root');
        
        // Trigger fade out
        root.classList.remove('fade-enter-active');
        
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            
            if (hash === 'home') UI.renderHome();
            else if (hash === 'shop') UI.renderShop();
            else if (hash.startsWith('product/')) UI.renderProduct(hash.split('/')[1]);
            else if (hash === 'cart') UI.renderCart();
            else if (hash === 'checkout') UI.renderCheckout();
            else if (hash === 'contact') UI.renderContact();
            else UI.renderHome();
            
            // Trigger fade in
            requestAnimationFrame(() => {
                root.classList.add('fade-enter-active');
            });
        }, 200); // Matches CSS transition duration
    },

    // Global Handlers
    handleAddToCart(productId, event) {
        if(event) {
            event.preventDefault(); // Stop link navigation if triggered from quick add
            event.stopPropagation();
        }
        
        const product = window.StoreData.products.find(p => p.id === productId);
        const qtyInput = document.getElementById('pd-qty');
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
        
        Cart.add(product, quantity);
        
        // Button feedback
        const btn = event ? event.currentTarget : document.getElementById('add-to-cart-btn');
        if(btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="ph ph-check"></i> Added`;
            btn.style.backgroundColor = 'var(--color-success)';
            btn.style.borderColor = 'var(--color-success)';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                btn.style.color = '';
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
