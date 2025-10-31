class KazakhIME {
  constructor() {
    this.isActive = false;
    this.currentInput = '';
    this.suggestions = [];
    this.selectedSuggestionIndex = 0;
    this.currentElement = null;
    this.overlay = null;
    this.isComposing = false;
    
    this.initialize();
  }

  initialize() {
    this.createOverlay();
    this.loadState();
  }

  createOverlay() {
    // Remove existing overlay if any
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    this.overlay = document.createElement('div');
    
    // Apply beautiful, modern styles
    Object.assign(this.overlay.style, {
      position: 'fixed',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      padding: '0',
      zIndex: '10000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '14px',
      color: 'white',
      display: 'none',
      borderRadius: '12px',
      boxShadow: `
        0 10px 30px rgba(0, 0, 0, 0.2),
        0 2px 10px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `,
      minWidth: '280px',
      maxWidth: '350px',
      maxHeight: '300px',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: '#333'
    });

    document.body.appendChild(this.overlay);
  }

  async loadState() {
    try {
      const result = await browser.storage.local.get('imeEnabled');
      this.isActive = result.imeEnabled !== false;
    } catch (error) {
      this.isActive = true;
    }
  }

  async saveState() {
    try {
      await browser.storage.local.set({ imeEnabled: this.isActive });
    } catch (error) {
      console.warn('Could not save IME state:', error);
    }
  }

  toggle() {
    this.isActive = !this.isActive;
    this.saveState();
    
    if (!this.isActive) {
      this.hideOverlay();
      this.resetState();
    }
    
    return this.isActive;
  }

  handleKeyDown(event, element) {
    if (!this.isActive) return false;

    const key = event.key;
    this.currentElement = element;

    // Don't handle modifier key combinations (Ctrl, Alt, Meta)
    if (event.ctrlKey || event.altKey || event.metaKey) {
      // Allow common shortcuts to work normally
      return false;
    }

    // Don't handle function keys or other special keys
    if (key.startsWith('F') && key.length > 1) { // F1-F12
      return false;
    }

    // Don't handle other special keys that shouldn't trigger composition
    const ignoredKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'OS', 'ContextMenu',
      'PrintScreen', 'ScrollLock', 'Pause', 'Insert', 'Delete',
      'Home', 'End', 'PageUp', 'PageDown', 'NumLock', 'CapsLock'
    ];
    
    if (ignoredKeys.includes(key)) {
      return false;
    }

    if (this.isComposing) {
      switch (key) {
        case ' ':
          // Only commit if we have suggestions
          if (this.suggestions.length > 0) {
            event.preventDefault();
            this.commitSuggestion();
            return true;
          } else {
            // No suggestions - prevent space from being inserted
            event.preventDefault();
            return true;
          }

        case 'Enter':
          event.preventDefault();
          this.commitCurrentInput();
          return true;

        case 'Escape':
          event.preventDefault();
          this.resetState();
          return true;

        case 'ArrowUp':
          event.preventDefault();
          this.selectPreviousSuggestion();
          return true;

        case 'ArrowDown':
          event.preventDefault();
          this.selectNextSuggestion();
          return true;

        case 'Tab':
          event.preventDefault();
          if (this.suggestions.length > 0) {
            this.selectNextSuggestion();
          }
          return true;

        case 'Backspace':
          if (this.currentInput.length > 0) {
            event.preventDefault();
            this.currentInput = this.currentInput.slice(0, -1);
            this.updateSuggestions();
            this.showOverlay();
          } else {
            this.resetState();
          }
          return true;

        default:
          if (key.length === 1 && /[а-яА-Яәғқңөұүіһ]/.test(key)) {
            event.preventDefault();
            this.currentInput += key;
            this.updateSuggestions();
            this.showOverlay();
            return true;
          }
      }
    } else {
      if (key.length === 1 && /[а-яА-Я]/.test(key)) {
        this.startComposition();
        this.currentInput = key;
        this.updateSuggestions();
        this.showOverlay();
        return true;
      }
    }

    return false;
  }

  startComposition() {
    this.isComposing = true;
    this.currentInput = '';
    this.suggestions = [];
    this.selectedSuggestionIndex = 0;
  }

  updateSuggestions() {
    this.suggestions = generateCandidates(this.currentInput);
    this.selectedSuggestionIndex = 0;
  }

  selectNextSuggestion() {
    if (this.suggestions.length > 0) {
      this.selectedSuggestionIndex = 
        (this.selectedSuggestionIndex + 1) % this.suggestions.length;
      this.showOverlay();
    }
  }

  selectPreviousSuggestion() {
    if (this.suggestions.length > 0) {
      this.selectedSuggestionIndex = 
        (this.selectedSuggestionIndex - 1 + this.suggestions.length) % this.suggestions.length;
      this.showOverlay();
    }
  }

  commitSuggestion() {
    if (this.suggestions.length === 0) {
      this.commitCurrentInput();
      return;
    }

    const selectedSuggestion = this.suggestions[this.selectedSuggestionIndex];
    const adjustedSuggestion = adjustCase(selectedSuggestion, this.currentInput);
    this.insertText(adjustedSuggestion + ' ');
    this.resetState();
  }

  commitCurrentInput() {
    this.insertText(this.currentInput);
    this.resetState();
  }

  insertText(text) {
    if (!this.currentElement) return;

    try {
      if (this.currentElement.isContentEditable || this.currentElement.tagName === 'TEXTAREA') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(text);
          range.insertNode(textNode);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        const start = this.currentElement.selectionStart;
        const end = this.currentElement.selectionEnd;
        const value = this.currentElement.value;
        
        this.currentElement.value = value.slice(0, start) + text + value.slice(end);
        this.currentElement.selectionStart = this.currentElement.selectionEnd = start + text.length;
      }

      const inputEvent = new Event('input', { bubbles: true });
      this.currentElement.dispatchEvent(inputEvent);
      
      const changeEvent = new Event('change', { bubbles: true });
      this.currentElement.dispatchEvent(changeEvent);
    } catch (error) {
      console.warn('Error inserting text:', error);
    }
  }

  showOverlay() {
    if (!this.currentElement || !this.isComposing) {
      this.hideOverlay();
      return;
    }

    // Update content first
    this.updateOverlayContent();
    
    // Then position it
    this.updateOverlayPosition();
    
    // Finally make it visible
    if (this.overlay) {
      this.overlay.style.display = 'block';
    }
  }

  updateOverlayContent() {
    if (!this.overlay) return;
    
    const hasSuggestions = this.suggestions.length > 0;
    
    let content = `
      <div style="
        padding: 16px 16px 12px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
      ">
        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Kazakh IME</div>
        <div style="font-size: 16px; font-weight: 600;">${this.currentInput}</div>
      </div>
    `;
    
    if (hasSuggestions) {
      content += `
        <div style="
          padding: 8px 0;
          max-height: 180px;
          overflow-y: auto;
        ">
      `;
      
      this.suggestions.forEach((suggestion, index) => {
        const adjustedSuggestion = adjustCase(suggestion, this.currentInput);
        const isSelected = index === this.selectedSuggestionIndex;
        
        content += `
          <div class="suggestion-item" data-index="${index}" style="
            padding: 10px 16px;
            margin: 2px 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: ${isSelected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
            color: ${isSelected ? 'white' : '#333'};
            font-weight: ${isSelected ? '600' : 'normal'};
            border-left: ${isSelected ? '3px solid #667eea' : '3px solid transparent'};
            transform: ${isSelected ? 'translateX(2px)' : 'none'};
          ">
            ${adjustedSuggestion}
          </div>
        `;
      });
      
      content += `</div>`;
    } else {
      content += `
        <div style="
          padding: 20px 16px;
          text-align: center;
          color: #666;
          font-style: italic;
        ">
          No suggestions found
        </div>
      `;
    }
    
    // Update instructions based on whether we have suggestions
    const instructions = hasSuggestions 
      ? '↑↓/Tab Navigate • Space Accept • Enter Type as-is • Esc Cancel'
      : 'Continue typing or press Enter to accept as-is';
    
    content += `
      <div style="
        padding: 12px 16px;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        border-radius: 0 0 12px 12px;
        font-size: 11px;
        color: #6c757d;
        line-height: 1.4;
      ">
        <div>${instructions}</div>
        ${hasSuggestions ? `<div style="margin-top: 2px; font-size: 10px; opacity: 0.7;">
          ${this.selectedSuggestionIndex + 1}/${this.suggestions.length} selected
        </div>` : ''}
      </div>
    `;
    
    this.overlay.innerHTML = content;
    
    // Add event listeners for click and hover
    this.overlay.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.selectedSuggestionIndex = index;
        this.commitSuggestion();
      });
      
      item.addEventListener('mouseenter', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.selectedSuggestionIndex = index;
        this.showOverlay();
      });
    });
  }

  updateOverlayPosition() {
    if (!this.currentElement || !this.isComposing || !this.overlay) {
      return;
    }

    try {
      const elementRect = this.currentElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Estimate overlay height based on content
      const baseHeight = 120; // Header + footer
      const suggestionHeight = 44; // Per suggestion
      const overlayHeight = Math.min(300, baseHeight + (this.suggestions.length * suggestionHeight));
      const overlayWidth = 320;
      
      // Calculate positions for above and below (using viewport coordinates only)
      const positionAbove = {
        top: elementRect.top - overlayHeight - 10, // 10px gap above input
        left: elementRect.left
      };
      
      const positionBelow = {
        top: elementRect.bottom + 5, // 5px gap below input  
        left: elementRect.left
      };
      
      // Check available space
      const spaceAbove = elementRect.top;
      const spaceBelow = viewportHeight - elementRect.bottom;
      
      let finalPosition;
      
      // Prefer position above if there's enough space
      if (spaceAbove >= overlayHeight + 20) {
        finalPosition = positionAbove;
      } 
      // If not enough space above but enough below, use below
      else if (spaceBelow >= overlayHeight + 20) {
        finalPosition = positionBelow;
      }
      // If neither has enough space, use whichever has more space
      else {
        finalPosition = spaceAbove >= spaceBelow ? positionAbove : positionBelow;
      }
      
      // Adjust horizontal position to stay in viewport
      if (finalPosition.left + overlayWidth > viewportWidth) {
        finalPosition.left = viewportWidth - overlayWidth - 10;
      }
      
      // Ensure we don't go off the left edge
      if (finalPosition.left < 0) {
        finalPosition.left = 10;
      }
      
      // Ensure we don't go off the top edge  
      if (finalPosition.top < 0) {
        finalPosition.top = 10;
      }
      
      this.overlay.style.top = finalPosition.top + 'px';
      this.overlay.style.left = finalPosition.left + 'px';
    } catch (error) {
      console.warn('Error positioning overlay:', error);
      
      // Fallback: position near top of viewport
      this.overlay.style.top = '100px';
      this.overlay.style.left = '100px';
    }
  }

  hideOverlay() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }

  resetState() {
    this.currentInput = '';
    this.suggestions = [];
    this.selectedSuggestionIndex = 0;
    this.isComposing = false;
    this.currentElement = null;
    this.hideOverlay();
  }
}

// Create global IME instance
const kazakhIME = new KazakhIME();
