// Background script for handling authentication and API requests
let authToken = null;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'SET_AUTH_TOKEN':
      authToken = request.token;
      chrome.storage.local.set({ authToken });
      break;
    case 'GET_AUTH_TOKEN':
      sendResponse({ token: authToken });
      break;
    case 'LOGOUT':
      authToken = null;
      chrome.storage.local.remove('authToken');
      break;
  }
});

// Initialize authToken from storage
chrome.storage.local.get(['authToken'], (result) => {
  authToken = result.authToken;
});
