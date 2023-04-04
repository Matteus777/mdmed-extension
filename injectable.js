
var cookie;

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (details.method == "POST") {
      var header = details.requestHeaders.filter((data) => data.name.toLowerCase() == 'cookie');
      cookie = header[0].value;
    }
  },
  { urls: ["https://api.mdmed.clinic/main/patients/load/*"] },
  ["requestHeaders", "extraHeaders"]
);

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type === "id") {
      console.log(request.data);
      console.log(cookie);
      (async () => {
        fetch(`https://api.mdmed.clinic/report/main/medical-docs/view/${request.data}`, {
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
              sendResponse({ laudoBase64: base64data });
            }
          })
          .catch((error) => {  sendResponse({ laudoBase64: base64data });});
      })();
    }
    return true
  }
);
