/**
 * MedFlow AI Module
 * Intelligent features: Chat Assistant, Smart Predictions, and Voice Interactions
 */

const MedAI = {
    // Simulated "Market Trends" for demo purposes
    marketTrends: {
        'Tablet': 'High',
        'Syrup': 'Moderate',
        'Injection': 'Low',
        'Cream': 'Stable'
    },

    init: () => {
        MedAI.injectChatWidget();
        console.log("MedAI Initialized");
    },

    // --- Smart Insights Generation ---
    getInsights: () => {
        const inventory = Store.getInventory();
        const insights = [];

        // 1. Stockout Prediction (Simulated based on random "daily usage")
        // Find items with stock < 20 and pretend they have high velocity
        const atRisk = inventory.filter(i => i.stock < 20 && i.stock > 0);
        if (atRisk.length > 0) {
            const item = atRisk[Math.floor(Math.random() * atRisk.length)];
            insights.push({
                type: 'danger',
                icon: '📉',
                title: 'Stockout Risk',
                text: `Based on usage trends, <strong>${item.name}</strong> may run out in approx. 3 days. Restock recommended.`
            });
        }

        // 2. Seasonal Suggestion (Randomized for variety)
        const seasons = [
            { text: "Flu season detected. Ensure high stock of Antibiotics and Vitamin C.", cat: "Tablet" },
            { text: "Allergy season approaching. check Antihistamines stock.", cat: "Syrup" }
        ];
        const seasonal = seasons[Math.floor(Math.random() * seasons.length)];
        insights.push({
            type: 'info',
            icon: '🌤️',
            title: 'Market Intelligence',
            text: seasonal.text
        });

        // 3. Dead Stock Detection (Items with no mock activity)
        // Just picking a random item with high stock
        const deadStock = inventory.find(i => i.stock > 100);
        if (deadStock) {
            insights.push({
                type: 'warning',
                icon: '🛑',
                title: 'Dead Stock Alert',
                text: `<strong>${deadStock.name}</strong> shows low movement. Consider a discount to clear space.`
            });
        }

        return insights;
    },

    // --- Voice Search ---
    startVoiceSearch: () => {
        if (!('webkitSpeechRecognition' in window)) {
            App.showToast("Voice search not supported in this browser.", "error");
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();

        App.showToast("Listening... Speak now.", "info");

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('searchInput').value = transcript;
            App.filterInventory();
            App.showToast(`Searched for: "${transcript}"`, "success");
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            App.showToast("Voice recognition failed.", "error");
        };
    },

    // --- Chat Bot Logic ---
    injectChatWidget: () => {
        const fabHtml = `
            <div id="ai-chat-widget">
                <div class="chat-window" id="chatWindow">
                    <div class="chat-header">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div class="bot-avatar">🤖</div>
                            <div>
                                <div style="font-weight:bold;">MediBot AI</div>
                                <div style="font-size:0.7rem; opacity:0.8;">Always active</div>
                            </div>
                        </div>
                        <button onclick="MedAI.toggleChat()" style="background:none; border:none; color:white; cursor:pointer;">×</button>
                    </div>
                    <div class="chat-messages" id="chatMessages">
                        <div class="message bot">
                            Hello! I'm MediBot. Ask me about stock, expiry, or sales trends.
                        </div>
                    </div>
                    <div class="chat-input-area">
                        <input type="text" id="chatInput" placeholder="Ask anything..." onkeypress="MedAI.handleChatKey(event)">
                        <button onclick="MedAI.sendChat()" class="btn-send">➤</button>
                    </div>
                </div>
                <button class="ai-fab" onclick="MedAI.toggleChat()">
                    🤖
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', fabHtml);
    },

    toggleChat: () => {
        const window = document.getElementById('chatWindow');
        window.classList.toggle('open');
        if (window.classList.contains('open')) {
            document.getElementById('chatInput').focus();
        }
    },

    handleChatKey: (e) => {
        if (e.key === 'Enter') MedAI.sendChat();
    },

    sendChat: () => {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text) return;

        // Add User Message
        MedAI.addMessage(text, 'user');
        input.value = '';

        // Simulate AI Processing time
        setTimeout(() => {
            const response = MedAI.processQuery(text);
            MedAI.addMessage(response, 'bot');
        }, 500);
    },

    addMessage: (text, sender) => {
        const container = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.innerHTML = text;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    processQuery: (query) => {
        const q = query.toLowerCase();
        const inventory = Store.getInventory();

        // Intent: Check Stock
        if (q.includes('stock') || q.includes('how many') || q.includes('have')) {
            // Extract item name... naive approach
            const item = inventory.find(i => q.includes(i.name.toLowerCase()));
            if (item) {
                return `We have <strong>${item.stock}</strong> units of ${item.name}. Status: ${item.stock < 10 ? 'Low Stock ⚠️' : 'Good ✅'}`;
            }
            return "I couldn't identify the medicine name. Try asking 'Stock of [Medicine Name]'.";
        }

        // Intent: Price
        if (q.includes('price') || q.includes('cost')) {
            const item = inventory.find(i => q.includes(i.name.toLowerCase()));
            if (item) {
                return `${item.name} costs <strong>$${item.price}</strong> per unit.`;
            }
        }

        // Intent: Low Stock
        if (q.includes('low') || q.includes('shortage')) {
            const low = inventory.filter(i => i.stock < 10);
            if (low.length === 0) return "Inventory is healthy! No low stock items.";
            return `Found ${low.length} low stock items: <br>• ` + low.map(i => i.name).slice(0, 5).join('<br>• ') + (low.length > 5 ? '<br>...and more' : '');
        }

        // Intent: Expiry
        if (q.includes('expiry') || q.includes('expire')) {
            // Find items expiring soon
            // reuse logic or just global search
            const today = new Date();
            const next30Days = new Date();
            next30Days.setDate(today.getDate() + 30);
            const expiring = inventory.filter(i => {
                const exp = new Date(i.expiry);
                return exp >= today && exp <= next30Days;
            });

            if (expiring.length > 0) return `⚠️ ${expiring.length} items expiring soon (30 days):<br>` + expiring.map(i => `${i.name} (${i.expiry})`).join('<br>');
            return "No immediate expiry alerts.";
        }

        // Intent: Hello
        if (q.includes('hi') || q.includes('hello')) return "Hello! available commands: 'Check stock of X', 'Show low stock', 'Expiring items'.";

        return "I'm not sure about that. Try asking about 'stock', 'price', or 'expiry' of items.";
    }
};
