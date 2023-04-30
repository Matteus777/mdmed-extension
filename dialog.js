var ACCESS_TOKEN = 'sl.Bdd1yTa793klkxGB0-688N08EYR0PhPXIGbDSO-06Qy18ZNqAnDgeqNBw--nV5s5nnpWg3skKdmEnyZZT84_7EK7Z1CBsOlNgAKcusZ8xF5Gz7bSXUsmLQd9r_tieLeQ9UQEvHd1'
function addLocationObserver(callback) {

  // Options for the observer (which mutations to observe)
  const config = { attributes: false, childList: true, subtree: false }

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback)

  // Start observing the target node for configured mutations
  observer.observe(document.body, config)
}

function observerCallback() {

  if (window.location.href.startsWith('https://mdmed.clinic/main/medical-history/view/')) {
    initContentScript()
  }
}

addLocationObserver(observerCallback)
observerCallback()

function initContentScript() {


  var laudoLink;
  function waitForElm(selector) {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }
  waitForElm('.medical-history-row').then(async (elm) => {
    let rows = document.getElementsByClassName('medical-history-row');
    let icons = [];
    for (let i = 0; i < rows.length; i++) {
      icons = document.getElementsByClassName('icon-feather-check-circle');
    }
    if (icons) await loadIcons(icons)
  });
  async function loadIcons(elements) {
    for (let i = 0; i < elements.length; i++) {
      let divParent = elements[i].parentNode.parentNode.parentNode
      let checkIcon = divParent.querySelector(`#btn${i}`);
      if (checkIcon) continue;
      let wppIcon = document.createElement('button');
      wppIcon.id = 'btn' + i;
      wppIcon.innerText = 'Enviar via Whatsapp';
      wppIcon.style = 'margin-left:30px;background-color:green;color:white;border:none;border-radius:8px;padding:8px;';

      let redirectTag = divParent.querySelector(".dropdown__button");
      redirectTag.click();
      await new Promise(r => setTimeout(r, 500));

      let dialog = divParent.querySelector('.dropdown__menu');
      let link = dialog.querySelector('a');
      let tagTarget = link.getAttribute('target');
      let id = tagTarget.split('-')[1]
      wppIcon.onclick = (async () => {
        const { laudoBase64 } = await chrome.runtime.sendMessage({ type: "id", data: id });
        // do something with response here, not outside the function
        laudoLink = laudoBase64
        openDialog(laudoBase64)
      });
      redirectTag.click();

      divParent.appendChild(wppIcon);

    }
  }

  function openDialog(base64) {
    fetch(chrome.runtime.getURL("dialog.html")).then().then((response) => response.text()).then((html) => {
      let dialog = document.createElement('div');
      dialog.innerHTML = html;
      dialog.style.position = 'fixed';
      dialog.style.top = '50%';
      dialog.style.left = '50%';
      dialog.style.transform = 'translate(-50%, -50%)';
      dialog.style.zIndex = '9999';
      dialog.style.background = '#fff';
      dialog.style.border = '1px solid #000';
      dialog.style.padding = '10px';

      document.body.appendChild(dialog);
      let closeBtn = dialog.querySelector('#close');
      closeBtn.addEventListener('click', function () {
        document.body.removeChild(dialog);
      });

      const uploadedImages = document.getElementById('image-upload')
      const imagesTable = document.getElementById('image-table')
      const elementLaudo = document.getElementById('laudo')
      const phone = document.getElementById('phone')
      const sendPhoneBtn = document.getElementById('enviarBtn')

      elementLaudo.src = base64 + '#toolbar=0&view=FitH&scrollbar=0';
      function checkPhoneNumber(phoneString) {
        if (phoneString.length == 11) {
          const checkedPhone = phoneString.substring(0, 2) + phoneString.substring(3);
          return checkedPhone;
        }
        return phoneString;
      }
      sendPhoneBtn.addEventListener('click', () => {
        const correctPhone = checkPhoneNumber(phone.value);
        let apiKey = '57c6239e2bf579634b0919191f6da387';
        const imagesInput = uploadedImages;
        const images = imagesInput.files;
        fetch(base64)
          .then(res => res.blob())
          .then(buffer => {
            let laudo = new File([buffer], "laudo.pdf");
            let myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${ACCESS_TOKEN}`);
            myHeaders.append("Content-Type", "application/octet-stream");
            myHeaders.append("Dropbox-API-Arg", "{\"autorename\":true,\"mode\":\"add\",\"mute\":false,\"path\":\"/" + correctPhone + "/" + laudo.name + "\",\"strict_conflict\":false}");
            let requestOptions = {
              method: 'POST',
              headers: myHeaders,
              body: laudo,
              redirect: 'follow'
            };
            fetch("https://content.dropboxapi.com/2/files/upload", requestOptions)
              .then(response => response.text())
              .then(result => console.log(result))
              .catch(error => console.log('error', error))
          })
          .catch(err => console.error(err));
        for (let i = 0; i < images.length; i++) {
          let file = images[i]
          let myHeaders = new Headers();
          myHeaders.append("Authorization", `Bearer ${ACCESS_TOKEN}`);
          myHeaders.append("Content-Type", "application/octet-stream");
          myHeaders.append("Dropbox-API-Arg", "{\"autorename\":true,\"mode\":\"add\",\"mute\":false,\"path\":\"/" + correctPhone + "/" + file.name + "\",\"strict_conflict\":false}");
          let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: file,
            redirect: 'follow'
          };
          fetch("https://content.dropboxapi.com/2/files/upload", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error))


        }
        fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: `/${correctPhone}`,
            settings: {
              access: "viewer",
              allow_download: true,
              audience: "public",
              requested_visibility: "public"
          }
          })
        })
          .then(response => response.json())
          .then(data => {
            requestOptions = {
              method: 'POST',
              headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic QUNiODQ0OTdkYmZkOTcxMmE5YWYzNTA1ODFkODdkN2FiMzoyNTgwOWZjNzBjMDgwYzliZDJmNjE4MzUyNWM4N2NiNw==`,
              }),
              body: new URLSearchParams({
                'From': 'whatsapp:+555199150305',
                'To': `whatsapp:+55${correctPhone}`,
                'Body': `Acesse o link para ter acesso ao seu laudo e imagens ${data.url??", link ja enviado anteriormente."}`
              })
            };
            fetch(`https://api.twilio.com/2010-04-01/Accounts/ACb84497dbfd9712a9af350581d87d7ab3/Messages.json`, requestOptions)
              .then(data => {
                data.text()
              }).then(
                response => {
                  alert("Mensagem enviada!");
                }
              )
              .catch(error => {
                console.error(error)
              });
          })
          .catch(error => console.error(error));

      })

      function addNewRow(filename) {
        let newRow = imagesTable.insertRow(imagesTable.rows.length)
        let filenameCell = newRow.insertCell(0);

        filenameCell.innerHTML = filename;

      }
      function clearTable() {
        var tableHeaderRowCount = 1;
        var table = document.getElementById('image-table');
        var rowCount = table.rows.length;
        for (var i = tableHeaderRowCount; i < rowCount; i++) {
          table.deleteRow(tableHeaderRowCount);
        }
      }

      uploadedImages.onchange = function (evt) {
        clearTable()
        for (let i = 0; i < evt.target.files.length; i++) {
          addNewRow(evt.target.files[i].name);
        }
      }



    });


  }

}