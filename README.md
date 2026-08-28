<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LENKA STORES | Modern Luxury & Lifestyle</title>
  
  <meta name="description" content="Discover premium collections at LENKA STORES. High-grade electronics, luxury fashion, and bespoke lifestyle goods." />
  <meta property="og:title" content="LENKA STORES - Elevate Your Lifestyle" />
  <meta property="og:site_name" content="LENKA STORES" />

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            display: ['Outfit', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#f6f7f9',
              500: '#6366f1',
              600: '#4f46e5',
              dark: '#0b0f19',
              card: '#111827',
              accent: '#38bdf8',
            }
          }
        }
      }
    }
  </script>

  <style>
    /* Custom Luxury Glassmorphism & Glow Effects */
    .glass-nav {
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-card {
      background: rgba(17, 24, 39, 0.65);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.07);
    }
    .glass-card:hover {
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.25);
    }
    .gradient-text {
      background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .accent-gradient {
      background: linear-gradient(135deg, #6366f1 0%, #38bdf8 100%);
    }
  </style>
</head>

<body class="bg-brand-dark text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">

  <div class="bg-gradient-to-r from-indigo-900 via-indigo-600 to-sky-600 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
    ✨ Free Express Shipping across India on orders over ₹1,999. Use code: <span class="font-bold underline">LENKA10</span>
  </div>

  <header class="sticky top-0 z-40 glass-nav transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      
      <a href="#" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
          <i data-lucide="sparkles" class="w-5 h-5 text-white"></i>
        </div>
        <div>
          <span class="font-display font-extrabold text-2xl tracking-wider text-white">LENKA</span>
          <span class="text-xs uppercase tracking-widest text-indigo-400 block -mt-1 font-semibold">STORES</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#products" class="hover:text-indigo-400 transition-colors">Collections</a>
        <a href="#categories" class="hover:text-indigo-400 transition-colors">Categories</a>
        <a href="#featured" class="hover:text-indigo-400 transition-colors">Featured</a>
        <a href="#about" class="hover:text-indigo-400 transition-colors">About</a>
      </nav>

      <div class="flex items-center gap-4">
        <div class="relative hidden sm:block">
          <input type="text" id="searchInput" placeholder="Search premium items..." 
                 class="bg-slate-900/80 text-xs px-4 py-2.5 pl-9 rounded-full border border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-48 lg:w-64 transition-all text-white placeholder-slate-500" />
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
        </div>

        <button onclick="toggleCart()" class="relative p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700/50">
          <i data-lucide="shopping-bag" class="w-5 h-5"></i>
          <span id="cartCount" class="absolute -top-1 -right-1 bg-indigo-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-dark">0</span>
        </button>

        <button class="md:hidden p-2 text-slate-300 hover:text-white" onclick="alert('Menu clicked')">
          <i data-lucide="menu" class="w-6 h-6"></i>
        </button>
      </div>
    </div>
  </header>

  <section class="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/3 right-10 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid lg:grid-cols-12 gap-12 items-center">
        
        <div class="lg:col-span-7 text-center lg:text-left space-y-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <i data-lucide="flame" class="w-3.5 h-3.5 text-indigo-400"></i> New Collection 2026 Drop
          </div>

          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.1]">
            Curated Goods. <br />
            <span class="gradient-text">Uncompromising Luxury.</span>
          </h1>

          <p class="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
            Welcome to <strong class="text-white font-medium">LENKA STORES</strong>. Experience high-tier hardware, bespoke accessories, and lifestyle essentials meticulously designed for the modern connoisseur.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <a href="#products" class="w-full sm:w-auto px-8 py-4 rounded-xl accent-gradient text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 group">
              Explore Catalog
              <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
            </a>
            <a href="#categories" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all text-center">
              View Categories
            </a>
          </div>

          <div class="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
            <div>
              <p class="font-display text-2xl font-bold text-white">100%</p>
              <p class="text-xs text-slate-400">Authentic Lineup</p>
            </div>
            <div>
              <p class="font-display text-2xl font-bold text-white">24/7</p>
              <p class="text-xs text-slate-400">Dedicated Support</p>
            </div>
            <div>
              <p class="font-display text-2xl font-bold text-white">48hr</p>
              <p class="text-xs text-slate-400">Fast Fulfillment</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 relative">
          <div class="glass-card rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            <div class="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80" 
                 alt="Featured Watch" class="w-full h-80 object-cover rounded-2xl shadow-inner mb-6 transform hover:scale-[1.02] transition-transform duration-500" />
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs text-indigo-400 uppercase tracking-widest font-semibold">Flagship Drop</span>
                <h3 class="text-xl font-display font-bold text-white mt-0.5">Chronograph Modern X</h3>
              </div>
              <span class="text-2xl font-display font-bold text-indigo-300">₹8,999</span>
            </div>
            <button onclick="addToCart('Chronograph Modern X', 8999, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80')" 
                    class="mt-5 w-full py-3.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700 hover:border-indigo-500">
              <i data-lucide="plus" class="w-4 h-4"></i> Add to Bag
            </button>
          </div>
        </div>

      </div>
    </div>
  </section>

  <section id="categories" class="py-8 border-y border-slate-800/60 bg-slate-950/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start sm:justify-center gap-3 overflow-x-auto no-scrollbar py-2">
      <button onclick="filterCategory('all')" class="category-btn active px-5 py-2 rounded-full text-xs font-semibold bg-indigo-600 text-white border border-indigo-500 transition-all whitespace-nowrap">All Products</button>
      <button onclick="filterCategory('electronics')" class="category-btn px-5 py-2 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all whitespace-nowrap">Electronics</button>
      <button onclick="filterCategory('fashion')" class="category-btn px-5 py-2 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all whitespace-nowrap">Luxury Watches & Fashion</button>
      <button onclick="filterCategory('lifestyle')" class="category-btn px-5 py-2 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all whitespace-nowrap">Lifestyle Gear</button>
    </div>
  </section>

  <section id="products" class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <span class="text-xs font-semibold text-indigo-400 tracking-widest uppercase">Verified Store Inventory</span>
          <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-white mt-1">Featured Essentials</h2>
        </div>
        <p class="text-slate-400 text-sm max-w-sm">Every item at Lenka Stores passes strict quality inspections before dispatch.</p>
      </div>

      <div id="productGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div class="product-card glass-card rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group" data-category="electronics">
          <div class="relative overflow-hidden rounded-xl bg-slate-900 mb-4 aspect-square">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80" 
                 alt="Wireless Studio Headset" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <span class="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md text-[11px] font-bold text-white px-2.5 py-1 rounded-md">Pro Audio</span>
          </div>
          <div>
            <h3 class="font-display font-bold text-base text-white group-hover:text-indigo-400 transition-colors">Acoustic Studio ANC Pro</h3>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2">Active Noise Cancelling over-ear headphones with 45hr battery life.</p>
            <div class="flex items-center justify-between mt-4">
              <span class="text-lg font-bold text-indigo-300 font-display">₹4,499</span>
              <button onclick="addToCart('Acoustic Studio ANC Pro', 4499, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80')"
                      class="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="product-card glass-card rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group" data-category="fashion">
          <div class="relative overflow-hidden rounded-xl bg-slate-900 mb-4 aspect-square">
            <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80" 
                 alt="Minimalist Leather Carry" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <span class="absolute top-3 left-3 bg-slate-800/90 backdrop-blur-md text-[11px] font-bold text-slate-200 px-2.5 py-1 rounded-md">Genuine</span>
          </div>
          <div>
            <h3 class="font-display font-bold text-base text-white group-hover:text-indigo-400 transition-colors">Obsidian Matte Carry Case</h3>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2">Handcrafted high-durability travel bag with water-resistant coating.</p>
            <div class="flex items-center justify-between mt-4">
              <span class="text-lg font-bold text-indigo-300 font-display">₹3,299</span>
              <button onclick="addToCart('Obsidian Matte Carry Case', 3299, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80')"
                      class="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="product-card glass-card rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group" data-category="lifestyle">
          <div class="relative overflow-hidden rounded-xl bg-slate-900 mb-4 aspect-square">
            <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80" 
                 alt="Smart Band 8" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <span class="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md text-[11px] font-bold text-white px-2.5 py-1 rounded-md">Hot Deal</span>
          </div>
          <div>
            <h3 class="font-display font-bold text-base text-white group-hover:text-indigo-400 transition-colors">Pulse OLED Smart Series</h3>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2">Biometric health tracking, GPS sync, and seamless smartphone alerts.</p>
            <div class="flex items-center justify-between mt-4">
              <span class="text-lg font-bold text-indigo-300 font-display">₹2,899</span>
              <button onclick="addToCart('Pulse OLED Smart Series', 2899, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=80')"
                      class="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="product-card glass-card rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group" data-category="fashion">
          <div class="relative overflow-hidden rounded-xl bg-slate-900 mb-4 aspect-square">
            <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80" 
                 alt="Aviator Shades" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <span class="absolute top-3 left-3 bg-sky-600/90 backdrop-blur-md text-[11px] font-bold text-white px-2.5 py-1 rounded-md">UV400</span>
          </div>
          <div>
            <h3 class="font-display font-bold text-base text-white group-hover:text-indigo-400 transition-colors">Titanium Polarized Shades</h3>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2">Ultra-lightweight aerospace alloy with polarized UV protection.</p>
            <div class="flex items-center justify-between mt-4">
              <span class="text-lg font-bold text-indigo-300 font-display">₹1,999</span>
              <button onclick="addToCart('Titanium Polarized Shades', 1999, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&auto=format&fit=crop&q=80')"
                      class="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <div id="cartModal" class="fixed inset-0 z-50 overflow-hidden hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onclick="toggleCart()"></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
        
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <i data-lucide="shopping-bag" class="w-5 h-5 text-indigo-400"></i>
              <h2 class="font-display font-bold text-lg text-white">Your Shopping Cart</h2>
            </div>
            <button onclick="toggleCart()" class="text-slate-400 hover:text-white p-1">
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>

          <div id="cartItemsList" class="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <p class="text-sm text-slate-500 text-center py-10">Your cart is currently empty.</p>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-800 space-y-4">
          <div class="flex justify-between text-base font-medium text-white">
            <span>Subtotal</span>
            <span id="cartSubtotal" class="font-display font-bold text-indigo-300">₹0</span>
          </div>
          <p class="text-xs text-slate-400">Taxes and express shipping calculated during checkout.</p>
          <button onclick="checkoutOrder()" class="w-full py-4 rounded-xl accent-gradient text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all">
            Proceed to Checkout
          </button>
        </div>

      </div>
    </div>
  </div>

  <footer id="about" class="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div class="space-y-4 md:col-span-1">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center">
              <i data-lucide="sparkles" class="w-4 h-4 text-white"></i>
            </div>
            <span class="font-display font-bold text-xl text-white">LENKA STORES</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Your premier destination for high-standard modern lifestyle goods, electronics, and wardrobe essentials.
          </p>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop Collections</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li><a href="#products" class="hover:text-indigo-400 transition-colors">Smart Electronics</a></li>
            <li><a href="#products" class="hover:text-indigo-400 transition-colors">Luxury Timepieces</a></li>
            <li><a href="#products" class="hover:text-indigo-400 transition-colors">Lifestyle Essentials</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Care</h4>
          <ul class="space-y-2 text-xs text-slate-400">
            <li><a href="#" class="hover:text-indigo-400 transition-colors">Order Tracking</a></li>
            <li><a href="#" class="hover:text-indigo-400 transition-colors">Shipping & Returns</a></li>
            <li><a href="#" class="hover:text-indigo-400 transition-colors">Help Center & FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay Connected</h4>
          <p class="text-xs text-slate-400 mb-3">Subscribe to receive exclusive drops and flash discounts.</p>
          <div class="flex gap-2">
            <input type="email" placeholder="Enter your email" class="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-full" />
            <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold">Join</button>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>&copy; 2026 LENKA STORES. All rights reserved.</p>
        <div class="flex gap-6">
          <a href="#" class="hover:text-slate-400">Privacy Policy</a>
          <a href="#" class="hover:text-slate-400">Terms of Service</a>
          <a href="#" class="hover:text-slate-400">Security</a>
        </div>
      </div>
    </div>
  </footer>

  <script>
    // Initialize Lucide Icons
    lucide.createIcons();

    // Shopping Cart State
    let cart = [];

    function toggleCart() {
      const modal = document.getElementById('cartModal');
      modal.classList.toggle('hidden');
    }

    function addToCart(title, price, image) {
      const existing = cart.find(item => item.title === title);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ title, price, image, quantity: 1 });
      }
      renderCart();
      toggleCart();
    }

    function updateQuantity(title, delta) {
      const item = cart.find(item => item.title === title);
      if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
          cart = cart.filter(i => i.title !== title);
        }
      }
      renderCart();
    }

    function renderCart() {
      const cartItemsList = document.getElementById('cartItemsList');
      const cartCount = document.getElementById('cartCount');
      const cartSubtotal = document.getElementById('cartSubtotal');

      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      cartCount.innerText = totalItems;
      cartSubtotal.innerText = `₹${subtotal.toLocaleString('en-IN')}`;

      if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="text-sm text-slate-500 text-center py-10">Your cart is currently empty.</p>';
        return;
      }

      cartItemsList.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div class="flex items-center gap-3">
            <img src="${item.image}" class="w-12 h-12 rounded-lg object-cover" />
            <div>
              <h4 class="text-xs font-semibold text-white max-w-[140px] truncate">${item.title}</h4>
              <p class="text-xs text-indigo-400 font-bold">₹${item.price.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
            <button onclick="updateQuantity('${item.title}', -1)" class="text-slate-400 hover:text-white px-1 text-xs font-bold">-</button>
            <span class="text-xs font-medium text-white px-1">${item.quantity}</span>
            <button onclick="updateQuantity('${item.title}', 1)" class="text-slate-400 hover:text-white px-1 text-xs font-bold">+</button>
          </div>
        </div>
      `).join('');
    }

    function filterCategory(category) {
      const cards = document.querySelectorAll('.product-card');
      const buttons = document.querySelectorAll('.category-btn');

      buttons.forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-500');
        btn.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-800');
      });
      event.target.classList.add('bg-indigo-600', 'text-white', 'border-indigo-500');
      event.target.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-800');

      cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    }

    function checkoutOrder() {
      if (cart.length === 0) {
        alert('Your cart is empty. Please add some products.');
        return;
      }
      alert('Order initiated! In the next step, we can link your payment gateway (Razorpay / Stripe) or WhatsApp checkout.');
    }
  </script>
</body>
</html>
