let pendingOrderData = null;

// OPEN / CLOSE MODALS & TABS
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

// PHONEPE / UPI PAYMENT GATEWAY MODAL
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

// CHECKOUT TRIGGER
async function proceedToCheckout() {
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

  const total = currentCart.reduce((sum, i) => sum + Number(i.offerPrice || 0), 0);
  const summary = currentCart.map(i => i.title).join(', ');

  pendingOrderData = { total, summary };

  closeCartDrawer();
  openPhonePeModal(total, summary);
}

// CONFIRM PAYMENT & TRIGGER PARTY CELEBRATION
function confirmPhonePePayment() {
  if (!pendingOrderData) return;

  const { total, summary } = pendingOrderData;
  closePhonePeModal();
  finalizeOrder(total, summary, "PhonePe UPI (8977627028-2@ybl)");
  pendingOrderData = null;
}

// PARTY BLAST CELEBRATION FUNCTION (MULTI-BURST)
function triggerCelebrationBlast() {
  try {
    if (typeof confetti === 'function') {
      // First big center blast
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#C5A880', '#E2D4C3', '#FFD700', '#5f259f', '#FFFFFF', '#10B981']
      });

      // Left cannon
      setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.65 },
          colors: ['#C5A880', '#FFD700', '#FFFFFF', '#5f259f']
        });
      }, 200);

      // Right cannon
      setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.65 },
          colors: ['#C5A880', '#FFD700', '#FFFFFF', '#5f259f']
        });
      }, 400);
    }
  } catch (err) {
    console.warn("Confetti blast warning:", err);
  }
}

// OPEN CELEBRATION MODAL
function openOrderSuccessModal(orderId) {
  const display = document.getElementById('successOrderIdDisplay');
  const modal = document.getElementById('orderSuccessModal');

  if (display) display.innerText = `#${orderId}`;
  if (modal) modal.classList.remove('hidden');

  // Trigger party blast
  triggerCelebrationBlast();

  if (window.lucide) lucide.createIcons();
}

function closeOrderSuccessModal(openOrders) {
  const modal = document.getElementById('orderSuccessModal');
  if (modal) modal.classList.add('hidden');
  if (openOrders) openOrdersPageModal();
}

// FINAL CLOUD ORDER COMMIT
async function finalizeOrder(total, summary, paymentMethod) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const orderId = 'LS' + Math.floor(100000 + Math.random() * 900000);

  const newOrder = {
    orderId: orderId,
    customerName: currentProfile.name || 'Customer',
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

  // 1. Local backup
  let localOrders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  localOrders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(localOrders));

  // 2. Direct Cloud Firestore write
  if (db) {
    try {
      await db.collection('orders').doc(orderId).set(newOrder);
    } catch (e) {
      console.warn("Cloud Order Save Error:", e);
    }
  }

  // 3. Clear Bag
  currentCart = [];
  localStorage.setItem('lenka_cart', JSON.stringify(currentCart));
  updateCartUI();

  // 4. SHOW CONGRATULATIONS CELEBRATION POPUP FIRST
  openOrderSuccessModal(orderId);

  // 5. SEND WHATSAPP RECEIPT WITH DELAY (So modal is clearly seen)
  sendWhatsAppOrderConfirmation(newOrder);
}

// AUTOMATED WHATSAPP BROADCAST (TO +91 8977627028)
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

  // Delayed trigger so celebration popup stays front & center
  setTimeout(() => {
    window.open(waUrl, '_blank');
  }, 2200);
}

// RENDER ACTIVE / CANCELLED ORDERS
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
      let pct = ord.status === 'Delivered' ? '100%' : ord.status === 'Dispatched' ? '55%' : '15%';
      const card = document.createElement('div');
      card.className = "p-6 rounded-2xl bg-noir-900 fine-border space-y-4 shadow-xl";
      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2">
          <div>
            <span class="text-xs font-mono text-bronze-400 font-semibold">CONSIGNMENT #${ord.orderId}</span>
            <p class="text-[10px] text-slate-500 mt-0.5">Booked on: ${ord.timestamp || ''}</p>
          </div>
          <span class="text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-semibold self-start sm:self-auto ${ord.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : ord.status === 'Dispatched' ? 'bg-blue-500/10
