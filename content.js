// Content script to handle input events
let activeElement = null;

document.addEventListener('focusin', (event) => {
  if (isInputElement(event.target)) {
    activeElement = event.target;
  }
});

document.addEventListener('focusout', () => {
  activeElement = null;
  kazakhIME.resetState();
});

document.addEventListener('keydown', (event) => {
  if (!activeElement) return;
  
  const handled = kazakhIME.handleKeyDown(event, activeElement);
  if (handled) {
    event.stopPropagation();
    event.preventDefault();
  }
});

// Listen for messages from background script
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggleIme') {
    const isNowActive = kazakhIME.toggle();
    showStatusMessage(`Kazakh IME: ${isNowActive ? 'ON' : 'OFF'}`);
  } else if (message.action === 'getStatus') {
    return Promise.resolve({ active: kazakhIME.isActive });
  }
});

// Handle keyboard command
browser.runtime.onMessage.addListener((message) => {
  if (message.command === 'toggle-ime') {
    const isNowActive = kazakhIME.toggle();
    showStatusMessage(`Kazakh IME: ${isNowActive ? 'ON' : 'OFF'}`);
  }
});

function isInputElement(element) {
  const inputTypes = [
    'text', 'password', 'email', 'search', 'tel', 'url', 'textarea'
  ];
  
  return (
    (element.tagName === 'INPUT' && inputTypes.includes(element.type)) ||
    element.tagName === 'TEXTAREA' ||
    element.isContentEditable
  );
}

function showStatusMessage(message) {
  // Remove existing message if any
  const existingMessage = document.getElementById('kazakh-ime-status');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const statusMessage = document.createElement('div');
  statusMessage.id = 'kazakh-ime-status';
  statusMessage.textContent = message;
  statusMessage.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10001;
    font-family: Arial, sans-serif;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  
  document.body.appendChild(statusMessage);
  
  // Animate in
  setTimeout(() => {
    statusMessage.style.opacity = '1';
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    statusMessage.style.opacity = '0';
    setTimeout(() => {
      if (statusMessage.parentNode) {
        statusMessage.parentNode.removeChild(statusMessage);
      }
    }, 300);
  }, 2000);
}

// Add to existing content.js

function isInputElement(element) {
  const inputTypes = [
    'text', 'password', 'email', 'search', 'tel', 'url', 'textarea'
  ];
  
  return (
    (element.tagName === 'INPUT' && inputTypes.includes(element.type)) ||
    element.tagName === 'TEXTAREA' ||
    element.isContentEditable
  );
}

// Add input highlighting when IME is active
document.addEventListener('focusin', (event) => {
  if (isInputElement(event.target)) {
    activeElement = event.target;
    if (kazakhIME.isActive) {
      event.target.classList.add('ime-active-input');
    }
  }
});

document.addEventListener('focusout', (event) => {
  if (isInputElement(event.target)) {
    event.target.classList.remove('ime-active-input');
  }
  activeElement = null;
  kazakhIME.resetState();
});

// Update input highlighting when IME is toggled
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggleIme' || message.command === 'toggle-ime') {
    const isNowActive = kazakhIME.toggle();
    
    // Update input highlighting
    const inputs = document.querySelectorAll('input, textarea, [contenteditable="true"]');
    inputs.forEach(input => {
      if (isNowActive && document.activeElement === input) {
        input.classList.add('ime-active-input');
      } else {
        input.classList.remove('ime-active-input');
      }
    });
    
    showStatusMessage(`Kazakh IME: ${isNowActive ? 'ON' : 'OFF'}`);
  } else if (message.action === 'getStatus') {
    return Promise.resolve({ active: kazakhIME.isActive });
  }
});

// Add to existing content.js

// Update overlay position on scroll and resize
let scrollTimer;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    if (kazakhIME.isComposing) {
      kazakhIME.updateOverlayPosition();
    }
  }, 50);
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (kazakhIME.isComposing) {
      kazakhIME.updateOverlayPosition();
    }
  }, 100);
});
