function openOrdersPageModal() {
  document.getElementById('ordersPageModal').classList.remove('hidden');
  switchOrderTab('confirmed');
}

function closeOrdersPageModal() {
  document.getElementById('ordersPageModal').classList.add('hidden');
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

  if (!currentProfile) {
    confirmedList.innerHTML = `<p class="text-xs text-slate-400 text-center py-12">Please set up your profile first to view placed orders.</p>`;
    cancelledList.innerHTML = `<p class="text-xs text-slate-400 text-center py-12">No profile found.</p>`;
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
      let pct = '15%';
      let step1Active = true;
      let step2Active = ord.status === 'Dispatched' || ord.status === 'Delivered';
      let step3Active = ord.status === 'Delivered';

      if (ord.status === 'Dispatched') pct = '55%';
      if (ord.status === 'Delivered') pct = '100%';

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
        <div class="pt-3 pb-1">
          <div class="relative w-full h-1.5 bg-noir-950 rounded-full overflow-hidden mb-6">
            <div class="h-full bg-gradient-to-r from-bronze-500 via-bronze-400 to-white transition-all duration-700" style="width: ${pct};"></div>
          </div>
          <div class="grid grid-cols-3 text-center relative">
            <div class="space-y-1">
              <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${step1Active ? 'bg-bronze-400 text-noir-950 active-tracker-glow' : 'bg-noir-950 text-slate-600 fine-border'}">
                <i data-lucide="check" class="w-4 h-4"></i>
              </div>
              <span class="text-[10px] uppercase tracking-wider text-slate-200 block font-semibold">1. Confirmed</span>
              <span class="text-[9px] text-slate-500 block">${ord.confirmedDate || ord.timestamp || 'Today'}</span>
            </div>
            <div class="space-y-1">
              <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${step2Active ? 'bg-bronze-400 text-noir-950 active-tracker-glow' : 'bg-noir-950 text-slate-600 fine-border'}">
                <i data-lucide="truck" class="w-4 h-4"></i>
              </div>
              <span class="text-[10px] uppercase tracking-wider ${step2Active ? 'text-slate-200' : 'text-slate-600'} block font-semibold">2. Dispatched</span>
              <span class="text-[9px] text-slate-500 block">${ord.shippingDate || 'Pending'}</span>
            </div>
            <div class="space-y-1">
              <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${step3Active ? 'bg-green-400 text-noir-950 active-tracker-glow' : 'bg-noir-950 text-slate-600 fine-border'}">
                <i data-lucide="package-check" class="w-4 h-4"></i>
              </div>
              <span class="text-[10px] uppercase tracking-wider ${step3Active ? 'text-green-400' : 'text-slate-600'} block font-semibold">3. Delivered</span>
              <span class="text-[9px] text-slate-500 block">${ord.deliveryDate || 'Express 48H'}</span>
            </div>
          </div>
        </div>
        <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Valuation: <strong class="text-white font-serif text-sm">₹${ord.totalAmount}</strong></span>
          ${ord.status !== 'Delivered' ? `
            <button onclick="requestCancelOrderDirect('${ord.orderId}')" class="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer">
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

  const favProds = cloudCatalog.filter(p => favorites.includes(p.id));
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
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-red-500 stroke-red-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
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

async function requestCancelOrderDirect(orderId) {
  if (confirm(`Cancel Consignment #${orderId}?`)) {
    let local = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
    const idx = local.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
      local[idx].status = 'Cancelled';
      localStorage.setItem('lenka_orders', JSON.stringify(local));
    }
    if (db) {
      try {
        const snap = await db.collection('orders').where('orderId', '==', orderId).get();
        snap.forEach(d => d.ref.update({ status: 'Cancelled' }));
      } catch (e) {
        console.log(e);
      }
    }
    renderOrdersTabs();
  }
}

function proceedToCheckout() {
  if (currentCart.length === 0) {
    alert('Your bag is empty.');
    return;
  }
  if (!currentProfile || !currentProfile.phone) {
    closeCartDrawer();
    openProfileDrawer();
    alert('Please save your Profile & Shipping Address before confirming.');
    return;
  }

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const orderId = 'LS' + Math.floor(100000 + Math.random() * 900000);
  const total = currentCart.reduce((sum, i) => sum + Number(i.offerPrice || 0), 0);
  const summary = currentCart.map(i => i.title).join(', ');

  const newOrder = {
    orderId: orderId,
    customerName: currentProfile.name || 'Customer',
    customerPhone: currentProfile.phone || '',
    customerAddress: currentProfile.formattedAddress || JSON.stringify(currentProfile.address || ''),
    customerAvatar: currentProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    itemsSummary: summary,
    totalAmount: total,
    status: 'Confirmed',
    confirmedDate: today,
    shippingDate: 'Express Scheduled',
    deliveryDate: 'Est. 2-3 Business Days',
    timestamp: today
  };

  let localOrders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  localOrders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(localOrders));

  if (db) {
    try {
      db.collection('orders').add({
        ...newOrder,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(e => console.warn('Background sync note:', e));
    } catch (e) {}
  }

  currentCart = [];
  localStorage.setItem('lenka_cart', JSON.stringify(currentCart));
  updateCartUI();
  closeCartDrawer();

  openOrderSuccessModal(orderId);
}

function triggerCelebrationBlast() {
  try {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 120, angle: 60, spread: 70, origin: { x: 0, y: 0.65 }, colors: ['#C5A880', '#E2D4C3', '#FFD700', '#FFFFFF', '#A88B63'] });
      confetti({ particleCount: 120, angle: 120, spread: 70, origin: { x: 1, y: 0.65 }, colors: ['#C5A880', '#E2D4C3', '#FFD700', '#FFFFFF', '#A88B63'] });
      setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 }, colors: ['#FFFFFF', '#C5A880', '#FFD700'] }), 250);
    }
  } catch (err) {
    console.warn(err);
  }
}

function openOrderSuccessModal(orderId) {
  document.getElementById('successOrderIdDisplay').innerText = `#${orderId}`;
  document.getElementById('orderSuccessModal').classList.remove('hidden');
  triggerCelebrationBlast();
  if (window.lucide) lucide.createIcons();
}

function closeOrderSuccessModal(openOrdersPage) {
  document.getElementById('orderSuccessModal').classList.add('hidden');
  if (openOrdersPage) openOrdersPageModal();
}
