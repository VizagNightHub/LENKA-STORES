const firebaseConfig = {
  apiKey: "AIzaSyC6A7SleUhcZjt0gMo83XvFCzO-k0_hSTI",
  authDomain: "lenkastores-studio.firebaseapp.com",
  projectId: "lenkastores-studio",
  storageBucket: "lenkastores-studio.firebasestorage.app",
  messagingSenderId: "198057972058",
  appId: "1:198057972058:web:c1e0742dcaa3b476472363",
  measurementId: "G-S5GNTV03XM"
};

let db = null;
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
} catch (err) {
  console.warn("Firebase Init note:", err);
}

let cloudCatalog = [];
let currentCart = JSON.parse(localStorage.getItem('lenka_cart') || '[]');
let currentProfile = JSON.parse(localStorage.getItem('lenka_profile') || 'null');
let favorites = JSON.parse(localStorage.getItem('lenka_favorites') || '[]');
let currentCategoryFilter = 'all';

// REAL-TIME FIRESTORE & LOCAL STORAGE SYNC
function initCatalogSync() {
  // 1. Load local catalog immediately for 0-delay display
  const localCat = JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
  if (localCat.length > 0) {
    cloudCatalog = localCat;
    renderCatalog(currentCategoryFilter);
  } else {
    fallbackDefaultProducts();
  }

  // 2. Listen to live cloud updates from Lenka Studio
  if (db) {
    db.collection('products').onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        cloudCatalog = [];
        snapshot.forEach(doc => {
          cloudCatalog.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('lenka_catalog', JSON.stringify(cloudCatalog));
        renderCatalog(currentCategoryFilter);
      }
    }, (err) => {
      console.warn("Cloud catalog sync note:", err);
    });
  }
}

function fallbackDefaultProducts() {
  cloudCatalog = [
    {
      id: 'prod_101',
      category: 'Audio & Wireless Earbuds',
      title: 'Lenka Horizon ANC Earbuds Pro',
      originalPrice: 4999,
      offerPrice: 2499,
      discountTag: '50% OFF',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
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
      variants: ['Crisp White', 'Pinstripe Navy', 'Charcoal Slate'],
      description: '100% Egyptian Giza combed cotton.'
    }
  ];
  renderCatalog(currentCategoryFilter);
}

function renderCatalog(filter = 'all') {
  currentCategoryFilter = filter;
  const grid = document.getElementById('productGrid');
  const empty = document.getElementById('emptyCatalogState');
  if (!grid) return;
  grid.innerHTML = '';

  const items = filter === 'all' 
    ? cloudCatalog 
    : cloudCatalog.filter(p => p.category === filter);

  if (items.length === 0) {
    if (empty) empty.classList.remove('hidden');
  } else {
    if (empty) empty.classList.add('hidden');
    items.forEach(prod => {
      const isFav = favorites.includes(prod.id);
      const card = document.createElement('div');
      card.className = "bg-noir-900 fine-border rounded-2xl overflow-hidden hover:border-bronze-400/40 transition-all flex flex-col justify-between group relative";
      card.innerHTML = `
        <div class="relative overflow-hidden bg-noir-850 aspect-square">
          <img src="${prod.image}" alt="${prod.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'"/>
          <button onclick="toggleFavorite('${prod.id}', event)" class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-noir-950/80 backdrop-blur-md fine-border flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer">
            <svg viewBox="0 0 24 24" class="w-4 h-4 ${isFav ? 'fill-red-500 stroke-red-500' : 'stroke-white fill-none'} transition-colors">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          ${prod.discountTag ? `<span class="absolute top-3 left-3 bg-bronze-400 text-noir-950 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">${prod.discountTag}</span>` : ''}
        </div>
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
            <button onclick="addToBag('${prod.id}')" class="px-4 py-2 bg-platinum-100 hover:bg-white text-noir-950 font-semibold text-xs rounded-xl tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer">
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
  if (event) event.stopPropagation();
  const index = favorites.indexOf(prodId);
  if (index === -1) { favorites.push(prodId); } else { favorites.splice(index, 1); }
  localStorage.setItem('lenka_favorites', JSON.stringify(favorites));
  renderCatalog(currentCategoryFilter);
  renderFavoritesTab();
}
