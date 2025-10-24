// Configuration constants for the extension
const CONFIG = {
    ORIGINS: {
        MENDIX: 'vwtworkflow.mendixcloud.com',
        WOW: 'mijn.wowportaal.nl'
    },

    SELECTORS: {
        MENDIX: {
            PROJECT_INFO: 'h5.mx-name-text1',
            DOCUMENT_ROWS: 'tr[class*="mx-name-index-"]',
            SELECTS: 'select'
        }
    },

    MESSAGES: {
        UPDATE_INFO: 'updateInfo',
        ERROR: 'error'
    },

    REGEX: {
        PR_NUMBER: /PR\d+/
    }
};

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}