// ATELIER CLIENT FEEDBACK & STICKER CELEBRATION ENGINE

function openFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Pre-fill name if user profile exists in localStorage
    try {
      const profile = JSON.parse(localStorage.getItem('lenka_user_profile') || 'null');
      if (profile && profile.username) {
        const nameInput = document.getElementById('feedbackName') || document.getElementById('fbName');
        if (nameInput && !nameInput.value) {
          nameInput.value = profile.username;
        }
      }
    } catch (err) {
      console.warn("Profile read error:", err);
    }
  }
  if (window.lucide) lucide.createIcons();
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) modal.classList.add('hidden');
}

function openFeedbackThanksModal() {
  const modal = document.getElementById('feedbackThanksModal');
  if (modal) {
    modal.classList.remove('hidden');

    // Trigger celebratory confetti burst
    if (typeof window.confetti === 'function') {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }
  if (window.lucide) lucide.createIcons();
}

function closeFeedbackThanksModal() {
  const modal = document.getElementById('feedbackThanksModal');
  if (modal) modal.classList.add('hidden');
}

async function submitFeedback(e) {
  if (e && e.preventDefault) e.preventDefault();

  const btn = document.getElementById('feedbackSubmitBtn') || document.getElementById('fbSubmitBtn');
  const originalBtnText = btn ? btn.innerText : "SEND FEEDBACK";
  if (btn) {
    btn.disabled = true;
    btn.innerText = "SENDING...";
  }

  // Support both standard and short input IDs
  const nameEl = document.getElementById('feedbackName') || document.getElementById('fbName');
  const phoneEl = document.getElementById('feedbackPhone') || document.getElementById('fbPhone');
  const msgEl = document.getElementById('feedbackMessage') || document.getElementById('fbMessage');

  const name = nameEl ? nameEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const message = msgEl ? msgEl.value.trim() : '';

  if (!message) {
    alert("Please write a message before sending.");
    if (btn) {
      btn.disabled = false;
      btn.innerText = originalBtnText;
    }
    return;
  }

  const feedbackData = {
    name: name || 'Anonymous Client',
    phone: phone || 'Not Provided',
    message: message,
    timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    createdAt: new Date().toISOString()
  };

  // 1. Save locally for instant offline review
  try {
    const feedbacks = JSON.parse(localStorage.getItem('lenka_feedbacks') || '[]');
    feedbacks.unshift(feedbackData);
    localStorage.setItem('lenka_feedbacks', JSON.stringify(feedbacks));
  } catch (err) {
    console.warn("Feedback localStorage save error:", err);
  }

  // 2. Sync to Firebase Firestore if connected
  if (window.firebase && firebase.apps && firebase.apps.length) {
    try {
      await firebase.firestore().collection('feedbacks').add(feedbackData);
    } catch (err) {
      console.warn("Feedback cloud sync notice:", err);
    }
  }

  // Reset Form & Close Main Feedback Modal
  const form = document.getElementById('feedbackForm');
  if (form) form.reset();

  if (btn) {
    btn.disabled = false;
    btn.innerText = originalBtnText;
  }
  closeFeedbackModal();

  // 3. Open celebratory sticker popup: "Thank you for your time 😊"
  openFeedbackThanksModal();
}

// Global window exposure for modular execution
window.openFeedbackModal = openFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.openFeedbackThanksModal = openFeedbackThanksModal;
window.closeFeedbackThanksModal = closeFeedbackThanksModal;
window.submitFeedback = submitFeedback;
window.handleSendFeedback = submitFeedback;
