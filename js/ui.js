const UI = {
    root: document.getElementById('app-root'),
    
    formatPrice(price) {
        const sym = window.StoreData.config.currencySymbol;
        return `${sym}${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    renderHome() {
        const { home } = window.StoreData.content;
        this.root.innerHTML = `
            <div class="hero">
                <img src="${home.heroImage}" alt="Hero" class="hero-bg">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1>${home.heroTitle}</h1>
                    <p>${home.heroSubtitle}</p>
                    <a href="#shop" class="btn" style="width: auto; padding-left: 40px; padding-right: 40px;">${home.heroButtonText}</a>
                </div>
            </div>
            <div class="container" style="padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl);">
                <h2 class="section-title">Featured Collection</h2>
                <div class="product-grid">
                    ${this.generateProductCards(window.StoreData.products.slice(0, 4))}
                </div>
                <div class="text-center" style="margin-top: var(--spacing-lg);">
                    <a href="#shop" class="btn btn-outline" style="width: auto;">View All Products</a>
                </div>
            </div>
        `;
    },

    renderShop() {
        this.root.innerHTML = `
            <div class="container" style="padding-top: var(--spacing-lg); padding-bottom: var(--spacing-xl);">
                <h1 style="margin-bottom: var(--spacing-lg);">All Products</h1>
                <div class="product-grid">
                    ${this.generateProductCards(window.StoreData.products)}
                </div>
            </div>
        `;
    },

    generateProductCards(products) {
        return products.map(p => `
            <a href="#product/${p.id}" class="product-card">
                <div class="product-card-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" class="product-card-img" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-price">${this.formatPrice(p.price)}</div>
                </div>
            </a>
        `).join('');
    },

    renderProduct(id) {
        const product = window.StoreData.products.find(p => p.id === id);
        if (!product) return this.renderShop();

        this.root.innerHTML = `
            <div class="container product-detail">
                <div class="pd-image-container">
                    <img src="${product.image}" alt="${product.name}" class="pd-image">
                </div>
                <div class="pd-info">
                    <h1>${product.name}</h1>
                    <div class="pd-price">${this.formatPrice(product.price)}</div>
                    
                    <div class="trust-badges">
                        <div class="trust-badge"><i class="ph ph-truck"></i> Free Delivery on all orders</div>
                        <div class="trust-badge"><i class="ph ph-money"></i> Cash on Delivery Available</div>
                        <div class="trust-badge"><i class="ph ph-shield-check"></i> Secure SSL Checkout</div>
                    </div>

                    <p class="pd-description">${product.description}</p>
                    
                    <div class="pd-action-area">
                        <div style="font-size: 0.9rem; font-weight: 500; margin-bottom: 8px;">Quantity</div>
                        <div class="qty-selector">
                            <button onclick="App.handlePdQtyChange(-1)">-</button>
                            <input type="number" id="pd-qty" value="1" min="1" readonly>
                            <button onclick="App.handlePdQtyChange(1)">+</button>
                        </div>
                        
                        <div class="mobile-sticky-cta">
                            <button id="add-to-cart-btn" class="btn btn-add-cart" onclick="App.handleAddToCart('${product.id}')">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCart() {
        if (Cart.items.length === 0) {
            this.root.innerHTML = `
                <div class="container text-center cart-container">
                    <div style="font-size: 4rem; color: var(--color-border); margin-bottom: var(--spacing-md);">
                        <i class="ph ph-shopping-cart"></i>
                    </div>
                    <h2>Your cart is empty</h2>
                    <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg);">Looks like you haven't added anything yet.</p>
                    <a href="#shop" class="btn" style="width: auto;">Continue Shopping</a>
                </div>`;
            return;
        }

        const itemsHtml = Cart.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-qty-control">
                            <button onclick="App.handleUpdateQty('${item.id}', -1)">-</button>
                            <span>${item.qty}</span>
                            <button onclick="App.handleUpdateQty('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="App.handleUpdateQty('${item.id}', -${item.qty})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.root.innerHTML = `
            <div class="container cart-container">
                <h1 style="margin-bottom: var(--spacing-lg);">Your Cart</h1>
                <div class="cart-layout">
                    <div class="cart-items-wrapper">${itemsHtml}</div>
                    <div class="cart-summary-wrapper">
                        <div class="cart-summary">
                            <h3 style="margin-bottom: var(--spacing-md);">Order Summary</h3>
                            <div class="summary-row">
                                <span>Subtotal</span>
                                <span>${this.formatPrice(Cart.getTotal())}</span>
                            </div>
                            <div class="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div class="summary-row total">
                                <span>Total</span>
                                <span>${this.formatPrice(Cart.getTotal())}</span>
                            </div>
                            <p style="font-size:0.85rem; color:var(--color-text-muted); margin: var(--spacing-md) 0;">Taxes included. Discounts applied at checkout.</p>
                            <a href="#checkout" class="btn">Proceed to Checkout</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCheckout() {
        this.root.innerHTML = `
            <div class="container cart-container" style="max-width: 600px;">
                <h1 style="margin-bottom: var(--spacing-lg);">Secure Checkout</h1>
                <form onsubmit="event.preventDefault(); alert('Order placed successfully!'); Cart.items=[]; Cart.save(); window.location.hash='#home';">
                    <div class="form-group">
                        <label>Contact Email</label>
                        <input type="email" class="form-control" placeholder="you@example.com" required>
                    </div>
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" class="form-control" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                        <label>Shipping Address</label>
                        <textarea class="form-control" rows="3" placeholder="Street, City, ZIP" required></textarea>
                    </div>
                    
                    <div class="cart-summary" style="margin: var(--spacing-lg) 0; background: transparent; padding: 0; border: none;">
                        <div class="summary-row total" style="border-top: none; padding-top: 0;">
                            <span>Total to pay</span>
                            <span style="color: var(--color-primary);">${this.formatPrice(Cart.getTotal())}</span>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn"><i class="ph ph-lock-key" style="margin-right: 8px;"></i> Place Order</button>
                    <div class="text-center" style="margin-top: 12px; font-size: 0.85rem; color: var(--color-text-muted);">
                        Guaranteed safe & secure checkout
                    </div>
                </form>
            </div>
        `;
    },

    renderContact() {
        const { contact } = window.StoreData.content;
        this.root.innerHTML = `
            <div class="container cart-container text-center" style="max-width: 600px;">
                <div style="font-size: 3rem; margin-bottom: var(--spacing-md); color: var(--color-primary);">
                    <i class="ph ph-envelope-simple"></i>
                </div>
                <h1 style="margin-bottom: var(--spacing-sm);">${contact.title}</h1>
                <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg); font-size: 1.1rem;">
                    ${contact.description}
                </p>
                <a href="mailto:${window.StoreData.config.supportEmail}" class="btn btn-outline">
                    ${window.StoreData.config.supportEmail}
                </a>
            </div>
        `;
    }
};
