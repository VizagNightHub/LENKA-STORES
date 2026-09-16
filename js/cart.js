// ATELIER CART, BAG & CHECKOUT CONTROLLER (CRASH-PROOF & DROPSHIP ENABLED)

let cartItems = [];

// Initialize cart from localStorage on load
function initCart() {
  try {
    cartItems = JSON.parse(localStorage.getItem('lenka_cart_v2') || '[]');
  } catch (e) {
    cartItems = [];
  }
  updateCartBadge();
}

// Update cart quantity
function updateCartQuantity(productId, delta) {
  const item = cartItems.find(i => String(i.id) === String(productId));
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cartItems = cartItems.filter(i => String(i.id) !== String(productId));
  }

  saveAndSyncCart();
}

// Save to localStorage and update UI badges and lists
function saveAndSyncCart() {
  localStorage.setItem('lenka_cart_v2', JSON.stringify(cartItems));
  updateCartBadge();
  renderCartDrawerItems();
}

// Update cart counter badge in navigation header
function updateCartBadge() {
  const badge = document.getElementById('navCartCount');
  if (badge) {
    const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badge.textContent = totalCount;
  }
}

// Render cart items inside slide-over drawer
function renderCartDrawerItems() {
  const container = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotalPrice');
  if (!container) return;

  container.innerHTML = '';

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 space-y-3">
        <i data-lucide="shopping-bag" class="w-10 h-10 text-slate-600 mx-auto"></i>
        <p class="text-xs text-slate-400">Your bag is currently empty.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    return;
  }

  let subtotal = 0;

  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const row = document.createElement('div');
    row.className = "flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#161820] border border-white/10";
    row.innerHTML = `
      <img src="${item.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'}" class="w-14 h-14 rounded-xl object-cover bg-black shrink-0" />
      <div class="flex-1 min-w-0">
        <h5 class="text-xs font-bold text-white truncate">${item.title}</h5>
        <p class="text-[11px] text-[#C5A880] font-mono mt-0.5">₹${item.price} × ${item.quantity}</p>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <button type="button" onclick="updateCartQuantity('${item.id}', -1)" class="w-7 h-7 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">-</button>
        <span class="text-xs font-mono font-bold w-5 text-center text-white">${item.quantity}</span>
        <button type="button" onclick="updateCartQuantity('${item.id}', 1)" class="w-7 h-7 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">+</button>
      </div>
    `;
    container.appendChild(row);
  });

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

// Cart Drawer Open/Close Controls
function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.classList.remove('translate-x-full');
    renderCartDrawerItems();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.classList.add('translate-x-full');
  }
}

