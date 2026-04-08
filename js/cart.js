const Cart = {
    items: JSON.parse(localStorage.getItem('premium_shop_cart')) || [],

    save() {
        localStorage.setItem('premium_shop_cart', JSON.stringify(this.items));
        this.updateBadge();
    },

    add(product, quantity = 1) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.qty += quantity;
        } else {
            this.items.push({ ...product, qty: quantity });
        }
        this.save();
    },

    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },

    updateQty(id, delta) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) this.remove(id);
            else this.save();
        }
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    updateBadge() {
        const count = this.items.reduce((sum, item) => sum + item.qty, 0);
        const badge = document.getElementById('cart-count');
        const cartIcon = document.querySelector('.cart-icon');
        
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
            
            // Tiny bounce animation on update
            if(count > 0 && cartIcon) {
                cartIcon.style.transform = 'scale(1.15)';
                setTimeout(() => cartIcon.style.transform = '', 200);
            }
        }
    }
};
