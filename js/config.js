// GLOBAL APPLICATION STATE ENGINE
window.LenkaApp = {
  db: null,
  catalog: [],
  cart: JSON.parse(localStorage.getItem('lenka_cart') || '[]'),
  profile: JSON.parse(localStorage.getItem('lenka_profile') || 'null'),
  favorites: JSON.parse(localStorage.getItem('lenka_favorites') || '[]'),
  activeCategory: 'all',
  activeImageIndexes: {} // Tracks current active slide index per product ID
};

// UNIFIED FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDXwQhinA5N5IRamLjr4viHvM7oeLNaVOc",
  authDomain: "lenkastores-website.firebaseapp.com",
  projectId: "lenkastores-website",
  storageBucket: "lenkastores-website.firebasestorage.app",
  messagingSenderId: "17683527030",
  appId: "1:17683527030:web:b443d717f2c89ee177f657",
  measurementId: "G-3JT9WKQ318"
};

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  window.LenkaApp.db = firebase.firestore();
} catch (err) {
  console.warn("Firebase Init Note:", err);
}

// REAL-TIME FIRESTORE & LOCAL CATALOG SYNC
function initCatalogSync() {
  const localSaved = JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
  if (localSaved.length > 0) {
    window.LenkaApp.catalog = localSaved;
    renderCatalog(window.LenkaApp.activeCategory);
  } else {
    seedDefaultCatalog();
  }

  if (window.LenkaApp.db) {
    window.LenkaApp.db.collection('products').onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        window.LenkaApp.catalog = [];
        snapshot.forEach(doc => {
          window.LenkaApp.catalog.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('lenka_catalog', JSON.stringify(window.LenkaApp.catalog));
        renderCatalog(window.LenkaApp.activeCategory);
      }
    }, (err) => {
      console.warn("Firestore sync note:", err);
    });
  }
}

function seedDefaultCatalog() {
  window.LenkaApp.catalog = [
    {
      id: 'prod_101',
      category: 'Audio & Wireless Earbuds',
      title: 'Lenka Horizon ANC Earbuds Pro',
      originalPrice: 4999,
      offerPrice: 2499,
      discountTag: '50% OFF',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800'
      ],
      variants: ['Midnight Obsidian', 'Champagne Gold', 'Frost White'],
      description: 'Active Noise Cancellation up to 40dB, 11mm beryllium drivers, 36h playback.'
    },
    {
      id: 'prod_102',
      category: 'Battery Banks & Power Gear',
      title: 'Lenka VoltCore 20,000mAh 65W GaN Power Bank',
      originalPrice: 3999,
      offerPrice: 1999,
      discountTag: '50% OFF',
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
      images: [
        'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'
      ],
      variants: ['Matte Carbon', 'Slate Silver'],
      description: '65W Power Delivery fast charging with digital LED readout.'
    },
    {
      id: 'prod_103',
      category: "Men's Apparel & Fashion",
      title: 'Lenka Signature Tailored Oxford Shirt',
      originalPrice: 2999,
      offerPrice: 1499,
      discountTag: 'LIMITED EDITION',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'
      ],
      variants: ['Crisp White', 'Pinstripe Navy', 'Charcoal Slate'],
      description: '100% Egyptian Giza combed cotton. Structured cuffs.'
    }
  ];
  localStorage.setItem('lenka_catalog', JSON.stringify(window.LenkaApp.catalog));
  renderCatalog(window.LenkaApp.activeCategory);
}

// SLIDER CONTROLLERS
function slideProductImage(prodId, direction, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const prod = window.LenkaApp.catalog.find(p => String(p.id) === String(prodId));
  if (!prod) return;

  const images = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.image];
  if (images.length <= 1) return;

  if (window.LenkaApp.activeImageIndexes[prodId] === undefined) {
    window.LenkaApp.activeImageIndexes[prodId] = 0;
  }

  let currentIdx = window.LenkaApp.activeImageIndexes[prodId];
  currentIdx += direction;

  if (currentIdx < 0) {
    currentIdx = images.length - 1;
  } else if (currentIdx >= images.length) {
    currentIdx = 0;
  }

  window.LenkaApp.activeImageIndexes[prodId] = currentIdx;

  const imgEl = document.getElementById(`storeImg-${prodId}`);
  const counterEl = document.getElementById(`slideCounter-${prodId}`);
  
  if (imgEl) {
    imgEl.src = images[currentIdx];
  }
  if (counterEl) {
    counterEl.innerText = `${currentIdx + 1} / ${images.length}`;
  }

  // Update active thumbnail borders
  const thumbs = document.querySelectorAll(`.thumb-${prodId}`);
  thumbs.forEach((t, i) => {
    if (i === currentIdx) {
      t.classList.add('border-bronze-400', 'opacity-100');
      t.classList.remove('border-transparent', 'opacity-50');
    } else {
      t.classList.remove('border-bronze-400', 'opacity-100');
      t.classList.add('border-transparent', 'opacity-50');
    }
  });
}

function setProductImage(prodId, index, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const prod = window.LenkaApp.catalog.find(p => String(p.id) === String(prodId));
  if (!prod) return;

  const images = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.image];
  if (index < 0 || index >= images.length) return;

  window.LenkaApp.activeImageIndexes[prodId] = index;

  const imgEl = document.getElementById(`storeImg-${prodId}`);
  const counterEl = document.getElementById(`slideCounter-${prodId}`);

  if (imgEl) imgEl.src = images[index];
  if (counterEl) counterEl.innerText = `${index + 1} / ${images.length}`;

  const thumbs = document.querySelectorAll(`.thumb-${prodId}`);
  thumbs.forEach((t, i) => {
    if (i === index) {
      t.classList.add('border-bronze-400', 'opacity-100');
      t.classList.remove('border-transparent', 'opacity-50');
    } else {
      t.classList.remove('border-bronze-400', 'opacity-100');
      t.classList.add('border-transparent', 'opacity-50');
    }
  });
}

