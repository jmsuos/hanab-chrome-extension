# Hanab Chrome Extension

A Chrome extension that enhances workflow productivity on Mendix and WOW portal platforms with automation tools and Excel integration.

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Chrome](https://img.shields.io/badge/chrome-extension-green.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)

---

## 🎯 Features

### Mendix Workflow Tools
- **📊 Live Project Tracking**: Automatically displays current project information (PR numbers) from the Mendix page
- **📄 Bulk Document Selection**: Select or deselect all documents with a single click
- **✅ Quick V&G Responses**: Set all dropdown answers to "JA" or "NEE" instantly
- **📋 Tab Organization**: Organized tools across Documents, V&G, and Vergunningen tabs

### Excel Integration
- **📤 Drag & Drop Upload**: Import Excel files (.xls/.xlsx) via drag-and-drop or file selection
- **📑 Sheet Selector**: Choose which worksheet to process
- **👁️ Data Preview**: View imported data in a formatted table (first 10 rows)
- **🔒 XSS Protection**: Safe HTML rendering with proper escaping

### WOW Portal Support
- **🌐 Portal Detection**: Automatically switches interface when visiting WOW portal
- **🛠️ Extensible**: Ready for WOW-specific tools and features

---

## 🚀 Installation

### From Source (Developer Mode)

1. **Clone or download** this repository
   ```bash
   git clone <repository-url>
   cd Hanab_HTML_Extension_Dynamic
   ```

2. **Open Chrome Extensions page**
    - Navigate to `chrome://extensions/`
    - Enable **Developer mode** (toggle in top-right corner)

3. **Load the extension**
    - Click **"Load unpacked"**
    - Select the project folder

4. **Verify installation**
    - The Hanab extension icon should appear in your toolbar
    - Navigate to `vwtworkflow.mendixcloud.com` to test

---

## 📖 Usage

### Opening the Side Panel

**Method 1: Extension Icon**
- Click the Hanab icon in your Chrome toolbar

**Method 2: Keyboard Shortcut**
- Press `Ctrl+B` (Windows/Linux) or `Cmd+B` (Mac)

### Using Mendix Tools

1. **Navigate** to `vwtworkflow.mendixcloud.com`
2. **Open** the Hanab side panel
3. **View** current project info (updates automatically)
4. **Use tools**:
    - **Documenten Tab**: Bulk select/deselect documents
    - **V&G Tab**: Set all dropdowns to Yes or No
    - **Vergunningen Tab**: Coming soon

### Importing Excel Files

1. **Navigate** to the "Excel Import" card
2. **Upload** a file:
    - Drag and drop an Excel file onto the dropzone, OR
    - Click the dropzone to browse files
3. **Select** a worksheet from the dropdown
4. **Click** "Verwerken" to preview the data
5. **View** the formatted data table

---

## 🏗️ Project Structure

---

## 🔧 Technical Details

### Architecture

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Side Panel**: Context-aware UI that switches based on active URL
- **Content Scripts**: Monitor and extract data from web pages
- **Service Worker**: Manages background logic and panel routing

### Supported Platforms

- **Mendix Workflow**: `vwtworkflow.mendixcloud.com`
- **WOW Portal**: `mijn.wowportaal.nl`

### Permissions

- `sidePanel`: Display side panel UI
- `tabs`: Access active tab information
- `scripting`: Execute scripts on web pages
- `host_permissions`: Interact with Mendix and WOW domains

### Dependencies

- **SheetJS (xlsx.full.min.js)**: Excel file parsing
- **Font Awesome 6.4.0**: Icons
- **Google Fonts (Inter)**: Typography

---

## 🛠️ Development

### Code Style

- **Modular Architecture**: Each feature in its own module
- **IIFE Pattern**: Prevents global scope pollution
- **JSDoc Comments**: Comprehensive documentation
- **Error Handling**: Try-catch blocks with proper logging
- **Console Logging**: Prefixed with `[Hanab]` for easy debugging

### Adding New Features

1. **Modify HTML**: Add UI elements to `mendix.html` or `wow.html`
2. **Update Scripts**: Extend `ui-controller.js` or create new modules
3. **Test**: Reload extension and verify functionality
4. **Document**: Update this README

### Debugging

- Open Chrome DevTools for the side panel: Right-click panel → "Inspect"
- View service worker logs: `chrome://extensions/` → "Service worker" link
- Check content script logs: DevTools on the web page

---

## 📝 Configuration

Key settings are centralized in `scripts/config.js`:

```javascript
const CONFIG = {
  ORIGINS: {
    MENDIX: 'vwtworkflow.mendixcloud.com',
    WOW: 'mijn.wowportaal.nl'
  },
  SELECTORS: {
    PROJECT_INFO: 'h5.mx-name-text1',
    DOCUMENT_ROWS: 'tr[class*="mx-name-index-"]'
  },
  // ... more configuration
};
```
More to come
....