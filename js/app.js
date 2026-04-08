// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://hwhzmqpchproonxfgcjv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3aHptcXBjaHByb29ueGZnY2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2Njg3NDUsImV4cCI6MjA5MTI0NDc0NX0.c63kcq6cwmj2_yuwc04iC9H3LpjIcqmBSrRD3lTmRAE";

// Initialize Supabase Client strictly using window.supabase.createClient
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
            // Ensure loader is ALWAYS removed, even if Supabase/Fetch fails
            const loader = document.getElementById('global-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    loader.remove(); 
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

    // --- FAKE OTP LOGIC ---
    handleSendOTP() {
        const phone = document.getElementById('checkout-phone').value.trim();
        // Validation: 10 digits
        if(!/^\d{10}$/.test(phone)) {
            alert("Please enter a valid 10-digit phone number first.");
            return;
        }
        
        const btn = document.getElementById('btn-send-otp');
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
        btn.disabled = true;
        
        // Fake Network Delay
        setTimeout(() => {
            btn.innerHTML = 'Sent!';
            document.getElementById('otp-section').style.display = 'flex';
        }, 1000);
    },

    handleVerifyOTP() {
        const otp = document.getElementById('checkout-otp').value.trim();
        if(!otp || otp.length < 4) {
            alert("Please enter the OTP sent to your phone.");
            return;
        }
        
        const btn = document.getElementById('btn-verify-otp');
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
        btn.disabled = true;
        
        // Fake Verification Delay
        setTimeout(() => {
            document.getElementById('otp-section').style.display = 'none';
            document.getElementById('btn-send-otp').style.display = 'none';
            document.getElementById('checkout-phone').readOnly = true;
            document.getElementById('otp-success-msg').style.display = 'block';
            
            // Enable the Place Order Button
            const submitBtn = document.getElementById('submit-order-btn');
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            
            // Hide the help text
            const helpText = document.getElementById('submit-help-text');
            if(helpText) helpText.style.display = 'none';
        }, 1000);
    },

    // --- SUPABASE CHECKOUT LOGIC ---
    async submitOrder(event) {
        event.preventDefault();

        try {
            // 1. Guard Clauses
            if (!Cart.items || Cart.items.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            if (!supabaseClient) {
                throw new Error("Supabase client is not initialized.");
            }

            const name = document.getElementById('checkout-name').value.trim();
            const phone = document.getElementById('checkout-phone').value.trim();
            const address = document.getElementById('checkout-address').value.trim();
            const city = document.getElementById('checkout-city').value.trim();
            const pincode = document.getElementById('checkout-pincode').value.trim();

            // 2. Strict Validations
            if (!name) return alert("Please enter your full name.");
            if (!/^\d{10}$/.test(phone)) return alert("Please enter a valid 10-digit phone number.");
            if (!address) return alert("Please enter your address.");
            if (!city) return alert("Please enter your city.");
            if (!/^\d{6}$/.test(pincode)) return alert("Please enter a valid 6-digit Pincode.");

            // 3. Update UI to Loading State
            const btn = document.getElementById('submit-order-btn');
            const originalBtnText = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-spinner ph-spin" style="margin-right: 8px;"></i> Processing...';
            btn.disabled = true;

            // 4. Data Parsing (CRITICAL FOR SUPABASE JSON & NUMERIC FORMATS)
            // JSON.parse(JSON.stringify()) ensures pure JSON, dropping any JS prototypes
            const pureJsonProducts = JSON.parse(JSON.stringify(Cart.items));
            // Ensure Total is explicitly passed as a numeric float
            const numericTotal = Number(parseFloat(Cart.getTotal()).toFixed(2));

            const orderData = {
                customer_name: name,
                phone: phone,
                address: address,
                city: city, 
                pincode: pincode, 
                products: pureJsonProducts,
                total: numericTotal
            };

            console.log("Preparing to insert into Supabase: ", orderData);

            // 5. Send to Supabase
            const { data, error } = await supabaseClient
                .from('orders')
                .insert([orderData]);

            if (error) {
                console.error("Supabase Detailed Error:", error);
                throw error;
            }

            // 6. Handle Success
            console.log("Order saved successfully!");
            alert("Order placed successfully! We will contact you soon.");
            Cart.items = []; 
            Cart.save();     
            window.location.hash = '#home'; 

        } catch (error) {
            // 7. Handle Failure
            console.error("Order Submission Exception:", error);
            alert("Issue placing order: " + (error.message || "Please check console and try again."));
            
            // Re-enable button on failure
            const btn = document.getElementById('submit-order-btn');
            if(btn) {
                btn.innerHTML = '<i class="ph ph-lock-key" style="margin-right: 8px;"></i> Retry Checkout';
                btn.disabled = false;
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