function renderCatalog(filter = 'all') {
  window.LenkaApp.activeCategory = filter;
  const grid = document.getElementById('productGrid');
  const empty = document.getElementById('emptyCatalogState');
  if (!grid) return;
  grid.innerHTML = '';

  const items = filter === 'all' 
    ? window.LenkaApp.catalog 
    : window.LenkaApp.catalog.filter(p => p.category === filter);

  if (!items || items.length === 0) {
    if (empty) empty.classList.remove('hidden');
  } else {
    if (empty) empty.classList.add('hidden');
    items.forEach(prod => {
      const favs = window.LenkaApp.favorites || JSON.parse(localStorage.getItem('lenka_favorites') || '[]');
      const isFav = favs.includes(prod.id);
      
      const images = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.image];
      const activeIdx = window.LenkaApp.activeImageIndexes[prod.id] || 0;
      const initialImage = images[activeIdx] || images[0];

      const card = document.createElement('div');
      card.className = "bg-noir-900 fine-border rounded-2xl overflow-hidden hover:border-bronze-400/40 transition-all flex flex-col justify-between group relative shadow-lg";
      card.innerHTML = `
        <!-- IMAGE & INTERACTIVE SLIDER CONTAINER -->
        <div class="relative overflow-hidden bg-noir-850 aspect-square select-none">
          <img id="storeImg-${prod.id}" 
               src="${initialImage}" 
               alt="${prod.title}" 
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
               onerror="this.src='https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'"/>

          <!-- SLIDE NAVIGATION BUTTONS (VISIBLE ONLY IF MULTIPLE IMAGES) -->
          ${images.length > 1 ? `
            <button onclick="slideProductImage('${prod.id}', -1, event)" 
                    type="button"
                    class="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-noir-950/80 hover:bg-noir-950 border border-white/20 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button onclick="slideProductImage('${prod.id}', 1, event)" 
                    type="button"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-noir-950/80 hover:bg-noir-950 border border-white/20 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <span id="slideCounter-${prod.id}" class="absolute bottom-2.5 right-2.5 z-20 bg-noir-950/85 border border-white/10 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow-md">
              ${activeIdx + 1} / ${images.length}
            </span>
          ` : ''}

          <!-- FAVORITE HEART BUTTON -->
          <button onclick="toggleFavorite('${prod.id}', event)" 
                  type="button"
                  class="absolute top-3.5 right-3.5 z-20 w-10 h-10 rounded-full bg-noir-950/90 border border-white/20 flex items-center justify-center transition-transform hover:scale-110 shadow-2xl cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 24 24" 
                 width="18" 
                 height="18" 
                 fill="${isFav ? '#EF4444' : 'none'}" 
                 stroke="${isFav ? '#EF4444' : '#FFFFFF'}" 
                 stroke-width="2" 
                 stroke-linecap="round" 
                 stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          </button>

          ${prod.discountTag ? `<span class="absolute top-3.5 left-3.5 bg-bronze-400 text-noir-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider shadow-md">${prod.discountTag}</span>` : ''}
        </div>

        <!-- THUMBNAIL STRIP (IF MULTIPLE IMAGES) -->
        ${images.length > 1 ? `
          <div class="flex gap-1.5 p-2 bg-noir-950 border-b border-white/5 overflow-x-auto custom-scrollbar">
            ${images.map((img, i) => `
              <img src="${img}" 
                   onclick="setProductImage('${prod.id}', ${i}, event)" 
                   class="thumb-${prod.id} w-9 h-9 rounded-md object-cover border-2 ${i === activeIdx ? 'border-bronze-400 opacity-100' : 'border-transparent opacity-50'} hover:opacity-100 transition-all cursor-pointer" />
            `).join('')}
          </div>
        ` : ''}
        
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <span class="text-[10px] text-bronze-400 uppercase tracking-widest font-semibold">${prod.category}</span>
            <h3 class="font-serif text-lg text-white font-medium mt-0.5">${prod.title}</h3>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2">${prod.description || ''}</p>
          </div>
          <div class="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-500 line-through mr-1.5">₹${prod.originalPrice}</span>
              <span class="text-lg font-serif text-white font-semibold">₹${prod.offerPrice}</span>
            </div>
            <button onclick="addToBag('${prod.id}')" class="px-4 py-2 bg-platinum-100 hover:bg-white text-noir-950 font-bold text-xs rounded-xl tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add To Bag
            </button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  if (window.lucide) lucide.createIcons();
}

function filterCategory(cat) {
  const heading = document.getElementById('currentCategoryHeading');
  if (heading) heading.innerText = cat === 'all' ? 'Live Catalog' : cat;
  renderCatalog(cat);
}

function toggleFavorite(prodId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (!window.LenkaApp.favorites) {
    window.LenkaApp.favorites = JSON.parse(localStorage.getItem('lenka_favorites') || '[]');
  }

  const idx = window.LenkaApp.favorites.indexOf(prodId);
  if (idx === -1) {
    window.LenkaApp.favorites.push(prodId);
  } else {
    window.LenkaApp.favorites.splice(idx, 1);
  }
  
  localStorage.setItem('lenka_favorites', JSON.stringify(window.LenkaApp.favorites));
  renderCatalog(window.LenkaApp.activeCategory);
}

window.initCatalogSync = initCatalogSync;
window.renderCatalog = renderCatalog;
window.filterCategory = filterCategory;
window.toggleFavorite = toggleFavorite;
window.slideProductImage = slideProductImage;
window.setProductImage = setProductImage;
