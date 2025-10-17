function getFormattedInfo() {
  const elements = document.querySelectorAll('h5.mx-name-text1');
  return Array.from(elements).map(lineEl => {
    const line = lineEl.textContent;
    const prMatch = line.match(/PR\d+/);
    if (prMatch) {
      return `<p><span class="highlight">${prMatch[0]}</span> | ${line.replace(prMatch[0] + ' | ', '')}</p>`;
    } else {
      return `<p>${line}</p>`;
    }
  }).join('');
}

// Observe changes in the page
const targetNode = document.body;
const observerConfig = { childList: true, subtree: true };

const observer = new MutationObserver(() => {
  const info = getFormattedInfo();
  // Send the updated info to the popup if needed
  chrome.runtime.sendMessage({ action: "updateInfo", data: info });
});

observer.observe(targetNode, observerConfig);

// Optional: send initial info immediately
chrome.runtime.sendMessage({ action: "updateInfo", data: getFormattedInfo() });

