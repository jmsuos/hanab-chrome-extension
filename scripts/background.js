/**
 * Background Service Worker for Hanab Extension
 * Manages side panel behavior based on active URL
 */

const CONFIG = {
    ORIGINS: {
        MENDIX: 'vwtworkflow.mendixcloud.com',
        WOW: 'mijn.wowportaal.nl',
        DYNAMICS: '4psconstruct.bc.dynamics.com'
    },
    PAGES: {
        MENDIX: 'workflow.html',
        WOW: 'wow.html',
        DYNAMICS: '4ps.html'  // Use same UI as Mendix for now
    }
};

/**
 * Enable side panel to open on action click
 */
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('[Hanab] Error setting panel behavior:', error));

/**
 * Handle tab updates to show/hide appropriate side panel
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only process when URL is available
    if (!tab.url) return;

    try {
        const url = new URL(tab.url);
        const hostname = url.hostname;

        console.log('[Hanab] Tab updated:', hostname);

        // Determine which side panel to show
        let panelPath = null;

        if (hostname === CONFIG.ORIGINS.MENDIX) {
            panelPath = CONFIG.PAGES.MENDIX;
        } else if (hostname === CONFIG.ORIGINS.WOW) {
            panelPath = CONFIG.PAGES.WOW;
        } else if (hostname === CONFIG.ORIGINS.DYNAMICS) {
            panelPath = CONFIG.PAGES.DYNAMICS;
        }

        // Set side panel options and enable/disable icon
        if (panelPath) {
            await chrome.sidePanel.setOptions({
                tabId,
                path: panelPath,
                enabled: true
            });
            
            // Enable the extension icon
            await chrome.action.enable(tabId);
            await chrome.action.setTitle({
                tabId,
                title: 'Open Hanab Side Panel'
            });
            
            console.log(`[Hanab] Side panel enabled: ${panelPath}`);
        } else {
            // Disable side panel on other sites
            await chrome.sidePanel.setOptions({
                tabId,
                enabled: false
            });
            
            // Disable (grey out) the extension icon
            await chrome.action.disable(tabId);
            await chrome.action.setTitle({
                tabId,
                title: 'Hanab - Niet beschikbaar op deze website'
            });
            
            console.log('[Hanab] Side panel disabled');
        }
    } catch (error) {
        console.error('[Hanab] Error handling tab update:', error);
    }
});

/**
 * Handle tab activation (switching between tabs)
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        
        if (!tab.url) return;
        
        const url = new URL(tab.url);
        const hostname = url.hostname;
        
        // Check if current tab should have extension enabled
        const isSupported = hostname === CONFIG.ORIGINS.MENDIX || 
                           hostname === CONFIG.ORIGINS.WOW || 
                           hostname === CONFIG.ORIGINS.DYNAMICS;
        
        if (isSupported) {
            await chrome.action.enable(activeInfo.tabId);
            await chrome.action.setTitle({
                tabId: activeInfo.tabId,
                title: 'Open Hanab Side Panel'
            });
        } else {
            await chrome.action.disable(activeInfo.tabId);
            await chrome.action.setTitle({
                tabId: activeInfo.tabId,
                title: 'Hanab - Niet beschikbaar op deze website'
            });
        }
    } catch (error) {
        console.error('[Hanab] Error handling tab activation:', error);
    }
});

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Hanab] Extension installed:', details.reason);

    if (details.reason === 'install') {
        console.log('[Hanab] First time installation');
    } else if (details.reason === 'update') {
        console.log('[Hanab] Extension updated from', details.previousVersion);
    }
});

/**
 * Handle messages from content scripts or UI
 */
chrome.runtime.onMessage.addListener((request, sender) => {
    console.log('[Hanab] Message received:', request.action, 'from:', sender.tab?.url || 'extension');

    // Handle different message types if needed
    if (request.action === 'error') {
        console.error('[Hanab] Error from content script:', request.data);
    }

    return false;
});