// Checkout Flow Controls
function openCheckoutModal() {
  if (cartItems.length === 0) {
    alert("Your bag is empty. Add items before proceeding.");
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById('checkoutModal');
  const summaryContainer = document.getElementById('checkoutProductSummary');
  
  if (summaryContainer) {
    summaryContainer.innerHTML = cartItems.map(i => `
      <div class="flex justify-between text-xs text-slate-300">
        <span class="truncate pr-2">${i.title} (x${i.quantity})</span>
        <span class="font-mono font-bold text-white">₹${i.price * i.quantity}</span>
      </div>
    `).join('');
  }

  if (modal) modal.classList.remove('hidden');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.add('hidden');
}

async function handlePhonePeRedirectPayment(e) {
  e.preventDefault();
  const proceedBtn = document.getElementById('proceedToPayBtn');
  
  const customerName = document.getElementById('customerName')?.value.trim() || "Valued Customer";
  const customerPhone = document.getElementById('customerPhone')?.value.trim() || "9999999999";
  
  // Calculate total amount from cart
  const totalAmount = typeof cartItems !== 'undefined' ? cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0) : 499;

  if (proceedBtn) {
    proceedBtn.disabled = true;
    proceedBtn.textContent = "OPENING RAZORPAY...";
  }

  var options = {
    "key": "rzp_test_Tcg7IyanNeTunP", // Your Razorpay Test Key ID
    "amount": totalAmount * 100,     // Amount in paise (₹1 = 100 paise)
    "currency": "INR",
    "name": "LENKA STORES",
    "description": "Secure Checkout Payment",
    "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    "handler": function (response) {
      alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
      
      // Save order to history
      const orders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
      orders.unshift({
        orderId: 'LS-' + Math.floor(100000 + Math.random() * 900000),
        itemsSummary: typeof cartItems !== 'undefined' ? cartItems.map(i => i.title).join(', ') : 'Curated Item',
        totalAmount: totalAmount,
        status: 'Confirmed & Dispatched',
        paymentId: response.razorpay_payment_id,
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem('lenka_orders', JSON.stringify(orders));
      localStorage.removeItem('lenka_cart_v2');

      // Redirect or trigger WhatsApp order share
      submitOrderViaWhatsApp();
    },
    "prefill": {
      "name": customerName,
      "contact": customerPhone,
      "email": "customer@lenkastores.com"
    },
    "theme": {
      "color": "#C5A880"
    }
  };

  var rzp1 = new Razorpay(options);
  
  rzp1.on('payment.failed', function (response){
    alert("Payment Failed: " + response.error.description);
    if (proceedBtn) {
      proceedBtn.disabled = false;
      proceedBtn.textContent = "PROCEED TO PAY";
    }
  });
  
  rzp1.open();
  
  if (proceedBtn) {
    proceedBtn.disabled = false;
    proceedBtn.textContent = "PROCEED TO PAY";
  }
}

// Automatic Dropshipping Order Forwarding to Supplier via WhatsApp
function forwardOrderToSupplier(orderData) {
  const supplierPhone = "918977627028"; // Supplier destination number
  const message = `🚨 NEW LENKA STORES DROPSHIP ORDER!\n\nOrder ID: #${orderData.orderId}\nCustomer: ${orderData.customerName} (${orderData.customerPhone})\nAddress: ${orderData.shippingAddress}\nItems: ${orderData.itemsSummary}\nTotal: ₹${orderData.totalAmount}\nStatus: Confirmed & Dispatched`;
  
  const whatsappUrl = `https://wa.me/${supplierPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Successful Order Placement & Delivery Truck Modal Trigger
async function triggerDeliveryTruckSuccessModal() {
  closeCheckoutModal();
  const orderId = 'LS-' + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const itemsSummary = cartItems.map(i => `${i.title} (x${i.quantity})`).join(', ');

  const customerNameInput = document.getElementById('customerName');
  const customerPhoneInput = document.getElementById('customerPhone');

  const customerName = customerNameInput ? customerNameInput.value : "Valued Customer";
  const customerPhone = customerPhoneInput ? customerPhoneInput.value : "Not Provided";

  // Collect structured 5-line address fields or general address field
  const line1 = document.getElementById('addrLine1')?.value || '';
  const line2 = document.getElementById('addrLine2')?.value || '';
  const district = document.getElementById('addrDistrict')?.value || '';
  const state = document.getElementById('addrState')?.value || '';
  const pinCode = document.getElementById('addrPinCode')?.value || '';
  const generalAddress = document.getElementById('customerAddress')?.value || '';

  const shippingAddress = generalAddress || `${line1}, ${line2}, ${district}, ${state} - ${pinCode}`.trim();

  const newOrder = {
    orderId,
    customerName,
    customerPhone,
    shippingAddress,
    itemsSummary,
    totalAmount,
    status: 'Confirmed & Dispatched',
    shippingDate: new Date().toLocaleDateString()
  };

  forwardOrderToSupplier(newOrder);

  let existingOrders = [];
  try {
    existingOrders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  } catch (err) {
    existingOrders = [];
  }
  existingOrders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(existingOrders));

  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    try {
      await firebase.firestore().collection('orders').doc(orderId).set({
        ...newOrder,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore order sync note:", err);
    }
  }

  cartItems = [];
  localStorage.removeItem('lenka_cart_v2');
  updateCartBadge();

  const successModal = document.getElementById('orderSuccessModal');
  const orderIdDisplay = document.getElementById('successOrderIdDisplay');
  if (orderIdDisplay) orderIdDisplay.textContent = `Order ID: #${orderId}`;
  if (successModal) successModal.classList.remove('hidden');

  if (typeof confetti === 'function') {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }
}

function closeOrderSuccessModal() {
  const successModal = document.getElementById('orderSuccessModal');
  if (successModal) successModal.classList.add('hidden');
  window.location.reload();
}

function addToBag(productId) {
  let availableCatalog = window.liveCatalog || [];
  if (availableCatalog.length === 0) {
    try {
      availableCatalog = JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
    } catch (e) {
      availableCatalog = [];
    }
  }

  const product = availableCatalog.find(p => String(p.id).trim() === String(productId).trim());
  
  if (!product) {
    console.warn("Product lookup failed for ID:", productId, "Available catalog:", availableCatalog);
    alert("Unable to add product. Please refresh the page.");
    return;
  }

  const existingItem = cartItems.find(item => String(item.id).trim() === String(product.id).trim());
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cartItems.push({
      id: product.id,
      title: product.title,
      price: product.offerPrice || product.price || 0,
      image: product.image,
      quantity: 1
    });
  }

  saveAndSyncCart();
  openCartDrawer();
}

