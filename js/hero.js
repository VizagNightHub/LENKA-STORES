// LENKA STORES HERO ADS CONTROLLER

let currentHeroIndex = 0;
let heroAdItems = [];

// Initialize Hero Carousel Ads
async function initHeroCarousel() {
  heroAdItems = [];

  // Try fetching dedicated hero ads from Firebase Firestore 'heroAds' collection
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    try {
      const snapshot = await firebase.firestore().collection('heroAds').get();
      snapshot.forEach(doc => {
        heroAdItems.push({ id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.warn("Firestore heroAds fetch note:", err);
    }
  }

  // Fallback to local storage if Firestore is empty
  if (heroAdItems.length === 0) {
    try {
      heroAdItems = JSON.parse(localStorage.getItem('lenka_hero_ads') || '[]');
    } catch (e) {
      heroAdItems = [];
    }
  }

  // Final fallback if no custom hero ads uploaded yet
  if (heroAdItems.length === 0) {
    heroAdItems = [
      {
        title: "LENKA STORES EXCLUSIVE",
        subtitle: "Curated Luxury & Modern Living",
        videoUrl: "https://videotourl.com/videos/1788946478817-c99553c4-67b1-4b9a-be27-9fd5c205d9e8.mp4"
      }
    ];
  }

  renderHeroCarouselStage();
}

// Render the active hero ad video stage
function renderHeroCarouselStage() {
  const stage = document.getElementById('heroCarouselStage');
  const navButtons = document.getElementById('navArrowButtons');
  if (!stage) return;

  stage.innerHTML = '';

  if (heroAdItems.length > 1 && navButtons) {
    navButtons.classList.remove('hidden');
  } else if (navButtons) {
    navButtons.classList.add('hidden');
  }

  const currentAd = heroAdItems[currentHeroIndex] || heroAdItems[0];

  const slideWrapper = document.createElement('div');
  slideWrapper.className = "relative w-full h-full flex items-center justify-center p-4 transition-all duration-500 ease-out";
  
  slideWrapper.innerHTML = `
    <div class="relative w-full max-w-xl aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black">
      <video autoplay loop muted playsinline class="w-full h-full object-cover">
        <source src="${currentAd.videoUrl || currentAd.image}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
        <div>
          <h4 class="text-xs font-bold text-white truncate">${currentAd.title || 'Lenka Featured Ad'}</h4>
          <p class="text-[10px] text-[#C5A880] font-mono mt-0.5">${currentAd.subtitle || 'Tap explore to discover more'}</p>
        </div>
        <button type="button" onclick="scrollToLiveCatalog()" class="px-4 py-2 bg-white text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow hover:bg-[#C5A880] transition-all cursor-pointer">
          Explore
        </button>
      </div>
    </div>
  `;

  stage.appendChild(slideWrapper);
}

// Navigate Hero Carousel Ads
function navigateHeroCarousel(direction) {
  if (heroAdItems.length === 0) return;

  if (direction === 'next') {
    currentHeroIndex = (currentHeroIndex + 1) % heroAdItems.length;
  } else {
    currentHeroIndex = (currentHeroIndex - 1 + heroAdItems.length) % heroAdItems.length;
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
