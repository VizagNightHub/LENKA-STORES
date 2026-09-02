// ATELIER CLIENT FEEDBACK & STICKER CELEBRATION ENGINE

function openFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.classList.remove('hidden');
    // Pre-fill if profile exists
    const profile = JSON.parse(localStorage.getItem('lenka_user_profile') || 'null');
    if (profile) {
      const nameInput = document.getElementById('feedbackName');
      if (nameInput && !nameInput.value) nameInput.value = profile.username || '';
    }
  }
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) modal.classList.add('hidden');
}

function openFeedbackThanksModal() {
  const modal = document.getElementById('feedbackThanksModal');
  if (modal) modal.classList.remove('hidden');

  // Trigger celebration particle blast
  if (window.confetti) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function closeFeedbackThanksModal() {
  const modal = document.getElementById('feedbackThanksModal');
  if (modal) modal.classList.add('hidden');
}

async function submitFeedback(e) {
  e.preventDefault();
  const btn = document.getElementById('feedbackSubmitBtn');
  btn.disabled = true;
  btn.innerText = "SENDING...";

  const name = document.getElementById('feedbackName').value.trim();
  const phone = document.getElementById('feedbackPhone').value.trim();
  const message = document.getElementById('feedbackMessage').value.trim();

  const feedbackData = {
    name: name,
    phone: phone,
    message: message,
    timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    createdAt: new Date().toISOString()
  };

  // 1. Save locally for instant offline review
  const feedbacks = JSON.parse(localStorage.getItem('lenka_feedbacks') || '[]');
  feedbacks.unshift(feedbackData);
  localStorage.setItem('lenka_feedbacks', JSON.stringify(feedbacks));

  // 2. Sync to Firebase Firestore if connected
  if (window.firebase && firebase.apps.length) {
    try {
      await firebase.firestore().collection('feedbacks').add(feedbackData);
    } catch (err) {
      console.warn("Feedback cloud sync notice:", err);
    }
  }

  // Reset Form & Close Main Feedback Modal
  document.getElementById('feedbackForm').reset();
  btn.disabled = false;
  btn.innerText = "SEND FEEDBACK";
  closeFeedbackModal();

  // 3. Open celebratory sticker popup: "Thank you for your time 😊"
  openFeedbackThanksModal();
}

window.openFeedbackModal = openFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.openFeedbackThanksModal = openFeedbackThanksModal;
window.closeFeedbackThanksModal = closeFeedbackThanksModal;
window.submitFeedback = submitFeedback;
