
var laudo;

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

  
  const uploadScren = document.getElementById("uploadScren")
  const uploadImage = document.getElementById('uploadImage')
  const uploadedImages = document.getElementById('image-upload')
  const imagesTable = document.getElementById('image-table')
  const imagesForm = document.getElementById('upload-form')
  const elementLaudo = document.getElementById('laudo')
  elementLaudo.src =  laudo;
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

