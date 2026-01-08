/**
 * MedFlow Application Logic
 * Handles Routing, UI Rendering, and Event Listeners
 */

const App = {
    root: document.getElementById('app'),

    init: () => {
        App.checkAuth();
    },

    checkAuth: () => {
        const session = Store.getSession();
        if (session) {
            App.renderDashboard(session);
        } else {
            App.renderLogin();
        }
    },

    // --- Views ---

    renderLogin: () => {
        App.root.innerHTML = `
            <div class="login-container animate-fade-in">
                <div class="glass-card">
                    <div class="logo-area">
                        <svg class="logo-icon" viewBox="0 0 24 24">
                            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M18 11H13V16H11V11H6V9H11V4H13V9H18V11Z" />
                        </svg>
                    </div>
                    <h1>MedFlow</h1>
                    <p class="subtitle">Offline Medical Store System</p>
                    
                    <form id="loginForm">
                        <div class="form-group">
                            <input type="text" id="username" placeholder="Username" required autocomplete="off">
                        </div>
                        <div class="form-group">
                            <input type="password" id="password" placeholder="Password" required>
                        </div>
                        <button type="submit" class="btn">
                            <span>Login to Dashboard</span>
                        </button>
                    </form>
                    <p style="margin-top: 20px; font-size: 0.8rem; color: var(--text-muted); opacity: 0.7;">Default: admin / 123</p>
                </div>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;

            const result = Store.login(u, p);
            if (result.success) {
                App.showToast('Welcome back, ' + result.user.name, 'success');
                App.renderDashboard(result.user);
            } else {
                App.showToast(result.message, 'error');
                // Shake animation for error
                const card = document.querySelector('.glass-card');
                card.style.animation = 'shake 0.5s ease';
                setTimeout(() => card.style.animation = '', 500);
            }
        });
    },

    renderDashboard: (user) => {
        const inventory = Store.getInventory();
        const lowStock = inventory.filter(i => i.stock < 10).length;
        const totalValue = inventory.reduce((acc, item) => acc + (item.price * item.stock), 0).toFixed(2);

        // Check for expiring items (within 30 days)
        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);

        const expiring = inventory.filter(i => {
            const exp = new Date(i.expiry);
            return exp >= today && exp <= next30Days;
        });

        App.root.innerHTML = `
            <div class="dashboard-layout animate-fade-in">
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <div style="background:var(--primary); padding:8px; border-radius:8px; margin-right:10px; box-shadow:0 0 15px var(--primary-dark);">
                            <svg style="width:24px;height:24px;fill:#000" viewBox="0 0 24 24"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M18 11H13V16H11V11H6V9H11V4H13V9H18V11Z" /></svg>
                        </div>
                        <div>
                            <h2 style="margin:0; font-size:1.2rem; line-height:1;">MedFlow</h2>
                            <small style="font-size:0.7rem; color:var(--primary);">Offline System</small>
                        </div>
                    </div>
                    
                    <nav>
                        <a href="#" class="nav-item active" onclick="App.navigate('dashboard', this)">
                            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M3,13H11V3H3V13M3,21H11V15H3V21M13,21H21V11H13V21M13,3V9H21V3H13Z" /></svg>
                            Dashboard
                        </a>
                        <a href="#" class="nav-item" onclick="App.navigate('inventory', this)">
                            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4V22H22V4C22 2.9 21.1 2 20 2M20 12H4V8H20V12M20 16H4V20H20V16Z" /></svg>
                            Inventory
                        </a>
                        <a href="#" class="nav-item" onclick="App.navigate('activity', this)">
                           <svg class="nav-icon" viewBox="0 0 24 24"><path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L10,12V8C10,6.89 10.89,6 12,6C13.11,6 14,6.89 14,8V12M16,8V12H21V8C21,6.89 20.11,6 19,6H17C16.45,6 15.95,6.22 15.59,6.59C15.22,6.22 14.72,6 14.17,6C14.06,6 13.95,6.01 13.84,6.03C13.34,4.2 11.69,2.83 9.71,2.83C7.38,2.83 5.5,4.72 5.5,7.05C5.5,8.81 6.57,10.32 8.08,10.95V12H3V8C3,6.89 3.89,6 5,6H7V12H8V17.87C8.04,18.16 7.94,18.47 7.71,18.7L5.7,20.71C5.31,21.1 4.68,21.1 4.29,20.71C4.06,20.5 3.96,20.18 4,19.88V13H3V19.88A2,2 0 0,0 5,22H6.5A1.5,1.5 0 0,0 8,20.5V14H9V20.5A1.5,1.5 0 0,0 10.5,22H19C20.11,22 21,21.11 21,20V13H21V19.88C21.04,20.18 20.94,20.5 20.71,20.71C20.32,21.1 19.69,21.1 19.3,20.71L17.29,18.7C17.06,18.47 16.96,18.16 17,17.87V12H16V17.87C16.03,17.96 16.03,18.06 16.03,18.15L16.71,18.84V13H16V12H15.86C15.95,11.83 16,11.65 16,11.45V8Z" /></svg>
                            Activity
                        </a>
                        <a href="#" class="nav-item" onclick="App.navigate('reports', this)">
                            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M7,20H9V14H7V20M11,20H13V12H11V20M15,20H17V16H15V20Z" /></svg>
                            Reports
                        </a>
                    </nav>

                    <div class="sidebar-footer">
                        <div class="user-info" style="margin-bottom:15px; display:flex; gap:10px; align-items:center;">
                            <div style="width:32px; height:32px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#000; font-weight:bold;">
                                ${user.name.charAt(0)}
                            </div>
                            <div>
                                <div style="font-weight:600;">${user.name}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${user.role}</div>
                            </div>
                        </div>
                        <button onclick="App.logout()" class="btn btn-secondary btn-small" style="width:100%">Logout</button>
                    </div>
                </aside>
                
                <main class="main-content" id="mainContent">
                    <!-- Content injected here -->
                </main>
            </div>
        `;

        App.loadDashboardHome(inventory, lowStock, totalValue, expiring);
    },

    navigate: (page, element) => {
        // Update Active State
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (element) element.classList.add('active');

        const main = document.getElementById('mainContent');

        if (page === 'dashboard') {
            const inventory = Store.getInventory();
            const lowStock = inventory.filter(i => i.stock < 10).length;
            const totalValue = inventory.reduce((acc, item) => acc + (item.price * item.stock), 0).toFixed(2);
            // Check for expiring items (within 30 days)
            const today = new Date();
            const next30Days = new Date();
            next30Days.setDate(today.getDate() + 30);
            const expiring = inventory.filter(i => {
                const exp = new Date(i.expiry);
                return exp >= today && exp <= next30Days;
            });
            App.loadDashboardHome(inventory, lowStock, totalValue, expiring);
        }
        else if (page === 'inventory') App.loadInventory();
        else if (page === 'activity') App.loadActivity();
        else if (page === 'reports') App.loadReports();
    },

    loadDashboardHome: (inventory, lowStock, totalValue, expiring) => {
        const categories = {};
        inventory.forEach(i => {
            const cat = i.category || 'Other';
            categories[cat] = (categories[cat] || 0) + 1;
        });
        const totalItems = inventory.length || 1; // avoid divide by zero

        const main = document.getElementById('mainContent');
        main.innerHTML = `
            <div class="animate-slide-in">
                <header class="content-header" style="align-items:flex-start">
                    <div>
                        <h1>Overview</h1>
                        <p style="color:var(--text-muted)">Welcome back. Here's what's happening today.</p>
                    </div>
                    <div style="text-align:right">
                        <div style="font-size:1.5rem; font-weight:bold; color:var(--primary);">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div style="font-size:0.9rem; color:var(--text-muted);">${new Date().toLocaleDateString()}</div>
                    </div>
                </header>

                <div class="card-grid">
                     <div class="stat-card">
                        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M9 19H7V17H9V19M13 19H11V17H13V19M17 19H15V17H17V19M9 15H7V13H9V15M13 15H11V13H13V15M17 15H15V13H17V15M9 11H7V9H9V11M13 11H11V9H13V11M17 11H15V9H17V11M9 7H7V5H9V7M13 7H11V5H13V7M17 7H15V5H17V7Z" /></svg></div>
                        <div class="stat-info">
                            <h3>${inventory.length}</h3>
                            <p>Total Medicines</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="color:var(--accent); background:rgba(213, 0, 249, 0.1);"><svg viewBox="0 0 24 24"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" /></svg></div>
                        <div class="stat-info">
                            <h3>${lowStock}</h3>
                            <p>Low Stock Alerts</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon" style="color:#00e5ff; background:rgba(0, 229, 255, 0.1);"><svg viewBox="0 0 24 24"><path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" /></svg></div>
                        <div class="stat-info">
                            <h3>$${totalValue}</h3>
                            <p>Total Inventory Value</p>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <!-- Expiring Items Section -->
                    <div class="glass-card" style="text-align:left; padding: 25px;">
                        <h3 style="margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
                            <span>Expiring Soon (30 Days)</span>
                            <span style="font-size: 0.8rem; background: rgba(255,82,82,0.2); color: #ff5252; padding: 2px 8px; border-radius: 4px;">${expiring.length} Alerts</span>
                        </h3>
                        ${expiring.length > 0 ? `
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                ${expiring.map(i => `
                                    <div style="background: rgba(255,82,82,0.1); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,82,82,0.3); font-size: 0.9rem;">
                                        <strong>${i.name}</strong> <span style="opacity:0.7; font-size:0.8rem">(${i.expiry})</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p style="color:var(--text-muted)">No items expiring soon. Good job!</p>'}
                    </div>

                    <!-- Category Dist Section -->
                    <div class="glass-card" style="text-align:left; padding: 25px;">
                        <h3 style="margin-bottom: 15px;">Stock Distribution</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${Object.keys(categories).length > 0 ? Object.entries(categories).map(([cat, count]) => `
                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
                                        <span>${cat}</span>
                                        <span>${((count / totalItems) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                                        <div style="height:100%; width:${(count / totalItems) * 100}%; background:var(--primary);"></div>
                                    </div>
                                </div>
                            `).join('') : '<p style="color:var(--text-muted)">No data yet.</p>'}
                        </div>
                    </div>
                </div>

                <div class="glass-card" style="text-align: left;">
                    <h3>Quick Actions</h3>
                    <div style="display: flex; gap: 15px; margin-top: 15px;">
                        <button onclick="App.openModal('addParams')" class="btn btn-small">Add Medicine</button>
                        <button onclick="App.navigate('reports', null)" class="btn btn-small btn-secondary">Backup Data</button>
                    </div>
                </div>
            </div>
        `;
    },

    loadSettings: () => {
        const main = document.getElementById('mainContent');
        const user = Store.getSession();

        main.innerHTML = `
            <div class="animate-slide-in">
                <h1>Settings</h1>
                <p style="color:var(--text-muted); margin-bottom:30px;">Manage system preferences.</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="glass-card" style="text-align:left;">
                        <h3>Store Profile</h3>
                        <form style="margin-top:20px;">
                            <div class="form-group">
                                <label>Store Name</label>
                                <input type="text" value="My Medical Store" readonly style="opacity:0.7; cursor:not-allowed;">
                            </div>
                            <div class="form-group">
                                <label>Administrator</label>
                                <input type="text" value="${user.name}" readonly style="opacity:0.7; cursor:not-allowed;">
                            </div>
                            <button type="button" class="btn btn-secondary" onclick="App.showToast('Profile management coming soon!')">Edit Profile</button>
                        </form>
                    </div>

                     <div class="glass-card" style="text-align:left;">
                        <h3>Preferences</h3>
                         <div style="margin-top:20px; display:flex; flex-direction:column; gap:15px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:15px; border-bottom:1px solid var(--border);">
                                <div>
                                    <div style="font-weight:600;">Dark/Light Mode</div>
                                    <div style="font-size:0.8rem; color:var(--text-muted);">Toggle application theme</div>
                                </div>
                                <button class="btn btn-small btn-secondary" style="width:auto;" onclick="App.showToast('Theme toggle coming soon!')">Auto</button>
                            </div>
                             <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:15px; border-bottom:1px solid var(--border);">
                                <div>
                                    <div style="font-weight:600;">Currency</div>
                                    <div style="font-size:0.8rem; color:var(--text-muted);">Set default currency</div>
                                </div>
                                <select style="width:auto; padding:5px 10px;" disabled><option>$ USD</option><option>₹ INR</option></select>
                            </div>
                             <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-weight:600;">Data Sync</div>
                                    <div style="font-size:0.8rem; color:var(--text-muted);">Backup interval</div>
                                </div>
                                <select style="width:auto; padding:5px 10px;" disabled><option>Daily</option><option>Weekly</option></select>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        `;
    },

    loadInventory: () => {
        const inventory = Store.getInventory();
        App.renderInventoryTable(inventory);
    },

    renderInventoryTable: (items) => {
        const main = document.getElementById('mainContent');

        const html = `
            <div class="content-header animate-slide-in">
                <div>
                    <h1>Inventory</h1>
                    <p style="color:var(--text-muted)">Manage medicine stock & details.</p>
                </div>
                <button onclick="App.openModal('addParams')" class="btn btn-small">
                    + Add New Medicine
                </button>
            </div>

            <div class="animate-slide-in" style="margin-bottom: 20px; display: flex; gap: 10px;">
                <input type="text" id="searchInput" placeholder="Search medicines..." style="flex: 2" onkeyup="App.filterInventory()">
                <select id="categoryFilter" style="flex: 1" onchange="App.filterInventory()">
                    <option value="">All Categories</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Cream">Cream</option>
                    <option value="Equipment">Medical Equipment</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div class="table-container animate-slide-in" id="inventoryTable">
                ${App.generateTableHtml(items)}
            </div>
        `;
        main.innerHTML = html;
    },

    filterInventory: () => {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const cat = document.getElementById('categoryFilter').value;

        const inventory = Store.getInventory();
        const filtered = inventory.filter(item => {
            const matchesQuery = item.name.toLowerCase().includes(query) || (item.manufacturer || '').toLowerCase().includes(query);
            const matchesCat = cat === '' || item.category === cat;
            return matchesQuery && matchesCat;
        });

        const tableContainer = document.getElementById('inventoryTable');
        tableContainer.innerHTML = App.generateTableHtml(filtered);
    },

    generateTableHtml: (items) => {
        return `
            <table>
                <thead>
                    <tr>
                        <th>Medicine</th>
                        <th>Category</th>
                        <th>Expiry</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--text-muted);">No items found matching your search.</td></tr>' : ''}
                    ${items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.name}</strong>
                                <div style="font-size:0.75rem; color:var(--text-muted)">${item.manufacturer || '-'}</div>
                            </td>
                            <td>${item.category || 'General'}</td>
                            <td>${item.expiry}</td>
                            <td>${item.stock}</td>
                            <td>$${item.price}</td>
                            <td><span class="status-badge ${item.stock < 10 ? 'status-low' : 'status-ok'}">${item.stock < 10 ? 'Low Stock' : 'In Stock'}</span></td>
                            <td class="actions">
                                <button class="icon-btn" onclick="App.editItem(${item.id})">✎</button>
                                <button class="icon-btn delete" onclick="App.deleteItem(${item.id})">✖</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    loadActivity: () => {
        const activities = Store.getRecentActivity();
        const main = document.getElementById('mainContent');
        main.innerHTML = `
            <div class="animate-slide-in">
                <h1>Recent Activity</h1>
                <p style="color:var(--text-muted); margin-bottom:20px;">Tracking changes in the system.</p>
                
                <div class="activity-list">
                    ${activities.length === 0 ? '<p>No activity yet.</p>' : ''}
                    ${activities.map(a => `
                        <div class="activity-item ${a.action}">
                            <div>
                                <strong>${a.description}</strong>
                                <div class="activity-meta">By ${a.user} • ${new Date(a.timestamp).toLocaleString()}</div>
                            </div>
                            <small class="activity-meta">${a.action}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    loadReports: () => {
        const main = document.getElementById('mainContent');
        main.innerHTML = `
            <div class="animate-slide-in">
                <h1>Reports</h1>
                <p style="color:var(--text-muted); margin-bottom:20px;">Download your offline data backups.</p>
                
                <div class="glass-card" style="text-align:left; max-width:600px;">
                    <h3>Data Backup</h3>
                    <p style="margin-bottom:20px;">Export all inventory, user, and attendance data to a JSON file. Use this to transfer data or keep a safe backup.</p>
                    <button onclick="Store.exportData()" class="btn">
                        Download Full Backup (JSON)
                    </button>
                </div>
            </div>
        `;
    },

    loadSettings: () => {
        const main = document.getElementById('mainContent');
        main.innerHTML = `
            <div class="animate-slide-in">
                <h1>Settings</h1>
                <p>System configuration.</p>
            </div>
        `;
    },

    // --- Actions ---

    openModal: (type) => {
        // Simple Modal Implementation
        const modalHtml = `
            <div class="modal-overlay open" id="modalOverlay">
                <div class="modal">
                    <div class="modal-header">
                        <h2>Add Medicine Details</h2>
                        <button class="close-modal" onclick="App.closeModal()">×</button>
                    </div>
                    <form id="addItemForm">
                        <div class="form-group"><label>Medicine Name</label><input type="text" name="name" required></div>
                        <div class="form-group"><label>Category</label>
                            <select name="category" required>
                                <option value="Tablet">Tablet</option>
                                <option value="Syrup">Syrup</option>
                                <option value="Injection">Injection</option>
                                <option value="Cream">Cream</option>
                                <option value="Equipment">Medical Equipment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Manufacturer</label><input type="text" name="manufacturer" placeholder="e.g. Pfizer, Sun Pharma"></div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <div class="form-group"><label>Batch Number</label><input type="text" name="batch" required></div>
                            <div class="form-group"><label>Expiry Date</label><input type="date" name="expiry" required></div>
                        </div>
                         <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <div class="form-group"><label>Stock Quantity</label><input type="number" name="stock" required min="0"></div>
                            <div class="form-group"><label>Price (Per Unit)</label><input type="number" name="price" required min="0" step="0.01"></div>
                        </div>
                        <button type="submit" class="btn">Save Item</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('addItemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const item = Object.fromEntries(formData.entries());
            Store.addItem(item);
            App.closeModal();
            App.loadInventory();
            App.showToast('Item Added Successfully', 'success');
        });
    },

    closeModal: () => {
        const el = document.getElementById('modalOverlay');
        if (el) el.remove();
    },

    deleteItem: (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            Store.deleteItem(id);
            App.loadInventory();
            App.showToast('Item Deleted', 'success');
        }
    },

    editItem: (id) => {
        App.showToast('Edit feature coming in v2!', 'success');
    },

    logout: () => {
        Store.logout();
        App.checkAuth();
        App.showToast('Logged out successfully', 'success');
    },

    showToast: (msg, type = 'success') => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container); // Append to BODY, not App.root to stay on top
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error' : ''}`;
        toast.innerText = msg;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Start the App
App.init();
