// Cart Module
const Cart = {
    items: JSON.parse(localStorage.getItem('shop_cart')) || [],

    save() {
        localStorage.setItem('shop_cart', JSON.stringify(this.items));
        this.updateBadge();
    },

    add(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({ ...product, qty: 1 });
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
        document.getElementById('cart-count').textContent = count;
    }
};
