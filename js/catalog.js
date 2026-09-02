// LIVE CATALOG & PRODUCT SYNCHRONIZATION ENGINE

let liveCatalog = [];
window.liveCatalog = liveCatalog; // ensures cart.js can access it

function initStorefrontCatalog() {
  // 1. Load local backup cache immediately
  const saved = JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
  if (saved.length > 0) {
    liveCatalog = saved;
    renderCatalog();
  }

  // 2. Real-time Firebase Firestore listener
  if (window.firebase && firebase.apps.length) {
    const db = firebase.firestore();
    db.collection('products').onSnapshot(snapshot => {
      liveCatalog = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        liveCatalog.push({
          id: doc.id,
          title: d.title || 'Untitled Product',
          category: d.category || 'Audio & Wireless Earbuds',
          originalPrice: Number(d.originalPrice) || 0,
          offerPrice: Number(d.offerPrice || d.price) || 0,
          discountTag: d.discountTag || '',
          description: d.description || '',
          image: d.image || (Array.isArray(d.images) ? d.images[0] : '') || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'
        });
      });
      
      localStorage.setItem('lenka_catalog', JSON.stringify(liveCatalog));
      renderCatalog();
    }, err => {
      console.warn("Firestore products fetch warning:", err);
      renderCatalog();
    });
  }
}

function filterCategory(cat) {
  currentCategoryFilter = cat;
  const heading = document.getElementById('currentCategoryHeading');
  if (heading) {
    heading.innerText = cat === 'all' ? 'Live Catalog' : cat;
  }
  renderCatalog();
}

function renderCatalog() {
  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyCatalogState');
  if (!grid) return;
  grid.innerHTML = '';

  let filtered = liveCatalog;
  if (currentCategoryFilter !== 'all') {
    const query = currentCategoryFilter.toLowerCase();
    filtered = liveCatalog.filter(p => {
      const cat = (p.category || '').toLowerCase();
      return cat.includes(query) || query.includes(cat);
    });
  }

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = "bg-[#111318] border border-white/10 rounded-3xl p-5 shadow-xl hover:border-[#C5A880]/50 transition-all flex flex-col justify-between space-y-4";
    card.innerHTML = `
      <div>
        <div class="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-3.5 relative">
          <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          ${p.discountTag ? `<span class="absolute top-2.5 left-2.5 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/10">${p.discountTag}</span>` : ''}
        </div>
        <span class="text-[9px] uppercase font-bold tracking-widest text-[#C5A880]">${p.category}</span>
        <h4 class="font-bold text-white text-base mt-1 line-clamp-1">${p.title}</h4>
        <p class="text-xs text-slate-400 mt-1 line-clamp-2">${p.description || 'Precision crafted and tuned for modern luxury.'}</p>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-white/10">
        <div>
          ${p.originalPrice ? `<span class="text-xs text-slate-500 line-through mr-1.5">₹${p.originalPrice}</span>` : ''}
          <span class="text-base font-extrabold text-white">₹${p.offerPrice}</span>
        </div>
        <button type="button" onclick="addToBag('${p.id}')" class="px-4 py-2 bg-gradient-to-r from-[#A88B63] via-[#C5A880] to-[#E8C997] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer">
          Add To Bag
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// Expose globally
window.initStorefrontCatalog = initStorefrontCatalog;
window.filterCategory = filterCategory;
window.renderCatalog = renderCatalog;

window.addEventListener('DOMContentLoaded', () => {
  initStorefrontCatalog();
});
