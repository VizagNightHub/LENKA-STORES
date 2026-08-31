// CART ENGINE (INTER-MODULE RELIABLE)
function addToBag(prodId) {
  const catalog = window.LenkaApp ? window.LenkaApp.catalog : JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
  const prod = catalog.find(p => String(p.id) === String(prodId));
  
  if (!prod) {
    alert("Item details loading, please try again in a second.");
    return;
  }

  if (!window.LenkaApp.cart) {
    window.LenkaApp.cart = JSON.parse(localStorage.getItem('lenka_cart') || '[]');
  }

  window.LenkaApp.cart.push({ ...prod, cartItemId: Date.now() + Math.random() });
  localStorage.setItem('lenka_cart', JSON.stringify(window.LenkaApp.cart));
  
  updateCartUI();
  openCartDrawer();
}

function updateCartUI() {
  const cart = window.LenkaApp ? window.LenkaApp.cart : JSON.parse(localStorage.getItem('lenka_cart') || '[]');
  const badge = document.getElementById('cartBadge');
  if (badge) badge.innerText = cart.length;

  const list = document.getElementById('cartItemsList');
  const totalDisplay = document.getElementById('cartTotalPrice');
  const checkoutBtn = document.getElementById('checkoutActionBtn');

  if (!list) return;
  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = `<p class="text-xs text-slate-500 text-center py-12">Your atelier bag is empty.</p>`;
    if (totalDisplay) totalDisplay.innerText = '₹0';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    total += Number(item.offerPrice || 0);
    const row = document.createElement('div');
    row.className = "p-3.5 rounded-xl bg-noir-850 fine-border flex items-center justify-between gap-3 shadow-md";
    row.innerHTML = `
      <img src="${item.image}" class="w-12 h-12 rounded-lg object-cover bg-noir-900 fine-border" onerror="this.src='https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'"/>
      <div class="flex-1 min-w-0">
        <h4 class="text-xs text-white truncate font-medium">${item.title}</h4>
        <span class="text-xs text-bronze-400 font-serif">₹${item.offerPrice}</span>
      </div>
      <button onclick="removeFromCart(${index})" class="text-slate-500 hover:text-red-400 p-1.5 cursor-pointer transition-colors">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;
    list.appendChild(row);
  });

  if (totalDisplay) totalDisplay.innerText = `₹${total}`;
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  if (window.lucide) lucide.createIcons();
}

function removeFromCart(index) {
  if (window.LenkaApp && window.LenkaApp.cart) {
    window.LenkaApp.cart.splice(index, 1);
    localStorage.setItem('lenka_cart', JSON.stringify(window.LenkaApp.cart));
  }
  updateCartUI();
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) drawer.classList.remove('hidden');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) drawer.classList.add('hidden');
}

window.addToBag = addToBag;
window.updateCartUI = updateCartUI;
window.removeFromCart = removeFromCart;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
