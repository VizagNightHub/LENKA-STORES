// CART DATA INITIALIZATION
window.currentCart = JSON.parse(localStorage.getItem('lenka_cart') || '[]');

function addToBag(prodId) {
  const prod = (window.cloudCatalog || []).find(p => p.id === prodId);
  if (!prod) return;
  window.currentCart.push({ ...prod, cartItemId: Date.now() });
  localStorage.setItem('lenka_cart', JSON.stringify(window.currentCart));
  updateCartUI();
  openCartDrawer();
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.innerText = window.currentCart.length;

  const list = document.getElementById('cartItemsList');
  const totalDisplay = document.getElementById('cartTotalPrice');
  const checkoutBtn = document.getElementById('checkoutActionBtn');

  if (!list) return;
  list.innerHTML = '';

  if (window.currentCart.length === 0) {
    list.innerHTML = `<p class="text-xs text-slate-500 text-center py-10">Your atelier bag is empty.</p>`;
    if (totalDisplay) totalDisplay.innerText = '₹0';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    return;
  }

  let total = 0;
  window.currentCart.forEach((item, index) => {
    total += Number(item.offerPrice || 0);
    const row = document.createElement('div');
    row.className = "p-3 rounded-xl bg-noir-850 fine-border flex items-center justify-between gap-3";
    row.innerHTML = `
      <img src="${item.image}" class="w-12 h-12 rounded-lg object-cover bg-noir-900" onerror="this.src='https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'"/>
      <div class="flex-1 min-w-0">
        <h4 class="text-xs text-white truncate font-medium">${item.title}</h4>
        <span class="text-xs text-bronze-400 font-serif">₹${item.offerPrice}</span>
      </div>
      <button onclick="removeFromCart(${index})" class="text-slate-500 hover:text-red-400 p-1 cursor-pointer">
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
  window.currentCart.splice(index, 1);
  localStorage.setItem('lenka_cart', JSON.stringify(window.currentCart));
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

// Global exposure
window.addToBag = addToBag;
window.updateCartUI = updateCartUI;
window.removeFromCart = removeFromCart;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
