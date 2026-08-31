// js/config.js
const CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api', // Change to your live backend URL in production
  STORAGE_KEYS: {
    AUTH_TOKEN: 'lenka_auth_token',
    USER_DATA: 'lenka_user_data'
  }
};

// Reusable API Request Helper
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = false) {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) })
  };

  const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Request failed');
  }
  return result;
}
