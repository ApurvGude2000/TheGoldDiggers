// Background service worker for AccessGuru

// Installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('AccessGuru installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.local.set({
      settings: {
        autoRun: false,
        showMLInsights: true,
        minSeverity: 'minor'
      }
    });
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse(result.settings || {});
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.local.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'logAnalytics') {
    // Could send analytics data to backend here
    console.log('Analytics:', request.data);
    sendResponse({ success: true });
    return true;
  }
});

// Handle browser action click (optional)
chrome.action.onClicked.addListener((tab) => {
  // This won't fire if popup is set, but useful for debugging
  console.log('Extension icon clicked for tab:', tab.id);
});
