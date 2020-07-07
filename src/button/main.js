/* eslint-disable no-nested-ternary */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable new-cap */
/* eslint-disable no-undef */
const SDK = require('blocksdk');

const sdk = new SDK({ blockEditorWidth: 300, tabs: ['htmlblock'] });
// eslint-disable-next-line no-use-before-define
const ContentBlockID = uuidv4();
let selectedBackgroundColor = '';
let contentsCount = 0;


function getLinkByName(name) {
 if ($('#links').val() !== undefined && $('#links').val() !== '') {
  const object = JSON.parse($('#links').val());
  if (name !== undefined || name !== '') {
   const array = object;
   console.log(array);
   // eslint-disable-next-line no-plusplus
   for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element.LinkName === name || element.linkName === name) {
     $('#selectedlinkID').val(element.LinkID);
     $('#selectedlink').val(element.BaseURL + element.Parameters + element.CustomParameters);
     contentsCount = element.ContentsCount;
    }
   }
  }
 }
}

function GetInputsData() {
 const linkName = $('#onelink').val();
 getLinkByName(linkName);

 return {
  contentBlockID: ContentBlockID,
  title: $('#title').val(),
  linkID: $('#selectedlinkID').val(),
  linkName: $('#onelink').val(),
  link: $('#selectedlink').val(),
  backgroundColor: $('#color-picker-summary-input').val(),
  fontColor: $('#FontColor').val(),
  paddingTop: $('#padding-top').val(),
  paddingRight: $('#padding-right').val(),
  paddingBotom: $('#padding-bottom').val(),
  paddingLeft: $('#padding-left').val(),
  marginTop: $('#margin-top').val(),
  marginRight: $('#margin-right').val(),
  marginBottom: $('#margin-bottom').val(),
  marginLeft: $('#margin-left').val(),
  textAlignment: $('#alignment').val(),
  roundedCorners: $('#rounded').val(),
  refresh_token: $('#rt').val(),
 };
}

function save() {
 const data = GetInputsData();
 sdk.setData(data);
 // eslint-disable-next-line no-use-before-define
 const cmp = new componentes();
 const html = cmp.button(data);
 sdk.setContent(html);
 sdk.setSuperContent(html);
}

function getUrlParameters() {
 const url = new URL(window.location.href);
 const rt = url.searchParams.get('rt');
 const eid = url.searchParams.get('eid');
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


 // eslint-disable-next-line no-nested-ternary
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

  // eslint-disable-next-line no-loop-func
  document.getElementById(`link${index}`).addEventListener('click', (e) => {
   e.preventDefault();
   $('#onelink-trigger').removeClass('slds-is-open');
   $('#onelink').val(element.LinkName);
   getLinkByName(element.LinkName);
   save();
  });
 }
}

function componentes() {
 // eslint-disable-next-line no-unused-expressions
 this.button = function(data) {
  if (data.backgroundColor === undefined || data.backgroundColor === '') {
   data.backgroundColor = '#5D5D5D';
  }

  if (data.textAlignment === undefined || data.textAlignment === '') {
   data.textAlignment = 'center';
  }

  if (data.title === undefined || data.title === '') {
   data.title = 'Button Text';
  }

  if (data.title === undefined || data.title === '') {
   data.title = 'Button Text';
  }

  if (data.paddingTop === undefined || data.paddingTop === '') {
   data.paddingTop = 10;
  }

  if (data.paddingBotom === undefined || data.paddingBotom === '') {
   data.paddingBotom = 10;
  }

  if (data.paddingLeft === undefined || data.paddingLeft === '') {
   data.paddingLeft = 10;
  }

  if (data.paddingRight === undefined || data.paddingRight === '') {
   data.paddingRight = 10;
  }

  if (data.fontColor === undefined || data.fontColor === '') {
   data.fontColor = '#FFFFFF';
  }
  if (data.roundedCorners === undefined || data.roundedCorners === '') {
   data.roundedCorners = '3';
  }

  let html = '<table width="100%" border="0" cellspacing="0" cellpadding="0">';
  html += '<tr>';
  html += `<td align="${data.textAlignment}" >`;
  html += `<table border="0" cellspacing="0" cellpadding="0" style=" margin-bottom: ${data.marginBottom}px; margin-left: ${data.marginLeft}px; margin-right: ${data.marginRight}px; margin-top: ${data.marginTop}px;">`;
  html += '<tr>';
  html += `<td class="innertd buttonblock" bgcolor="${data.backgroundColor}" style=" border-radius: ${data.roundedCorners}px; -moz-border-radius: 3px; -webkit-border-radius: 3px;   background-color: ${data.backgroundColor};">`;
  html += `<a target="_blank" class="buttonstyles" style=" font-size: 16px; font-family: Arial, helvetica, sans-serif; color: ${data.fontColor}; text-align: center; text-decoration: none; display: block; background-color: ${data.backgroundColor}; border: 1px solid ${data.backgroundColor}; padding-top: ${data.paddingTop}px; padding-bottom: ${data.paddingBotom}px; padding-left: ${data.paddingLeft}px; padding-right: ${data.paddingRight}px; border-radius: 3px; -moz-border-radius: ${data.roundedCorners}px; -webkit-border-radius: ${data.roundedCorners}px;" href="${data.link}" title="${data.title}" alias="" conversion="false" data-linkto="http://">${data.title}</a>`;
  html += '</td>';
  html += '</tr>';
  html += '</table>';
  html += '</td>';
  html += '</tr>';
  html += '</table>';

  return html;
 };
 this.defaultButton = function() {
  let defaultHtml = '<table width="100%" border="0" cellspacing="0" cellpadding="0">';
  defaultHtml += '<tr><td align="center">';
  defaultHtml += '<table border="0" cellspacing="0" cellpadding="0">';
  defaultHtml += '<tr><td class="innertd buttonblock" bgcolor="#5D5D5D" style=" border-radius: 3px; -moz-border-radius: 3px; -webkit-border-radius: 3px; background-color: #5D5D5D;">';
  defaultHtml += '<a target="_blank" class="buttonstyles" style=" font-size: 16px; font-family: Arial, helvetica, sans-serif; color: #FFFFFF; text-align: center; text-decoration: none; display: block; background-color: #5D5D5D; border: 1px solid #5D5D5D; padding: 10px; border-radius: 3px; -moz-border-radius: 3px; -webkit-border-radius: 3px;" href="http://" title="" alias="" conversion="false" data-linkto="http://">Button Text</a></td></tr></table></td></tr></table>';
  return defaultHtml;
 };
}


