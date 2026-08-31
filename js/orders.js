// UNFREEZES CHECKOUT BUTTON & CONNECTS TO 3D OVERLAY
async function proceedToCheckout() {
  if (!currentCart || currentCart.length === 0) {
    alert('Your bag is empty.');
    return;
  }

  // If client details are not saved, route to profile setup
  if (!currentProfile || !currentProfile.phone) {
    if (typeof closeCartDrawer === 'function') closeCartDrawer();
    if (typeof openProfileDrawer === 'function') openProfileDrawer();
    alert('Please enter your Name, Phone and Shipping Address to proceed.');
    return;
  }

  const total = currentCart.reduce((sum, i) => sum + Number(i.offerPrice || 0), 0);
  const summary = currentCart.map(i => i.title).join(', ');

  // Automatically finalize reservation and trigger 3D success overlay
  finalizeOrder(total, summary, "Lenka Concierge Express Booking");
}

async function finalizeOrder(total, summary, paymentMethod) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const orderId = 'LS' + Math.floor(100000 + Math.random() * 900000);

  const newOrder = {
    orderId: orderId,
    customerName: currentProfile.name || 'Client',
    customerPhone: currentProfile.phone || '',
    customerAddress: currentProfile.formattedAddress || JSON.stringify(currentProfile.address || ''),
    customerAvatar: currentProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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

  // 1. Local backup save
  let localOrders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  localOrders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(localOrders));

  // 2. Direct Firestore Cloud Write
  if (typeof db !== 'undefined' && db !== null) {
    try {
      await db.collection('orders').doc(orderId).set(newOrder);
    } catch (e) {
      console.warn("Firestore Order Write note:", e);
    }
  }

  // 3. Reset Bag & update UI
  currentCart = [];
  localStorage.setItem('lenka_cart', JSON.stringify(currentCart));
  if (typeof updateCartUI === 'function') updateCartUI();
  if (typeof closeCartDrawer === 'function') closeCartDrawer();

  // 4. Trigger 3D Order Success Overlay
  if (typeof window.showOrderSuccess === 'function') {
    window.showOrderSuccess(orderId);
  }

  // 5. Send prefilled WhatsApp notification to owner
  sendWhatsAppOrderConfirmation(newOrder);
}

function sendWhatsAppOrderConfirmation(order) {
  const storeOwnerPhone = "918977627028";
  const msg = `*🛍️ NEW ORDER RECEIVED — LENKA STORES*%0A` +
    `================================%0A` +
    `*Consignment ID:* %23${order.orderId}%0A` +
    `*Client:* ${encodeURIComponent(order.customerName)}%0A` +
    `*Phone:* ${encodeURIComponent(order.customerPhone)}%0A` +
    `*Items:* ${encodeURIComponent(order.itemsSummary)}%0A` +
    `*Valuation:* ₹${order.totalAmount}%0A` +
    `*Destination:* ${encodeURIComponent(order.customerAddress)}%0A` +
    `================================%0A` +
    `Live Terminal: https://lenkastores.run.place/admin.html`;

  const waUrl = `https://wa.me/${storeOwnerPhone}?text=${msg}`;
  setTimeout(() => {
    window.open(waUrl, '_blank');
  }, 2200);
}

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
  if (tab === 'favorites' && typeof renderFavoritesTab === 'function') renderFavoritesTab();
  if (window.lucide) lucide.createIcons();
}

function renderOrdersTabs() {
  const confirmedList = document.getElementById('confirmedOrdersList');
  const cancelledList = document.getElementById('cancelledOrdersList');
  if (!confirmedList || !cancelledList) return;
  confirmedList.innerHTML = '';
  cancelledList.innerHTML = '';

  if (!currentProfile) {
    confirmedList.innerHTML = `<p class="text-xs text-slate-400 text-center py-12">Please set up your profile first to view placed orders.</p>`;
    return;
  }

  const allLocal = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  const myOrders = allLocal.filter(o => o.customerPhone === currentProfile.phone);
  const confirmed = myOrders.filter(o => o.status !== 'Cancelled');
  const cancelled = myOrders.filter(o => o.status === 'Cancelled');

  if (confirmed.length === 0) {
    confirmedList.innerHTML = `<p class="text-xs text-slate-500 text-center py-12">No active orders placed under ${currentProfile.phone}.</p>`;
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
