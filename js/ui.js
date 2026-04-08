const UI = {
    root: document.getElementById('app-root'),
    
    // Minimalist fallback image
    fallbackImage: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800',
    
    formatPrice(price) {
        const sym = window.StoreData.config.currencySymbol;
        return `${sym}${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    renderHome() {
        const { home } = window.StoreData.content;
        this.root.innerHTML = `
            <div class="hero">
                <img src="${home.heroImage}" alt="Hero" class="hero-bg" onerror="this.src='${this.fallbackImage}'">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1>${home.heroTitle}</h1>
                    <p>${home.heroSubtitle}</p>
                    <a href="#shop" class="btn" style="width: auto; padding: 18px 48px; font-size: 1.1rem;">${home.heroButtonText}</a>
                </div>
            </div>
            
            <div class="container">
                <div class="trust-section">
                    <div class="trust-item">
                        <i class="ph ph-truck"></i>
                        <h4>Complimentary Shipping</h4>
                        <p>On all domestic orders over ${window.StoreData.config.currencySymbol}5000</p>
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
                    ${this.generateProductCards(window.StoreData.products.slice(0, 4))}
                </div>
                <div class="text-center" style="margin-top: var(--spacing-lg);">
                    <a href="#shop" class="btn btn-outline" style="width: auto; padding: 14px 40px;">View Full Collection</a>
                </div>
            </div>
        `;
    },

    renderShop() {
        this.root.innerHTML = `
            <div class="container" style="padding-top: var(--spacing-lg); padding-bottom: var(--spacing-xl);">
                <div style="text-align: center; margin-bottom: var(--spacing-xl);">
                    <h1>The Collection</h1>
                    <p style="margin-top: var(--spacing-xs);">Thoughtfully designed pieces for everyday living.</p>
                </div>
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
                    <img src="${p.image}" alt="${p.name}" class="product-card-img" loading="lazy" onerror="this.src='${this.fallbackImage}'">
                    <div class="quick-add-overlay">
                        <button class="btn-quick-add" onclick="App.handleAddToCart('${p.id}', event)">Quick Add</button>
                    </div>
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
                    <img src="${product.image}" alt="${product.name}" class="pd-image" onerror="this.src='${this.fallbackImage}'">
                </div>
                <div class="pd-info">
                    <h1>${product.name}</h1>
                    <div class="pd-price">${this.formatPrice(product.price)}</div>
                    
                    <p class="pd-description">${product.description}</p>
                    
                    <div class="pd-action-area" style="margin-top: var(--spacing-md);">
                        <div style="font-size: 0.9rem; font-weight: 500; margin-bottom: 12px; color: var(--color-text-muted);">Quantity</div>
                        <div class="qty-selector">
                            <button onclick="App.handlePdQtyChange(-1)" aria-label="Decrease quantity"><i class="ph ph-minus"></i></button>
                            <input type="number" id="pd-qty" value="1" min="1" readonly>
                            <button onclick="App.handlePdQtyChange(1)" aria-label="Increase quantity"><i class="ph ph-plus"></i></button>
                        </div>
                        
                        <div class="mobile-sticky-cta">
                            <button id="add-to-cart-btn" class="btn" onclick="App.handleAddToCart('${product.id}', event)">
                                Add to Cart — ${this.formatPrice(product.price)}
                            </button>
                        </div>
                        
                        <div style="margin-top: var(--spacing-lg); padding-top: var(--spacing-md); border-top: 1px solid var(--color-border); font-size: 0.9rem; color: var(--color-text-muted);">
                            <div style="display:flex; align-items:center; gap: 8px; margin-bottom: 8px;"><i class="ph ph-check-circle"></i> In stock and ready to ship</div>
                            <div style="display:flex; align-items:center; gap: 8px;"><i class="ph ph-arrow-counter-clockwise"></i> Free returns within 30 days</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCart() {
        if (Cart.items.length === 0) {
            this.root.innerHTML = `
                <div class="container text-center cart-container" style="padding-top: 120px; padding-bottom: 120px;">
                    <div style="font-size: 5rem; color: var(--color-border); margin-bottom: var(--spacing-sm);">
                        <i class="ph ph-shopping-bag-open"></i>
                    </div>
                    <h2>Your bag is empty</h2>
                    <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg);">Let's find something special for you.</p>
                    <a href="#shop" class="btn" style="width: auto;">Continue Shopping</a>
                </div>`;
            return;
        }

        const itemsHtml = Cart.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='${this.fallbackImage}'">
                <div class="cart-item-details">
                    <div>
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price" style="margin-top: 4px;">${this.formatPrice(item.price)}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div class="cart-qty-control">
                            <button onclick="App.handleUpdateQty('${item.id}', -1)"><i class="ph ph-minus" style="font-size:0.8rem"></i></button>
                            <span>${item.qty}</span>
                            <button onclick="App.handleUpdateQty('${item.id}', 1)"><i class="ph ph-plus" style="font-size:0.8rem"></i></button>
                        </div>
                        <button class="remove-btn" onclick="App.handleUpdateQty('${item.id}', -${item.qty})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');

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
                            <div class="summary-row">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div class="summary-row total">
                                <span>Total</span>
                                <span>${this.formatPrice(Cart.getTotal())}</span>
                            </div>
                            <button onclick="window.location.hash='#checkout'" class="btn" style="margin-top: var(--spacing-md);">Proceed to Checkout</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCheckout() {
        this.root.innerHTML = `
            <div class="container cart-container" style="max-width: 600px;">
                <h1 style="margin-bottom: var(--spacing-sm);">Checkout</h1>
                <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg);">Please enter your details below.</p>
                <form onsubmit="event.preventDefault(); alert('Payment processed successfully!'); Cart.items=[]; Cart.save(); window.location.hash='#home';">
                    <div class="form-group">
                        <input type="email" class="form-control" placeholder="Email address" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                        <div class="form-group">
                            <input type="text" class="form-control" placeholder="First name" required>
                        </div>
                        <div class="form-group">
                            <input type="text" class="form-control" placeholder="Last name" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" placeholder="Address" required>
                    </div>
                    
                    <div class="cart-summary" style="margin: var(--spacing-lg) 0; box-shadow: none; background: var(--color-bg);">
                        <div class="summary-row total" style="border-top: none; padding-top: 0; margin-top: 0;">
                            <span>Total due</span>
                            <span>${this.formatPrice(Cart.getTotal())}</span>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn"><i class="ph ph-lock-key" style="margin-right: 8px;"></i> Pay Now</button>
                </form>
            </div>
        `;
    },

    renderContact() {
        const { contact } = window.StoreData.content;
        this.root.innerHTML = `
            <div class="container cart-container text-center" style="max-width: 600px; padding-top: 100px; padding-bottom: 100px;">
                <h1 style="margin-bottom: var(--spacing-sm);">${contact.title}</h1>
                <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg); font-size: 1.1rem;">
                    ${contact.description}
                </p>
                <a href="mailto:${window.StoreData.config.supportEmail}" class="btn" style="width: auto;">
                    Email Support
                </a>
            </div>
        `;
    }
};