function uuidv4() {
 return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
 });
}


sdk.getContent((content) => {
 if (content !== undefined && content !== '') {
  sdk.setContent(content);
  sdk.setSuperContent(content);
  console.log(content);
 } else {
  const cmp = new componentes();
  const html = cmp.defaultButton();
  sdk.setContent(html);
  sdk.setSuperContent(html);
 }
});

sdk.getData(function(data) {
 console.log(data);
 this.ContentBlockID = data.contentBlockID === '' || data.contentBlockID === undefined ? uuidv4() : data.contentBlockID;

 selectedBackgroundColor = data.backgroundColor;
 $('#btn-select-fontColor').css('background', data.fontColor);
 $('#title').val(data.title);
 $('#onelink').val(data.linkName);
 $('#color-picker-summary-input').val(data.backgroundColor);
 $('#FontColor').val(data.fontColor);
 $('#btn-select').css('background', data.backgroundColor);
 $('#padding-top').val(data.paddingTop);
 $('#padding-right').val(data.paddingRight);
 $('#padding-bottom').val(data.paddingBotom);
 $('#padding-left').val(data.paddingLeft);
 $('#margin-top').val(data.marginTop);
 $('#margin-right').val(data.marginRight);
 $('#margin-bottom').val(data.marginBottom);
 $('#margin-left').val(data.marginLeft);
 $('#alignment').val(data.textAlignment);
 $('#rounded').val(data.roundedCorners);
 getLinkByName(data.linkName);
});

document.getElementById('workspace').addEventListener('input', () => {
 console.log('workspace');
 save();
});

function getLinks() {
 const endpoint = `/sfmc/GetLinks?rt=${$('#rt').val()}&eid=${$('#eid').val()}`;
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

function SaveDataExtensionRow() {
 const data = GetInputsData();

 // eslint-disable-next-line no-unused-vars
 sdk.getData((_contentData) => {
  sdk.setData(data);
 });

 const link = {};
 link.LinkID = data.linkID;
 link.contentsCount = contentsCount;

 $.ajax({
  url: '/sfmc/UpsertButtonRow',
  method: 'POST',
  async: false,
  data,
  success(upsertButtonData) {
   link.refresh_token = upsertButtonData.refresh_token;
   $.ajax({
    url: '/sfmc/UpsertLink',
    method: 'POST',
    async: false,
    data: link,
    success(upsertLinkData) {
     console.log(upsertLinkData);
    },
   });
   console.log(upsertButtonData);
  },
 });
}
$(document).ready(() => {
 getUrlParameters();

 sdk.getData(function(data, err) {
  console.log(data);
 });
 getLinks();
 const classname = document.getElementsByClassName('slds-swatch');
 const selectPicker = function() {
  const element = $(this);
  console.log(element);
  console.log(element[0].innerText);
  selectedBackgroundColor = element[0].innerText;
  $('#color-picker-summary-input').val(selectedBackgroundColor);
  $('#btn-select').css('background', selectedBackgroundColor);
  save();
 };

 $('#onelink').on('change', () => {
  const linkName = $('#onelink').val();
  getLinkByName(linkName);
  save();
 });

 for (let i = 0; i < classname.length; i++) {
  classname[i].addEventListener('click', selectPicker, false);
 }

 $('#color-picker-summary-input').on('change', () => {
  save();
 });

 $('#FontColor').on('change', function() {
  const element = $(this);
  console.log(element);
  save();
 });

 $('#alignment').on('change', () => {
  save();
 });
 $('#rounded').on('change', () => {
  save();
 });
 $('#padding-top').on('change', () => {
  save();
 });
 $('#padding-top').on('change', () => {
  save();
 });

 $('#padding-left').on('change', () => {
  save();
 });

 $('#padding-right').on('change', () => {
  save();
 });

 $('#padding-bottom').on('change', () => {
  save();
 });

 $('#margin-top').on('change', () => {
  save();
 });

 $('#margin-left').on('change', () => {
  save();
 });

 $('#margin-right').on('change', () => {
  save();
 });

 $('#margin-bottom').on('change', () => {
  save();
 });

 $('#previewContent').click(() => {
  SaveDataExtensionRow();
 });
});