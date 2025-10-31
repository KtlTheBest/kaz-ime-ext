document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const toggleBtn = document.getElementById('toggleBtn');
  
  // Get current tab
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  
  // Get IME status
  try {
    const response = await browser.tabs.sendMessage(tab.id, { action: 'getStatus' });
    updateStatus(response.active);
  } catch (error) {
    // Content script might not be ready
    updateStatus(false);
  }
  
  toggleBtn.addEventListener('click', async () => {
    try {
      await browser.tabs.sendMessage(tab.id, { command: 'toggle-ime' });
      // Close popup after toggle
      window.close();
    } catch (error) {
      console.error('Error toggling IME:', error);
    }
  });
  
  function updateStatus(isActive) {
    if (isActive) {
      statusDiv.textContent = 'IME: ACTIVE';
      statusDiv.className = 'status active';
      toggleBtn.textContent = 'Turn OFF';
    } else {
      statusDiv.textContent = 'IME: INACTIVE';
      statusDiv.className = 'status inactive';
      toggleBtn.textContent = 'Turn ON';
    }
  }
});
