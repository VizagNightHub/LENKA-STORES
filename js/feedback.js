function openFeedbackModal() {
  if (currentProfile) {
    document.getElementById('fbName').value = currentProfile.name || '';
    document.getElementById('fbPhone').value = currentProfile.phone || '';
  }
  document.getElementById('feedbackModal').classList.remove('hidden');
}

function closeFeedbackModal() { document.getElementById('feedbackModal').classList.add('hidden'); }
function openFeedbackSuccessModal() { document.getElementById('feedbackSuccessModal').classList.remove('hidden'); }
function closeFeedbackSuccessModal() { document.getElementById('feedbackSuccessModal').classList.add('hidden'); }
function openDpdpPolicyModal() { document.getElementById('dpdpPolicyModal').classList.remove('hidden'); }
function closeDpdpPolicyModal() { document.getElementById('dpdpPolicyModal').classList.add('hidden'); }

function handleFeedbackSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('fbName').value.trim();
  const phone = document.getElementById('fbPhone').value.trim();
  const message = document.getElementById('fbMessage').value.trim();

  if (!name || !phone || !message) {
    alert('Please complete all feedback fields.');
    return;
  }

  const newFeedback = {
    feedbackId: 'FB' + Math.floor(10000 + Math.random() * 90000),
    name: name,
    phone: phone,
    message: message,
    timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };

  let localFeedbacks = JSON.parse(localStorage.getItem('lenka_feedbacks') || '[]');
  localFeedbacks.unshift(newFeedback);
  localStorage.setItem('lenka_feedbacks', JSON.stringify(localFeedbacks));

  try {
    if (db) {
      db.collection('feedbacks').add({
        ...newFeedback,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(err => console.warn('Background sync note:', err));
    }
  } catch (err) {
    console.warn('Firebase error bypassed:', err);
  }
  
  document.getElementById('feedbackForm').reset();
  closeFeedbackModal();
  openFeedbackSuccessModal();
}
