// ATELIER CATALOG & TOUCH SLIDER ENGINE (CRASH-PROOF)

let liveCatalog = [];
let currentCategoryFilter = 'all';

function initStorefrontCatalog() {
  const saved = JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
  if (saved.length > 0) {
    liveCatalog = saved;
    renderCatalog();
  }

  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    firebase.firestore().collection('products').onSnapshot(snapshot => {
      liveCatalog = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        let imagesList = [];
        if (Array.isArray(d.images) && d.images.length > 0) {
          imagesList = d.images;
        } else if (d.image) {
          imagesList = [d.image];
        } else {
          imagesList = ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'];
        }

        liveCatalog.push({
          id: doc.id,
          title: d.title || 'Untitled Product',
          category: d.category || 'Audio & Wireless Earbuds',
          originalPrice: d.originalPrice || 0,
          offerPrice: d.offerPrice || d.price || 0,
          discountTag: d.discountTag || '',
          description: d.description || '',
          image: imagesList[0],
          images: imagesList
        });
      });
      localStorage.setItem('lenka_catalog', JSON.stringify(liveCatalog));
      renderCatalog();
    }, err => {
      console.warn("Catalog sync warning:", err);
      renderCatalog();
    });
  } else {
    renderCatalog();
  }
}

function filterCategory(cat) {
  currentCategoryFilter = String(cat).trim().toLowerCase();
  const heading = document.getElementById('currentCategoryHeading');
  if (heading) {
    heading.innerText = (currentCategoryFilter === 'all') ? 'Live Catalog' : cat;
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
    filtered = liveCatalog.filter(p => String(p.category || '').trim().toLowerCase() === currentCategoryFilter);
  }

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  filtered.forEach((p, index) => {
    const imagesList = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image];
    const hasMultipleImages = imagesList.length > 1;
    const sliderId = `prodSlider_${p.id || index}`;

    const card = document.createElement('div');
    card.className = "bg-[#111318] border border-white/10 rounded-3xl p-5 shadow-xl hover:border-[#C5A880]/50 transition-all flex flex-col justify-between space-y-4";
    card.innerHTML = `
      <div>
        <div id="wrapper_${sliderId}" class="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-3.5 relative group select-none cursor-grab active:cursor-grabbing touch-pan-y">
          
          <div id="${sliderId}" class="h-full flex transition-transform duration-300 ease-out pointer-events-none" style="width: ${imagesList.length * 100}%;">
            ${imagesList.map(img => `<img src="${img}" class="h-full object-cover shrink-0 pointer-events-none" style="width: ${100 / imagesList.length}%;" />`).join('')}
          </div>
          
          ${p.discountTag ? `<span class="absolute top-2.5 left-2.5 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/10 z-10">${p.discountTag}</span>` : ''}

          ${hasMultipleImages ? `
            <button type="button" onclick="event.stopPropagation(); slideProductImage('${sliderId}', -1, ${imagesList.length})" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 text-sm font-bold shadow-md">❮</button>
            <button type="button" onclick="event.stopPropagation(); slideProductImage('${sliderId}', 1, ${imagesList.length})" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 text-sm font-bold shadow-md">❯</button>
            
            <div id="dots_${sliderId}" class="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10 pointer-events-none">
              ${imagesList.map((_, i) => `<span class="w-2 h-2 rounded-full bg-white/${i === 0 ? '100' : '40'} shadow transition-all"></span>`).join('')}
            </div>
          ` : ''}
        </div>

        <span class="text-[9px] uppercase font-bold tracking-widest text-[#C5A880]">${p.category || 'Atelier Exclusive'}</span>
        <h4 class="font-bold text-white text-base mt-1 line-clamp-1">${p.title}</h4>
        <p class="text-xs text-slate-400 mt-1 line-clamp-2">${p.description || 'Precision crafted and tuned for modern luxury.'}</p>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-white/10">
        <div>
          ${p.originalPrice ? `<span class="text-xs text-slate-500 line-through mr-1.5">₹${p.originalPrice}</span>` : ''}
          <span class="text-base font-extrabold text-white">₹${p.offerPrice || 0}</span>
        </div>
        <button type="button" onclick="addToBag('${p.id}')" class="px-4 py-2 bg-gradient-to-r from-[#A88B63] via-[#C5A880] to-[#E8C997] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer">
          Add To Bag
        </button>
      </div>
    `;
    grid.appendChild(card);

    if (hasMultipleImages) {
      setTimeout(() => setupProductSwipeGestures(sliderId, imagesList.length), 50);
    }
  });
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

window.productSliderIndices = window.productSliderIndices || {};
function slideProductImage(sliderId, direction, totalImages) {
  if (window.productSliderIndices[sliderId] === undefined) window.productSliderIndices[sliderId] = 0;
  let currentIndex = window.productSliderIndices[sliderId];
  currentIndex = (currentIndex + direction + totalImages) % totalImages;
  window.productSliderIndices[sliderId] = currentIndex;

  const sliderEl = document.getElementById(sliderId);
  if (sliderEl) {
    const percentage = -(currentIndex * (100 / totalImages));
    sliderEl.style.transform = `translateX(${percentage}%)`;
  }

  const dotsContainer = document.getElementById(`dots_${sliderId}`);
  if (dotsContainer) {
    const dots = dotsContainer.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].className = `w-2 h-2 rounded-full bg-white/${i === currentIndex ? '100' : '40'} shadow transition-all`;
    }
  }
}

function setupProductSwipeGestures(sliderId, totalImages) {
  const wrapper = document.getElementById(`wrapper_${sliderId}`);
  if (!wrapper) return;

  let startX = 0;
  let endX = 0;

  wrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    if (Math.abs(diffX) > 30) {
      if (diffX < 0) {
        slideProductImage(sliderId, 1, totalImages);
      } else {
        slideProductImage(sliderId, -1, totalImages);
      }
    }
  }, { passive: true });
}

window.filterCategory = filterCategory;
window.slideProductImage = slideProductImage;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStorefrontCatalog);
} else {
  initStorefrontCatalog();
}
