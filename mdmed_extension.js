const uploadScren = document.getElementById("uploadScren")
const openPopUp = document.getElementById('openPopUp')
const uploadImage = document.getElementById('uploadImage')
const uploadedImages = document.getElementById('images')
const imagesTable = document.getElementById('image-table')
const fileUploaded = document.getElementById('images')
const imagesForm = document.getElementById('upload-form')
const tableBody = document.querySelector('#image-table tbody')
const phone = document.getElementById('phone')
const sendPhoneBtn = document.getElementById('sendPhoneBtn')
const twilioSID = 'AC8571995fe2be6c2b7a0d783ea25b99d8'
const twilioAuthToken = 'f3e6d3dc0dc7c312d9e80cec64eba623'

sendPhoneBtn.addEventListener('click', () => {
  const correctPhone = checkPhoneNumber(phone.value);
  fetch('teste_ico.png').then(data => {console.log(data)}).then(response => { console.log(response)}).catch(error => {console.log(error)})
  const requestOptions = {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(twilioSID + ':' + twilioAuthToken)}`,
    }),
    body: new URLSearchParams({
      'From': 'whatsapp:+14155238886',
      'To': `whatsapp:+55${correctPhone}`,
      'Body': `Hello there ${correctPhone} teste`,
      'MediaUrl': 'file:///C:/devel/mdmed-extension/teste_ico.png'
    })
  };
  fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSID}/Messages.json`, requestOptions)
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
})

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

function checkPhoneNumber(phoneString){
  if(phoneString.length == 11){
    const checkedPhone = phoneString.substring(0,2) + phoneString.substring(3);
    return checkedPhone;
  }
}