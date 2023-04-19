

var cookie;
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["dialog.js"]
    });
  }
});


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
