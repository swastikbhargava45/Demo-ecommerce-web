const UI = {
    root: document.getElementById('app-root'),
    
    // Fallback image if a GitHub path is broken or missing
    fallbackImage: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800',
    
    formatPrice(price) {
        const sym = window.StoreData.config.currencySymbol;
        return `${sym}${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    // Safely get the main image or fallback
    getMainImage(product) {
        if (product.images && product.images.length > 0) {
            return product.images[0];
        }
        return this.fallbackImage;
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
        return products.map(p => {
            const mainImg = this.getMainImage(p);
            // Optional: Premium hover effect to show second image if available
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
        const product = window.StoreData.products.find(p => p.id === id);
        if (!product) return this.renderShop();

        // Generate Gallery HTML
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
                    
                    <p class="pd-description">${product.description}</p>
                    
                    <div class="pd-action-area" style="margin-top: var(--spacing-md);">
                        <div style="font-size: 0.9rem; font-weight: 500; margin-bottom: 12px; color: var(--color-text-muted);">Quantity</div>
                        <div class="qty-selector">
                            <button onclick="App.handlePdQtyChange(-1)"><i class="ph ph-minus"></i></button>
                            <input type="number" id="pd-qty" value="1" min="1" readonly>
                            <button onclick="App.handlePdQtyChange(1)"><i class="ph ph-plus"></i></button>
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
    },

    renderCart() {
        if (Cart.items.length === 0) {
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
                            <button onclick="App.handleUpdateQty('${item.id}', -1)"><i class="ph ph-minus" style="font-size:0.8rem"></i></button>
                            <span>${item.qty}</span>
                            <button onclick="App.handleUpdateQty('${item.id}', 1)"><i class="ph ph-plus" style="font-size:0.8rem"></i></button>
                        </div>
                        <button class="remove-btn" onclick="App.handleUpdateQty('${item.id}', -${item.qty})">Remove</button>
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
                <form onsubmit="event.preventDefault(); alert('Payment processed successfully!'); Cart.items=[]; Cart.save(); window.location.hash='#home';">
                    <div class="form-group"><input type="email" class="form-control" placeholder="Email address" required></div>
                    <button type="submit" class="btn"><i class="ph ph-lock-key" style="margin-right: 8px;"></i> Pay ${this.formatPrice(Cart.getTotal())}</button>
                </form>
            </div>
        `;
    },

    renderContact() {
        const { contact } = window.StoreData.content;
        this.root.innerHTML = `
            <div class="container cart-container text-center" style="max-width: 600px; padding-top: 100px;">
                <h1 style="margin-bottom: var(--spacing-sm);">${contact.title}</h1>
                <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg);">${contact.description}</p>
                <a href="mailto:${window.StoreData.config.supportEmail}" class="btn" style="width: auto;">Email Support</a>
            </div>
        `;
    }
};
