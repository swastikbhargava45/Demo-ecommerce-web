// UI Rendering Module
const UI = {
    root: document.getElementById('app-root'),
    formatPrice: (price) => `${window.StoreData.config.currencySymbol}${price.toFixed(2)}`,

    renderHome() {
        const { home } = window.StoreData.content;
        this.root.innerHTML = `
            <div class="container hero">
                <img src="${home.heroImage}" alt="Hero" class="hero-img">
                <h1>${home.heroTitle}</h1>
                <p style="color: var(--color-gray-dark); margin-bottom: var(--spacing-lg)">${home.heroSubtitle}</p>
                <a href="#shop" class="btn" style="max-width: 250px;">${home.heroButtonText}</a>
            </div>
        `;
    },

    renderShop() {
        const productsHtml = window.StoreData.products.map(p => `
            <a href="#product/${p.id}" class="product-card">
                <img src="${p.image}" alt="${p.name}" class="product-card-img" loading="lazy">
                <h3 class="product-title">${p.name}</h3>
                <div class="product-price">${this.formatPrice(p.price)}</div>
            </a>
        `).join('');

        this.root.innerHTML = `
            <div class="container" style="padding-top: var(--spacing-lg); padding-bottom: var(--spacing-xl);">
                <h2>All Products</h2>
                <div class="product-grid">${productsHtml}</div>
            </div>
        `;
    },

    renderProduct(id) {
        const product = window.StoreData.products.find(p => p.id === id);
        if (!product) return this.renderShop();

        this.root.innerHTML = `
            <div class="container product-detail">
                <div><img src="${product.image}" alt="${product.name}" class="pd-image"></div>
                <div class="pd-info">
                    <h1>${product.name}</h1>
                    <div class="pd-price">${this.formatPrice(product.price)}</div>
                    <p class="pd-description">${product.description}</p>
                    <div class="pd-actions">
                        <button class="btn btn-add-cart" onclick="App.handleAddToCart('${product.id}')">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderCart() {
        if (Cart.items.length === 0) {
            this.root.innerHTML = `
                <div class="container text-center" style="padding: var(--spacing-xl) 0;">
                    <h2>Your cart is empty</h2>
                    <a href="#shop" class="btn" style="margin-top: var(--spacing-md); max-width: 200px;">Continue Shopping</a>
                </div>`;
            return;
        }

        const itemsHtml = Cart.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="product-title">${item.name}</div>
                    <div class="product-price">${this.formatPrice(item.price)}</div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" onclick="App.handleUpdateQty('${item.id}', -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="App.handleUpdateQty('${item.id}', 1)">+</button>
                        <button style="margin-left:auto; text-decoration:underline; font-size:0.8rem;" onclick="App.handleUpdateQty('${item.id}', -${item.qty})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.root.innerHTML = `
            <div class="container" style="padding-top: var(--spacing-lg); padding-bottom: var(--spacing-xl);">
                <h2>Your Cart</h2>
                <div class="cart-layout">
                    <div class="cart-items">${itemsHtml}</div>
                    <div>
                        <div class="cart-summary">
                            <div class="summary-row">
                                <span>Subtotal</span>
                                <span>${this.formatPrice(Cart.getTotal())}</span>
                            </div>
                            <p style="font-size:0.8rem; color:var(--color-gray-dark); margin-bottom:var(--spacing-md);">Taxes and shipping calculated at checkout.</p>
                            <a href="#checkout" class="btn">Proceed to Checkout</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCheckout() {
        this.root.innerHTML = `
            <div class="container" style="max-width: 600px; padding-top: var(--spacing-lg); padding-bottom: var(--spacing-xl);">
                <h2>Checkout</h2>
                <form onsubmit="event.preventDefault(); alert('Order placed successfully!'); Cart.items=[]; Cart.save(); window.location.hash='#home';">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Shipping Address</label>
                        <textarea class="form-control" rows="3" required></textarea>
                    </div>
                    <div class="summary-row" style="margin: var(--spacing-lg) 0;">
                        <span>Total to pay</span>
                        <span>${this.formatPrice(Cart.getTotal())}</span>
                    </div>
                    <button type="submit" class="btn">Place Order</button>
                </form>
            </div>
        `;
    },

    renderContact() {
        const { contact } = window.StoreData.content;
        this.root.innerHTML = `
            <div class="container text-center" style="max-width: 600px; padding: var(--spacing-xl) 0;">
                <h2>${contact.title}</h2>
                <p style="margin-bottom: var(--spacing-lg);">${contact.description}</p>
                <a href="mailto:${window.StoreData.config.supportEmail}" class="btn btn-outline">${window.StoreData.config.supportEmail}</a>
            </div>
        `;
    }
};
