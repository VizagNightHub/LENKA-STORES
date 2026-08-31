let pendingCheckoutData = null;

// 1. CONFIRM ORDER BUTTON HANDLER
function handleConfirmOrderClick() {
  const cart = window.LenkaApp ? window.LenkaApp.cart : JSON.parse(localStorage.getItem('lenka_cart') || '[]');
  
  if (!cart || cart.length === 0) {
    alert('Your bag is empty.');
    return;
  }

  const profile = window.LenkaApp ? window.LenkaApp.profile : JSON.parse(localStorage.getItem('lenka_profile') || 'null');
  
  if (!profile || !profile.phone || !profile.name) {
    closeCartDrawer();
    if (typeof openProfileDrawer === 'function') openProfileDrawer();
    alert('Please enter and save your Name, Phone Number, and Shipping Address before confirming.');
    return;
  }

  const total = cart.reduce((sum, i) => sum + Number(i.offerPrice || 0), 0);
  const summary = cart.map(i => i.title).join(', ');

  pendingCheckoutData = { total, summary, profile };

  closeCartDrawer();
  openPhonePeModal(total, summary);
}

window.handleConfirmOrderClick = handleConfirmOrderClick;
window.proceedToCheckout = handleConfirmOrderClick;

// 2. PHONEPE UPI QR MODAL
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

// 3. I HAVE PAID CLICK -> COMMITS TO CLOUD & FIRES 3D OVERLAY
function confirmPhonePePayment() {
  if (!pendingCheckoutData) return;

  const { total, summary, profile } = pendingCheckoutData;
  closePhonePeModal();
  finalizeCloudOrder(total, summary, "PhonePe UPI (8977627028-2@ybl)", profile);
  pendingCheckoutData = null;
}

async function finalizeCloudOrder(total, summary, paymentMethod, profile) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const orderId = 'LS' + Math.floor(100000 + Math.random() * 900000);

  const newOrder = {
    orderId: orderId,
    customerName: profile.name || 'Client',
    customerPhone: profile.phone || '',
    customerAddress: profile.formattedAddress || JSON.stringify(profile.address || ''),
    customerAvatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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

  // Local storage save
  let localOrders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  localOrders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(localOrders));

  // Firebase Cloud write
  const db = window.LenkaApp ? window.LenkaApp.db : null;
  if (db) {
    try {
      await db.collection('orders').doc(orderId).set(newOrder);
    } catch (e) {
      console.warn("Cloud Order Save Note:", e);
    }
  }

  // Clear Bag
  if (window.LenkaApp) window.LenkaApp.cart = [];
  localStorage.setItem('lenka_cart', JSON.stringify([]));
  updateCartUI();

  // Trigger 3D Luxury Success Celebration
  if (typeof window.showOrderSuccess === 'function') {
    window.showOrderSuccess(orderId);
  } else {
    const legacyModal = document.getElementById('orderSuccessModal');
    const legacyOrderId = document.getElementById('successOrderIdDisplay');
    if (legacyOrderId) legacyOrderId.innerText = `#${orderId}`;
    if (legacyModal) legacyModal.classList.remove('hidden');
  }

  // Send WhatsApp Broadcast with slight delay so animation plays first
  sendWhatsAppOrderConfirmation(newOrder);
}

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
    `Manage consignment in Studio: https://lenkastores.run.place/admin.html`;

  const waUrl = `https://wa.me/${storeOwnerPhone}?text=${msg}`;
  setTimeout(() => {
    window.open(waUrl, '_blank');
  }, 2200);
}

// ORDERS TRACKING PORTAL
function openOrdersPageModal() {
  const modal = document.getElementById('ordersPageModal');
  if (modal) modal.classList.remove('hidden');
  switchOrderTab('confirmed');
}

function closeOrdersPageModal() {
  const modal = document.getElementById('ordersPageModal');
  if (modal) modal.classList.add('hidden');
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
  if (tab === 'favorites') renderFavoritesTab();
  if (window.lucide) lucide.createIcons();
}

function renderOrdersTabs() {
  const confirmedList = document.getElementById('confirmedOrdersList');
  const cancelledList = document.getElementById('cancelledOrdersList');
  if (!confirmedList || !cancelledList) return;
  confirmedList.innerHTML = '';
  cancelledList.innerHTML = '';

  const profile = window.LenkaApp ? window.LenkaApp.profile : JSON.parse(localStorage.getItem('lenka_profile') || 'null');
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
          <span class="text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-semibold self-start sm:self-auto ${
            ord.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 
            ord.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 
            'bg-bronze-400/10 text-bronze-400 border border-bronze-400/30'
          }">
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

function renderFavoritesTab() {
  const container = document.getElementById('favoritesList');
  if (!container) return;
  container.innerHTML = '';
  const catalog = window.LenkaApp ? window.LenkaApp.catalog : [];
  const favs = window.LenkaApp ? window.LenkaApp.favorites : [];
  const favProds = catalog.filter(p => favs.includes(p.id));

  if (favProds.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 text-xs">No favorites added yet.</div>`;
    return;
  }
  favProds.forEach(prod => {
    const card = document.createElement('div');
    card.className = "p-4 rounded-2xl bg-noir-900 fine-border space-y-3 relative flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="relative aspect-square rounded-xl overflow-hidden bg-noir-850 mb-3">
          <img src="${prod.image}" class="w-full h-full object-cover" />
          <button onclick="toggleFavorite('${prod.id}', event)" class="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-noir-950/80 fine-border cursor-pointer">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-red-500 stroke-red-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
        <h4 class="text-xs text-white font-medium">${prod.title}</h4>
        <span class="text-xs text-bronze-400 font-serif">₹${prod.offerPrice}</span>
      </div>
      <button onclick="addToBag('${prod.id}')" class="w-full py-2 bg-platinum-100 hover:bg-white text-noir-950 font-semibold text-xs rounded-xl uppercase tracking-wider cursor-pointer">
        Add to Bag
      </button>
    `;
    container.appendChild(card);
  });
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
    const db = window.LenkaApp ? window.LenkaApp.db : null;
    if (db) {
      try {
        await db.collection('orders').doc(orderId).update({ status: 'Cancelled' });
      } catch (e) {
        console.warn(e);
      }
    }
    renderOrdersTabs();
  }
}

window.openPhonePeModal = openPhonePeModal;
window.closePhonePeModal = closePhonePeModal;
window.confirmPhonePePayment = confirmPhonePePayment;
window.openOrdersPageModal = openOrdersPageModal;
window.closeOrdersPageModal = closeOrdersPageModal;
window.switchOrderTab = switchOrderTab;
window.cancelOrderDirect = cancelOrderDirect;
