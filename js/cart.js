function addToBag(prodId) {
  const prod = cloudCatalog.find(p => p.id === prodId);
  if (!prod) return;
  currentCart.push({ ...prod, cartItemId: Date.now() });
  localStorage.setItem('lenka_cart', JSON.stringify(currentCart));
  updateCartUI();
  openCartDrawer();
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.innerText = currentCart.length;

  const list = document.getElementById('cartItemsList');
  const totalDisplay = document.getElementById('cartTotalPrice');
  if (!list) return;
  list.innerHTML = '';

  if (currentCart.length === 0) {
    list.innerHTML = `<p class="text-xs text-slate-500 text-center py-10">Your atelier bag is empty.</p>`;
    if (totalDisplay) totalDisplay.innerText = '₹0';
    return;
  }

  let total = 0;
  currentCart.forEach((item, index) => {
    total += Number(item.offerPrice || 0);
    const row = document.createElement('div');
    row.className = "p-3 rounded-xl bg-noir-850 fine-border flex items-center justify-between gap-3";
    row.innerHTML = `
      <img src="${item.image}" class="w-12 h-12 rounded-lg object-cover bg-noir-900" />
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
  if (window.lucide) lucide.createIcons();
}

function removeFromCart(index) {
  currentCart.splice(index, 1);
  localStorage.setItem('lenka_cart', JSON.stringify(currentCart));
  updateCartUI();
}

function openCartDrawer() { document.getElementById('cartDrawer').classList.remove('hidden'); }
function closeCartDrawer() { document.getElementById('cartDrawer').classList.add('hidden'); }
