// ATELIER SHOPPING CART & BAG MANAGEMENT ENGINE

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
  // Check global liveCatalog or localStorage
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
      image: product.image || (Array.isArray(product.images) ? product.images[0] : '') || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
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
    if (item.quantity <= 0) {
      return removeFromCart(id);
    }
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

// Global window exposure
window.getCart = getCart;
window.saveCart = saveCart;
window.addToBag = addToBag;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.updateCartUI = updateCartUI;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;

window.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
});
