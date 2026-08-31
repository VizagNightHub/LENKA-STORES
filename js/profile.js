// GLOBAL PROFILE ENGINE
window.currentProfile = JSON.parse(localStorage.getItem('lenka_profile') || 'null');

function checkSavedProfile() {
  const profile = window.currentProfile || JSON.parse(localStorage.getItem('lenka_profile') || 'null');
  const authSection = document.getElementById('authSection');
  const savedCard = document.getElementById('profileSavedCard');
  const footer = document.getElementById('profileFooter');

  if (profile && profile.name && profile.phone) {
    if (authSection) authSection.classList.add('hidden');
    if (savedCard) savedCard.classList.remove('hidden');
    if (footer) footer.classList.remove('hidden');

    const nameEl = document.getElementById('displayUserName');
    const phoneEl = document.getElementById('displayUserPhone');
    const addrEl = document.getElementById('displayUserAddress');
    const imgEl = document.getElementById('cardProfileImg');

    if (nameEl) nameEl.innerText = profile.name;
    if (phoneEl) phoneEl.innerHTML = `<i data-lucide="phone" class="w-3.5 h-3.5 text-bronze-400 shrink-0"></i> <span>${profile.phone}</span>`;
    if (addrEl) addrEl.innerHTML = `<i data-lucide="map-pin" class="w-3.5 h-3.5 text-bronze-400 shrink-0 mt-0.5"></i> <span>${profile.formattedAddress || 'Address on file'}</span>`;
    if (imgEl && profile.avatar) imgEl.src = profile.avatar;
  } else {
    if (authSection) authSection.classList.remove('hidden');
    if (savedCard) savedCard.classList.add('hidden');
    if (footer) footer.classList.add('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

// SAVE USER PROFILE & REGISTER TO CLOUD FIRESTORE
async function saveUserProfile() {
  const nameInput = document.getElementById('userNameInput');
  const phoneInput = document.getElementById('userPhoneInput');
  const countryInput = document.getElementById('addrCountry');
  const stateInput = document.getElementById('addrState');
  const areaInput = document.getElementById('addrArea');
  const pinInput = document.getElementById('addrPin');
  const consentBox = document.getElementById('dpdpConsentCheckbox');
  const avatarPreview = document.getElementById('editAvatarPreview');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const country = countryInput ? countryInput.value.trim() : 'India';
  const state = stateInput ? stateInput.value.trim() : '';
  const area = areaInput ? areaInput.value.trim() : '';
  const pin = pinInput ? pinInput.value.trim() : '';
  const avatar = avatarPreview ? avatarPreview.src : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  if (!name) {
    alert('Please enter your Full Name.');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!phone || phone.length < 10) {
    alert('Please enter a valid 10-digit Mobile / WhatsApp contact number.');
    if (phoneInput) phoneInput.focus();
    return;
  }

  if (consentBox && !consentBox.checked) {
    alert('Please check the DPDP Act consent checkbox to proceed with reservation delivery.');
    return;
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

  // 1. Commit to Local Storage
  window.currentProfile = profileData;
  if (window.LenkaApp) window.LenkaApp.profile = profileData;
  localStorage.setItem('lenka_profile', JSON.stringify(profileData));

  // 2. Register to Cloud Firestore (lenkastores-website)
  const db = (window.LenkaApp && window.LenkaApp.db) ? window.LenkaApp.db : (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
  if (db) {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      await db.collection('customers').doc(cleanPhone).set(profileData, { merge: true });
    } catch (e) {
      console.warn("Cloud customer save note:", e);
    }
  }

  // 3. Update Drawer Display UI
  checkSavedProfile();
  alert(`Profile for ${name} verified and saved successfully!`);
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
    if (stateInput) stateInput.value = (window.currentProfile.address && window.currentProfile.address.state) || '';
    if (areaInput) areaInput.value = (window.currentProfile.address && window.currentProfile.address.area) || '';
    if (pinInput) pinInput.value = (window.currentProfile.address && window.currentProfile.address.pin) || '';
  }

  if (authSection) authSection.classList.remove('hidden');
  if (savedCard) savedCard.classList.add('hidden');
  if (cancelBtn) cancelBtn.classList.remove('hidden');
}

function cancelProfileEdit() {
  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) cancelBtn.classList.add('hidden');
  checkSavedProfile();
}

function resetProfile() {
  if (confirm('Log out and clear saved profile details from this browser?')) {
    window.currentProfile = null;
    if (window.LenkaApp) window.LenkaApp.profile = null;
    localStorage.removeItem('lenka_profile');
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
