// Content script - runs on every page
// This script injects axe-core library into the page context

(function() {
  'use strict';

  // Check if axe is already injected
  if (window.axeInjected) {
    return;
  }
  window.axeInjected = true;

  // Inject axe-core script
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('axe.min.js');
  script.onload = function() {
    console.log('AccessGuru: axe-core loaded');
    this.remove();
  };
  script.onerror = function() {
    console.error('AccessGuru: Failed to load axe-core');
    this.remove();
  };
  
  (document.head || document.documentElement).appendChild(script);

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
      sendResponse({ status: 'ready' });
    }
  });
})();
