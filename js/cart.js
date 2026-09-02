// ATELIER SHOPPING CART & CHECKOUT ENGINE WITH 3D DELIVERY TRUCK ANIMATION

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
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Auto-fill user profile details (Name, Phone, Address)
    try {
      const user = JSON.parse(localStorage.getItem('lenka_user_profile') || 'null');
      if (user) {
        const nameInput = document.getElementById('orderClientName');
        const phoneInput = document.getElementById('orderClientPhone');
        const addressInput = document.getElementById('orderClientAddress');
        
        if (nameInput && !nameInput.value) nameInput.value = user.username || user.name || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
        if (addressInput && !addressInput.value && user.address && user.address !== 'Add your delivery address') {
          addressInput.value = user.address;
        }
      }
    } catch (e) {
      console.warn("Auto-fill notice:", e);
    }
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.add('hidden');
}

// ORDER PLACEMENT & ANIMATED TRUCK SUCCESS ENGINE
function handlePlaceOrder(e) {
  e.preventDefault();
  const cart = getCart();
  if (cart.length === 0) return alert("Your bag is empty.");

  const name = document.getElementById('orderClientName').value.trim();
  const phone = document.getElementById('orderClientPhone').value.trim();
  const address = document.getElementById('orderClientAddress').value.trim();
  const paymentMethod = document.getElementById('orderPaymentMethod').value;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderId = 'LS-' + Math.floor(100000 + Math.random() * 900000);
  
  // Clean product details (Name and quantity only without extra descriptions)
  const itemsSummary = cart.map(i => `• ${i.name} (Qty: ${i.quantity}) - ₹${i.price * i.quantity}`).join('\n');

  const newOrder = {
    orderId,
    customerName: name,
    customerPhone: phone,
    customerAddress: address,
    paymentMethod,
    itemsSummary,
    totalAmount: subtotal,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
    shippingDate: 'Processing in warehouse',
    deliveryDate: 'Expected in 3-5 days'
  };

  const orders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  orders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(orders));

  if (window.firebase && firebase.apps.length) {
    firebase.firestore().collection('orders').doc(orderId).set(newOrder).catch(err => console.warn(err));
  }

  localStorage.removeItem('lenka_cart_v2');
  updateCartUI();
  closeCheckoutModal();

  if (window.confetti) {
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
  }

  // Format WhatsApp message with only product details, customer info, and payment status
  const waMessage = 
`*NEW ORDER CONFIRMED - LENKA STORES*
---------------------------------------
*Order ID:* #${orderId}
*Customer Name:* ${name}
*Phone:* ${phone}
*Delivery Address:* ${address}

*Products:*
${itemsSummary}

*Total Amount:* ₹${subtotal}
*Payment Status:* ${paymentMethod.includes('UPI') ? 'Pending UPI Payment' : 'Cash on Delivery'}
---------------------------------------`;

  const whatsappUrl = `https://wa.me/918977627028?text=${encodeURIComponent(waMessage)}`;

  // Populate Success Modal
  document.getElementById('successOrderIdDisplay').innerText = `Order ID: #${orderId}`;
  document.getElementById('successPaymentDisplay').innerText = paymentMethod;

  const upiUrl = `upi://pay?pa=8977627028-2@ybl&pn=Lenka%20Stores&am=${subtotal}&cu=INR&tn=Order%20${orderId}`;
  const upiBtn = document.getElementById('directUpiPaymentLink');
  const upiText = document.getElementById('upiBtnText');
  
  if (paymentMethod.includes('PhonePe') || paymentMethod.includes('UPI')) {
    upiBtn.href = upiUrl;
    upiText.innerText = `PROCEED TO PAY ₹${subtotal}`;
    upiBtn.classList.remove('hidden');
  } else {
    upiBtn.classList.add('hidden');
  }

  document.getElementById('directWhatsAppLink').href = whatsappUrl;

  // Show the animated 3D delivery truck / success modal
  const successModal = document.getElementById('orderSuccessModal');
  if (successModal) successModal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('orderSuccessModal');
  if (modal) modal.classList.add('hidden');
  
  // Show "Thank you for your time and have a nice day" pop-up sticker
  showThankYouStickerModal();
}

function showThankYouStickerModal() {
  let stickerModal = document.getElementById('thankYouStickerModal');
  if (!stickerModal) {
    stickerModal = document.createElement('div');
    stickerModal.id = 'thankYouStickerModal';
    stickerModal.className = 'fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4';
    stickerModal.innerHTML = `
      <div class="max-w-sm w-full bg-[#11131A] border-2 border-[#C5A880]/50 rounded-[36px] p-8 text-center space-y-4 shadow-[0_0_50px_rgba(197,168,128,0.25)] relative animate-bounce-short">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#f4845f] via-[#c5a880] to-[#e8c997] p-1 mx-auto shadow-2xl">
          <div class="w-full h-full bg-[#0d0f14] rounded-[22px] flex items-center justify-center text-4xl select-none">
            😊
          </div>
        </div>
        <div class="space-y-1.5 pt-2">
          <h4 class="font-anton text-2xl text-white tracking-wider">THANK YOU FOR YOUR TIME!</h4>
          <p class="text-xs text-[#E8C997] font-medium">Have a nice day! Continue your shopping with Lenka Stores. 😊</p>
        </div>
        <div class="pt-2">
          <button type="button" onclick="document.getElementById('thankYouStickerModal').remove(); window.scrollTo({top:0, behavior:'smooth'});" class="w-full py-3.5 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:bg-[#E8C997] transition-all cursor-pointer active:scale-95">
            Continue Shopping
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(stickerModal);
  }
}

// Global window exposure
window.getCart = getCart;
window.saveCart = saveCart;
window.addToBag = addToBag;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.updateCartUI = updateCartUI;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.handlePlaceOrder = handlePlaceOrder;
window.closeOrderSuccessModal = closeOrderSuccessModal;
window.showThankYouStickerModal = showThankYouStickerModal;
