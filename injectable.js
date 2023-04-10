

var cookie;

chrome.webRequest.onBeforeSendHeaders.addListener(
  async function (details) {
    if (details.method == "POST") {
      var header = details.requestHeaders.filter((data) => data.name.toLowerCase() == 'cookie');
      cookie = header[0].value;
    }
    const [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["dialog.js"]
    });
  },
  { urls: ["https://api.mdmed.clinic/main/patients/load/*"] },
  ["requestHeaders", "extraHeaders"]
);

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type === "id") {      
      (async () => {
        fetch(`https://api.mdmed.clinic/report/main/medical-docs/view/${request.data}`, {
          method: 'GET',
          headers: {
            'Cookie': cookie,

          },
          redirect: 'follow',
        }).then((res) =>
          sendResponse({ laudoBase64: res.url })
        ).catch((error) => { sendResponse({ laudoBase64: base64data }); });
      })();
    }
    return true
  }
);
