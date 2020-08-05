/* eslint-disable max-len */
/* eslint-disable no-loop-func */
/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-undef */

function getUrlParameters() {
 const url = new URL(window.location.href);
 const rt = url.searchParams.get('rt');
 const eid = url.searchParams.get('eid');
 const tssd = url.searchParams.get('tssd');
 $('#tssd').val(tssd);
 $('#rt').val(rt);
 $('#eid').val(eid);
}


function listLinks(data) {
 let array = [];
 if (data.links !== undefined) {
  array = data.links;
  $('#links').val(JSON.stringify(array));
 }
 $('#rt').val(data.refresh_token);
 let html = ' <ul class="slds-listbox slds-listbox_vertical" role="presentation">';

 if (array !== undefined && array.length > 0) {
  array.sort((a, b) => ((new Date(a.Modified) < new Date(b.Modified)) ? 1 : ((new Date(b.Modified) < new Date(a.Modified)) ? -1 : 0)));
 }

 for (let index = 0; index < array.length; index++) {
  const element = array[index];

  html += ` <li role="presentation"  id="link${index}" class="slds-listbox__item">`;
  html += '<div  id="left" class="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small" role="option">';
  html += '<span class="slds-media__figure slds-listbox__option-icon"></span>';
  html += '<span class="slds-media__body">';
  html += `<span class="slds-truncate" title="${element.LinkName}">${element.LinkName}</span>`;
  html += '</span>';
  html += '</div>';
 }
 html += ' </ul>';

 $('#listLinks').html(html);

 for (let index = 0; index < array.length; index++) {
  const element = array[index];

  document.getElementById(`link${index}`).addEventListener('click', (e) => {
   e.preventDefault();
   $('#onelink-trigger').removeClass('slds-is-open');
   $('#onelink').val(element.LinkName);
   $('#linkId').val(element.LinkID);
   $('#contentsCount').val(element.ContentsCount);
   $('#urlLink').val(element.FullURL)

  });
 }
}

function getLinks() {
 const endpoint = `/sfmc/GetLinks?rt=${$('#rt').val()}&eid=${$('#eid').val()}&tssd=${$('#tssd').val()}`;
 $.ajax({
  url: endpoint,
  method: 'GET',
  async: false,
  success(data) {
   if (data !== undefined) {
    listLinks(data);
   }
  },
 });
}
$(document).ready(() => {
 getUrlParameters();
 getLinks();
});