// LENKA STORES DYNAMIC HERO ADS CONTROLLER

let currentHeroIndex = 0;
let heroAdItems = [];

async function initHeroCarousel() {
  heroAdItems = [];

  // 1. Try loading from localStorage first for instant rendering
  try {
    const localAds = JSON.parse(localStorage.getItem('lenka_hero_ads') || '[]');
    if (Array.isArray(localAds) && localAds.length > 0) {
      heroAdItems = localAds;
    }
  } catch (e) {
    heroAdItems = [];
  }

  // 2. Sync with Firebase Firestore 'hero_ads' settings document
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    try {
      const docSnap = await firebase.firestore().collection('settings').doc('hero_ads').get();
      if (docSnap.exists && Array.isArray(docSnap.data().media)) {
        const cloudAds = docSnap.data().media.filter(ad => ad && ad.url);
        if (cloudAds.length > 0) {
          heroAdItems = cloudAds;
          localStorage.setItem('lenka_hero_ads', JSON.stringify(heroAdItems));
        }
      }
    } catch (err) {
      console.warn("Firestore hero_ads sync note:", err);
    }
  }

  // 3. Fallback blank state if no ads have been uploaded in Admin Studio yet
  if (heroAdItems.length === 0) {
    heroAdItems = [
      {
        title: "LENKA STORES STUDIO",
        url: "", // Blank so it forces you to upload via Admin Studio
        bg: "#F4845F"
      }
    ];
  }

  renderHeroCarouselStage();
}

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
  
  if (!currentAd.url) {
    slideWrapper.innerHTML = `
      <div class="relative w-full max-w-xl aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black/60 flex flex-col items-center justify-center p-6 text-center space-y-2">
        <h4 class="text-xs font-bold text-white uppercase tracking-wider">No Hero Ad Video Uploaded</h4>
        <p class="text-[11px] text-slate-400">Open Lenka Studio (admin.html), go to 'Hero Ads Manager', and add your video URL.</p>
      </div>
    `;
  } else {
    slideWrapper.innerHTML = `
      <div class="relative w-full max-w-xl aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black">
        <video autoplay loop muted playsinline class="w-full h-full object-cover">
          <source src="${currentAd.url}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div class="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <h4 class="text-xs font-bold text-white truncate">${currentAd.title || 'Lenka Featured Ad'}</h4>
            <p class="text-[10px] text-[#C5A880] font-mono mt-0.5">Tap explore to discover more</p>
          </div>
          <button type="button" onclick="scrollToLiveCatalog()" class="px-4 py-2 bg-white text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow hover:bg-[#C5A880] transition-all cursor-pointer">
            Explore
          </button>
        </div>
      </div>
    `;
  }

  stage.appendChild(slideWrapper);
}

function navigateHeroCarousel(direction) {
  if (heroAdItems.length === 0) return;

  if (direction === 'next') {
    currentHeroIndex = (currentHeroIndex + 1) % heroAdItems.length;
  } else {
    currentHeroIndex = (currentHeroIndex - 1 + heroAdItems.length) % heroAdItems.length;
  }

  renderHeroCarouselStage();
}

function scrollToLiveCatalog() {
  const catalogEl = document.getElementById('mainStoreCatalog');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  }
}

window.navigateHeroCarousel = navigateHeroCarousel;
window.scrollToLiveCatalog = scrollToLiveCatalog;
window.initHeroCarousel = initHeroCarousel;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroCarousel);
} else {
  initHeroCarousel();
}
