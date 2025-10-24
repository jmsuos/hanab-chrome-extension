//const container = document.getElementById('project');

// Listen for updates from the content script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "updateInfo") {
    container.innerHTML = request.data;
  }
});


document.addEventListener('DOMContentLoaded', () => {

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            // Remove the active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Select the All Documents button
    const selectAllDocumentsBtn = document.getElementById('selectAllDocuments');
    if (selectAllDocumentsBtn) {
        let isSelected = false;
        
        selectAllDocumentsBtn.addEventListener('click', async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!isSelected) {
                // Selecteer alle documenten
                console.log('Selecting all documents...');
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        // Find all TR elements with class starting with mx-name-index-
                        const rows = document.querySelectorAll('tr[class*="mx-name-index-"]');

                        rows.forEach(row => {
                            // Add a 'selected' class
                            row.classList.add('selected');

                            // Trigger click event on the row
                            row.click();
                        });

                        console.log(`Selected ${rows.length} rows`);
                    }
                });
                
                selectAllDocumentsBtn.textContent = 'Deselecteer alle documenten';
                isSelected = true;
            } else {
                // Deselecteer alle documenten
                console.log('Deselecting all documents...');
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        // Find all TR elements with class starting with mx-name-index-
                        const rows = document.querySelectorAll('tr[class*="mx-name-index-"]');

                        rows.forEach(row => {
                            // Remove 'selected' class
                            row.classList.remove('selected');

                            // Trigger click event on the row to deselect
                            row.click();
                        });

                        console.log(`Deselected ${rows.length} rows`);
                    }
                });
                
                selectAllDocumentsBtn.textContent = 'Selecteer alle documenten';
                isSelected = false;
            }
        });
    }

    document.getElementById('setAllYes').addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (value) => {
                document.querySelectorAll('select').forEach(select => {
                    if (select.options.length > 0) {
                        for (let i = 0; i < select.options.length; i++) {
                            if (select.options[i].text.toLowerCase() === value.toLowerCase()) {
                                select.selectedIndex = i;
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                                break;
                            }
                        }
                    }
                });
            },
            args: ['Ja']
        });
    });

    document.getElementById('setAllNo').addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (value) => {
                document.querySelectorAll('select').forEach(select => {
                    if (select.options.length > 0) {
                        for (let i = 0; i < select.options.length; i++) {
                            if (select.options[i].text.toLowerCase() === value.toLowerCase()) {
                                select.selectedIndex = i;
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                                break;
                            }
                        }
                    }
                });
            },
            args: ['Nee']
        });
    });


    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.scripting.executeScript(
            {
                target: {tabId: tabs[0].id},
                func: () => {
                    const elements = document.querySelectorAll('h5.mx-name-text1');
                    return Array.from(elements).map(el => el.textContent);
                }
            },
            (results) => {
                const container = document.getElementById('project');
                container.innerHTML = '<p><span>Geen project geselecteerd</span></p>';
                if (results && results[0]) {
                    const rawInfo = results[0].result;

                    // Process each line
                    const formattedInfo = rawInfo.map(line => {
                        // Use regex to find PR number
                        const prMatch = line.match(/PR\d+/);
                        if (prMatch) {
                            return `<p><span class="highlight">${prMatch[0]}</span> | ${line.replace(prMatch[0] + ' | ', '')}</p>`;
                        } else {
                            return `<p>${line}</p>`;
                        }
                    });

                    const data = formattedInfo.join('');
                    if (data.length > 0) {
                        container.innerHTML = data;
                    } else {
                        container.innerHTML = '<p><span>Geen project geselecteerd</span></p>';
                    }
                }
            }
        );
    });
});