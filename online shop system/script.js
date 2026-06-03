const API_URL = 'http://127.0.0.1:5000/api/orders';
let activeTrackingId = null; 
const STATUS_SEQUENCE = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

// Simulated Message Database Pool
const MOCK_MESSAGES = [
    { name: "Amit Verma", address: "Flat 402, Rose Heights, Mohali", itemValue: "320", text: "Hey Sumit, please send 1 Capsicum & Onion Pizza to my flat urgently. Thanks!" },
    { name: "Priya Patel", address: "House 14, Sector 22, Chandigarh", itemValue: "180", text: "Can I get 1 Paneer Tikka Roll delivered to Sector 22? Payment upon arrival." },
    { name: "Vikram Singh", address: "Pocket B, Phase 3, Panchkula", itemValue: "260", text: "Please log 1 Chicken Butter Masala Wrap for Vikram, Phase 3. Delivery address attached." }
];

document.addEventListener('DOMContentLoaded', () => {
    syncWithDatabase();
    document.getElementById('orderForm').addEventListener('submit', createOrder);
    document.getElementById('generateMsgBtn').addEventListener('click', simulateIncomingMessage);
});

// 1. FETCH LIVE DATA FROM PYTHON
async function syncWithDatabase() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        document.getElementById('shopBalance').innerText = data.shopBalance.toFixed(2);
        renderKitchenQueue(data.orders);
        renderLiveTracking(data.orders);
    } catch (err) {
        console.error("Database connection dropped:", err);
    }
}

// 2. SEND NEW ORDER TO PYTHON (STORES IN SQL)
async function createOrder(e) {
    e.preventDefault();
    const nameInput = document.getElementById('customerName');
    const addressInput = document.getElementById('address');
    const itemSelect = document.getElementById('menuItem');

    const orderPayload = {
        customer_name: nameInput.value.trim(),
        delivery_address: addressInput.value.trim(),
        order_value: parseFloat(itemSelect.value)
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });
        nameInput.value = '';
        addressInput.value = '';
        syncWithDatabase();
    } catch (err) {
        console.error("Failed to save order:", err);
    }
}

// 3. UPDATE STATUS IN SQL VIA PYTHON
async function advanceOrderStatus(orderId, currentStatus) {
    const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);
    if (currentIndex >= 3) return;
    const nextStatus = STATUS_SEQUENCE[currentIndex + 1];

    try {
        await fetch(`${API_URL}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, nextStatus: nextStatus })
        });
        syncWithDatabase();
    } catch (err) {
        console.error("Failed to update status:", err);
    }
}

// 4. CANCEL ORDER IN SQL VIA PYTHON
async function cancelOrder(orderId) {
    try {
        await fetch(`${API_URL}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, nextStatus: 'CANCELLED' })
        });
        syncWithDatabase();
    } catch (err) {
        console.error("Failed to cancel order:", err);
    }
}

function simulateIncomingMessage() {
    const stream = document.getElementById('messageStream');
    if(stream.querySelector('.empty-state')) stream.innerHTML = '';

    const randomTemplate = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgBubble = document.createElement('div');
    msgBubble.className = 'msg-bubble';
    msgBubble.innerHTML = `
        <div class="msg-header"><strong>💬 ${randomTemplate.name}</strong><span>${timeStr}</span></div>
        <div class="msg-body">"${randomTemplate.text}"</div>
        <button type="button" class="btn-populate" onclick="autoFillForm('${randomTemplate.name}', '${randomTemplate.address}', '${randomTemplate.itemValue}', this)">
            Auto-Fill Form
        </button>
    `;
    stream.insertBefore(msgBubble, stream.firstChild);
}

function autoFillForm(name, address, itemValue, buttonEl) {
    document.getElementById('customerName').value = name;
    document.getElementById('address').value = address;
    document.getElementById('menuItem').value = itemValue;
    buttonEl.parentElement.style.opacity = '0.5';
    buttonEl.innerText = 'Copied to Fields';
    buttonEl.disabled = true;
}

function renderKitchenQueue(orders) {
    const tbody = document.getElementById('kitchenTableBody');
    tbody.innerHTML = ''; 

    orders.forEach(order => {
        const row = document.createElement('tr');
        const isCancelled = order.status === 'CANCELLED';
        const isDelivered = order.status === 'DELIVERED';
        
        let advanceButton = isDelivered 
            ? `<span style="color: var(--status-delivered); font-weight:600;">Funds Received</span>`
            : (isCancelled ? `<span style="color: var(--text-muted);">Voided</span>` 
            : `<button class="btn-status" onclick="event.stopPropagation(); advanceOrderStatus(${order.order_id}, '${order.status}')">Move Step</button>`);

        let cancelButton = isCancelled 
            ? `<span style="color: var(--text-muted); font-size: 0.8rem;">Cancelled</span>`
            : `<button class="btn-cancel" onclick="event.stopPropagation(); cancelOrder(${order.order_id})">${isDelivered ? 'Revoke & Refund' : 'Cancel Order'}</button>`;

        row.innerHTML = `
            <td>#${order.order_id}</td>
            <td><strong>${order.customer_name}</strong></td>
            <td style="color: var(--text-light); font-weight:600;">₹${order.order_value}</td>
            <td><span class="badge badge-${order.status}">${order.status}</span></td>
            <td>${advanceButton}</td>
            <td>${cancelButton}</td>
        `;
        
        row.addEventListener('click', () => {
            activeTrackingId = order.order_id;
            renderLiveTracking(orders);
        });
        tbody.appendChild(row);
    });
}

function renderLiveTracking(orders) {
    const trackBox = document.getElementById('activeTrackBox');
    if (!activeTrackingId && orders.length > 0) activeTrackingId = orders[0].order_id;
    if (!activeTrackingId) return;

    const order = orders.find(o => parseInt(o.order_id) === parseInt(activeTrackingId));
    if (!order) return;

    trackBox.className = "track-box";
    if (order.status === 'CANCELLED') {
        trackBox.innerHTML = `<strong>Order Tracking #${order.order_id}</strong><br><span style="color: var(--status-danger); font-weight:700;">STATUS: CANCELLED</span>`;
        return;
    }

    const currentIdx = STATUS_SEQUENCE.indexOf(order.status);
    const steps = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    
    const stepsHtml = steps.map((step, idx) => `
        <div class="status-step ${idx <= currentIdx ? 'step-active' : ''}">
            <div class="step-dot"></div><span>${step}</span>
        </div>
    `).join('');

    trackBox.innerHTML = `
        <div style="margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            <strong>Tracking Order #${order.order_id}</strong> (₹${order.order_value})<br>
            <span style="color: var(--text-muted)">To: ${order.delivery_address}</span>
        </div>
        <div class="steps-container">${stepsHtml}</div>
    `;
}