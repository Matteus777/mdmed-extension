const uploadScren = document.getElementById("uploadScren")
const openPopUp = document.getElementById('openPopUp')
const uploadImage = document.getElementById('uploadImage')
const uploadedImages = document.getElementById('images')
const imagesTable = document.getElementById('image-table')
const fileUploaded = document.getElementById('images')
const imagesForm = document.getElementById('upload-form')
const tableBody = document.querySelector('#image-table tbody')

openPopUp.addEventListener('click', () => {
    uploadScren.showModal();
})

uploadImage.addEventListener('click', () => {
    const imagesInput = uploadedImages;
    const images = imagesInput.files;

    const formData = new FormData();
    for(let i=0; i<images.length; i++){
        formData.append('images[]', images[i])
        console.log(i)
    }


    fetch('https://api.whatsapp.com/send?phone=5548984841119&text=Hello', {
      method: 'POST',
      mode:`no-cors`
    })
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.error(error);
  });
})

function addNewRow(filename){
    var newRow = imagesTable.insertRow(imagesTable.rows.length)
    var filenameCell = newRow.insertCell(0);
    var deleteCell = newRow.insertCell(1);

    filenameCell.innerHTML = filename;


    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Deletar";
    deleteButton.onclick = function() {
        imagesTable.deleteRow(newRow.rowIndex);
    };
    deleteCell.appendChild(deleteButton);
}

uploadedImages.onchange = function() {
    var filename = this.value.split('\\').pop();
    addNewRow(filename);
}