// ATELIER SHOPPING CART & CHECKOUT ENGINE

function getCart() {
  try {
    const saved = localStorage.getItem('lenka_cart_v2');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('lenka_cart_v2', JSON.stringify(cart));
  updateCartUI();
}

function addToBag(productId) {
  let catalog = window.liveCatalog || [];
  if (catalog.length === 0) {
    try {
      catalog = JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
    } catch (e) {
      catalog = [];
    }
  }

  const product = catalog.find(p => String(p.id) === String(productId));
  if (!product) {
    alert("Product item not found in live inventory.");
    return;
  }

  const cart = getCart();
  const existing = cart.find(item => String(item.id) === String(productId));
  
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.title || product.name,
      price: Number(product.offerPrice || product.price) || 0,
      image: product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '') || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      quantity: 1
    });
  }

  saveCart(cart);
  openCartDrawer();
}

function removeFromCart(id) {
  let cart = getCart().filter(i => String(i.id) !== String(id));
  saveCart(cart);
}

function updateQuantity(id, qty) {
  let cart = getCart();
  const item = cart.find(i => String(i.id) === String(id));
  if (item) {
    item.quantity = Number(qty);
    if (item.quantity <= 0) return removeFromCart(id);
  }
  saveCart(cart);
}

function updateCartUI() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const countEl = document.getElementById('navCartCount');
  if (countEl) countEl.innerText = count;

  const subtotalEl = document.getElementById('cartSubtotalPrice');
  if (subtotalEl) subtotalEl.innerText = `₹${subtotal}`;

  const list = document.getElementById('cartItemsList');
  if (!list) return;
  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = '<p class="text-xs text-slate-500 text-center py-12">Your Atelier bag is currently empty.</p>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  cart.forEach(item => {
    list.innerHTML += `
      <div class="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-xs">
        <img src="${item.image}" class="w-12 h-12 rounded-xl object-cover bg-black" onerror="this.src='https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'" />
        <div class="flex-1 min-w-0">
          <h5 class="font-bold text-white truncate">${item.name}</h5>
          <span class="text-[#C5A880] font-bold">₹${item.price}</span>
          <div class="flex items-center gap-2 mt-1.5">
            <button type="button" onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="w-5 h-5 rounded bg-white/10 text-white font-bold flex items-center justify-center cursor-pointer">-</button>
            <span class="font-mono">${item.quantity}</span>
            <button type="button" onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="w-5 h-5 rounded bg-white/10 text-white font-bold flex items-center justify-center cursor-pointer">+</button>
          </div>
        </div>
        <button type="button" onclick="removeFromCart('${item.id}')" class="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </div>`;
  });

  if (window.lucide) lucide.createIcons();
}

function openCartDrawer() {
  const d = document.getElementById('cartDrawer');
  if (d) d.classList.remove('translate-x-full');
  updateCartUI();
}

function closeCartDrawer() {
  const d = document.getElementById('cartDrawer');
  if (d) d.classList.add('translate-x-full');
}

function openCheckoutModal() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your bag is empty.");
    return;
  }
  closeCartDrawer();
  
  // Render Product Details Summary (Name, Image, Cost ONLY)
  const summaryContainer = document.getElementById('checkoutProductSummary');
  if (summaryContainer) {
    summaryContainer.innerHTML = '';
    cart.forEach(item => {
      summaryContainer.innerHTML += `
        <div class="flex items-center gap-3 text-xs">
          <img src="${item.image}" class="w-10 h-10 rounded-lg object-cover bg-black" />
          <div class="flex-1 min-w-0">
            <h6 class="font-bold text-white truncate">${item.name}</h6>
            <span class="text-slate-400">Qty: ${item.quantity}</span>
          </div>
          <span class="font-extrabold text-[#C5A880]">₹${item.price * item.quantity}</span>
        </div>
      `;
    });
  }

  const proceedBtn = document.getElementById('proceedToPayBtn');
  const completedContainer = document.getElementById('paymentCompletedContainer');
  if (proceedBtn) proceedBtn.classList.remove('hidden');
  if (completedContainer) completedContainer.classList.add('hidden');

  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('hidden');
}
function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.add('hidden');
}

