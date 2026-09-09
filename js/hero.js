// ATELIER HERO CAROUSEL & MEDIA CONTROLLER (CRASH-PROOF)

let currentHeroIndex = 0;
let heroCarouselItems = [];

// Initialize Hero Carousel
function initHeroCarousel() {
  // Use liveCatalog or fallback to local cache
  heroCarouselItems = window.liveCatalog || [];
  if (heroCarouselItems.length === 0) {
    try {
      heroCarouselItems = JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
    } catch (e) {
      heroCarouselItems = [];
    }
  }

  renderHeroCarouselStage();
}

// Render the active hero item or video stage
function renderHeroCarouselStage() {
  const stage = document.getElementById('heroCarouselStage');
  const navButtons = document.getElementById('navArrowButtons');
  if (!stage) return;

  stage.innerHTML = '';

  if (heroCarouselItems.length === 0) {
    stage.innerHTML = `
      <div class="flex items-center justify-center h-full text-white/70 text-sm">
        Curating immersive pieces...
      </div>
    `;
    if (navButtons) navButtons.classList.add('hidden');
    return;
  }

  if (heroCarouselItems.length > 1 && navButtons) {
    navButtons.classList.remove('hidden');
  }

  const currentItem = heroCarouselItems[currentHeroIndex] || heroCarouselItems[0];

  const slideWrapper = document.createElement('div');
  slideWrapper.className = "relative w-full h-full flex items-center justify-center p-4 transition-all duration-500 ease-out";
  
  // Check if item has a video URL, otherwise fall back to image
  if (currentItem.videoUrl) {
    slideWrapper.innerHTML = `
      <div class="relative w-full max-w-lg aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black">
        <video autoplay loop muted playsinline class="w-full h-full object-cover">
          <source src="${currentItem.videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div class="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <h4 class="text-xs font-bold text-white truncate">${currentItem.title}</h4>
            <p class="text-[10px] text-[#C5A880] font-mono mt-0.5">₹${currentItem.offerPrice || currentItem.price}</p>
          </div>
          <button type="button" onclick="addToBag('${currentItem.id}')" class="px-3 py-1.5 bg-white text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow hover:bg-[#C5A880] transition-all cursor-pointer">
            Add to Bag
          </button>
        </div>
      </div>
    `;
  } else {
    slideWrapper.innerHTML = `
      <div class="relative w-full max-w-lg aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black">
        <img src="${currentItem.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'}" class="w-full h-full object-cover breathing-img" alt="${currentItem.title}" />
        <div class="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <h4 class="text-xs font-bold text-white truncate">${currentItem.title}</h4>
            <p class="text-[10px] text-[#C5A880] font-mono mt-0.5">₹${currentItem.offerPrice || currentItem.price}</p>
          </div>
          <button type="button" onclick="addToBag('${currentItem.id}')" class="px-3 py-1.5 bg-white text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow hover:bg-[#C5A880] transition-all cursor-pointer">
            Add to Bag
          </button>
        </div>
      </div>
    `;
  }

  stage.appendChild(slideWrapper);
}

// Navigate Carousel Items
function navigateHeroCarousel(direction) {
  if (heroCarouselItems.length === 0) return;

  if (direction === 'next') {
    currentHeroIndex = (currentHeroIndex + 1) % heroCarouselItems.length;
  } else {
    currentHeroIndex = (currentHeroIndex - 1 + heroCarouselItems.length) % heroCarouselItems.length;
  }

  renderHeroCarouselStage();
}

// Scroll smoothly down to the live catalog section
function scrollToLiveCatalog() {
  const catalogEl = document.getElementById('mainStoreCatalog');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  }
}

// Expose functions globally to window scope
window.navigateHeroCarousel = navigateHeroCarousel;
window.scrollToLiveCatalog = scrollToLiveCatalog;
window.initHeroCarousel = initHeroCarousel;

// Auto initialize hero section on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroCarousel);
} else {
  initHeroCarousel();
}
