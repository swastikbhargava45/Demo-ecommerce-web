// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://hwhzmqpchproonxfgcjv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3aHptcXBjaHByb29ueGZnY2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2Njg3NDUsImV4cCI6MjA5MTI0NDc0NX0.c63kcq6cwmj2_yuwc04iC9H3LpjIcqmBSrRD3lTmRAE";

// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const AdminApp = {
    // State
    orders: [],
    products: [],
    settings: null,

    // 1. Initialization & Auth
    init() {
        const isAuth = localStorage.getItem('admin_auth');
        if (isAuth === 'true') {
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('app-view').style.display = 'flex';
            this.loadAllData();
        } else {
            document.getElementById('login-view').style.display = 'flex';
            document.getElementById('app-view').style.display = 'none';
        }
    },

    handleLogin(e) {
        e.preventDefault();
        const pwd = document.getElementById('admin-password').value;
        // Simple frontend password check for admin
        if (pwd === 'admin123') {
            localStorage.setItem('admin_auth', 'true');
            this.init();
        } else {
            alert('Incorrect password');
        }
    },

    logout() {
        localStorage.removeItem('admin_auth');
        window.location.reload();
    },

    // 2. Navigation
    switchTab(tabId) {
        // Update Nav Active State
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-item[data-target="${tabId}"]`);
        if(activeBtn) activeBtn.classList.add('active');

        // Update Content Active State
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${tabId}-section`).classList.add('active');
    },

    showLoader() { document.getElementById('global-loader').style.display = 'flex'; },
    hideLoader() { document.getElementById('global-loader').style.display = 'none'; },

    // 3. Data Fetching
    async loadAllData() {
        this.showLoader();
        try {
            await Promise.all([
                this.fetchOrders(false),
                this.fetchProducts(false),
                this.fetchSettings(false)
            ]);
            this.updateDashboard();
        } catch (error) {
            console.error("Error loading data:", error);
            alert("Error loading store data. Please ensure Supabase tables are created.");
        } finally {
            this.hideLoader();
        }
    },

    // --- ORDERS MANAGEMENT ---
    async fetchOrders(showLoad = true) {
        if(showLoad) this.showLoader();
        try {
            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            this.orders = data || [];
            this.renderOrders();
            this.updateDashboard();
        } catch (error) {
            console.error(error);
            if(showLoad) alert("Failed to fetch orders.");
        } finally {
            if(showLoad) this.hideLoader();
        }
    },

    renderOrders() {
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = '';
        
        if (this.orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">No orders found.</td></tr>`;
            return;
        }

        this.orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'});
            tbody.innerHTML += `
                <tr>
                    <td>#${order.id.slice(0,8)}<br><small style="color:var(--color-text-muted)">${date}</small></td>
                    <td>${order.customer_name}</td>
                    <td>₹${order.total.toLocaleString('en-IN')}</td>
                    <td><span class="badge ${order.status.toLowerCase()}">${order.status}</span></td>
                    <td>
                        <button class="btn btn-secondary btn-small" onclick="AdminApp.viewOrder('${order.id}')">View</button>
                    </td>
                </tr>
            `;
        });
    },

    viewOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if(!order) return;

        const date = new Date(order.created_at).toLocaleString();
        
        // Parse products if it's a string, otherwise use as array
        let items = [];
        try { items = typeof order.products === 'string' ? JSON.parse(order.products) : order.products; } catch(e){}

        let itemsHtml = items.map(item => `
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--color-border);">
                <span>${item.qty}x ${item.name}</span>
                <span>₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
        `).join('');

        const modalBody = document.getElementById('order-modal-body');
        modalBody.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; align-items:center;">
                <span class="badge ${order.status.toLowerCase()}" style="font-size: 1rem;">${order.status}</span>
                <button class="btn btn-secondary btn-small" onclick="AdminApp.generateInvoice('${order.id}')"><i class="ph ph-printer"></i> Invoice</button>
            </div>
            
            <div class="order-detail-grid">
                <div class="detail-box">
                    <h4>Customer Details</h4>
                    <p><strong>Name:</strong> ${order.customer_name}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <p><strong>City:</strong> ${order.city || 'N/A'}</p>
                    <p><strong>Pincode:</strong> ${order.pincode || 'N/A'}</p>
                    <p><strong>Address:</strong><br>${order.address}</p>
                </div>
                <div class="detail-box">
                    <h4>Order Summary</h4>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <div style="margin-top: 16px;">
                        ${itemsHtml}
                        <div style="display:flex; justify-content:space-between; font-weight:bold; margin-top: 12px; font-size: 1.1rem;">
                            <span>Total</span>
                            <span>₹${order.total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-box">
                <h4>Update Status</h4>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn ${order.status==='Pending'?'btn-primary':'btn-secondary'}" onclick="AdminApp.updateOrderStatus('${order.id}', 'Pending')">Pending</button>
                    <button class="btn ${order.status==='Confirmed'?'btn-primary':'btn-secondary'}" onclick="AdminApp.updateOrderStatus('${order.id}', 'Confirmed')">Confirmed</button>
                    <button class="btn ${order.status==='Shipped'?'btn-primary':'btn-secondary'}" onclick="AdminApp.updateOrderStatus('${order.id}', 'Shipped')">Shipped</button>
                    <button class="btn ${order.status==='Delivered'?'btn-primary':'btn-secondary'}" onclick="AdminApp.updateOrderStatus('${order.id}', 'Delivered')">Delivered</button>
                    <button class="btn ${order.status==='Cancelled'?'btn-primary':'btn-secondary'} text-danger" onclick="AdminApp.updateOrderStatus('${order.id}', 'Cancelled')">Cancel</button>
                </div>
            </div>
        `;

        document.getElementById('order-modal').classList.add('active');
    },

    async updateOrderStatus(id, newStatus) {
        this.showLoader();
        try {
            const { error } = await supabaseClient
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if(error) throw error;
            
            // Update local state and re-render
            const index = this.orders.findIndex(o => o.id === id);
            if(index !== -1) this.orders[index].status = newStatus;
            
            this.renderOrders();
            this.updateDashboard();
            this.viewOrder(id); // refresh modal

        } catch (error) {
            console.error(error);
            alert("Failed to update status.");
        } finally {
            this.hideLoader();
        }
    },

    // --- DASHBOARD ---
    updateDashboard() {
        // Stats Math
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + parseFloat(o.total), 0);
        const pendingCount = this.orders.filter(o => o.status === 'Pending').length;

        document.getElementById('dash-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN', {minimumFractionDigits:2})}`;
        document.getElementById('dash-orders-count').textContent = totalOrders;
        document.getElementById('dash-pending-count').textContent = pendingCount;

        // Recent Orders (Top 5)
        const recent = this.orders.slice(0, 5);
        const tbody = document.getElementById('dash-recent-orders');
        tbody.innerHTML = '';
        if(recent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">No recent orders.</td></tr>`;
        } else {
            recent.forEach(order => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${order.id.slice(0,8)}</td>
                        <td>${order.customer_name}</td>
                        <td>₹${order.total.toLocaleString('en-IN')}</td>
                        <td><span class="badge ${order.status.toLowerCase()}">${order.status}</span></td>
                    </tr>
                `;
            });
        }
    },

    // --- PRODUCTS MANAGEMENT ---
    async fetchProducts(showLoad = true) {
        if(showLoad) this.showLoader();
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                // If table doesn't exist, just catch it
                if(error.code === '42P01') {
                    console.warn("Products table does not exist yet.");
                    this.products = [];
                } else {
                    throw error;
                }
            } else {
                this.products = data || [];
            }
            this.renderProducts();
        } catch (error) {
            console.error(error);
        } finally {
            if(showLoad) this.hideLoader();
        }
    },

    renderProducts() {
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';
        
        if (this.products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">No products found. Click 'Add Product' to create one.</td></tr>`;
            return;
        }

        this.products.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${p.image_url}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                    <td><strong>${p.name}</strong><br><small class="text-muted">${p.category || 'Uncategorized'}</small></td>
                    <td>₹${p.price.toLocaleString('en-IN')}</td>
                    <td>${p.stock}</td>
                    <td>
                        <button class="btn-icon" onclick="AdminApp.editProduct('${p.id}')"><i class="ph ph-pencil-simple"></i></button>
                        <button class="btn-icon text-danger" onclick="AdminApp.deleteProduct('${p.id}')"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    },

    openProductModal() {
        document.getElementById('product-form').reset();
        document.getElementById('prod-id').value = '';
        document.getElementById('product-modal-title').textContent = 'Add Product';
        document.getElementById('product-modal').classList.add('active');
    },

    editProduct(id) {
        const prod = this.products.find(p => p.id === id);
        if(!prod) return;

        document.getElementById('prod-id').value = prod.id;
        document.getElementById('prod-name').value = prod.name;
        document.getElementById('prod-price').value = prod.price;
        document.getElementById('prod-discount').value = prod.discount_price || '';
        document.getElementById('prod-category').value = prod.category || '';
        document.getElementById('prod-stock').value = prod.stock;
        document.getElementById('prod-image').value = prod.image_url;
        document.getElementById('prod-desc').value = prod.description || '';

        document.getElementById('product-modal-title').textContent = 'Edit Product';
        document.getElementById('product-modal').classList.add('active');
    },

    async saveProduct(e) {
        e.preventDefault();
        
        const btn = document.getElementById('btn-save-product');
        const origText = btn.innerHTML;
        btn.innerHTML = 'Saving...';
        btn.disabled = true;

        const id = document.getElementById('prod-id').value;
        const productData = {
            name: document.getElementById('prod-name').value,
            price: parseFloat(document.getElementById('prod-price').value),
            discount_price: parseFloat(document.getElementById('prod-discount').value) || null,
            category: document.getElementById('prod-category').value,
            stock: parseInt(document.getElementById('prod-stock').value),
            image_url: document.getElementById('prod-image').value,
            description: document.getElementById('prod-desc').value
        };

        try {
            if (id) {
                // Update
                const { error } = await supabaseClient.from('products').update(productData).eq('id', id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabaseClient.from('products').insert([productData]);
                if (error) throw error;
            }

            this.closeModal('product-modal');
            await this.fetchProducts(true);

        } catch (error) {
            console.error(error);
            alert("Failed to save product. Ensure 'products' table exists with correct schema.");
        } finally {
            btn.innerHTML = origText;
            btn.disabled = false;
        }
    },

    async deleteProduct(id) {
        if(!confirm("Are you sure you want to delete this product?")) return;
        this.showLoader();
        try {
            const { error } = await supabaseClient.from('products').delete().eq('id', id);
            if(error) throw error;
            await this.fetchProducts(false);
        } catch(error) {
            console.error(error);
            alert("Failed to delete product.");
        } finally {
            this.hideLoader();
        }
    },

    // --- SETTINGS MANAGEMENT ---
    async fetchSettings(showLoad = true) {
        if(showLoad) this.showLoader();
        try {
            const { data, error } = await supabaseClient.from('settings').select('*').limit(1);
            
            if (error) {
                if(error.code === '42P01') console.warn("Settings table does not exist.");
                else throw error;
            } else if (data && data.length > 0) {
                this.settings = data[0];
                document.getElementById('set-gst').value = this.settings.gst_percentage || 18;
                document.getElementById('set-shipping').value = this.settings.shipping_charge || 0;
                document.getElementById('set-cod').checked = this.settings.cod_enabled || false;
            }
        } catch (error) {
            console.error("Settings error:", error);
        } finally {
            if(showLoad) this.hideLoader();
        }
    },

    async saveSettings(e) {
        e.preventDefault();
        const btn = document.getElementById('btn-save-settings');
        const origText = btn.innerHTML;
        btn.innerHTML = 'Saving...';
        btn.disabled = true;

        const settingsData = {
            gst_percentage: parseFloat(document.getElementById('set-gst').value),
            shipping_charge: parseFloat(document.getElementById('set-shipping').value),
            cod_enabled: document.getElementById('set-cod').checked
        };

        try {
            if (this.settings && this.settings.id) {
                const { error } = await supabaseClient.from('settings').update(settingsData).eq('id', this.settings.id);
                if (error) throw error;
            } else {
                // Insert first row if doesn't exist
                const { error } = await supabaseClient.from('settings').insert([settingsData]);
                if (error) throw error;
            }
            alert("Settings saved successfully.");
            await this.fetchSettings(false);
        } catch(error) {
            console.error(error);
            alert("Failed to save settings. Ensure 'settings' table exists.");
        } finally {
            btn.innerHTML = origText;
            btn.disabled = false;
        }
    },

    // --- UTILS & INVOICE ---
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    generateInvoice(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if(!order) return;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(22);
            doc.text("INVOICE", 105, 20, null, null, "center");
            
            doc.setFontSize(12);
            doc.text(`Store Name`, 20, 40);
            doc.setFontSize(10);
            doc.text(`Order ID: ${order.id}`, 20, 50);
            doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 55);
            doc.text(`Status: ${order.status}`, 20, 60);

            // Customer info
            doc.setFontSize(12);
            doc.text("Bill To:", 120, 40);
            doc.setFontSize(10);
            doc.text(`${order.customer_name}`, 120, 50);
            doc.text(`Phone: ${order.phone}`, 120, 55);
            
            // Address wrapper (basic implementation)
            const splitAddress = doc.splitTextToSize(`${order.address}, ${order.city || ''} - ${order.pincode || ''}`, 70);
            doc.text(splitAddress, 120, 60);

            // Items Table Header
            doc.setLineWidth(0.5);
            doc.line(20, 80, 190, 80);
            doc.setFontSize(10);
            doc.text("Item", 20, 85);
            doc.text("Qty", 120, 85);
            doc.text("Price", 150, 85);
            doc.text("Total", 180, 85);
            doc.line(20, 88, 190, 88);

            // Items List
            let yPos = 95;
            let items = typeof order.products === 'string' ? JSON.parse(order.products) : order.products;
            
            items.forEach(item => {
                doc.text(doc.splitTextToSize(item.name, 90), 20, yPos);
                doc.text(`${item.qty}`, 120, yPos);
                doc.text(`${item.price}`, 150, yPos);
                doc.text(`${item.price * item.qty}`, 180, yPos);
                yPos += 10;
            });

            doc.line(20, yPos + 5, 190, yPos + 5);
            
            // Grand Total
            doc.setFontSize(12);
            doc.text("Grand Total:", 140, yPos + 15);
            doc.text(`INR ${order.total}`, 180, yPos + 15);

            // Save PDF
            doc.save(`Invoice_${order.id.slice(0,6)}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate PDF. Make sure jsPDF is loaded correctly.");
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    AdminApp.init();
});