// STEP 1: REDIRECT TO PHONEPE & SHOW PAYMENT COMPLETED BUTTON
function handlePhonePeRedirectPayment(e) {
  e.preventDefault();
  const cart = getCart();
  if (cart.length === 0) return alert("Your bag is empty.");

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderId = 'LS-' + Math.floor(100000 + Math.random() * 900000);

  // Save temporary order ID
  localStorage.setItem('lenka_pending_order_id', orderId);

  // Trigger PhonePe URI Scheme
  const upiUrl = `upi://pay?pa=8977627028-2@ybl&pn=Lenka%20Stores&am=${subtotal}&cu=INR&tn=Order%20${orderId}`;
  window.location.href = upiUrl;

  // Swap buttons so user can click "Payment Completed" after returning from PhonePe
  const proceedBtn = document.getElementById('proceedToPayBtn');
  const completedContainer = document.getElementById('paymentCompletedContainer');
  if (proceedBtn) proceedBtn.classList.add('hidden');
  if (completedContainer) completedContainer.classList.remove('hidden');
}

// STEP 2: TRIGGER DELIVERY TRUCK POPUP AFTER PAYMENT IS COMPLETED
function triggerDeliveryTruckSuccessModal() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderId = localStorage.getItem('lenka_pending_order_id') || ('LS-' + Math.floor(100000 + Math.random() * 900000));
  const itemsSummary = cart.map(i => `• ${i.name} (Qty: ${i.quantity}) - ₹${i.price * i.quantity}`).join('\n');

  const newOrder = {
    orderId,
    customerName: "Verified Online Client",
    customerPhone: "8977627028",
    customerAddress: "Direct UPI Express Order",
    paymentMethod: "PhonePe UPI (Paid)",
    itemsSummary,
    totalAmount: subtotal,
    status: 'Confirmed & Paid',
    createdAt: new Date().toISOString(),
    shippingDate: 'Processing in warehouse',
    deliveryDate: 'Expected in 3-5 days'
  };

  // Save order to database & local storage
  const orders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  orders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(orders));

  if (window.firebase && firebase.apps.length) {
    firebase.firestore().collection('orders').doc(orderId).set(newOrder).catch(err => console.warn(err));
  }

  // AUTOMATE WHATSAPP MESSAGE TO 8977627028
  const waMessage = 
`*NEW PAID ORDER - LENKA STORES*
---------------------------------------
*Order ID:* #${orderId}
*Payment Status:* Paid via PhonePe UPI (Verified)

*Product Details:*
${itemsSummary}

*Total Amount:* ₹${subtotal}
---------------------------------------`;

  // Open WhatsApp in background
  const whatsappUrl = `https://wa.me/918977627028?text=${encodeURIComponent(waMessage)}`;
  window.open(whatsappUrl, '_blank');

  // Clear cart
  localStorage.removeItem('lenka_cart_v2');
  updateCartUI();
  closeCheckoutModal();

  if (window.confetti) {
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
  }

  // Display Order ID in success modal
  const orderIdDisplay = document.getElementById('successOrderIdDisplay');
  if (orderIdDisplay) orderIdDisplay.innerText = `Order ID: #${orderId}`;

  // Open Animated Delivery Truck Success Modal
  const successModal = document.getElementById('orderSuccessModal');
  if (successModal) successModal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeOrderSuccessModal() {
  const successModal = document.getElementById('orderSuccessModal');
  if (successModal) successModal.classList.add('hidden');

  // Open Thank You Sticker Popup
  const thankYouModal = document.getElementById('feedbackThanksModal');
  if (thankYouModal) thankYouModal.classList.remove('hidden');
}

function closeThankYouModal() {
  const thankYouModal = document.getElementById('feedbackThanksModal');
  if (thankYouModal) thankYouModal.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global exposure
window.addToBag = addToBag;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.handlePhonePeRedirectPayment = handlePhonePeRedirectPayment;
window.triggerDeliveryTruckSuccessModal = triggerDeliveryTruckSuccessModal;
window.closeOrderSuccessModal = closeOrderSuccessModal;
window.closeThankYouModal = closeThankYouModal;
