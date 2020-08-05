/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
/* eslint-disable no-use-before-define */
const SDK = require('blocksdk');

const sdk = new SDK({ blockEditorWidth: 300, tabs: ['htmlblock'] });
const ContentBlockID = uuidv4();

function componentes() {
 this.imagen = function(data) {
  let html = '<table width="100%" cellspacing="0" cellpadding="0">';
  html += '<tr>';
  html += '<td align="center">';
  html += `<a href="${data.LinkUrl}"><img src="${data.Url}" width="${data.Width}" height="${data.Height}" alt="${data.AltText}" style="display: block; text-align: center;"/></a>`;
  html += '</td>';
  html += '</tr>';
  html += '</table>';
  return html;
 };
}

// eslint-disable-next-line no-undef
document.getElementById('workspace').addEventListener('input', () => {
 console.log('workspace');

 const data = getInputsData();

 sdk.setData(data);

 save(data);
});

function getInputsData() {
 let filename = '';

 if ($('#onelinkImage')[0] !== undefined) {
  if ($('#onelinkImage')[0].files[0] !== undefined) {
   filename = $('#onelinkImage')[0].files[0].name;
  }
 }
 return {
  ContentBlockID,
  filename,
  Url: $('#urlImage').val(),
  LinkID: $('#linkId').val(),
  AltText: $('#imagealt').val(),
  Width: $('#imagewidth').val(),
  Height: $('#imageheight').val(),
  LinkUrl: $('#urlLink').val(),
  LinkName: $('#onelink').val(),
  refresh_token: $('#rt').val(),
 };
}

sdk.getContent((content) => {
 sdk.setContent(content);
 sdk.setSuperContent(content);
 console.log('getContent');
 console.log(content);
});


sdk.getData(function(data) {
 this.ContentBlockID = data.contentBlockID === '' || data.contentBlockID === undefined ? uuidv4() : data.contentBlockID;
 $('#urlImage').val(data.url);
 $('#onelink').val(data.linkName);
 $('#imagealt').val(data.altText);
 $('#imagewidth').val(data.width);
 $('#imageheight').val(data.height);
 $('#urlLink').val(data.linkUrl);
 $('#linkId').val(data.linkID);
});


function save() {
 const data = getInputsData();
 console.log(data);
 // eslint-disable-next-line new-cap
 const cmp = new componentes();
 const html = cmp.imagen(data);
 sdk.setContent(html);
 sdk.setSuperContent(html);
 $('.spinner').hide();
 $('#step1').show();
}

function readURL(input) {
 if (input.files && input.files[0]) {
  // eslint-disable-next-line no-undef
  const reader = new FileReader();

  reader.onload = function(e) {
   $('#urlImage').val(e.target.result);
   save();
  };
  $('#filename').val(input.files[0].name);
  reader.readAsDataURL(input.files[0]);
  save();
 }
}

$('#onelinkImage').on('change', function() {
 readURL(this);
});

$('#urlImage').on('change', () => {
 save();
});

$('#onelink').on('change', () => {
 save();
});

$('#imagealt').on('change', () => {
 save();
});

$('#imagewidth').on('change', () => {
 save();
});

$('#imageheight').on('change', () => {
 save();
});

$('#urlLink').on('change', () => {
 save();
});

$('#linkId').on('change', () => {
 save();
});

$(() => {
 $('#previewContent').click(() => {
  $('.spinner').show();
  $('#step1').hide();
  const formData = JSON.stringify({
   name: uuidv4(),
   refresh_token: $('#rt').val(),
   fileBase64: $('#urlImage').val(),
   tssd: $('#tssd').val(),
  });
  // form_data.append('file', file_data);
  // MOSTRAR SPINNER
  $.ajax({
   url: '/sfmc/SaveImage',
   headers: {
    'Content-Type': 'application/json',
   },
   data: formData,
   method: 'POST',
   success(response) {
    $("#rt").val(response.refresh_token);
    if (response.data !== undefined && response.data !== '') {
     const objResponse = JSON.parse(response.data);

     if (objResponse.fileProperties !== undefined) {
      const imageId = objResponse.id;
      console.log(imageId);
      const { publishedURL } = objResponse.fileProperties;
      $('#urlImage').val(publishedURL);
      checkImageStatus(imageId);
     }

     if (objResponse.validationErrors !== undefined) {
      // eslint-disable-next-line no-alert
      // eslint-disable-next-line no-undef
      alert(objResponse.validationErrors[0].message);
     }
    }
    console.log(response); // display success response from the server
   },
   error(response) {
    console.log(response); // display error response from the server
   },
  });

  SaveDataExtensionRow();
 });
});

function checkImageStatus(imageId) {
 setTimeout(() => {
   $.post('/sfmc/GetImageStatus', { id: imageId, refresh_token: $('#rt').val(), tssd: $('#tssd').val() })
    .done((data) => {
     console.log('data .done', data);
     if (data.refresh_token !== undefined) {
      $('#rt').val(data.refresh_token);
     }
     const imageObj = data.body;
     if (imageObj.items !== undefined) {
      if (imageObj.items[0].status !== undefined) {
       if (imageObj.items[0].status.name !== 'Published') {
        checkImageStatus(imageId);
       } else {
        setTimeout(() => {
         save();
        }, 10000);
       }
      }
     }
    });
  },
  3000);
}

function uuidv4() {
 return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const
   v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
 });
}

function SaveDataExtensionRow() {
 const data = getInputsData();

 // eslint-disable-next-line no-unused-vars
 sdk.getData((_data) => {
  sdk.setData(getInputsData());
 });

 const link = {
  LinkID: data.LinkID,
  contentsCount: $('#contentsCount').val(),
  tssd: $('#tssd').val(),
  refresh_token: ""
 };
 data.tssd = $('#tssd').val(),
  $.ajax({
   url: '/sfmc/UpsertImageRow',
   method: 'POST',
   async: false,
   data,
   success(upsertImageRowData) {
    $("#rt").val(upsertImageRowData.refresh_token)
    link.refresh_token = upsertImageRowData.refresh_token;
    $.ajax({
     url: '/sfmc/UpsertLink',
     method: 'POST',
     async: false,
     data: link,
     success(upsertLinkData) {
      $("#rt").val(upsertLinkData.refresh_token)
      console.log(upsertLinkData);
     },
    });
   },
  });
}