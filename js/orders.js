let pendingOrderData = null;

// STEP 1: CLICK "CONFIRM ORDER" -> OPENS PHONEPE PAYMENT OPTION
function handleConfirmOrderClick() {
  const cart = window.currentCart || JSON.parse(localStorage.getItem('lenka_cart') || '[]');
  
  if (!cart || cart.length === 0) {
    alert('Your bag is empty.');
    return;
  }

  const profile = window.currentProfile || JSON.parse(localStorage.getItem('lenka_profile') || 'null');
  if (!profile || !profile.phone) {
    if (typeof closeCartDrawer === 'function') closeCartDrawer();
    if (typeof openProfileDrawer === 'function') openProfileDrawer();
    alert('Please save your Profile & Shipping Address before confirming.');
    return;
  }

  const total = cart.reduce((sum, i) => sum + Number(i.offerPrice || 0), 0);
  const summary = cart.map(i => i.title).join(', ');

  pendingOrderData = { total, summary, profile };

  // Close bag drawer and open PhonePe QR payment modal
  if (typeof closeCartDrawer === 'function') closeCartDrawer();
  openPhonePeModal(total, summary);
}

// Global fallback for any legacy proceedToCheckout callers
window.proceedToCheckout = handleConfirmOrderClick;
window.handleConfirmOrderClick = handleConfirmOrderClick;

