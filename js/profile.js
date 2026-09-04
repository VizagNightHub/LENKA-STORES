// DEDICATED ATELIER PROFILE & SESSION CONTROLLER

document.addEventListener('DOMContentLoaded', () => {
    const displayUsername = document.getElementById('display-username');
    const profileDisplaySection = document.getElementById('profile-display-section');
    const profileEditSection = document.getElementById('profile-edit-section');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editProfileForm = document.getElementById('edit-profile-form');
    
    const displayAddress = document.getElementById('display-address');
    const inputUsername = document.getElementById('input-username');
    const inputAddress = document.getElementById('input-address');
    const inputPhone = document.getElementById('input-phone'); // Optional phone input if present in form
    
    const profileAvatarPreview = document.getElementById('profile-avatar-preview');
    const photoFileInput = document.getElementById('photo-file-input');
    const liveFilePreview = document.getElementById('live-file-preview');
    const fileLabel = document.getElementById('file-label');
    
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    const authBtnText = document.getElementById('auth-btn-text');

    // Retrieve profile data or initialize cleanly with blank/placeholder defaults instead of hardcoded demo data
    let savedData;
    try {
        savedData = JSON.parse(localStorage.getItem('lenka_user_profile')) || {
            username: "",
            number: "",
            address: "",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
            isLoggedIn: false
        };
    } catch (e) {
        savedData = {
            username: "",
            number: "",
            address: "",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
            isLoggedIn: false
        };
    }

    function renderProfile() {
        if (displayUsername) displayUsername.textContent = savedData.username || "Guest User";
        if (displayAddress) {
            displayAddress.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${savedData.address || "Add your delivery address"}`;
        }
        if (profileAvatarPreview && savedData.avatar) profileAvatarPreview.src = savedData.avatar;
        
        // FIX 1: Set placeholder attributes explicitly and only assign value if saved data exists
        if (inputUsername) {
            inputUsername.placeholder = "Enter your name";
            inputUsername.value = savedData.username || "";
        }
        if (inputAddress) {
            inputAddress.placeholder = "Enter your delivery address";
            inputAddress.value = savedData.address || "";
        }
        if (inputPhone) {
            inputPhone.placeholder = "Enter your number";
            inputPhone.value = savedData.number || localStorage.getItem('lenka_logged_in_phone') || "";
        }

        if (authBtnText) authBtnText.textContent = savedData.isLoggedIn ? "Logout" : "Login";
    }

    renderProfile();

    if (editProfileBtn && profileEditSection) {
        editProfileBtn.addEventListener('click', () => {
            profileEditSection.style.display = 'flex';
        });
    }

    if (cancelEditBtn && profileEditSection) {
        cancelEditBtn.addEventListener('click', () => {
            profileEditSection.style.display = 'none';
        });
    }

    let temporaryImageBase64 = savedData.avatar;
    if (photoFileInput) {
        photoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (fileLabel) fileLabel.textContent = file.name;
                const reader = new FileReader();
                reader.onload = function(uploadEvent) {
                    temporaryImageBase64 = uploadEvent.target.result;
                    if (liveFilePreview) {
                        liveFilePreview.src = temporaryImageBase64;
                        liveFilePreview.style.display = 'block';
                    }
                    if (profileAvatarPreview) {
                        profileAvatarPreview.src = temporaryImageBase64;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            savedData.username = inputUsername ? inputUsername.value.trim() : "";
            savedData.address = inputAddress ? inputAddress.value.trim() : "";
            if (inputPhone) savedData.number = inputPhone.value.trim();
            savedData.avatar = temporaryImageBase64;
            savedData.isLoggedIn = true;
            
            localStorage.setItem('lenka_user_profile', JSON.stringify(savedData));
            if (savedData.number) {
                localStorage.setItem('lenka_logged_in_phone', savedData.number);
            }
            renderProfile();
            
            if (profileEditSection) profileEditSection.style.display = 'none';
            alert("Profile updated successfully!");
        });
    }

    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', () => {
            clientLogOutSession();
        });
    }

    // Auto-render consignments on page load if container exists
    renderActiveConsignmentsModal();
});

// GLOBAL HELPERS
function checkAndOpenProfile() {
    window.location.href = "profile.html";
}

// FIX 2: Complete and robust session clearing and redirection logout flow
function clientLogOutSession() {
    if (!confirm("Are you sure you want to log out of Lenka Stores?")) return;
    
    // Clear client storage tokens and profile session data completely
    localStorage.removeItem('lenka_user_profile');
    localStorage.removeItem('lenka_logged_in_phone');
    localStorage.removeItem('lenka_cart_v2');
    sessionStorage.clear();

    // Clear authentication cookies if any exist
    document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Force clean redirect back to guest storefront homepage
    window.location.href = "index.html";
}

// RENDER ACTIVE CONSIGNMENTS WITH "CANCEL ORDER" DELETION BUTTON
function renderActiveConsignmentsModal() {
  const container = document.getElementById('activeConsignmentsList') || document.getElementById('userOrdersContainer');
  if (!container) return;

  const orders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 space-y-2">
        <p class="text-xs text-slate-400">No active consignments found.</p>
      </div>
    `;
    return;
  }

  orders.forEach(ord => {
    const orderId = ord.orderId || ord.id;
    const card = document.createElement('div');
    card.className = "p-4 rounded-2xl bg-[#11131A] border border-white/10 space-y-3 shadow-lg mb-3 text-white";
    card.innerHTML = `
      <div class="flex items-center justify-between border-b border-white/5 pb-2">
        <span class="text-xs font-mono font-bold text-[#C5A880]">#${orderId}</span>
        <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">${ord.status || 'Confirmed'}</span>
      </div>

      <div class="text-xs space-y-1 text-slate-300">
        <p class="font-medium text-white">${ord.itemsSummary || 'Consignment Items'}</p>
        <p class="text-[11px] text-slate-400">Total: <strong class="text-white">₹${ord.totalAmount || 0}</strong> • ${ord.shippingDate || 'Processing in warehouse'}</p>
      </div>

      <div class="pt-2 flex justify-end">
        <button type="button" onclick="cancelAndDeleteOrder('${orderId}')" class="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
          <i data-lucide="x-circle" class="w-3.5 h-3.5"></i>
          <span>Cancel Order</span>
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// Profile Form Default Values Update
function loadProfileForm() {
  const savedUser = JSON.parse(localStorage.getItem('lenka_user_profile') || '{}');
  
  const nameInput = document.getElementById('profileNameInput');
  const phoneInput = document.getElementById('profilePhoneInput');

  if (nameInput) {
    // If a saved name exists, populate it as value; otherwise, leave empty so placeholder shows
    nameInput.value = savedUser.name || '';
    nameInput.placeholder = "Enter your name";
  }

  if (phoneInput) {
    // If a saved number exists, populate it as value; otherwise, leave empty so placeholder shows
    phoneInput.value = savedUser.phone || '';
    phoneInput.placeholder = "Enter your number";
  }
}

// CANCELLATION & DELETION HANDLER
async function cancelAndDeleteOrder(orderId) {
  if (!confirm(`Are you sure you want to cancel and delete Order #${orderId}?`)) return;

  let orders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  orders = orders.filter(o => String(o.orderId || o.id) !== String(orderId));
  localStorage.setItem('lenka_orders', JSON.stringify(orders));

  if (window.firebase && firebase.apps.length) {
    try {
      await firebase.firestore().collection('orders').doc(orderId).delete();
    } catch (err) {
      console.warn("Firestore order deletion note:", err);
    }
  }

  alert(`Order #${orderId} has been successfully cancelled and removed.`);
  renderActiveConsignmentsModal();
}

window.checkAndOpenProfile = checkAndOpenProfile;
window.clientLogOutSession = clientLogOutSession;
window.cancelAndDeleteOrder = cancelAndDeleteOrder;
window.renderActiveConsignmentsModal = renderActiveConsignmentsModal;
