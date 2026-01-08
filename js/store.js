/**
 * LocalStorage Wrapper for MedFlow
 * Handles all CRUD operations with browser storage
 */

const DB_KEYS = {
    USERS: 'medflow_users',
    INVENTORY: 'medflow_inventory',
    ATTENDANCE: 'medflow_attendance',
    SESSION: 'medflow_session'
};

const Store = {
    // --- Generic Helpers ---
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    set: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    },

    // --- User / Auth ---
    initUsers: () => {
        if (!Store.get(DB_KEYS.USERS)) {
            // Default Admin
            Store.set(DB_KEYS.USERS, [
                { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Super Admin' }
            ]);
        }
    },

    login: (username, password) => {
        const users = Store.get(DB_KEYS.USERS) || [];
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            Store.set(DB_KEYS.SESSION, user);
            return { success: true, user };
        }
        return { success: false, message: 'Invalid Credentials' };
    },

    logout: () => {
        localStorage.removeItem(DB_KEYS.SESSION);
    },

    getSession: () => {
        return Store.get(DB_KEYS.SESSION);
    },

    // --- Activity Log ---
    getRecentActivity: () => {
        return Store.get(DB_KEYS.ACTIVITY) || [];
    },

    logActivity: (action, description) => {
        const activities = Store.getRecentActivity();
        const newActivity = {
            id: Date.now(),
            action,
            description,
            timestamp: new Date().toISOString(),
            user: Store.getSession()?.name || 'System'
        };
        activities.unshift(newActivity); // Add to top
        if (activities.length > 50) activities.pop(); // Keep last 50
        Store.set(DB_KEYS.ACTIVITY, activities);
    },

    // --- Inventory Management ---
    getInventory: () => {
        return Store.get(DB_KEYS.INVENTORY) || [];
    },

    addItem: (item) => {
        const inventory = Store.getInventory();
        item.id = Date.now();
        item.updatedAt = new Date().toISOString();
        inventory.push(item);
        Store.set(DB_KEYS.INVENTORY, inventory);
        Store.logActivity('ADD_ITEM', `Added new medicine: ${item.name}`);
        return item;
    },

    updateItem: (id, updates) => {
        let inventory = Store.getInventory();
        const index = inventory.findIndex(i => i.id == id);
        if (index > -1) {
            const oldName = inventory[index].name;
            inventory[index] = { ...inventory[index], ...updates, updatedAt: new Date().toISOString() };
            Store.set(DB_KEYS.INVENTORY, inventory);
            Store.logActivity('UPDATE_ITEM', `Updated details for: ${oldName}`);
            return true;
        }
        return false;
    },

    deleteItem: (id) => {
        let inventory = Store.getInventory();
        const item = inventory.find(i => i.id == id);
        const filtered = inventory.filter(i => i.id != id);
        Store.set(DB_KEYS.INVENTORY, filtered);
        if (item) Store.logActivity('DELETE_ITEM', `Deleted medicine: ${item.name}`);
        return true;
    },

    // --- Reporting ---
    exportData: () => {
        const data = {
            users: Store.get(DB_KEYS.USERS),
            inventory: Store.get(DB_KEYS.INVENTORY),
            attendance: Store.get(DB_KEYS.ATTENDANCE),
            activity: Store.get(DB_KEYS.ACTIVITY),
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Store.logActivity('BACKUP', 'System data exported');
    }
};

// Initialize DB on load
Store.initUsers();
if (!Store.get(DB_KEYS.ACTIVITY)) Store.set(DB_KEYS.ACTIVITY, []);
