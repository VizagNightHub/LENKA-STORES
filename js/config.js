const firebaseConfig = {
  apiKey: "AIzaSyC6A7SleUhcZjt0gMo83XvFCzO-k0_hSTI",
  authDomain: "lenkastores-studio.firebaseapp.com",
  projectId: "lenkastores-studio",
  storageBucket: "lenkastores-studio.firebasestorage.app",
  messagingSenderId: "198057972058",
  appId: "1:198057972058:web:c1e0742dcaa3b476472363",
  measurementId: "G-S5GNTV03XM"
};

let db = null;
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
} catch (err) {
  console.warn("Firebase Init note:", err);
}

let cloudCatalog = [];
let currentCart = JSON.parse(localStorage.getItem('lenka_cart') || '[]');
let currentProfile = JSON.parse(localStorage.getItem('lenka_profile') || 'null');
let favorites = JSON.parse(localStorage.getItem('lenka_favorites') || '[]');
let currentCategoryFilter = 'all';
