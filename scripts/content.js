// Content script for Mendix page monitoring
(function() {
  'use strict';

  const CONFIG = {
    SELECTORS: {
      PROJECT_INFO: 'h5.mx-name-text1'
    },
    MESSAGES: {
      UPDATE_INFO: 'updateInfo'
    },
    REGEX: {
      PR_NUMBER: /PR\d+/
    }
  };

  /**
   * Extracts and formats project information from the page
   * @returns {string} HTML formatted project info
   */
  function getFormattedInfo() {
    const elements = document.querySelectorAll(CONFIG.SELECTORS.PROJECT_INFO);
    
    if (!elements.length) {
      return '<p><span>Geen project geselecteerd</span></p>';
    }
    
    return Array.from(elements).map(lineEl => {
      const line = lineEl.textContent.trim();
      const prMatch = line.match(CONFIG.REGEX.PR_NUMBER);
      
      if (prMatch) {
        const prNumber = prMatch[0];
        const description = line.replace(prNumber + ' | ', '');
        return `<p><span class="highlight">${prNumber}</span> | ${description}</p>`;
      }
      
      return `<p>${line}</p>`;
    }).join('');
  }

  /**
   * Sends project info to the extension
   */
  function sendProjectInfo() {
    try {
      const info = getFormattedInfo();
      chrome.runtime.sendMessage({ 
        action: CONFIG.MESSAGES.UPDATE_INFO, 
        data: info 
      });
    } catch (error) {
      console.error('[Hanab] Error sending project info:', error);
    }
  }

  /**
   * Sets up mutation observer to watch for page changes
   */
  function initializeObserver() {
    const observer = new MutationObserver(() => {
      sendProjectInfo();
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    console.log('[Hanab] Content script initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeObserver();
      sendProjectInfo();
    });
  } else {
    initializeObserver();
    sendProjectInfo();
  }
})();

