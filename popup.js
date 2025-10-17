const container = document.getElementById('project');

// Listen for updates from the content script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "updateInfo") {
    container.innerHTML = request.data;
  }
});


document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          const elements = document.querySelectorAll('h5.mx-name-text1');
          return Array.from(elements).map(el => el.textContent);
        }
      },
      (results) => {
        console.log('anus');
        const container = document.getElementById('project');
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
          if(data.length > 0){
             console.log('bbanus');
            container.innerHTML = data;
          } else{
            console.log('bbbanus');
            container.innerHTML = '<p><span>Geen project geselecteerd</span></p>';    
          }
          console.log('banus');
        } else{
          console.log('canus');
        }
      }
    );
  });
});
