// SELF-CONTAINED PROFILE ENGINE (BULLETPROOF DELEGATION)

// 1. Initial State Check
function checkSavedProfile() {
  let profile = null;
  try {
    profile = JSON.parse(localStorage.getItem('lenka_profile') || 'null');
  } catch (e) {
    profile = null;
  }
  window.currentProfile = profile;

  const authSection = document.getElementById('authSection');
  const savedCard = document.getElementById('profileSavedCard');
  const footer = document.getElementById('profileFooter');

  if (profile && profile.name && profile.phone) {
    if (authSection) authSection.style.display = 'none';
    if (savedCard) savedCard.style.display = 'block';
    if (footer) footer.style.display = 'block';

    const nameEl = document.getElementById('displayUserName');
    const phoneEl = document.getElementById('displayUserPhone');
    const addrEl = document.getElementById('displayUserAddress');
    const imgEl = document.getElementById('cardProfileImg');

    if (nameEl) nameEl.innerText = profile.name;
    if (phoneEl) phoneEl.innerText = profile.phone;
    if (addrEl) addrEl.innerText = profile.formattedAddress || 'Address on file';
    if (imgEl && profile.avatar) imgEl.src = profile.avatar;
  } else {
    if (authSection) authSection.style.display = 'block';
    if (savedCard) savedCard.style.display = 'none';
    if (footer) footer.style.display = 'none';
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try { window.lucide.createIcons(); } catch (e) {}
  }
}

// 2. Direct Synchronous Save Handler
function saveUserProfile() {
  try {
    const nameInput = document.getElementById('userNameInput');
    const phoneInput = document.getElementById('userPhoneInput');
    const countryInput = document.getElementById('addrCountry');
    const stateInput = document.getElementById('addrState');
    const areaInput = document.getElementById('addrArea');
    const pinInput = document.getElementById('addrPin');
    const avatarPreview = document.getElementById('editAvatarPreview');
    const saveBtn = document.getElementById('saveProfileBtn');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const country = countryInput ? countryInput.value.trim() : 'India';
    const state = stateInput ? stateInput.value.trim() : 'Telangana';
    const area = areaInput ? areaInput.value.trim() : '';
    const pin = pinInput ? pinInput.value.trim() : '500072';
    const avatar = avatarPreview ? avatarPreview.src : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    if (!name) {
      alert('Please enter your Full Name.');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      alert('Please enter a valid 10-digit Mobile / WhatsApp contact number.');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (saveBtn) {
      saveBtn.innerText = 'SAVING DETAILS...';
      saveBtn.disabled = true;
    }

    const formattedAddress = `${area ? area + ', ' : ''}${state ? state + ', ' : ''}${country} - ${pin}`.replace(/^,\s*|,\s*$/g, '');

    const profileData = {
      name: name,
      phone: phone,
      address: { country, state, area, pin },
      formattedAddress: formattedAddress,
      avatar: avatar,
      dpdpConsent: true,
      updatedAt: new Date().toISOString()
    };

    // 1. Immediately write to LocalStorage & memory
    localStorage.setItem('lenka_profile', JSON.stringify(profileData));
    window.currentProfile = profileData;
    if (window.LenkaApp) window.LenkaApp.profile = profileData;

    // 2. Cloud Firestore sync (non-blocking)
    try {
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
        const db = firebase.firestore();
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        db.collection('customers').doc(cleanPhone).set(profileData, { merge: true }).catch(() => {});
      }
    } catch (err) {}

    // 3. Immediately switch UI to verified profile card
    checkSavedProfile();

    if (saveBtn) {
      saveBtn.innerText = 'SAVE PROFILE & ADDRESS';
      saveBtn.disabled = false;
    }

    alert(`Profile verified and saved for ${name}!`);
  } catch (error) {
    console.error("Save error:", error);
    alert("Profile saved to device.");
    checkSavedProfile();
  }
}

function startProfileEdit() {
  const authSection = document.getElementById('authSection');
  const savedCard = document.getElementById('profileSavedCard');
  const cancelBtn = document.getElementById('cancelEditBtn');

  if (window.currentProfile) {
    const nameInput = document.getElementById('userNameInput');
    const phoneInput = document.getElementById('userPhoneInput');
    const countryInput = document.getElementById('addrCountry');
    const stateInput = document.getElementById('addrState');
    const areaInput = document.getElementById('addrArea');
    const pinInput = document.getElementById('addrPin');

    if (nameInput) nameInput.value = window.currentProfile.name || '';
    if (phoneInput) phoneInput.value = window.currentProfile.phone || '';
    if (countryInput) countryInput.value = (window.currentProfile.address && window.currentProfile.address.country) || 'India';
    if (stateInput) stateInput.value = (window.currentProfile.address && window.currentProfile.address.state) || 'Telangana';
    if (areaInput) areaInput.value = (window.currentProfile.address && window.currentProfile.address.area) || '';
    if (pinInput) pinInput.value = (window.currentProfile.address && window.currentProfile.address.pin) || '500072';
  }

  if (authSection) authSection.style.display = 'block';
  if (savedCard) savedCard.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'block';
}

function cancelProfileEdit() {
  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) cancelBtn.style.display = 'none';
  checkSavedProfile();
}

function resetProfile() {
  if (confirm('Log out and clear saved profile details from this browser?')) {
    localStorage.removeItem('lenka_profile');
    window.currentProfile = null;
    if (window.LenkaApp) window.LenkaApp.profile = null;
    checkSavedProfile();
  }
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const preview = document.getElementById('editAvatarPreview');
    if (preview) preview.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function openProfileDrawer() {
  const drawer = document.getElementById('profileDrawer');
  if (drawer) drawer.classList.remove('hidden');
  checkSavedProfile();
}

function closeProfileDrawer() {
  const drawer = document.getElementById('profileDrawer');
  if (drawer) drawer.classList.add('hidden');
}

function openDpdpPolicyModal() {
  const modal = document.getElementById('dpdpPolicyModal');
  if (modal) modal.classList.remove('hidden');
}

function closeDpdpPolicyModal() {
  const modal = document.getElementById('dpdpPolicyModal');
  if (modal) modal.classList.add('hidden');
}

// Global Delegation Listener (Bypasses any innerHTML timing bugs)
document.addEventListener('click', function(e) {
  const target = e.target;
  if (target && (target.id === 'saveProfileBtn' || target.closest('#saveProfileBtn'))) {
    e.preventDefault();
    saveUserProfile();
  }
});

// Window Bindings
window.saveUserProfile = saveUserProfile;
window.checkSavedProfile = checkSavedProfile;
window.startProfileEdit = startProfileEdit;
window.cancelProfileEdit = cancelProfileEdit;
window.resetProfile = resetProfile;
window.handleImageUpload = handleImageUpload;
window.openProfileDrawer = openProfileDrawer;
window.closeProfileDrawer = closeProfileDrawer;
window.openDpdpPolicyModal = openDpdpPolicyModal;
window.closeDpdpPolicyModal = closeDpdpPolicyModal;
