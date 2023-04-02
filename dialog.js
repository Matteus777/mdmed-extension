
var laudo;
var doc = JSON.parse(laudo);
var idArray = doc.formData['DigitalSignatureForm[document]'];

const xhr = new XMLHttpRequest();
xhr.open('HEAD', `//api.mdmed.clinic/report/main/medical-docs/view/${idArray[0]}`, true);
xhr.onreadystatechange = function() {
  if (this.readyState === this.DONE) {
    if (this.status === 200) {
      const contentDisposition = xhr.getResponseHeader('content-disposition');
      const fileNameRegex = /filename[^;=\n]*=(([\'"]).*?\2|[^;\n]*)/;
      const matches = fileNameRegex.exec(contentDisposition);
      const fileName = matches != null && matches[1] ? matches[1].replace(/['"]/g, '') : 'file.pdf';
      const url = xhr.responseURL;
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      console.error('Error fetching PDF file:', xhr.statusText);
    }
  }
};
xhr.send();
console.log(window.location.href);
fetch(chrome.runtime.getURL("dialog.html")).then().then((response) => response.text()).then((html) => {
  console.log(laudo);



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

  const uploadScren = document.getElementById("uploadScren")
  const uploadImage = document.getElementById('uploadImage')
  const uploadedImages = document.getElementById('image-upload')
  const imagesTable = document.getElementById('image-table')
  const imagesForm = document.getElementById('upload-form')
  function addNewRow(filename) {
    let newRow = imagesTable.insertRow(imagesTable.rows.length)
    let filenameCell = newRow.insertCell(0);
    let deleteCell = newRow.insertCell(1);

    filenameCell.innerHTML = filename;

    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Deletar";
    deleteButton.onclick = function () {
      imagesTable.deleteRow(newRow.rowIndex);
    };
    deleteCell.appendChild(deleteButton);
  }
  uploadedImages.onchange = function () {
    var filename = this.value.split('\\').pop();
    addNewRow(filename);
  }
  uploadImage.addEventListener('click', () => {
    const imagesInput = uploadedImages;
    const images = imagesInput.files;

    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
      formData.append('images[]', images[i])
    }

  });

});

