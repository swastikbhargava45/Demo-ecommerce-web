const UI = {
    root: document.getElementById('app-root'),
    
    fallbackImage: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800',
    
    formatPrice(price) {
        try {
            const sym = window.StoreData?.config?.currencySymbol || "₹";
            return `${sym}${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } catch (e) {
            return `₹${price}`;
        }
    },

    getMainImage(product) {
        if (product && product.images && product.images.length > 0) {
            return product.images[0];
        }
        return this.fallbackImage;
    },

    renderHome() {
        try {
            const home = window.StoreData?.content?.home || {};
            const config = window.StoreData?.config || {};
            
            this.root.innerHTML = `
                <div class="hero">
                    <img src="${home.heroImage || this.fallbackImage}" alt="Hero" class="hero-bg" onerror="this.src='${this.fallbackImage}'">
                    <div class="hero-overlay"></div>
                    <div class="hero-content">
                        <h1>${home.heroTitle || 'Premium Store'}</h1>
                        <p>${home.heroSubtitle || 'Discover our collection.'}</p>
                        <a href="#shop" class="btn" style="width: auto; padding: 18px 48px; font-size: 1.1rem;">${home.heroButtonText || 'Shop Now'}</a>
                    </div>
                </div>
                
                <div class="container">
                    <div class="trust-section">
                        <div class="trust-item">
                            <i class="ph ph-truck"></i>
                            <h4>Complimentary Shipping</h4>
                            <p>On all domestic orders over ${config.currencySymbol || '₹'}5000</p>
                        </div>
                        <div class="trust-item">
                            <i class="ph ph-arrow-u-up-left"></i>
                            <h4>Easy Returns</h4>
                            <p>30-day hassle-free return policy</p>
                        </div>
                        <div class="trust-item">
                            <i class="ph ph-lock-key"></i>
                            <h4>Secure Checkout</h4>
                            <p>Bank-grade SSL encryption</p>
                        </div>
                    </div>
                </div>

                <div class="container" style="padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl);">
                    <h2 class="section-title">New Arrivals</h2>
                    <div class="product-grid">
                        ${this.generateProductCards((window.StoreData?.products || []).slice(0, 4))}
                    </div>
                    <div class="text-center" style="margin-top: var(--spacing-lg);">
                        <a href="#shop" class="btn btn-outline" style="width: auto; padding: 14px 40px;">View Full Collection</a>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Error rendering Home:", error);
            this.root.innerHTML = `<p class="text-center" style="padding: 50px;">Error loading home page.</p>`;
        }
    },

    renderShop() {
        try {
            this.root.innerHTML = `
                <div class="container" style="padding-top: var(--spacing-lg); padding-bottom: var(--spacing-xl);">
                    <div style="text-align: center; margin-bottom: var(--spacing-xl);">
                        <h1>The Collection</h1>
                        <p style="margin-top: var(--spacing-xs);">Thoughtfully designed pieces for everyday living.</p>
                    </div>
                    <div class="product-grid">
                        ${this.generateProductCards(window.StoreData?.products || [])}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Error rendering Shop:", error);
        }
    },

    generateProductCards(products) {
        if(!products || !Array.isArray(products)) return '';
        return products.map(p => {
            const mainImg = this.getMainImage(p);
            const hoverImg = (p.images && p.images.length > 1) ? p.images[1] : mainImg;
            
            return `
            <a href="#product/${p.id}" class="product-card" onmouseenter="this.querySelector('.product-card-img').src='${hoverImg}'" onmouseleave="this.querySelector('.product-card-img').src='${mainImg}'">
                <div class="product-card-img-wrapper">
                    <img src="${mainImg}" alt="${p.name}" class="product-card-img" loading="lazy" onerror="this.src='${this.fallbackImage}'">
                    <div class="quick-add-overlay">
                        <button class="btn-quick-add" onclick="App.handleAddToCart('${p.id}', event)">Quick Add</button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-price">${this.formatPrice(p.price)}</div>
                </div>
            </a>
            `;
        }).join('');
    },

    renderProduct(id) {
        try {
            const product = (window.StoreData?.products || []).find(p => p.id === id);
            if (!product) return this.renderShop();

            const safeImages = (product.images && product.images.length > 0) ? product.images : [this.fallbackImage];
            const mainImageHtml = `<img id="main-product-image" src="${safeImages[0]}" alt="${product.name}" class="pd-image" onerror="this.src='${this.fallbackImage}'" style="border-radius: var(--radius-md); transition: opacity 0.3s ease;">`;
            
            let thumbnailsHtml = '';
            if (safeImages.length > 1) {
                thumbnailsHtml = `
                    <div style="display: flex; gap: 10px; margin-top: 10px; overflow-x: auto; padding-bottom: 5px;">
                        ${safeImages.map((img) => `
                            <img src="${img}" 
                                 onclick="document.getElementById('main-product-image').src='${img}'"
                                 onerror="this.src='${this.fallbackImage}'"
                                 style="width: 80px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; border: 1px solid var(--color-border);" 
                                 alt="Thumbnail">
                        `).join('')}
                    </div>
                `;
            }

            this.root.innerHTML = `
                <div class="container product-detail">
                    <div>
                        <div class="pd-image-container" style="border: none; background: transparent; margin-bottom: 0;">
                            ${mainImageHtml}
                        </div>
                        ${thumbnailsHtml}
                    </div>
                    
                    <div class="pd-info">
                        <h1>${product.name}</h1>
                        <div class="pd-price">${this.formatPrice(product.price)}</div>
                        
                        <p class="pd-description">${product.description || ''}</p>
                        
                        <div class="pd-action-area" style="margin-top: var(--spacing-md);">
                            <div style="font-size: 0.9rem; font-weight: 500; margin-bottom: 12px; color: var(--color-text-muted);">Quantity</div>
                            <div class="qty-selector">
                                <button type="button" onclick="App.handlePdQtyChange(-1)"><i class="ph ph-minus"></i></button>
                                <input type="number" id="pd-qty" value="1" min="1" readonly>
                                <button type="button" onclick="App.handlePdQtyChange(1)"><i class="ph ph-plus"></i></button>
                            </div>
                            
                            <div class="mobile-sticky-cta">
                                <button id="add-to-cart-btn" class="btn" onclick="App.handleAddToCart('${product.id}', event)">
                                    Add to Cart — ${this.formatPrice(product.price)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Error rendering Product:", error);
            this.renderShop();
        }
    },

    renderCart() {
        try {
            if (!Cart.items || Cart.items.length === 0) {
                this.root.innerHTML = `
                    <div class="container text-center cart-container" style="padding-top: 120px; padding-bottom: 120px;">
                        <div style="font-size: 5rem; color: var(--color-border); margin-bottom: var(--spacing-sm);">
                            <i class="ph ph-shopping-bag-open"></i>
                        </div>
                        <h2>Your bag is empty</h2>
                        <a href="#shop" class="btn" style="width: auto; margin-top: var(--spacing-lg);">Continue Shopping</a>
                    </div>`;
                return;
            }

            const itemsHtml = Cart.items.map(item => {
                const mainImg = this.getMainImage(item);
                return `
                <div class="cart-item">
                    <img src="${mainImg}" alt="${item.name}" class="cart-item-img" onerror="this.src='${this.fallbackImage}'">
                    <div class="cart-item-details">
                        <div>
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price" style="margin-top: 4px;">${this.formatPrice(item.price)}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                            <div class="cart-qty-control">
                                <button type="button" onclick="App.handleUpdateQty('${item.id}', -1)"><i class="ph ph-minus" style="font-size:0.8rem"></i></button>
                                <span>${item.qty}</span>
                                <button type="button" onclick="App.handleUpdateQty('${item.id}', 1)"><i class="ph ph-plus" style="font-size:0.8rem"></i></button>
                            </div>
                            <button type="button" class="remove-btn" onclick="App.handleUpdateQty('${item.id}', -${item.qty})">Remove</button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');

            this.root.innerHTML = `
                <div class="container cart-container">
                    <h1 style="margin-bottom: var(--spacing-lg);">Shopping Bag</h1>
                    <div class="cart-layout">
                        <div class="cart-items-wrapper">${itemsHtml}</div>
                        <div class="cart-summary-wrapper">
                            <div class="cart-summary">
                                <h3 style="margin-bottom: var(--spacing-md);">Order Summary</h3>
                                <div class="summary-row">
                                    <span>Subtotal</span>
                                    <span>${this.formatPrice(Cart.getTotal())}</span>
                                </div>
                                <div class="summary-row total">
                                    <span>Total</span>
                                    <span>${this.formatPrice(Cart.getTotal())}</span>
                                </div>
                                <button type="button" onclick="window.location.hash='#checkout'" class="btn" style="margin-top: var(--spacing-md);">Proceed to Checkout</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Error rendering Cart:", error);
        }
    },

    renderCheckout() {
        try {
            this.root.innerHTML = `
                <div class="container cart-container" style="max-width: 600px;">
                    <h1 style="margin-bottom: var(--spacing-sm);">Checkout</h1>
                    <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg);">Please enter your details below.</p>
                    <form id="checkoutForm" onsubmit="App.submitOrder(event)">
                        
                        <div class="form-group">
                            <label style="font-size: 0.9rem; font-weight: 500; margin-bottom: 6px; display: block;">Full Name</label>
                            <input type="text" id="checkout-name" class="form-control" placeholder="John Doe" required>
                        </div>
                        
                        <div class="form-group">
                            <label style="font-size: 0.9rem; font-weight: 500; margin-bottom: 6px; display: block;">Phone Number</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="tel" id="checkout-phone" class="form-control" placeholder="10-digit mobile number" pattern="[0-9]{10}" required>
                                <button type="button" id="btn-send-otp" class="btn btn-outline" style="width: auto; padding: 0 16px; white-space: nowrap;" onclick="App.handleSendOTP()">Send OTP</button>
                            </div>
                        </div>

                        <div class="form-group" id="otp-section" style="display: none; gap: 8px; margin-top: -8px;">
                            <input type="text" id="checkout-otp" class="form-control" placeholder="Enter OTP (e.g. 1234)">
                            <button type="button" id="btn-verify-otp" class="btn" style="width: auto; padding: 0 16px; white-space: nowrap; background: var(--color-primary); color: #fff;" onclick="App.handleVerifyOTP()">Verify</button>
                        </div>
                        <div id="otp-success-msg" style="display: none; color: var(--color-success, #059669); font-size: 0.85rem; font-weight: 500; margin-top: -8px; margin-bottom: 16px;">
                            <i class="ph ph-check-circle"></i> Number verified successfully.
                        </div>

                        <div class="form-group">
                            <label style="font-size: 0.9rem; font-weight: 500; margin-bottom: 6px; display: block;">Delivery Address</label>
                            <textarea id="checkout-address" class="form-control" rows="3" placeholder="Street, House No, Landmark" required></textarea>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            <div class="form-group">
                                <label style="font-size: 0.9rem; font-weight: 500; margin-bottom: 6px; display: block;">City</label>
                                <input type="text" id="checkout-city" class="form-control" placeholder="City" required>
                            </div>
                            <div class="form-group">
                                <label style="font-size: 0.9rem; font-weight: 500; margin-bottom: 6px; display: block;">Pincode</label>
                                <input type="text" id="checkout-pincode" class="form-control" placeholder="6-digit Pincode" pattern="[0-9]{6}" required>
                            </div>
                        </div>
                        
                        <div class="cart-summary" style="margin: var(--spacing-lg) 0; box-shadow: none; background: transparent; padding: 0;">
                            <div class="summary-row total" style="border-top: none; padding-top: 0; margin-top: 0;">
                                <span>Total due</span>
                                <span>${this.formatPrice(Cart.getTotal())}</span>
                            </div>
                        </div>
                        
                        <button type="submit" id="submit-order-btn" class="btn" disabled style="opacity: 0.5; cursor: not-allowed;">
                            <i class="ph ph-lock-key" style="margin-right: 8px;"></i> Place Order ${this.formatPrice(Cart.getTotal())}
                        </button>
                        <p id="submit-help-text" style="text-align: center; font-size: 0.85rem; color: var(--color-text-muted); margin-top: 12px;">Please verify your phone number to place the order.</p>
                    </form>
                </div>
            `;
        } catch (error) {
            console.error("Error rendering Checkout:", error);
        }
    },

    renderContact() {
        try {
            const contact = window.StoreData?.content?.contact || {};
            const email = window.StoreData?.config?.supportEmail || '';
            
            this.root.innerHTML = `
                <div class="container cart-container text-center" style="max-width: 600px; padding-top: 100px;">
                    <h1 style="margin-bottom: var(--spacing-sm);">${contact.title || 'Contact Us'}</h1>
                    <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg);">${contact.description || 'We are here to help.'}</p>
                    <a href="mailto:${email}" class="btn" style="width: auto;">Email Support</a>
                </div>
            `;
        } catch (error) {
            console.error("Error rendering Contact:", error);
        }
    }
};
