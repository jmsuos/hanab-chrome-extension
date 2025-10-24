// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
/**
 * Background Service Worker for Hanab Extension
 * Manages side panel behavior based on active URL
 */

const CONFIG = {
  ORIGINS: {
    MENDIX: 'vwtworkflow.mendixcloud.com',
    WOW: 'mijn.wowportaal.nl'
  },
  PAGES: {
    MENDIX: 'mendix.html',
    WOW: 'wow.html'
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
    }

    // Set side panel options
    if (panelPath) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: panelPath,
        enabled: true
      });
      console.log(`[Hanab] Side panel enabled: ${panelPath}`);
    } else {
      // Disable side panel on other sites
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
      });
      console.log('[Hanab] Side panel disabled');
    }
  } catch (error) {
    console.error('[Hanab] Error handling tab update:', error);
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