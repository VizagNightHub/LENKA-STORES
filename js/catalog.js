// LENKA STORES CATALOG & INTERACTIVE PRODUCT STICKER CONTROLLER

let allProducts = [];

// Initialize Catalog from localStorage or Firebase
async function initCatalog() {
  try {
    allProducts = JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
  } catch (e) {
    allProducts = [];
  }

  window.liveCatalog = allProducts;
  renderCatalogGrid(allProducts);
}

// Render the Store Product Cards Grid
function renderCatalogGrid(products) {
  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyCatalogState');
  if (!grid) return;

  grid.innerHTML = '';

  if (!products || products.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = "bg-[#111218] border border-white/10 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-[#C5A880]/50 transition-all group";
    
    // Calculate dummy or stored reviews
    const reviews = prod.reviews || [
      { name: "Rahul S.", rating: 5, comment: "Absolute luxury quality! Worth every rupee.", date: "2 days ago" },
      { name: "Priya M.", rating: 5, comment: "Super fast shipping and premium finish.", date: "1 week ago" }
    ];
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

    card.innerHTML = `
      <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-black cursor-pointer" onclick="openProductStickerModal('${prod.id}')">
        <img src="${prod.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${prod.title}" />
        ${prod.discountTag ? `<span class="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-[#E8C997] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10">${prod.discountTag}</span>` : ''}
      </div>

      <div class="space-y-1.5 cursor-pointer" onclick="openProductStickerModal('${prod.id}')">
        <span class="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A880]">${prod.category || 'Curated Luxury'}</span>
        <h3 class="font-bold text-white text-sm sm:text-base line-clamp-1">${prod.title}</h3>
        
        <div class="flex items-center gap-1.5 text-xs text-amber-400">
          <div class="flex items-center">★ ★ ★ ★ ★</div>
          <span class="text-slate-400 font-mono text-[11px]">(${avgRating} • ${reviews.length} reviews)</span>
        </div>

        <div class="flex items-center gap-2 pt-1 font-mono">
          <span class="text-white font-bold text-base">₹${prod.offerPrice || prod.price}</span>
          ${prod.originalPrice ? `<span class="text-slate-500 text-xs line-through">₹${prod.originalPrice}</span>` : ''}
        </div>
      </div>

      <!-- ADD TO BAG BUTTON OPENS 3D STICKER POPUP -->
      <button type="button" onclick="openProductStickerModal('${prod.id}')" class="w-full py-3.5 bg-gradient-to-r from-[#A88B63] via-[#C5A880] to-[#E8C997] text-black font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer">
        Add to Bag
      </button>
    `;
    grid.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// 3D GLASS STICKER PRODUCT POPUP MODAL
function openProductStickerModal(productId) {
  const product = allProducts.find(p => String(p.id) === String(productId));
  if (!product) return;

  // Remove any existing modal first
  const existing = document.getElementById('productStickerModal');
  if (existing) existing.remove();

  const reviews = product.reviews || [
    { name: "Rahul S.", rating: 5, comment: "Absolute luxury quality! Worth every rupee.", date: "2 days ago" },
    { name: "Priya M.", rating: 5, comment: "Super fast shipping and premium finish.", date: "1 week ago" }
  ];

  const totalReviews = reviews.length;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);

  const modal = document.createElement('div');
  modal.id = 'productStickerModal';
  modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn";
  
  modal.innerHTML = `
    <div class="max-w-lg w-full bg-[#111218] border border-[#C5A880]/30 rounded-[32px] p-6 sm:p-8 shadow-[0_0_50px_rgba(197,168,128,0.2)] relative text-white space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
      
      <!-- Close Button -->
      <button type="button" onclick="document.getElementById('productStickerModal').remove()" class="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>

      <!-- Header / Title -->
      <div class="space-y-1 pr-8">
        <span class="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C5A880]">3D STICKER PREVIEW</span>
        <h2 class="font-serif text-2xl sm:text-3xl text-white font-bold">${product.title}</h2>
      </div>

      <!-- Product Image & Price Card -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-black/40 p-4 rounded-2xl border border-white/10">
        <img src="${product.image}" class="w-full h-40 object-cover rounded-xl bg-black" />
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-amber-400 text-xs">
            <span>★ ★ ★ ★ ★</span>
            <span class="text-slate-300 font-mono font-bold">${avgRating} / 5.0</span>
          </div>
          <div class="font-mono">
            <span class="text-2xl font-bold text-white">₹${product.offerPrice || product.price}</span>
            ${product.originalPrice ? `<span class="text-slate-500 text-xs line-through ml-2">₹${product.originalPrice}</span>` : ''}
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed">${product.description || 'Crafted with precision for the modern connoisseur.'}</p>
        </div>
      </div>

      <!-- REVIEW STATISTICS & BREAKDOWN -->
      <div class="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#E8C997]">Customer Verified Reviews</h4>
          <span class="text-[11px] text-slate-400 font-mono">${fiveStarCount} of ${totalReviews} members gave 5 Stars (100%)</span>
        </div>

        <div id="reviewsListContainer" class="space-y-2.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
          ${reviews.map(r => `
            <div class="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">${r.name}</span>
                <span class="text-amber-400 text-[10px]">★ ★ ★ ★ ★</span>
              </div>
              <p class="text-slate-300">${r.comment}</p>
              <span class="text-[9px] text-slate-500 font-mono">${r.date}</span>
            </div>
          `).join('')}
        </div>

        <!-- SUBMIT NEW REVIEW & PHOTO UPLOAD TOOL -->
        <div class="pt-3 border-t border-white/10 space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] block">Write a Review & Upload Product Photo</label>
          <input type="text" id="reviewerName" placeholder="Your Name" class="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
          <textarea id="reviewerComment" placeholder="Write your 5-star review..." rows="2" class="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none"></textarea>
          
          <div class="flex items-center gap-2">
            <input type="file" id="reviewPhotoInput" accept="image/*" class="text-[10px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer" />
          </div>

          <button type="button" onclick="submitUserReview('${product.id}')" class="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">
            Post 5-Star Review & Photo ✓
          </button>
        </div>
      </div>

      <!-- DIRECT PAY & BAG BUTTONS -->
      <div class="space-y-2 pt-2">
        <button type="button" onclick="addItemAndPayDirectly('${product.id}')" class="w-full py-4 bg-gradient-to-r from-[#A88B63] via-[#C5A880] to-[#E8C997] text-black font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer">
          PAY NOW (DIRECT CHECKOUT)
        </button>
        <button type="button" onclick="addItemToBagFromSticker('${product.id}')" class="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer">
          Add to Bag & Continue Shopping
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
}

// Submit a new 5-star review with photo
function submitUserReview(productId) {
  const name = document.getElementById('reviewerName').value.trim() || "Verified Buyer";
  const comment = document.getElementById('reviewerComment').value.trim() || "Amazing product quality!";
  const fileInput = document.getElementById('reviewPhotoInput');

  let product = allProducts.find(p => String(p.id) === String(productId));
  if (!product) return;

  if (!product.reviews) product.reviews = [];

  const newReview = {
    name,
    rating: 5,
    comment,
    date: "Just now"
  };

  if (fileInput && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      newReview.photo = e.target.result;
      product.reviews.unshift(newReview);
      localStorage.setItem('lenka_catalog', JSON.stringify(allProducts));
      alert("Thank you! Your 5-star review and photo have been published.");
      openProductStickerModal(productId); // Refresh modal
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    product.reviews.unshift(newReview);
    localStorage.setItem('lenka_catalog', JSON.stringify(allProducts));
    alert("Thank you! Your 5-star review has been published.");
    openProductStickerModal(productId); // Refresh modal
  }
}

// Add item to bag and open checkout/payment modal directly
function addItemAndPayDirectly(productId) {
  if (typeof addToBag === 'function') {
    addToBag(productId);
  }
  const modal = document.getElementById('productStickerModal');
  if (modal) modal.remove();

  if (typeof openCheckoutModal === 'function') {
    openCheckoutModal();
  }
}

// Add item to bag and close sticker modal
function addItemToBagFromSticker(productId) {
  if (typeof addToBag === 'function') {
    addToBag(productId);
  }
  const modal = document.getElementById('productStickerModal');
  if (modal) modal.remove();
}

// Filter category handler
function filterCategory(categoryName) {
  const heading = document.getElementById('currentCategoryHeading');
  if (heading) heading.textContent = categoryName === 'all' ? 'Live Catalog' : categoryName;

  if (categoryName === 'all') {
    renderCatalogGrid(allProducts);
  } else {
    const filtered = allProducts.filter(p => String(p.category).trim().toLowerCase() === String(categoryName).trim().toLowerCase());
    renderCatalogGrid(filtered);
  }
}

// Expose functions globally
window.initCatalog = initCatalog;
window.filterCategory = filterCategory;
window.openProductStickerModal = openProductStickerModal;
window.submitUserReview = submitUserReview;
window.addItemAndPayDirectly = addItemAndPayDirectly;
window.addItemToBagFromSticker = addItemToBagFromSticker;

// Auto initialize catalog on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCatalog);
} else {
  initCatalog();
}
