async function updatePanel() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  const panelTitle = document.getElementById("panelTitle");
  const panelInfo = document.getElementById("panelInfo");
  const panelCard = document.getElementById("panelCard");
  const url = new URL(tab.url);
  const hostname = url.hostname;
  panelCard.style.background = "#e0f7fa";
  panelTitle.textContent = "Hanab – VWT Workflow";
  panelInfo.innerHTML = `Je bevindt je op URL: <span class="highlight">${tab.url}</span>`;
}
updatePanel();
chrome.tabs.onUpdated.addListener(updatePanel);