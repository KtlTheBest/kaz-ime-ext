// Background script for handling commands and state
browser.commands.onCommand.addListener((command) => {
  if (command === 'toggle-ime') {
    // Send message to all tabs
    browser.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, { command: 'toggle-ime' })
          .catch(() => {}); // Ignore errors for tabs that can't receive messages
      });
    });
  }
});

// Handle extension icon click to toggle IME
browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.sendMessage(tab.id, { command: 'toggle-ime' })
    .catch(() => {
      // If content script isn't ready, inject it
      browser.tabs.executeScript(tab.id, {
        file: 'content.js'
      });
    });
});

// Handle installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default state
    browser.storage.local.set({ imeEnabled: true });
  }
});