// STEP 2: OPEN PHONEPE PAYMENT MODAL
function openPhonePeModal(total, summary) {
  const upiId = "8977627028-2@ybl";
  const payeeName = "LENKA STORES";
  const note = `Order-${Date.now().toString().slice(-4)}`;

  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR&tn=${encodeURIComponent(note)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  const qrImg = document.getElementById('phonepeQrImage');
  const amtDisplay = document.getElementById('phonepeAmountDisplay');
  const directBtn = document.getElementById('phonepeDirectPayBtn');
  const modal = document.getElementById('phonePePaymentModal');

  if (qrImg) qrImg.src = qrUrl;
  if (amtDisplay) amtDisplay.innerText = `₹${total}`;
  if (directBtn) directBtn.href = upiUri;
  if (modal) modal.classList.remove('hidden');

  if (window.lucide) lucide.createIcons();
}

function closePhonePeModal() {
  const modal = document.getElementById('phonePePaymentModal');
  if (modal) modal.classList.add('hidden');
}

// STEP 3: CLICK "I HAVE PAID" -> COMMITS ORDER & SHOWS 3D POPUP
function confirmPhonePePayment() {
  if (!pendingOrderData) return;

  const { total, summary, profile } = pendingOrderData;
  closePhonePeModal();
  finalizeOrder(total, summary, "PhonePe UPI (8977627028-2@ybl)", profile);
  pendingOrderData = null;
}

// STEP 4: WRITE TO FIRESTORE & TRIGGER 3D OVERLAY
async function finalizeOrder(total, summary, paymentMethod, profile) {
  const activeProfile = profile || window.currentProfile || JSON.parse(localStorage.getItem('lenka_profile') || '{}');
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const orderId = 'LS' + Math.floor(100000 + Math.random() * 900000);

  const newOrder = {
    orderId: orderId,
    customerName: activeProfile.name || 'Client',
    customerPhone: activeProfile.phone || '',
    customerAddress: activeProfile.formattedAddress || JSON.stringify(activeProfile.address || ''),
    customerAvatar: activeProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    itemsSummary: summary,
    totalAmount: total,
    paymentMethod: paymentMethod,
    status: 'Confirmed',
    confirmedDate: today,
    shippingDate: 'Express Scheduled',
    deliveryDate: 'Est. 2-3 Business Days',
    timestamp: today,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  // 1. Save local backup
  let localOrders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  localOrders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(localOrders));

  // 2. Direct Cloud Firestore write
  if (typeof db !== 'undefined' && db !== null) {
    try {
      await db.collection('orders').doc(orderId).set(newOrder);
    } catch (e) {
      console.warn("Cloud Order Save Error:", e);
    }
  }

  // 3. Clear Bag
  window.currentCart = [];
  localStorage.setItem('lenka_cart', JSON.stringify([]));
  if (typeof updateCartUI === 'function') updateCartUI();

  // 4. TRIGGER 3D SUCCESS POPUP
  if (typeof window.showOrderSuccess === 'function') {
    window.showOrderSuccess(orderId);
  } else {
    // Fallback if 3D overlay module has not loaded yet
    const legacyModal = document.getElementById('orderSuccessModal');
    const legacyOrderId = document.getElementById('successOrderIdDisplay');
    if (legacyOrderId) legacyOrderId.innerText = `#${orderId}`;
    if (legacyModal) legacyModal.classList.remove('hidden');
  }

  // 5. WhatsApp notification with a 2.5s delay so the 3D animation plays first
  sendWhatsAppOrderConfirmation(newOrder);
}

// WHATSAPP NOTIFICATION
function sendWhatsAppOrderConfirmation(order) {
  const storeOwnerPhone = "918977627028";
  const msg = `*🛍️ NEW ORDER RECEIVED — LENKA STORES*%0A` +
    `================================%0A` +
    `*Consignment ID:* %23${order.orderId}%0A` +
    `*Client Name:* ${encodeURIComponent(order.customerName)}%0A` +
    `*Client Phone:* ${encodeURIComponent(order.customerPhone)}%0A` +
    `*Items Ordered:* ${encodeURIComponent(order.itemsSummary)}%0A` +
    `*Valuation / Amount:* ₹${order.totalAmount}%0A` +
    `*Payment Mode:* ${encodeURIComponent(order.paymentMethod)}%0A` +
    `*Shipping Address:* ${encodeURIComponent(order.customerAddress)}%0A` +
    `*Booking Date:* ${encodeURIComponent(order.timestamp)}%0A` +
    `================================%0A` +
    `Manage order in Studio: https://lenkastores.run.place/admin.html`;

  const waUrl = `https://wa.me/${storeOwnerPhone}?text=${msg}`;
  setTimeout(() => {
    window.open(waUrl, '_blank');
  }, 2500);
}

// MODAL CONTROLLERS & TABS
function openOrdersPageModal() {
  const modal = document.getElementById('ordersPageModal');
  if (modal) modal.classList.remove('hidden');
  switchOrderTab('confirmed');
}

function closeOrdersPageModal() {
  const modal = document.getElementById('ordersPageModal');
  if (modal) modal.classList.add('hidden');
}

function closeOrderSuccessOverlay(openOrders) {
  if (typeof window.destroySuccessOverlay === 'function') {
    window.destroySuccessOverlay();
  } else {
    const overlay = document.getElementById('orderSuccessOverlay');
    if (overlay) overlay.classList.add('hidden');
  }
  if (openOrders) openOrdersPageModal();
}

function switchOrderTab(tab) {
  const tabs = ['confirmed', 'cancelled', 'favorites'];
  tabs.forEach(t => {
    const tabEl = document.getElementById(`orderTab-${t}`);
    const tabBtn = document.getElementById(`tabBtn-${t}`);
    if (t === tab) {
      if (tabEl) tabEl.classList.remove('hidden');
      if (tabBtn) tabBtn.className = "px-5 py-2.5 rounded-xl bg-bronze-400 text-noir-950 font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer";
    } else {
      if (tabEl) tabEl.classList.add('hidden');
      if (tabBtn) tabBtn.className = "px-5 py-2.5 rounded-xl bg-noir-850 text-slate-300 fine-border hover:text-white text-xs transition-all flex items-center gap-1.5 cursor-pointer";
    }
  });

  if (tab === 'confirmed' || tab === 'cancelled') renderOrdersTabs();
  if (tab === 'favorites' && typeof renderFavoritesTab === 'function') renderFavoritesTab();
  if (window.lucide) lucide.createIcons();
}

function renderOrdersTabs() {
  const confirmedList = document.getElementById('confirmedOrdersList');
  const cancelledList = document.getElementById('cancelledOrdersList');
  if (!confirmedList || !cancelledList) return;
  confirmedList.innerHTML = '';
  cancelledList.innerHTML = '';

  const profile = window.currentProfile || JSON.parse(localStorage.getItem('lenka_profile') || 'null');
  if (!profile) {
    confirmedList.innerHTML = `<p class="text-xs text-slate-400 text-center py-12">Please set up your profile first to view placed orders.</p>`;
    cancelledList.innerHTML = `<p class="text-xs text-slate-400 text-center py-12">No profile found.</p>`;
    return;
  }

  const allLocal = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  const myOrders = allLocal.filter(o => o.customerPhone === profile.phone);

  const confirmed = myOrders.filter(o => o.status !== 'Cancelled');
  const cancelled = myOrders.filter(o => o.status === 'Cancelled');

  if (confirmed.length === 0) {
    confirmedList.innerHTML = `<p class="text-xs text-slate-500 text-center py-12">No active orders placed under ${profile.phone}.</p>`;
  } else {
    confirmed.forEach(ord => {
      let pct = ord.status === 'Delivered' ? '100%' : ord.status === 'Dispatched' ? '55%' : '15%';
      const card = document.createElement('div');
      card.className = "p-6 rounded-2xl bg-noir-900 fine-border space-y-4 shadow-xl";
      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2">
          <div>
            <span class="text-xs font-mono text-bronze-400 font-semibold">CONSIGNMENT #${ord.orderId}</span>
            <p class="text-[10px] text-slate-500 mt-0.5">Booked on: ${ord.timestamp || ''}</p>
          </div>
          <span class="text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-semibold self-start sm:self-auto ${ord.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : ord.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-bronze-400/10 text-bronze-400 border border-bronze-400/30'}">
            ${ord.status === 'Dispatched' ? 'In Transit' : ord.status}
          </span>
        </div>
        <div class="text-sm text-white font-medium">${ord.itemsSummary}</div>
        <div class="text-[11px] text-slate-400">Payment: <span class="text-bronze-300 font-medium">${ord.paymentMethod || 'PhonePe UPI'}</span></div>
        <div class="pt-3 pb-1">
          <div class="relative w-full h-1.5 bg-noir-950 rounded-full overflow-hidden mb-6">
            <div class="h-full bg-gradient-to-r from-bronze-500 via-bronze-400 to-white transition-all duration-700" style="width: ${pct};"></div>
          </div>
          <div class="grid grid-cols-3 text-center relative">
            <div class="space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-slate-200 block font-semibold">1. Confirmed</span>
              <span class="text-[9px] text-slate-500 block">${ord.confirmedDate || ord.timestamp || 'Today'}</span>
            </div>
            <div class="space-y-1">
              <span class="text-[10px] uppercase tracking-wider ${ord.status !== 'Confirmed' ? 'text-slate-200' : 'text-slate-600'} block font-semibold">2. Dispatched</span>
              <span class="text-[9px] text-slate-500 block">${ord.shippingDate || 'Pending'}</span>
            </div>
            <div class="space-y-1">
              <span class="text-[10px] uppercase tracking-wider ${ord.status === 'Delivered' ? 'text-green-400' : 'text-slate-600'} block font-semibold">3. Delivered</span>
              <span class="text-[9px] text-slate-500 block">${ord.deliveryDate || 'Express 48H'}</span>
            </div>
          </div>
        </div>
        <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Valuation: <strong class="text-white font-serif text-sm">₹${ord.totalAmount}</strong></span>
          ${ord.status !== 'Delivered' ? `
            <button onclick="cancelOrderDirect('${ord.orderId}')" class="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer">
              Cancel Consignment
            </button>
          ` : ''}
        </div>
      `;
      confirmedList.appendChild(card);
    });
  }

  if (cancelled.length === 0) {
    cancelledList.innerHTML = `<p class="text-xs text-slate-500 text-center py-12">No cancelled consignments.</p>`;
  } else {
    cancelled.forEach(ord => {
      const card = document.createElement('div');
      card.className = "p-5 rounded-2xl bg-noir-900 fine-border space-y-3 opacity-75 border-red-500/20";
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono text-slate-400">#${ord.orderId}</span>
          <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 uppercase font-semibold">Cancelled</span>
        </div>
        <p class="text-xs text-slate-300 font-medium">${ord.itemsSummary}</p>
        <div class="text-[11px] text-slate-500 flex justify-between border-t border-white/5 pt-2">
          <span>Amount: ₹${ord.totalAmount}</span>
          <span>Cancelled Date: ${ord.timestamp || ''}</span>
        </div>
      `;
      cancelledList.appendChild(card);
    });
  }
  if (window.lucide) lucide.createIcons();
}

async function cancelOrderDirect(orderId) {
  if (confirm(`Cancel Consignment #${orderId}?`)) {
    let local = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
    const idx = local.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
      local[idx].status = 'Cancelled';
      localStorage.setItem('lenka_orders', JSON.stringify(local));
    }
    if (typeof db !== 'undefined' && db !== null) {
      try {
        await db.collection('orders').doc(orderId).update({ status: 'Cancelled' });
      } catch (e) {
        console.warn(e);
      }
    }
    renderOrdersTabs();
  }
}
