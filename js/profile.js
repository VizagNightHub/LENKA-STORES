let uploadedAvatarBase64 = '';
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      uploadedAvatarBase64 = evt.target.result;
      document.getElementById('editAvatarPreview').src = uploadedAvatarBase64;
    };
    reader.readAsDataURL(file);
  }
}

function openProfileDrawer() { 
  document.getElementById('profileDrawer').classList.remove('hidden'); 
  checkSavedProfile();
}
function closeProfileDrawer() { document.getElementById('profileDrawer').classList.add('hidden'); }

async function saveUserProfile() {
  const name = document.getElementById('userNameInput').value.trim();
  const phone = document.getElementById('userPhoneInput').value.trim();
  const country = document.getElementById('addrCountry').value.trim() || 'India';
  const state = document.getElementById('addrState').value.trim();
  const area = document.getElementById('addrArea').value.trim();
  const pin = document.getElementById('addrPin').value.trim();
  const consentGiven = document.getElementById('dpdpConsentCheckbox')?.checked ?? true;
  const avatar = uploadedAvatarBase64 || (currentProfile ? currentProfile.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  if (!name || !phone || !area || !pin) {
    alert('Please fill out Name, Phone, Area & PIN Code.');
    return;
  }
  if (!consentGiven) {
    alert('Please grant DPDP data processing consent to save shipping details.');
    return;
  }

  currentProfile = {
    name,
    phone,
    avatar,
    address: { country, state, area, pin },
    formattedAddress: `${area}, ${state}, ${country} - ${pin}`,
    dpdpConsent: true,
    dpdpConsentTimestamp: new Date().toISOString()
  };

  localStorage.setItem('lenka_profile', JSON.stringify(currentProfile));

  let masterCustomers = JSON.parse(localStorage.getItem('lenka_registered_customers') || '[]');
  const existingIdx = masterCustomers.findIndex(c => c.phone === phone);
  if (existingIdx !== -1) {
    masterCustomers[existingIdx] = currentProfile;
  } else {
    masterCustomers.unshift(currentProfile);
  }
  localStorage.setItem('lenka_registered_customers', JSON.stringify(masterCustomers));

  if (db) {
    try {
      db.collection('customers').doc(phone).set({
        ...currentProfile,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(e => console.warn(e));
    } catch (e) {
      console.log(e);
    }
  }

  document.getElementById('cancelEditBtn').classList.add('hidden');
  checkSavedProfile();
  alert('Profile & Address saved successfully with DPDP Act, 2023 Consent!');
}

function checkSavedProfile() {
  const authSec = document.getElementById('authSection');
  const savedCard = document.getElementById('profileSavedCard');
  const foot = document.getElementById('profileFooter');
  const navLabel = document.getElementById('navProfileLabel');
  const navAvatar = document.getElementById('navProfileAvatar');
  const navIcon = document.getElementById('navProfileIcon');

  if (currentProfile) {
    if (authSec) authSec.classList.add('hidden');
    if (savedCard) savedCard.classList.remove('hidden');
    if (foot) foot.classList.remove('hidden');

    if (document.getElementById('displayUserName')) document.getElementById('displayUserName').innerText = currentProfile.name;
    if (document.getElementById('cardProfileImg')) document.getElementById('cardProfileImg').src = currentProfile.avatar;
    if (document.getElementById('displayUserPhone')) document.getElementById('displayUserPhone').querySelector('span').innerText = currentProfile.phone;
    if (document.getElementById('displayUserAddress')) document.getElementById('displayUserAddress').querySelector('span').innerText = currentProfile.formattedAddress || currentProfile.address;

    if (navAvatar) {
      navAvatar.src = currentProfile.avatar;
      navAvatar.classList.remove('hidden');
    }
    if (navIcon) navIcon.classList.add('hidden');
    if (navLabel) navLabel.innerText = currentProfile.name.split(' ')[0];
  } else {
    if (authSec) authSec.classList.remove('hidden');
    if (savedCard) savedCard.classList.add('hidden');
    if (foot) foot.classList.add('hidden');
    if (navAvatar) navAvatar.classList.add('hidden');
    if (navIcon) navIcon.classList.remove('hidden');
    if (navLabel) navLabel.innerText = 'Profile';
  }
  if (window.lucide) lucide.createIcons();
}

function startProfileEdit() {
  if (!currentProfile) return;
  document.getElementById('userNameInput').value = currentProfile.name;
  document.getElementById('userPhoneInput').value = currentProfile.phone;
  if (currentProfile.avatar) {
    document.getElementById('editAvatarPreview').src = currentProfile.avatar;
    uploadedAvatarBase64 = currentProfile.avatar;
  }
  if (typeof currentProfile.address === 'object') {
    document.getElementById('addrCountry').value = currentProfile.address.country || 'India';
    document.getElementById('addrState').value = currentProfile.address.state || '';
    document.getElementById('addrArea').value = currentProfile.address.area || '';
    document.getElementById('addrPin').value = currentProfile.address.pin || '';
  }
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('profileSavedCard').classList.add('hidden');
  document.getElementById('cancelEditBtn').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function cancelProfileEdit() { checkSavedProfile(); }
function resetProfile() {
  currentProfile = null;
  localStorage.removeItem('lenka_profile');
  checkSavedProfile();
}
