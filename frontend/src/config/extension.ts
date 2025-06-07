export const EXTENSION_CONFIG = {
  // API endpoints
  API_URL: 'http://localhost:8000',
  
  // Extension settings
  POPUP_WIDTH: 320,
  POPUP_HEIGHT: 400,
  
  // Authentication
  TOKEN_STORAGE_KEY: 'authToken',
  USER_STORAGE_KEY: 'user',
  
  // Feature flags
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
  
  // Update checking
  CHECK_FOR_UPDATES: true,
  UPDATE_CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
};
