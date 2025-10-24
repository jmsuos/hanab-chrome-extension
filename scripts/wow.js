async function updatePanel() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  const panelTitle = document.getElementById("panelTitle");
  const panelInfo = document.getElementById("panelInfo");
  const panelCard = document.getElementById("panelCard");
  const url = new URL(tab.url);
  const hostname = url.hostname;
  if (hostname === "vwtworkflow.mendixcloud.com") {
    panelCard.style.background = "#e0f7fa";
    panelTitle.textContent = "Hanab – VWT Workflow";
    panelInfo.innerHTML = `Je bevindt je op <span class="highlight">${hostname}</span><br>URL: <span class="highlight">${tab.url}</span>`;
  } else if (hostname === "mijn.wowportaal.nl" && url.pathname.startsWith("/GIS/WoWWorkplace")) {
    panelCard.style.background = "#fffde7";
    panelTitle.textContent = "Hanab – WoW Workplace";
    panelInfo.innerHTML = `Je bevindt je op <span class="highlight">${hostname}</span><br>URL: <span class="highlight">${tab.url}</span>`;
  } else {
    panelCard.style.background = "white";
    panelTitle.textContent = "Hanab – terugval";
    panelInfo.innerHTML = `Geen specifieke inhoud voor deze site.<br>URL: <span class="highlight">${tab.url}</span>`;
  }
}
updatePanel();
chrome.tabs.onUpdated.addListener(updatePanel);