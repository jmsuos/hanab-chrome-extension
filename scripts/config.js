/**
 * Configuration constants for Hanab Extension
 * Centralized configuration to avoid magic strings
 */

const CONFIG = {
    // Supported origins
    ORIGINS: {
        MENDIX: 'vwtworkflow.mendixcloud.com',
        WOW: 'mijn.wowportaal.nl',
        DYNAMICS: '4psconstruct.bc.dynamics.com'
    },

    // Page paths
    PAGES: {
        MENDIX: 'workflow.html',
        WOW: 'wow.html',
        DYNAMICS: '4ps.html'  // Create this file
    },

    // DOM selectors for Mendix page
    SELECTORS: {
        MENDIX: {
            PROJECT_INFO: 'h5.mx-name-text1',
            DOCUMENT_ROWS: 'tr[class*="mx-name-index-"]',
            SELECTS: 'select'
        }
    },

    // Message types for chrome.runtime communication
    MESSAGES: {
        UPDATE_INFO: 'updateInfo',
        ERROR: 'error',
        LOG: 'log'
    },

    // Regular expressions
    REGEX: {
        PR_NUMBER: /PR\d+/
    },

    // UI element IDs
    UI: {
        PANEL_TITLE: 'panelTitle',
        PANEL_INFO: 'panelInfo',
        PANEL_CARD: 'panelCard',
        PROJECT_CONTAINER: 'project',
        TAB_BUTTONS: '.tab-button',
        TAB_PANES: '.tab-pane'
    },

    // Button IDs
    BUTTONS: {
        SELECT_ALL_DOCS: 'selectAllDocuments',
        SET_ALL_YES: 'setAllYes',
        SET_ALL_NO: 'setAllNo'
    },

    // Excel handler settings
    EXCEL: {
        MAX_PREVIEW_ROWS: 10,
        VALID_TYPES: [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        VALID_EXTENSIONS: /\.(xls|xlsx)$/i
    }
};

// Make it available globally for browser context
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Make it available for Node.js context (if needed for testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}