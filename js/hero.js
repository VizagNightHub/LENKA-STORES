// DEDICATED ATELIER HERO AD & VIDEO CAROUSEL ENGINE

let heroMediaSlots = [];
let activeHeroIndex = 0;
let isHeroAnimating = false;
let heroAutoTimer = null;

const DEFAULT_HERO_MEDIA = [
  {
    id: 0,
    url: "https://assets.mixkit.co/videos/preview/mixkit-stylish-man-walking-in-a-city-41450-large.mp4",
    bg: "#F4845F",
    title: "Lenka Collection"
  }
];

function initHeroMediaEngine() {
  const saved = JSON.parse(localStorage.getItem('lenka_hero_ads') || '[]');
  heroMediaSlots = Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_HERO_MEDIA;
  buildAndRenderMediaStage();
  startAutoSlideTimer();
  setupTouchSwipeGestures();

  if (window.firebase && firebase.apps.length) {
    firebase.firestore().collection('settings').doc('hero_ads').onSnapshot(doc => {
      if (doc.exists && Array.isArray(doc.data().media) && doc.data().media.length > 0) {
        heroMediaSlots = doc.data().media;
        localStorage.setItem('lenka_hero_ads', JSON.stringify(heroMediaSlots));
        buildAndRenderMediaStage();
      }
    }, err => console.warn("Hero ads fetch warning:", err));
  }
}

function buildAndRenderMediaStage() {
  const stage = document.getElementById('heroCarouselStage');
  const arrowControls = document.getElementById('navArrowButtons');
  if (!stage) return;
  stage.innerHTML = '';

  if (arrowControls) {
    if (heroMediaSlots.length <= 1) arrowControls.classList.add('hidden');
    else arrowControls.classList.remove('hidden');
  }

  heroMediaSlots.forEach((slot, idx) => {
    const url = slot.url || '';
    const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('.mp4') || url.includes('cloudfront.net');
    
    const card = document.createElement('div');
    card.id = `carouselItem-${idx}`;
    card.className = "absolute rounded-[32px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border-2 border-white/20 bg-black";
    card.style.transition = "all 600ms cubic-bezier(0.4, 0, 0.2, 1)";
    card.style.willChange = "transform, filter, opacity, left, top, width, height";

    if (isVideo) {
      card.innerHTML = `
        <video autoplay muted loop playsinline preload="auto" class="w-full h-full object-cover pointer-events-none">
          <source src="${url}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      `;
    } else {
      card.innerHTML = `
        <img src="${url}" alt="${slot.title || 'Lenka Ad'}" draggable="false" class="w-full h-full object-cover pointer-events-none" />
      `;
    }
    stage.appendChild(card);
  });

  renderHeroStage();
}

function renderHeroStage() {
  const isMobile = window.innerWidth < 640;
  const total = heroMediaSlots.length;
  const heroRoot = document.getElementById('lenkaHeroRoot');
  const getStartedBtn = document.getElementById('heroGetStartedBtn');
  const currentTheme = heroMediaSlots[activeHeroIndex] || { bg: '#F4845F' };

  if (heroRoot) heroRoot.style.backgroundColor = currentTheme.bg || '#F4845F';
  if (getStartedBtn) getStartedBtn.style.color = currentTheme.bg || '#F4845F';

  if (total === 0) return;

  heroMediaSlots.forEach((_, idx) => {
    const itemEl = document.getElementById(`carouselItem-${idx}`);
    if (!itemEl) return;

    const vid = itemEl.querySelector('video');
    if (vid) {
      vid.play().catch(e => console.warn("Video autoplay prevented:", e));
    }

    if (total === 1) {
      itemEl.style.left = '50%';
      itemEl.style.top = isMobile ? '37%' : '36%';
      itemEl.style.transform = 'translateX(-50%) scale(1)';
      itemEl.style.width = isMobile ? '86%' : '370px';
      itemEl.style.height = isMobile ? '50%' : '54%';
      itemEl.style.filter = 'blur(0px)';
      itemEl.style.opacity = '1';
      itemEl.style.zIndex = '30';
    } else {
      const relativePos = (idx - activeHeroIndex + total) % total;

      if (relativePos === 0) {
        itemEl.style.left = '50%';
        itemEl.style.top = isMobile ? '37%' : '36%';
        itemEl.style.transform = 'translateX(-50%) scale(1)';
        itemEl.style.width = isMobile ? '86%' : '370px';
        itemEl.style.height = isMobile ? '50%' : '54%';
        itemEl.style.filter = 'blur(0px)';
        itemEl.style.opacity = '1';
        itemEl.style.zIndex = '30';
      } else if (relativePos === 1) {
        itemEl.style.left = isMobile ? '90%' : '78%';
        itemEl.style.top = isMobile ? '40%' : '39%';
        itemEl.style.transform = 'translateX(-50%) scale(0.85)';
        itemEl.style.width = isMobile ? '68%' : '300px';
        itemEl.style.height = isMobile ? '42%' : '46%';
        itemEl.style.filter = 'blur(2.5px)';
        itemEl.style.opacity = '0.7';
        itemEl.style.zIndex = '15';
      } else if (relativePos === total - 1) {
        itemEl.style.left = isMobile ? '10%' : '22%';
        itemEl.style.top = isMobile ? '40%' : '39%';
        itemEl.style.transform = 'translateX(-50%) scale(0.85)';
        itemEl.style.width = isMobile ? '68%' : '300px';
        itemEl.style.height = isMobile ? '42%' : '46%';
        itemEl.style.filter = 'blur(2.5px)';
        itemEl.style.opacity = '0.7';
        itemEl.style.zIndex = '15';
      } else {
        itemEl.style.left = '50%';
        itemEl.style.top = '42%';
        itemEl.style.transform = 'translateX(-50%) scale(0.7)';
        itemEl.style.width = '240px';
        itemEl.style.height = '36%';
        itemEl.style.filter = 'blur(5px)';
        itemEl.style.opacity = '0';
        itemEl.style.zIndex = '5';
      }
    }
  });
}

function navigateHeroCarousel(direction) {
  const total = heroMediaSlots.length;
  if (total <= 1 || isHeroAnimating) return;
  isHeroAnimating = true;

  if (direction === 'next') {
    activeHeroIndex = (activeHeroIndex + 1) % total;
  } else {
    activeHeroIndex = (activeHeroIndex - 1 + total) % total;
  }
  
  renderHeroStage();
  resetAutoSlideTimer();
  setTimeout(() => { isHeroAnimating = false; }, 600);
}

function startAutoSlideTimer() {
  if (heroAutoTimer) clearInterval(heroAutoTimer);
  heroAutoTimer = setInterval(() => {
    navigateHeroCarousel('next');
  }, 30000);
}

function resetAutoSlideTimer() {
  startAutoSlideTimer();
}

function setupTouchSwipeGestures() {
  const stage = document.getElementById('heroCarouselStage');
  if (!stage) return;

  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  stage.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    handleGesture();
  }, { passive: true });

  let isMouseDown = false;
  stage.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.clientX;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isMouseDown) return;
    isMouseDown = false;
    endX = e.clientX;
    handleGesture();
  });

  function handleGesture() {
    const diffX = endX - startX;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) navigateHeroCarousel('next');
      else navigateHeroCarousel('prev');
    }
  }
}

window.navigateHeroCarousel = navigateHeroCarousel;

window.addEventListener('DOMContentLoaded', () => {
  initHeroMediaEngine();
});
window.addEventListener('resize', renderHeroStage);
