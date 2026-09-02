// ATELIER CHECKOUT, CONFETTI BLAST & WHATSAPP INVOICE ENGINE

function handlePlaceOrder(e) {
  e.preventDefault();
  const cart = JSON.parse(localStorage.getItem('lenka_cart_v2') || '[]');
  if (cart.length === 0) {
    alert("Your bag is empty.");
    return;
  }

  const name = document.getElementById('orderClientName').value.trim();
  const phone = document.getElementById('orderClientPhone').value.trim();
  const address = document.getElementById('orderClientAddress').value.trim();
  const paymentMethod = document.getElementById('orderPaymentMethod').value;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderId = 'LS-' + Math.floor(100000 + Math.random() * 900000);
  const itemsSummary = cart.map(i => `${i.name} (x${i.quantity})`).join(', ');

  const newOrder = {
    orderId,
    customerName: name,
    customerPhone: phone,
    customerAddress: address,
    paymentMethod,
    itemsSummary,
    totalAmount: subtotal,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
    shippingDate: 'Processing in warehouse',
    deliveryDate: 'Expected in 3-5 days'
  };

  // Save to local orders manifest
  const orders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  orders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(orders));

  // Sync to Firebase if connected
  if (window.firebase && firebase.apps.length) {
    firebase.firestore().collection('orders').doc(orderId).set(newOrder).catch(err => console.warn(err));
  }

  // Clear cart bag
  localStorage.removeItem('lenka_cart_v2');
  if (typeof window.updateCartUI === 'function') window.updateCartUI();

  // Close checkout modal
  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) checkoutModal.classList.add('hidden');

  // Trigger Confetti Celebration Blast
  if (window.confetti) {
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 }
    });
  }

  // Populate Success Modal Details
  const idDisplay = document.getElementById('successOrderIdDisplay');
  const payDisplay = document.getElementById('successPaymentDisplay');
  if (idDisplay) idDisplay.innerText = `Order ID: #${orderId}`;
  if (payDisplay) payDisplay.innerText = paymentMethod;

  // Configure Direct Payment Gateway URL
  const payLink = document.getElementById('paymentGatewayLink');
  if (payLink) {
    if (paymentMethod.includes('PhonePe')) {
      payLink.href = `https://phonepe.com/pay?amount=${subtotal}&order=${orderId}`;
      payLink.innerHTML = `<i data-lucide="external-link" class="w-4 h-4"></i><span>PAY ₹${subtotal} VIA PHONEPE UPI</span>`;
    } else if (paymentMethod.includes('Card')) {
      payLink.href = `https://checkout.razorpay.com?amount=${subtotal}&order=${orderId}`;
      payLink.innerHTML = `<i data-lucide="credit-card" class="w-4 h-4"></i><span>PAY ₹${subtotal} VIA SECURE CARD</span>`;
    } else {
      payLink.href = `https://wa.me/918977627028?text=${encodeURIComponent(`Hi, I selected Cash on Delivery for Order #${orderId} (₹${subtotal}). Please confirm.`)}`;
      payLink.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i><span>COD ORDER CONFIRMED</span>`;
    }
  }

  // Configure Direct WhatsApp Invoice Link
  const waLink = document.getElementById('whatsappInvoiceLink');
  if (waLink) {
    const waText = `Hi Lenka Stores! I just placed Order #${orderId} amounting to ₹${subtotal} via ${paymentMethod}. Delivery Address: ${address}. Please confirm dispatch!`;
    waLink.href = `https://wa.me/918977627028?text=${encodeURIComponent(waText)}`;
  }

  // Open Success Modal Popup
  const successModal = document.getElementById('orderSuccessModal');
  if (successModal) successModal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('orderSuccessModal');
  if (modal) modal.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.handlePlaceOrder = handlePlaceOrder;
window.closeOrderSuccessModal = closeOrderSuccessModal;