// WhatsApp Direct Order Submission Function
function submitOrderViaWhatsApp() {
  const customerName = document.getElementById('customerName')?.value.trim() || "Valued Customer";
  const customerPhone = document.getElementById('customerPhone')?.value.trim() || "Not Provided";
  const deliveryAddress = document.getElementById('customerAddress')?.value || 
    `${document.getElementById('addrLine1')?.value || ''}, ${document.getElementById('addrDistrict')?.value || ''}`.trim() || "Not Provided";
  
  const cart = cartItems.length > 0 ? cartItems : JSON.parse(localStorage.getItem('lenka_cart_v2') || '[]');
  if (cart.length === 0) {
    alert("Your bag is empty!");
    return;
  }

  const totalAmount = cart.reduce((sum, item) => sum + ((item.price || item.offerPrice) * item.quantity), 0);
  
  let itemsSummary = cart.map(i => `• ${i.title} (x${i.quantity}) - ₹${(i.price || i.offerPrice) * i.quantity}`).join('\n');

  // Format message for your WhatsApp
  const whatsappMessage = `🛍️ *NEW LENKA STORES ORDER* 🛍️\n\n` +
    `*Customer Name:* ${customerName}\n` +
    `*Phone:* ${customerPhone}\n` +
    `*Address:* ${deliveryAddress}\n\n` +
    `*Items Ordered:*\n${itemsSummary}\n\n` +
    `*Total Amount:* ₹${totalAmount}\n\n` +
    `Please confirm my order and share live status updates here!`;

  const businessWhatsAppNumber = "918977627028"; 
  const whatsappUrl = `https://wa.me/${businessWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  cartItems = [];
  localStorage.removeItem('lenka_cart_v2');
  updateCartBadge();
  window.open(whatsappUrl, '_blank');
}

// Expose functions globally to window
window.addToBag = addToBag;
window.updateCartQuantity = updateCartQuantity;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.handlePhonePeRedirectPayment = handlePhonePeRedirectPayment;
window.triggerDeliveryTruckSuccessModal = triggerDeliveryTruckSuccessModal;
window.closeOrderSuccessModal = closeOrderSuccessModal;
window.forwardOrderToSupplier = forwardOrderToSupplier;
window.submitOrderViaWhatsApp = submitOrderViaWhatsApp;

// Auto initialize cart on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCart);
} else {
  initCart();
}
