// Successful Order Placement & Delivery Truck Modal Trigger
async function triggerDeliveryTruckSuccessModal() {
  closeCheckoutModal();
  const orderId = 'LS-' + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const itemsSummary = cartItems.map(i => `${i.title} (x${i.quantity})`).join(', ');

  // Get customer details if available from form or localStorage
  const customerNameInput = document.getElementById('customerName');
  const customerPhoneInput = document.getElementById('customerPhone');
  const shippingAddressInput = document.getElementById('shippingAddress');

  const customerName = customerNameInput ? customerNameInput.value : "Valued Customer";
  const customerPhone = customerPhoneInput ? customerPhoneInput.value : (localStorage.getItem('lenka_logged_in_phone') || "Not Provided");
  const shippingAddress = shippingAddressInput ? shippingAddressInput.value : "Address provided via checkout";

  const newOrder = {
    orderId,
    customerName,
    customerPhone,
    shippingAddress,
    itemsSummary,
    totalAmount,
    status: 'Confirmed & Dispatched',
    shippingDate: new Date().toLocaleDateString()
  };

  // Automatically Forward Order to Supplier via WhatsApp
  forwardOrderToSupplier(newOrder);

  // Save order to local storage history
  let existingOrders = [];
  try {
    existingOrders = JSON.parse(localStorage.getItem('lenka_orders') || '[]');
  } catch (err) {
    existingOrders = [];
  }
  existingOrders.unshift(newOrder);
  localStorage.setItem('lenka_orders', JSON.stringify(existingOrders));

  // Sync to Firebase Firestore if configured
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    try {
      await firebase.firestore().collection('orders').doc(orderId).set({
        ...newOrder,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore order sync note:", err);
    }
  }

  // Clear cart
  cartItems = [];
  localStorage.removeItem('lenka_cart_v2');
  updateCartBadge();

  // Display success modal & run confetti if available
  const successModal = document.getElementById('orderSuccessModal');
  const orderIdDisplay = document.getElementById('successOrderIdDisplay');
  if (orderIdDisplay) orderIdDisplay.textContent = `Order ID: #${orderId}`;
  if (successModal) successModal.classList.remove('hidden');

  if (typeof confetti === 'function') {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }
}
