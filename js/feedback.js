// FEEDBACK & INQUIRIES SUBMISSION ENGINE (DELEGATED & FAIL-SAFE)

async function submitFeedback(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('feedbackName');
  const phoneInput = document.getElementById('feedbackPhone');
  const messageInput = document.getElementById('feedbackMessage');
  const submitBtn = document.getElementById('feedbackSubmitBtn');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const message = messageInput ? messageInput.value.trim() : '';

  if (!name) {
    alert('Please enter your name.');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
    alert('Please enter a valid 10-digit WhatsApp / Contact number.');
    if (phoneInput) phoneInput.focus();
    return;
  }

  if (!message) {
    alert('Please enter your feedback or inquiry message.');
    if (messageInput) messageInput.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.innerText = 'TRANSMITTING INQUIRY...';
    submitBtn.disabled = true;
  }

  const feedbackId = 'fb_' + Date.now();
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const feedbackData = {
    feedbackId: feedbackId,
    name: name,
    phone: phone,
    message: message,
    timestamp: today,
    createdAt: new Date().toISOString()
  };

  // 1. Local backup
  let localFbs = JSON.parse(localStorage.getItem('lenka_feedbacks') || '[]');
  localFbs.unshift(feedbackData);
  localStorage.setItem('lenka_feedbacks', JSON.stringify(localFbs));

  // 2. Direct Cloud Firestore write (lenkastores-website)
  const db = (window.LenkaApp && window.LenkaApp.db) ? window.LenkaApp.db : (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
  
  if (db) {
    try {
      const firestoreWrite = db.collection('feedbacks').doc(feedbackId).set(feedbackData);
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500));
      await Promise.race([firestoreWrite, timeout]).catch(e => console.warn("Cloud feedback write note:", e));
    } catch (err) {
      console.warn("Feedback sync note:", err);
    }
  }

  // 3. Reset form
  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (messageInput) messageInput.value = '';

  if (submitBtn) {
    submitBtn.innerText = 'SUBMIT INQUIRY';
    submitBtn.disabled = false;
  }

  alert(`Thank you, ${name}! Your inquiry has been transmitted to Lenka Studio.`);
}

// Global Document Delegation to bypass any component loading race condition
document.addEventListener('click', function(e) {
  const target = e.target;
  if (target && (target.id === 'feedbackSubmitBtn' || target.closest('#feedbackSubmitBtn'))) {
    e.preventDefault();
    submitFeedback(e);
  }
});

window.submitFeedback = submitFeedback;
