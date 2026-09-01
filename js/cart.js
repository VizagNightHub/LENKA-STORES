// ATELIER SHOPPING BAG & CART ENGINE

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
  const catalog = window.LenkaApp && window.LenkaApp.catalog ? window.LenkaApp.catalog : JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
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
      price: product.offerPrice || product.price,
      image: product.image,
      category: product.category,
      quantity: 1
    });
  }

  saveCart(cart);
  openCartDrawer();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => String(item.id) !== String(productId));
  saveCart(cart);
}

function updateQuantity(productId, qty) {
  let cart = getCart();
  const item = cart.find(i => String(i.id) === String(productId));
  if (item) {
    item.quantity = Number(qty);
    if (item.quantity <= 0) {
      return removeFromCart(productId);
    }
  }
  saveCart(cart);
}

function updateCartUI() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update badge counters in navbar
  const badge = document.getElementById('navCartCount');
  if (badge) badge.innerText = totalCount;

  const subtotalEl = document.getElementById('cartSubtotalPrice');
  if (subtotalEl) subtotalEl.innerText = `₹${subtotal.toLocaleString('en-IN')}`;

  const container = document.getElementById('cartItemsList');
  if (!container) return;

  container.innerHTML = '';
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 space-y-3">
        <i data-lucide="shopping-bag" class="w-10 h-10 text-slate-600 mx-auto"></i>
        <p class="text-xs text-slate-400">Your Atelier bag is currently empty.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = "flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10";
    el.innerHTML = `
      <img src="${item.image}" class="w-14 h-14 rounded-xl object-cover bg-black" />
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-bold text-white truncate">${item.name}</h4>
        <p class="text-xs font-semibold text-[#C5A880] mt-0.5">₹${item.price}</p>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-bold hover:bg-white/20">-</button>
          <span class="text-xs font-mono text-white">${item.quantity}</span>
          <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs font-bold hover:bg-white/20">+</button>
        </div>
      </div>
      <button onclick="removeFromCart('${item.id}')" class="p-2 text-slate-500 hover:text-red-400 transition-colors">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;
    container.appendChild(el);
  });

  if (window.lucide) lucide.createIcons();
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) drawer.classList.remove('translate-x-full');
  updateCartUI();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) drawer.classList.add('translate-x-full');
}

function openCheckoutModal() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your bag is empty.");
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('hidden');

  // Pre-fill profile name & phone if saved
  const profile = JSON.parse(localStorage.getItem('lenka_profile') || 'null');
  if (profile) {
    const nameInp = document.getElementById('orderClientName');
    const phoneInp = document.getElementById('orderClientPhone');
    const addrInp = document.getElementById('orderClientAddress');
    if (nameInp && !nameInp.value) nameInp.value = profile.name;
    if (phoneInp && !phoneInp.value) phoneInp.value = profile.phone;
    if (addrInp && !addrInp.value) addrInp.value = profile.address;
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.add('hidden');
}

// Expose globally
window.addToBag = addToBag;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.updateCartUI = updateCartUI;

window.addEventListener('DOMContentLoaded', updateCartUI);
