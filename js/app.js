// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://hwhzmqpchproonxfgcjv.supabase.co";
const SUPABASE_KEY = "sb_publishable_gp2dnGn6kICrLFZdUWmzVQ_tSmWUVoV";

// Initialize Supabase Client strictly using window.supabase.createClient
// Variable must be supabaseClient
let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
    console.error("Failed to initialize Supabase:", error);
}

const App = {
    async init() {
        try {
            // Use absolute paths for Vercel deployment
            const [configRes, contentRes, productsRes] = await Promise.all([
                fetch('/data/config.json'),
                fetch('/data/content.json'),
                fetch('/data/products.json')
            ]);

            if (!configRes.ok || !contentRes.ok || !productsRes.ok) {
                throw new Error("Failed to fetch JSON data files. Check paths.");
            }

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
            console.error("Initialization Error:", error);
            const root = document.getElementById('app-root');
            if (root) {
                root.innerHTML = `
                    <div class="container text-center" style="padding: 100px 20px;">
                        <h2 style="color: #dc2626; margin-bottom: 10px;">Connection Error</h2>
                        <p>We couldn't load the store data. Please refresh the page.</p>
                        <p><small style="color: gray;">${error.message}</small></p>
                    </div>
                `;
            }
        } finally {
            // FIX: Ensure loader is ALWAYS removed, even if Supabase/Fetch fails
            const loader = document.getElementById('global-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    loader.remove(); // Completely remove to prevent infinite blocking
                }, 500);
            }
        }
    },

    setupGlobalUI() {
        try {
            const storeName = window.StoreData.config.storeName;
            document.title = storeName;
            document.getElementById('site-logo').textContent = storeName;
            document.getElementById('footer-logo').textContent = storeName;
            document.getElementById('footer-text').innerHTML = `&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

            // Mobile Menu Logic
            const menuBtn = document.getElementById('mobile-menu-btn');
            const nav = document.getElementById('main-nav');
            
            if(menuBtn && nav) {
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
                        nav.style.background = 'var(--color-surface, #fff)';
                        nav.style.borderBottom = '1px solid var(--color-border, #eaeaea)';
                        nav.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                        nav.style.zIndex = '999';
                        
                        const linksContainer = nav.querySelector('.nav-links');
                        if(linksContainer) {
                            linksContainer.style.display = 'flex';
                            linksContainer.style.flexDirection = 'column';
                            linksContainer.style.padding = '20px';
                            linksContainer.style.gap = '20px';
                        }
                    }
                });
            }

            // Close menu on link click (mobile)
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 768 && nav) {
                        nav.style.display = 'none';
                    }
                });
            });
            
            // Header scroll effect
            window.addEventListener('scroll', () => {
                const header = document.querySelector('.site-header');
                if (header) {
                    if (window.scrollY > 10) {
                        header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    } else {
                        header.style.boxShadow = '0 1px 0 rgba(0,0,0,0.05)';
                    }
                }
            });
        } catch (error) {
            console.error("Error setting up Global UI:", error);
        }
    },

    router() {
        try {
            const hash = window.location.hash.slice(1) || 'home';
            const root = document.getElementById('app-root');
            
            if(root) root.classList.remove('fade-enter-active');
            
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'auto' });
                
                if (hash === 'home') UI.renderHome();
                else if (hash === 'shop') UI.renderShop();
                else if (hash.startsWith('product/')) UI.renderProduct(hash.split('/')[1]);
                else if (hash === 'cart') UI.renderCart();
                else if (hash === 'checkout') UI.renderCheckout();
                else if (hash === 'contact') UI.renderContact();
                else UI.renderHome();
                
                requestAnimationFrame(() => {
                    if(root) root.classList.add('fade-enter-active');
                });
            }, 200);
        } catch (error) {
            console.error("Routing Error:", error);
        }
    },

    handleAddToCart(productId, event) {
        try {
            if(event) {
                event.preventDefault(); 
                event.stopPropagation();
            }
            
            const product = window.StoreData.products.find(p => p.id === productId);
            if(!product) return;

            const qtyInput = document.getElementById('pd-qty');
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
            
            Cart.add(product, quantity);
            
            const btn = event ? event.currentTarget : document.getElementById('add-to-cart-btn');
            if(btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = `<i class="ph ph-check"></i> Added`;
                btn.style.backgroundColor = 'var(--color-success, #059669)';
                btn.style.borderColor = 'var(--color-success, #059669)';
                btn.style.color = '#fff';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }, 1500);
            }
        } catch (error) {
            console.error("Add to cart error:", error);
        }
    },

    handleUpdateQty(productId, delta) {
        try {
            Cart.updateQty(productId, delta);
            UI.renderCart();
        } catch (error) {
            console.error("Update quantity error:", error);
        }
    },

    handlePdQtyChange(delta) {
        try {
            const input = document.getElementById('pd-qty');
            if(input) {
                let val = parseInt(input.value) + delta;
                if (val < 1) val = 1;
                input.value = val;
            }
        } catch (error) {
            console.error("Qty change error:", error);
        }
    },

    // --- SUPABASE CHECKOUT LOGIC ---
    async submitOrder(event) {
        event.preventDefault();

        try {
            if (!Cart.items || Cart.items.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            if (!supabaseClient) {
                throw new Error("Supabase client is not initialized.");
            }

            const btn = document.getElementById('submit-order-btn');
            const originalBtnText = btn.innerHTML;
            
            btn.innerHTML = '<i class="ph ph-spinner ph-spin" style="margin-right: 8px;"></i> Processing...';
            btn.disabled = true;

            const orderData = {
                customer_name: document.getElementById('checkout-name').value,
                phone: document.getElementById('checkout-phone').value,
                address: document.getElementById('checkout-address').value,
                products: Cart.items,
                total: Cart.getTotal()
            };

            const { data, error } = await supabaseClient
                .from('orders')
                .insert([orderData]);

            if (error) throw error;

            alert("Order placed successfully! We will contact you soon.");
            Cart.items = []; 
            Cart.save();     
            window.location.hash = '#home'; 

        } catch (error) {
            console.error("Order Submission Error:", error);
            alert("There was an issue placing your order. Please check your connection and try again.");
            
            const btn = document.getElementById('submit-order-btn');
            if(btn) {
                btn.innerHTML = '<i class="ph ph-lock-key" style="margin-right: 8px;"></i> Retry Checkout';
                btn.disabled = false;
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
