// DEDICATED ATELIER PROFILE & SESSION CONTROLLER

document.addEventListener('DOMContentLoaded', () => {
    initProfileEngine();
});

function initProfileEngine() {
    const displayUsername = document.getElementById('display-username');
    if (!displayUsername) return; 

    const profileDisplaySection = document.getElementById('profile-display-section');
    const profileEditSection = document.getElementById('profile-edit-section');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editProfileForm = document.getElementById('edit-profile-form');
    
    const displayAddress = document.getElementById('display-address');
    const inputUsername = document.getElementById('input-username');
    const inputAddress = document.getElementById('input-address');
    
    const profileAvatarPreview = document.getElementById('profile-avatar-preview');
    const photoFileInput = document.getElementById('photo-file-input');
    const liveFilePreview = document.getElementById('live-file-preview');
    const fileLabel = document.getElementById('file-label');
    
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    const authBtnText = document.getElementById('auth-btn-text');

    const savedData = JSON.parse(localStorage.getItem('lenka_user_profile')) || {
        username: "V. Udayteja",
        address: "Add your delivery address",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        isLoggedIn: true
    };

    function renderProfile() {
        if (displayUsername) displayUsername.textContent = savedData.username;
        if (displayAddress) displayAddress.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${savedData.address}`;
        if (profileAvatarPreview) profileAvatarPreview.src = savedData.avatar;
        if (inputUsername) inputUsername.value = savedData.username;
        if (inputAddress) inputAddress.value = savedData.address === "Add your delivery address" ? "" : savedData.address;
        if (authBtnText) authBtnText.textContent = savedData.isLoggedIn ? "Logout" : "Login";
    }

    renderProfile();

    if (editProfileBtn && profileDisplaySection && profileEditSection) {
        editProfileBtn.addEventListener('click', () => {
            profileDisplaySection.style.display = 'none';
            profileEditSection.style.display = 'flex';
        });
    }

    if (cancelEditBtn && profileDisplaySection && profileEditSection) {
        cancelEditBtn.addEventListener('click', () => {
            profileEditSection.style.display = 'none';
            profileDisplaySection.style.display = 'flex';
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
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            savedData.username = inputUsername.value.trim();
            savedData.address = inputAddress.value.trim() || "Add your delivery address";
            savedData.avatar = temporaryImageBase64;
            localStorage.setItem('lenka_user_profile', JSON.stringify(savedData));
            renderProfile();
            if (profileEditSection) profileEditSection.style.display = 'none';
            if (profileDisplaySection) profileDisplaySection.style.display = 'flex';
        });
    }

    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', () => {
            if (savedData.isLoggedIn) {
                if (confirm("Log out of your account?")) {
                    savedData.isLoggedIn = false;
                    localStorage.setItem('lenka_user_profile', JSON.stringify(savedData));
                    localStorage.removeItem('lenka_logged_in_phone');
                    window.location.href = "index.html";
                }
            } else {
                if (typeof openAuthModal === 'function') {
                    openAuthModal();
                } else {
                    window.location.href = "index.html";
                }
            }
        });
    }
}

// GLOBAL HELPERS FOR CLIENT SESSION MANAGEMENT
function checkAndOpenProfile() {
  const loggedPhone = localStorage.getItem('lenka_logged_in_phone');
  if (!loggedPhone) {
    if (typeof openAuthModal === 'function') {
      openAuthModal();
    } else {
      alert("Please authenticate with your mobile number first.");
    }
  } else {
    if (typeof openProfileDrawer === 'function') {
      openProfileDrawer();
    }
  }
}

function clientLogOutSession() {
  if (!confirm("Are you sure you want to log out?")) return;
  localStorage.removeItem('lenka_logged_in_phone');
  localStorage.removeItem('lenka_profile');
  if (typeof closeProfileDrawer === 'function') closeProfileDrawer();
  window.location.href = "index.html";
}

window.checkAndOpenProfile = checkAndOpenProfile;
window.clientLogOutSession = clientLogOutSession;
