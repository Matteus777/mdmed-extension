function myFunction(param1) {
  laudo = param1;
}
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.method == "POST" && details.requestBody) {
      (async () => {
        const [tab] = await chrome.tabs.query({ active: true });
        chrome.scripting.executeScript({
          args: [JSON.stringify(details.requestBody)],
          target: { tabId: tab.id },
          func: myFunction
        });
      })();
    }
  },
  { urls: ["https://api.mdmed.clinic/report/main/medical-docs/digital-signature-request"] },
  ["requestBody"]
);

chrome.webRequest.onCompleted.addListener(
  function (details) {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true });

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['dialog.js']
      });

    })();
    console.log(JSON.stringify(details));
    if (details.statusCode == 200 || details.statusCode == 201) {
    }
  },
  { urls: ["https://api.mdmed.clinic/report/main/medical-docs/digital-signature-request"] },

);

