/**
 * Main UI Controller for Hanab Extension
 * Manages tabs, project info, and tool actions
 */
(function() {
    'use strict';

    const CONFIG = {
        SELECTORS: {
            PANEL_TITLE: 'panelTitle',
            PANEL_INFO: 'panelInfo',
            PANEL_CARD: 'panelCard',
            PROJECT_CONTAINER: 'project',
            TAB_BUTTONS: '.tab-button',
            TAB_PANES: '.tab-pane'
        },
        BUTTONS: {
            SELECT_ALL_DOCS: 'selectAllDocuments',
            SET_ALL_YES: 'setAllYes',
            SET_ALL_NO: 'setAllNo'
        }
    };

    class HanabController {
        constructor() {
            this.currentTab = null;
            this.isDocumentsSelected = false;
            this.init();
        }

        /**
         * Initialize the controller
         */
        async init() {
            await this.updatePanel();
            this.setupMessageListener();
            this.setupTabNavigation();
            this.setupActionButtons();
            this.loadProjectInfo();

            // Listen for tab updates
            chrome.tabs.onUpdated.addListener(() => this.updatePanel());
        }

        /**
         * Updates the panel header with current tab info
         */
        async updatePanel() {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

                if (!tab) {
                    console.warn('[Hanab] No active tab found');
                    return;
                }

                this.currentTab = tab;

                const panelTitle = document.getElementById(CONFIG.SELECTORS.PANEL_TITLE);
                const panelInfo = document.getElementById(CONFIG.SELECTORS.PANEL_INFO);
                const panelCard = document.getElementById(CONFIG.SELECTORS.PANEL_CARD);

                if (panelTitle && panelInfo && panelCard) {
                    panelCard.style.background = '#e0f7fa';
                    panelTitle.textContent = 'Hanab – VWT Workflow';
                    panelInfo.innerHTML = `Je bevindt je op URL: <span class="highlight">${tab.url}</span>`;
                }
            } catch (error) {
                console.error('[Hanab] Error updating panel:', error);
            }
        }

        /**
         * Setup listener for messages from content script
         */
        setupMessageListener() {
            chrome.runtime.onMessage.addListener((request) => {
                if (request.action === 'updateInfo' && request.data) {
                    this.updateProjectContainer(request.data);
                }
            });
        }

        /**
         * Updates the project info container
         * @param {string} htmlContent - HTML content to display
         */
        updateProjectContainer(htmlContent) {
            const container = document.getElementById(CONFIG.SELECTORS.PROJECT_CONTAINER);
            if (container) {
                container.innerHTML = htmlContent;
            }
        }

        /**
         * Setup tab navigation
         */
        setupTabNavigation() {
            const tabButtons = document.querySelectorAll(CONFIG.SELECTORS.TAB_BUTTONS);
            const tabPanes = document.querySelectorAll(CONFIG.SELECTORS.TAB_PANES);

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.getAttribute('data-tab');

                    // Remove active class from all
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabPanes.forEach(pane => pane.classList.remove('active'));

                    // Add active class to selected
                    button.classList.add('active');
                    const targetPane = document.getElementById(targetTab);
                    if (targetPane) {
                        targetPane.classList.add('active');
                    }
                });
            });
        }

        /**
         * Setup action buttons
         */
        setupActionButtons() {
            this.setupSelectAllDocuments();
            this.setupSetAllYes();
            this.setupSetAllNo();
        }

        /**
         * Setup "Select All Documents" button
         */
        setupSelectAllDocuments() {
            const btn = document.getElementById(CONFIG.BUTTONS.SELECT_ALL_DOCS);
            if (!btn) return;

            btn.addEventListener('click', async () => {
                if (!this.currentTab) {
                    console.error('[Hanab] No active tab');
                    return;
                }

                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: this.currentTab.id },
                        func: (isSelected) => {
                            const rows = document.querySelectorAll('tr[class*="mx-name-index-"]');

                            rows.forEach(row => {
                                if (isSelected) {
                                    row.classList.remove('selected');
                                } else {
                                    row.classList.add('selected');
                                }
                                row.click();
                            });

                            return rows.length;
                        },
                        args: [this.isDocumentsSelected]
                    });

                    this.isDocumentsSelected = !this.isDocumentsSelected;
                    btn.textContent = this.isDocumentsSelected
                        ? 'Deselecteer alle documenten'
                        : 'Selecteer alle documenten';

                } catch (error) {
                    console.error('[Hanab] Error toggling document selection:', error);
                    alert('Fout bij het selecteren van documenten. Zorg ervoor dat je op de juiste pagina bent.');
                }
            });
        }

        /**
         * Setup "Set All Yes" button
         */
        setupSetAllYes() {
            const btn = document.getElementById(CONFIG.BUTTONS.SET_ALL_YES);
            if (!btn) return;

            btn.addEventListener('click', () => this.setAllDropdowns('Ja'));
        }

        /**
         * Setup "Set All No" button
         */
        setupSetAllNo() {
            const btn = document.getElementById(CONFIG.BUTTONS.SET_ALL_NO);
            if (!btn) return;

            btn.addEventListener('click', () => this.setAllDropdowns('Nee'));
        }

        /**
         * Set all dropdowns to a specific value
         * @param {string} value - Value to set ('Ja' or 'Nee')
         */
        async setAllDropdowns(value) {
            if (!this.currentTab) {
                console.error('[Hanab] No active tab');
                return;
            }

            try {
                await chrome.scripting.executeScript({
                    target: { tabId: this.currentTab.id },
                    func: (targetValue) => {
                        let changedCount = 0;
                        document.querySelectorAll('select').forEach(select => {
                            for (let i = 0; i < select.options.length; i++) {
                                if (select.options[i].text.toLowerCase() === targetValue.toLowerCase()) {
                                    select.selectedIndex = i;
                                    select.dispatchEvent(new Event('change', { bubbles: true }));
                                    changedCount++;
                                    break;
                                }
                            }
                        });
                        return changedCount;
                    },
                    args: [value]
                });
            } catch (error) {
                console.error(`[Hanab] Error setting dropdowns to ${value}:`, error);
                alert('Fout bij het aanpassen van dropdown menu\'s.');
            }
        }

        /**
         * Load initial project info from page
         */
        async loadProjectInfo() {
            if (!this.currentTab) return;

            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: this.currentTab.id },
                    func: () => {
                        const elements = document.querySelectorAll('h5.mx-name-text1');
                        return Array.from(elements).map(el => el.textContent.trim());
                    }
                });

                if (results && results[0] && results[0].result) {
                    const rawInfo = results[0].result;
                    const formattedInfo = this.formatProjectInfo(rawInfo);
                    this.updateProjectContainer(formattedInfo);
                }
            } catch (error) {
                console.error('[Hanab] Error loading project info:', error);
            }
        }

        /**
         * Format project info array into HTML
         * @param {string[]} infoArray - Array of project info strings
         * @returns {string} Formatted HTML
         */
        formatProjectInfo(infoArray) {
            if (!infoArray || infoArray.length === 0) {
                return '<p><span>Geen project geselecteerd</span></p>';
            }

            const formatted = infoArray.map(line => {
                const prMatch = line.match(/PR\d+/);
                if (prMatch) {
                    const prNumber = prMatch[0];
                    const description = line.replace(prNumber + ' | ', '');
                    return `<p><span class="highlight">${prNumber}</span> | ${description}</p>`;
                }
                return `<p>${line}</p>`;
            });

            return formatted.join('') || '<p><span>Geen project geselecteerd</span></p>';
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new HanabController();
        });
    } else {
        new HanabController();
    }
})();