/**
 * Updates the panel header with current tab info
 */
async function updatePanel() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.warn('[Hanab UI] No active tab found');
      return;
    }

    this.currentTab = tab;

    const panelTitle = document.getElementById(CONFIG.SELECTORS.PANEL_TITLE);
    const panelInfo = document.getElementById(CONFIG.SELECTORS.PANEL_INFO);
    const panelCard = document.getElementById(CONFIG.SELECTORS.PANEL_CARD);

    if (panelTitle && panelInfo && panelCard) {
      // Extract hostname from URL
      const url = new URL(tab.url);
      const hostname = url.hostname;

      console.log(hostname);
      
      panelCard.style.background = '#e0f7fa';
      panelTitle.textContent = 'Hanab – VWT Workflow';
      panelInfo.innerHTML = `Je bevindt je op: <span class="highlight">${this.escapeHtml(hostname)}</span>`;
    }
  } catch (error) {
    console.error('[Hanab UI] Error updating panel:', error);
  }
}
updatePanel();
chrome.tabs.onUpdated.addListener(updatePanel);