# Kazakh IME - Russian to Kazakh Input Method Engine

## Disclaimer: this project was completely vibe-coded by DeepSeek, because I was too lazy to code this and fix annoying bugs in the frontend on my own. But I tested (still testing) the extension by myself.

A Firefox browser extension that provides an Input Method Engine (IME) for converting Russian phonetic input to Kazakh language. This extension allows users to type Russian characters and get Kazakh word suggestions in real-time.

## 🌟 Features

- **Real-time Conversion**: Type Russian characters and get instant Kazakh word suggestions
- **Smart Suggestions**: Uses phonetic mapping to generate accurate Kazakh word candidates
- **Beautiful Interface**: Modern, clean overlay with smooth animations
- **Intuitive Controls**: Easy-to-use keyboard shortcuts for navigation and selection
- **Non-intrusive**: Works only when enabled and doesn't interfere with normal browser operation

## ⌨️ Keyboard Controls

| Key | Action |
|-----|--------|
| **Letters** | Start/compose Kazakh words |
| **Space** | Accept current suggestion (when available) |
| **Enter** | Commit current input as-is |
| **Escape** | Cancel composition |
| **↑/↓** | Navigate through suggestions |
| **Tab** | Cycle through suggestions |
| **Backspace** | Delete characters |
| **Ctrl+Shift+K** | Toggle IME on/off |

## 🏗️ Project Structure

```
kazakh-ime-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background script for command handling
├── content.js            # Content script for input detection
├── ime-engine.js         # Main IME logic and overlay
├── index.html            # Test file to test capabilities of the extension
├── dictionary.js         # Phonetic mapping and word generation
├── wordbank.js           # Kazakh vocabulary database
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── icons/                # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md             # This file
```

## 📁 File Descriptions

### Core Files

- **manifest.json**: Extension configuration including permissions, content scripts, and commands
- **background.js**: Handles browser commands and extension state management
- **content.js**: Injected into web pages, detects input fields and forwards key events
- **ime-engine.js**: Main IME class handling composition, suggestions, and overlay display

### Logic Files

- **dictionary.js**: Contains phonetic mapping rules and candidate generation algorithms
- **wordbank.js**: Set of valid Kazakh words used for suggestion validation, currently uses [Hunspell-kk](https://github.com/taem/hunspell-kk)

### UI Files

- **popup.html/popup.js**: Browser action popup for toggling and status display
- **icons/**: Various sized icons for the extension

## 🔧 How It Works

### 1. Input Detection
The content script detects when users focus on text inputs, textareas, or contenteditable elements.

### 2. Phonetic Conversion
When typing Russian characters, the extension:
- Applies phonetic mapping rules (e.g., `а` → `а` or `ә`)
- Generates all possible Kazakh word combinations
- Validates against the Kazakh wordbank

### 3. Suggestion Display
- Shows real-time suggestions in a positioned overlay
- Allows navigation with arrow keys and Tab
- Commits selections with Space or Enter

### 4. Smart Positioning
The overlay intelligently positions itself:
- Prefers above the input field
- Falls back to below if space is limited
- Stays within viewport boundaries

## 🚀 Installation

### Method 1: Temporary Installation (Development)

1. **Clone or download** this repository
2. **Open Firefox** and navigate to `about:debugging`
3. **Click "This Firefox"** in the left sidebar
4. **Click "Load Temporary Add-on"**
5. **Select the `manifest.json`** file from the extension folder
6. **If using Private Browsing**: go to `about:addons`, find the extension and allow it to run in Private Mode.

### Method 2: Permanent Installation

1. **Package the extension**:
   ```bash
   zip -r kazakh-ime-extension.zip . -x "*.git*" "README.md" "*.DS_Store" "index.html"
   ```

2. **Install in Firefox**:
   - Go to `about:addons`
   - Click the gear icon → "Install Add-on From File"
   - Select the ZIP file

## 🛠️ Development

### Prerequisites
- Basic understanding of JavaScript
- Firefox browser
- Text editor or IDE

### Modifying the Extension

1. **Add new words**: Edit `wordbank.js` to include more Kazakh vocabulary
2. **Adjust phonetic rules**: Modify `PHONETIC_MAPPING` in `dictionary.js`
3. **Change styling**: Update the inline styles in `ime-engine.js`
4. **Add features**: Extend the `KazakhIME` class in `ime-engine.js`

### Testing
Test the extension on various websites:
- Google Docs
- Gmail
- Social media platforms
- Any text input fields

##### Known bugs
For now known to not work on Google Search. Maybe somewhere else.

## 🌍 Language Support

### Currently Supported
- **Input**: Russian Cyrillic characters
- **Output**: Kazakh Cyrillic characters with specific Kazakh letters (ә, ғ, қ, ң, ө, ұ, ү, і, һ)

### Phonetic Mapping Examples
- `а` → `а` or `ә`
- `е` → `е` or `ә` 
- `к` → `к` or `қ`
- `г` → `г` or `ғ`
- `н` → `н` or `ң`
- `у` → `у`, `ү`, or `ұ`

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Expand the wordbank** with more Kazakh words
2. **Improve phonetic rules** for better accuracy
3. **Add new features** like custom dictionaries
4. **Fix bugs** and improve performance
5. **Translate** the interface to other languages

### Reporting Issues
Please report bugs and feature requests on the GitHub Issues page.

## 📝 License

This project is open source. Feel free to use, modify, and distribute as needed.

## 🙏 Acknowledgments

- Thanks to the [Hunspell-kk](https://github.com/taem/hunspell-kk) for wordbank of kazakh words!
- DeepSeek's Deep Thinking capabilities, making this year long project possible in one day

## 🔮 Future Enhancements

- [ ] User-customizable dictionaries
- [ ] Support for and from Qazaq latin
- [ ] Learning user typing patterns
- [ ] Statistical ranking of suggestions (maybe)

---

**Note**: This extension is designed for users familiar with both Russian and Kazakh languages, providing a smooth transition between phonetic Russian input and proper Kazakh output.
