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
    let wppIcon = document.createElement('button');
    wppIcon.innerText = 'Enviar via Whatsapp';
    wppIcon.style = 'margin-left:30px;background-color:green;color:white;border:none;border-radius:8px;padding:8px;';

    let divParent = elements[i].parentNode.parentNode.parentNode
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
      const requestOptions = {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic QUMwOTljMTU5YjA2ZmYyZjE3NTQxZGE4MGIyZDk4NGM0MTo4ZTUxNjU4MTRhNWFiZjI1YjUyZTA3ZjQ0NWYyZGJmNg==`,
        }),
        body: new URLSearchParams({
          'From': 'whatsapp:+14155238886',
          'To': `whatsapp:+55${correctPhone}`,
          'MediaUrl': laudoLink,
        })
      };
      fetch(`https://api.twilio.com/2010-04-01/Accounts/AC099c159b06ff2f17541da80b2d984c41/Messages.json`, requestOptions)
        .then(data => {
          data.text()
        }).then(
          response => {
            console.log(response)
          }
        )
        .catch(error => {
          console.error(error)
        });

      const imagesInput = uploadedImages;
      const images = imagesInput.files;

      for (let i = 0; i < images.length; i++) {
        let reader = new FileReader();
        reader.readAsDataURL(images[i]);
        reader.onloadend = function () {
          var base64data = reader.result;
          var formData = new FormData();
          formData.append('image', base64data.split(',')[1]);

          // Display the key/value pairs
          for (var pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
          }
          fetch(`https://api.imgbb.com/1/upload?expiration=600&key=${apiKey}`, {
            method: 'POST',
            redirect: 'follow',
            body: formData,
          })
            .then(response => response.json())
            .then(data => {
              const requestOptions = {
                method: 'POST',
                headers: new Headers({
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Authorization': `Basic QUMwOTljMTU5YjA2ZmYyZjE3NTQxZGE4MGIyZDk4NGM0MTo4ZTUxNjU4MTRhNWFiZjI1YjUyZTA3ZjQ0NWYyZGJmNg==`,
                }),
                body: new URLSearchParams({
                  'From': 'whatsapp:+14155238886',
                  'To': `whatsapp:+55${correctPhone}`,
                  'MediaUrl': data.data.url,
                  'Body': `Hello there ${correctPhone} teste`
                })
              };
              fetch(`https://api.twilio.com/2010-04-01/Accounts/AC099c159b06ff2f17541da80b2d984c41/Messages.json`, requestOptions)
                .then(data => {
                  data.text()
                }).then(
                  response => {
                    console.log(response)
                  }
                )
                .catch(error => {
                  console.error(error)
                });
              // O URL da imagem estará disponível em 
            })
            .catch(error => {
              console.error(error);
            });
        }


      }

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

