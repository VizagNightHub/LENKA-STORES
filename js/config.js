// REAL-TIME FIRESTORE PRODUCT LISTENER
function listenToCloudCatalog() {
  if (!db) {
    fallbackLocalCatalog();
    return;
  }

  // Real-time listener: triggers whenever admin.html publishes or updates a product
  db.collection('products').onSnapshot((snapshot) => {
    if (!snapshot.empty) {
      cloudCatalog = [];
      snapshot.forEach(doc => {
        cloudCatalog.push({
          id: doc.id,
          ...doc.data()
        });
      });
      // Save locally as backup and re-render grid
      localStorage.setItem('lenka_catalog', JSON.stringify(cloudCatalog));
      renderCatalog(currentCategoryFilter);
    } else {
      // If database has 0 products, seed defaults
      fallbackLocalCatalog();
    }
  }, (error) => {
    console.warn("Firestore live sync error, loading local catalog:", error);
    const local = JSON.parse(localStorage.getItem('lenka_catalog') || '[]');
    if (local.length > 0) {
      cloudCatalog = local;
      renderCatalog(currentCategoryFilter);
    } else {
      fallbackLocalCatalog();
    }
  });
}
