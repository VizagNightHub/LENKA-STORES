// DEDICATED ATELIER PROFILE & CONSIGNMENT CONTROLLER

function openProfileDrawer() {
  const modal = document.getElementById('clientProfilePortal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  renderProfileDashboard();
}

function closeProfileDrawer() {
  const modal = document.getElementById('clientProfilePortal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function switchProfileTab(tabId) {
  const tabs = ['overview', 'orders', 'history', 'favorites', 'address', 'edit-profile'];
  tabs.forEach(t => {
    const sec = document.getElementById(`psec-${t}`);
    const btn = document.getElementById(`ptabBtn-${t}`);
    if (t === tabId) {
      if (sec) sec.classList.remove('hidden');
      if (btn) {
        btn.className = "px-3.5 py-2 rounded-xl bg-white text-black font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0";
      }
    } else {
      if (sec) sec.classList.add('hidden');
      if (btn) {
        btn.className = "px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0";
      }
    }
  });
  if (window.lucide) lucide.createIcons();
}

function getStoredProfile() {
  return JSON.parse(localStorage.getItem('lenka_profile') || 'null') || {
    name: 'Atelier Guest',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    address: 'Flat 402, Signature Towers, KPHB Colony, Hyderabad, 500072',
    city: 'Hyderabad'
  };
}

function renderProfileDashboard() {
  const profile = getStoredProfile();
  
  // Fill profile header details
  const nameEls = document.querySelectorAll('.prof-user-name');
  const phoneEls = document.querySelectorAll('.prof-user-phone');
  const avatarEls = document.querySelectorAll('.prof-user-avatar');
  const addressEls = document.querySelectorAll('.prof-user-address');

  nameEls.forEach(el => el.innerText = profile.name);
  phoneEls.forEach(el => el.innerText = profile.phone);
  avatarEls.forEach(el => el.src = profile.avatar);
  addressEls.forEach(el => el.innerText = profile.address);

  // Pre-fill inputs for edit forms
  const editName = document.getElementById('editProfName');
  const editPhone = document.getElementById('editProfPhone');
  const editAvatar = document.getElementById('editProfAvatar');
  const editAddress = document.getElementById('editProfAddress');
  const editCity = document.getElementById('editProfCity');

  if (editName) editName.value = profile.name;
  if (editPhone) editPhone.value = profile.phone;
  if (editAvatar) editAvatar.value = profile.avatar;
  if (editAddress) editAddress.value = profile.address;
  if (editCity) editCity.value = profile.city || 'Hyderabad';

  renderClientOrders();
  renderClientFavorites();
  if (window.lucide) lucide.createIcons();
}

// 1. EDIT PROFILE INFO
function handleSaveProfile(e) {
  e.preventDefault();
  const name = document.getElementById('editProfName').value.trim();
  const phone = document.getElementById('editProfPhone').value.trim();
  const avatar = document.getElementById('editProfAvatar').value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
  const address = document.getElementById('editProfAddress').value.trim();
  const city = document.getElementById('editProfCity').value.trim();

  const updatedProfile = { name, phone, avatar, address, city };
  localStorage.setItem('lenka_profile', JSON.stringify(updatedProfile));
  
  renderProfileDashboard();
  switchProfileTab('overview');
  alert("Profile updated successfully!");
}

// 2. SAVED ADDRESS UPDATE
function handleSaveAddressOnly(e) {
  e.preventDefault();
  const profile = getStoredProfile();
  const newAddress = document.getElementById('addressFieldOnly').value.trim();
  const newCity = document.getElementById('cityFieldOnly').value.trim();

  profile.address = newAddress;
  profile.city = newCity;
  localStorage.setItem('lenka_profile', JSON.stringify(profile));

  renderProfileDashboard();
  switchProfileTab('overview');
  alert("Delivery destination updated successfully!");
}

// 3. RENDER ORDERS (ACTIVE VS DELIVERED HISTORY)
function renderClientOrders() {
  const activeContainer = document.getElementById('activeOrdersList');
  const historyContainer = document.getElementById('historyOrdersList');
  const activeCountBadge = document.getElementById('activeOrdersCount');
  const historyCountBadge = document.getElementById('historyOrdersCount');

  const profile = getStoredProfile();
  const allOrders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');

  // Filter orders related to this client profile
  const userOrders = allOrders.filter(o => 
    (o.customerPhone && profile.phone && o.customerPhone.replace(/\D/g, '').includes(profile.phone.replace(/\D/g, ''))) ||
    (!o.customerPhone)
  );

  const activeOrders = userOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const historyOrders = userOrders.filter(o => o.status === 'Delivered');

  if (activeCountBadge) activeCountBadge.innerText = `${activeOrders.length} Active`;
  if (historyCountBadge) historyCountBadge.innerText = `${historyOrders.length} Completed`;

  // Render Active Orders
  if (activeContainer) {
    activeContainer.innerHTML = '';
    if (activeOrders.length === 0) {
      activeContainer.innerHTML = `
        <div class="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
          <i data-lucide="package-search" class="w-8 h-8 text-slate-500 mx-auto"></i>
          <p class="text-xs text-slate-400">No active consignments currently in transit.</p>
        </div>
      `;
    } else {
      activeOrders.forEach(ord => {
        const ordId = ord.orderId || ord.id;
        const status = ord.status || 'Confirmed';
        
        let statusBadge = `<span class="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">Confirmed</span>`;
        if (status === 'Dispatched') {
          statusBadge = `<span class="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold">In Shipping</span>`;
        } else if (status === 'OutForDelivery') {
          statusBadge = `<span class="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold">Out For Delivery</span>`;
        }

        const card = document.createElement('div');
        card.className = "p-5 rounded-2xl bg-[#111216] border border-white/10 space-y-4 shadow-xl";
        card.innerHTML = `
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2">
            <div>
              <span class="text-xs font-mono font-bold text-white">CONSIGNMENT #${ordId}</span>
              <p class="text-[11px] text-slate-400 mt-0.5">${ord.itemsSummary || 'Atelier Item'} • Total: <strong class="text-white">₹${ord.totalAmount || 0}</strong></p>
            </div>
            <div class="flex items-center gap-2">
              ${statusBadge}
              <button onclick="clientCancelOrder('${ordId}')" class="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[11px] font-bold transition-all cursor-pointer">
                Cancel Order
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">DESTINATION</span>
              <p class="text-slate-300 mt-0.5">${ord.customerAddress || profile.address}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">ESTIMATED DISPATCH / DELIVERY</span>
              <p class="text-[#E8C997] font-medium mt-0.5">${ord.shippingDate || ord.deliveryDate || 'Processing in warehouse'}</p>
            </div>
          </div>
        `;
        activeContainer.appendChild(card);
      });
    }
  }

  // Render History Orders (Delivered only)
  if (historyContainer) {
    historyContainer.innerHTML = '';
    if (historyOrders.length === 0) {
      historyContainer.innerHTML = `
        <div class="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
          <i data-lucide="archive" class="w-8 h-8 text-slate-500 mx-auto"></i>
          <p class="text-xs text-slate-400">No past delivered orders found in your archive.</p>
        </div>
      `;
    } else {
      historyOrders.forEach(ord => {
        const ordId = ord.orderId || ord.id;
        const card = document.createElement('div');
        card.className = "p-5 rounded-2xl bg-[#111216] border border-white/10 space-y-3 shadow-md";
        card.innerHTML = `
          <div class="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <span class="text-xs font-mono font-bold text-white">ORDER #${ordId}</span>
              <p class="text-[11px] text-slate-400 mt-0.5">${ord.itemsSummary || 'Atelier Product'} • ₹${ord.totalAmount || 0}</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
              Delivered ✓
            </span>
          </div>
          <div class="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Delivered to: ${ord.customerAddress || profile.address}</span>
            <span class="text-slate-500">${ord.deliveryDate || 'Completed'}</span>
          </div>
        `;
        historyContainer.appendChild(card);
      });
    }
  }
}

// 4. CLIENT SELF-SERVICE ORDER CANCELLATION
async function clientCancelOrder(orderId) {
  if (!confirm(`Are you sure you want to cancel Consignment #${orderId}?`)) return;

  const orders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  const idx = orders.findIndex(o => (o.orderId || o.id) === orderId);
  if (idx !== -1) {
    orders[idx].status = 'Cancelled';
    localStorage.setItem('lenka_orders', JSON.stringify(orders));
  }

  if (window.firebase && firebase.apps.length) {
    try {
      await firebase.firestore().collection('orders').doc(orderId).update({ status: 'Cancelled' });
    } catch(e) {
      console.warn(e);
    }
  }

  renderClientOrders();
  alert(`Consignment #${orderId} has been successfully cancelled.`);
}

// 5. RENDER FAVORITES TAB
function renderClientFavorites() {
  const container = document.getElementById('favoritesSlotGrid');
  const favBadge = document.getElementById('favSlotCount');
  if (!container) return;
  container.innerHTML = '';

  const favIds = JSON.parse(localStorage.getItem('lenka_favorites') || '[]');
  const catalog = window.LenkaApp ? window.LenkaApp.catalog : JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
  const favProducts = catalog.filter(p => favIds.includes(p.id));

  if (favBadge) favBadge.innerText = `${favProducts.length} Items`;

  if (favProducts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
        <i data-lucide="heart-off" class="w-8 h-8 text-slate-500 mx-auto"></i>
        <p class="text-xs text-slate-400">You have no saved favorites yet.</p>
      </div>
    `;
    return;
  }

  favProducts.forEach(prod => {
    const card = document.createElement('div');
    card.className = "bg-[#16181E] border border-white/10 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between space-y-3";
    card.innerHTML = `
      <div class="relative aspect-video rounded-xl overflow-hidden bg-black">
        <img src="${prod.image}" class="w-full h-full object-cover" />
        <button onclick="toggleFavorite('${prod.id}'); renderClientFavorites();" class="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-red-500">
          <i data-lucide="heart" class="w-4 h-4 fill-red-500"></i>
        </button>
      </div>
      <div>
        <span class="text-[9px] uppercase font-bold text-[#C5A880]">${prod.category}</span>
        <h4 class="text-xs font-bold text-white truncate">${prod.title}</h4>
        <p class="text-xs font-semibold text-white mt-1">₹${prod.offerPrice}</p>
      </div>
      <button onclick="addToBag('${prod.id}')" class="w-full py-2 bg-white text-black text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#C5A880] transition-colors cursor-pointer">
        Add To Bag
      </button>
    `;
    container.appendChild(card);
  });
}

function checkSavedProfile() {
  const p = getStoredProfile();
  localStorage.setItem('lenka_profile', JSON.stringify(p));
}

window.openProfileDrawer = openProfileDrawer;
window.closeProfileDrawer = closeProfileDrawer;
window.switchProfileTab = switchProfileTab;
window.handleSaveProfile = handleSaveProfile;
window.handleSaveAddressOnly = handleSaveAddressOnly;
window.clientCancelOrder = clientCancelOrder;
window.checkSavedProfile = checkSavedProfile;
// CUSTOMER MOBILE OTP LOGIN & PROFILE RECOGNITION ENGINE

function openAuthModal() {
  const modal = document.getElementById('customerAuthModal');
  if (modal) modal.classList.remove('hidden');
  resetAuthStep();
}

function closeAuthModal() {
  const modal = document.getElementById('customerAuthModal');
  if (modal) modal.classList.add('hidden');
}

function resetAuthStep() {
  document.getElementById('authStepPhone').classList.remove('hidden');
  document.getElementById('authStepOtp').classList.add('hidden');
  document.getElementById('authPhoneInput').value = '';
  document.getElementById('authOtpInput').value = '';
}

let pendingLoginPhone = '';

function requestClientOtp() {
  const phone = document.getElementById('authPhoneInput').value.trim();
  if (!phone || phone.length < 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }
  pendingLoginPhone = phone;
  document.getElementById('displayTargetPhone').innerText = `+91 ${phone}`;
  
  document.getElementById('authStepPhone').classList.add('hidden');
  document.getElementById('authStepOtp').classList.remove('hidden');
}

async function verifyClientOtp() {
  const enteredOtp = document.getElementById('authOtpInput').value.trim();
  if (enteredOtp !== '2026') {
    alert("Invalid OTP code. Please use demo code: 2026");
    return;
  }

  // OTP verified successfully. Recognize or create customer profile.
  const formattedPhone = `+91 ${pendingLoginPhone}`;
  let clientProfile = null;

  // 1. Check local storage first
  const existingProfile = JSON.parse(localStorage.getItem('lenka_profile') || 'null');
  if (existingProfile && existingProfile.phone.includes(pendingLoginPhone)) {
    clientProfile = existingProfile;
  } else {
    // 2. Look up in Firestore orders / profiles if they logged in previously
    clientProfile = {
      name: `Client_${pendingLoginPhone.slice(-4)}`,
      phone: formattedPhone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      address: 'Flat 402, Signature Towers, KPHB Colony, Hyderabad',
      city: 'Hyderabad',
      lastLogin: new Date().toISOString()
    };
  }

  // Save active login session
  localStorage.setItem('lenka_profile', JSON.stringify(clientProfile));
  localStorage.setItem('lenka_logged_in_phone', formattedPhone);

  closeAuthModal();
  alert(`Welcome back! Your account associated with ${formattedPhone} has been successfully restored.`);
  
  // Refresh UI / Profile drawer
  if (typeof renderProfileDashboard === 'function') {
    renderProfileDashboard();
  }
  openProfileDrawer();
}

function checkClientSessionOnLoad() {
  const loggedPhone = localStorage.getItem('lenka_logged_in_phone');
  if (!loggedPhone) {
    // If first time or logged out, prompt them or show login option in navbar
    console.warn("No active client session detected.");
  }
}

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.requestClientOtp = requestClientOtp;
window.verifyClientOtp = verifyClientOtp;
window.resetAuthStep = resetAuthStep;

window.addEventListener('DOMContentLoaded', checkClientSessionOnLoad);
function clientLogOutSession() {
  if (!confirm("Are you sure you want to log out of your Lenka Stores account?")) return;
  localStorage.removeItem('lenka_logged_in_phone');
  closeProfileDrawer();
  alert("You have successfully logged out.");
}
window.clientLogOutSession = clientLogOutSession;
