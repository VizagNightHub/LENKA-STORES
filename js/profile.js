document.addEventListener('DOMContentLoaded', () => {
    const profileDisplaySection = document.getElementById('profile-display-section');
    const profileEditSection = document.getElementById('profile-edit-section');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editProfileForm = document.getElementById('edit-profile-form');
    
    const displayUsername = document.getElementById('display-username');
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
        avatar: "default-avatar.png",
        isLoggedIn: true
    };

    function renderProfile() {
        displayUsername.textContent = savedData.username;
        displayAddress.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${savedData.address}`;
        profileAvatarPreview.src = savedData.avatar;
        inputUsername.value = savedData.username;
        inputAddress.value = savedData.address === "Add your delivery address" ? "" : savedData.address;
        authBtnText.textContent = savedData.isLoggedIn ? "Logout" : "Login";
    }

    renderProfile();

    editProfileBtn.addEventListener('click', () => {
        profileDisplaySection.style.display = 'none';
        profileEditSection.style.display = 'flex';
    });

    cancelEditBtn.addEventListener('click', () => {
        profileEditSection.style.display = 'none';
        profileDisplaySection.style.display = 'flex';
    });

    let temporaryImageBase64 = savedData.avatar;
    photoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileLabel.textContent = file.name;
            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                temporaryImageBase64 = uploadEvent.target.result;
                liveFilePreview.src = temporaryImageBase64;
                liveFilePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        savedData.username = inputUsername.value.trim();
        savedData.address = inputAddress.value.trim() || "Add your delivery address";
        savedData.avatar = temporaryImageBase64;
        localStorage.setItem('lenka_user_profile', JSON.stringify(savedData));
        renderProfile();
        profileEditSection.style.display = 'none';
        profileDisplaySection.style.display = 'flex';
    });

    authToggleBtn.addEventListener('click', () => {
        if (savedData.isLoggedIn) {
            if (confirm("Log out?")) {
                savedData.isLoggedIn = false;
                localStorage.setItem('lenka_user_profile', JSON.stringify(savedData));
                window.location.href = "index.html";
            }
        } else {
            window.location.href = "login.html";
        }
    });
});
