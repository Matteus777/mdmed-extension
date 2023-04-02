function myFunction(param1) {
  laudo = param1;
}
var cookie;
function sendSession(param) {
  cookie = param
}
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.method == "POST" && details.requestBody) {
      (async () => {
        const [tab] = await chrome.tabs.query({ active: true });
        fetch(`https://api.mdmed.clinic/report/main/medical-docs/view/38181788`, {
          method: 'GET',
          headers: {
            'Cookie': cookie,

          },
          redirect: 'follow',
        }).then((res) => res.blob())
          .then((data) => {

            var reader = new FileReader();
            reader.readAsDataURL(data);
            reader.onloadend = function () {
              var base64data = reader.result;

              chrome.scripting.executeScript({
                args: [base64data],
                target: { tabId: tab.id },
                func: myFunction
              });
            }
          })
          .catch((error) => { console.error(error) });
      })();
    }
  },
  { urls: ["https://api.mdmed.clinic/report/main/medical-docs/digital-signature-request"] },
  ["requestBody"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (details.method == "POST") {
      var header = details.requestHeaders.filter((data) => data.name.toLowerCase() == 'cookie');
      let cookie = header[0].value;
      (async () => {
        const [tab] = await chrome.tabs.query({ active: true });
        chrome.scripting.executeScript({
          args: [cookie],
          target: { tabId: tab.id },
          func: sendSession
        });
      })();
    }
  },
  { urls: ["https://api.mdmed.clinic/report/main/medical-docs/digital-signature-request"] },
  ["requestHeaders", "extraHeaders"]
);


chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (details.method == 'POST') {
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
    }

  },
  { urls: ["https://api.mdmed.clinic/report/main/medical-docs/digital-signature-request"] },

);

