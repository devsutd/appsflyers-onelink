/* eslint-disable no-use-before-define */
/* eslint-disable no-useless-escape */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable no-undef */
var JSONParameter = {
 AttributtionLinks: [],
 CustomParameters: []
}

function getUrlParameters() {
 // eslint-disable-next-line no-undef
 const url = new URL(window.location.href);
 const urlParams = {
  refresh_token: url.searchParams.get('rt'),
  enterpriseId: url.searchParams.get('eid'),
  tssd: url.searchParams.get('tssd')
 };
 $('#tssd').val(urlParams.tssd);
 $('#rt').val(urlParams.refresh_token);
 $('#eid').val(urlParams.enterpriseId);
 return urlParams;
}

function buildQueryString() {
 let rules = [];
 const json = $('#rl').val();
 if (json.length > 0) {
  rules = JSON.parse(json);
 }

 let qs = '';
 if (rules.length > 0) {
  qs += '?';
 }
 // eslint-disable-next-line no-plusplus
 for (let index = 0; index < rules.length; index++) {
  const element = rules[index];

  qs += `${element.name}=`;
  if (element.value.startsWith("'%%")) {
   qs += `${element.value}`;
  } else if (element.value.startsWith('%%')) {
   qs += `'${element.value}'`;
  } else {
   qs += element.value;
  }

  if (index !== rules.length - 1) {
   qs += '&';
  }
 }
 $('#rl').val(JSON.stringify(rules));
 return qs;
}

function overrideParamsValues(name, value, isCustomOnblur = false) {
 let json = $('#rl').val();
 let alreadyExist = false;
 if (json.length > 0) {
  rules = JSON.parse(json);
  for (let index = 0; index < rules.length; index++) {
   if (rules[index].name === name) {
    rules[index].value = value;
    alreadyExist = true;
    break;
   } else {
    alreadyExist = false;
   }
  }

  if (alreadyExist === false) {
   const isAttributionLink = getOption(name);
   if (isAttributionLink.Name !== undefined) {
    rules.push(newRuleObj(rules.length, name, value));
    JSONParameter.AttributtionLinks.push({ index: rules.length, name: name, value: value, canDelete: true, selectId: `select${rules.length}`, inputValueId: name, isCustom: false, customValue: null })
   } else if (isCustomOnblur === false) {
    const customParams = `${$('#customParameters').val()}&${name}=${value}`;
    var cpLength = JSONParameter.CustomParameters.length;
    JSONParameter.CustomParameters.push({ index: cpLength, name: name, value: value });
    $('#customParameters').val(customParams);
   }
  }

  addRules(rules);
  json = JSON.stringify(rules);
  $('#rl').val(json);
 }
}

function parseCustomParameters(url) {
 if (url !== '') {
  params = url.split('&');
  console.log(params);
  for (let index = 0; index < params.length; index++) {
   const queryParam = params[index].split('=');
   overrideParamsValues(queryParam[0], queryParam[1], true);
  }
 }
}

function fillFullUrl() {
 let fullUrl = $('#baseURL').val() + buildQueryString();
 const parameters = $('#customParameters').val();
 if (parameters !== undefined && parameters !== '') {
  fullUrl += parameters;
 }
 parseCustomParameters(fullUrl);
 $('#fullurl').val(fullUrl);
}

// eslint-disable-next-line no-unused-vars
function onChangePersonalizationString(element) {
 const elementIndex = element[0].id[element[0].id.length - 1];
 let json = $('#rl').val();
 if (json.length > 0) {
  rules = JSON.parse(json);
 }
 const rule = rules[elementIndex];
 const optionValue = element[0].value;
 const personalization = `%%${optionValue}%%`;
 $(`#${rule.name}`).val(personalization);
 $(`#${element[0].id}`).css('display', 'none');
 rules[elementIndex].value = personalization;
 json = JSON.stringify(rules);
 $('#rl').val(json);
 fillFullUrl();
}

// eslint-disable-next-line no-unused-vars
function dinamicInputsOnBlur(element) {
 let json = $('#rl').val();
 if (json.length > 0) {
  rules = JSON.parse(json);
 }
 // eslint-disable-next-line no-unused-vars
 let rule = '';
 for (let index = 0; index < rules.length; index++) {
  if (rules[index].name === element[0].id) {
   if (element[0].value !== undefined && element[0].value !== '') {
    rules[index].value = element[0].value;
    JSONParameter.AttributtionLinks[index].value = element[0].value;
   } else {
    rules[index].value = 'Enter Value';
    JSONParameter.AttributtionLinks[index].value = 'Enter Value';
   }

   rule = rules[index];
   break;
  }
 }

 json = JSON.stringify(rules);
 $('#rl').val(json);
 fillFullUrl();
}

// eslint-disable-next-line no-unused-vars
function dinamicInputsOnClick(element) {
 if (element[0].value === 'Enter Value') {
  $(`#${element[0].id}`).val('');
 }
}

function createHtmlForRule(index, name, value = null, canDelete = false, isCustom = false, customValue = null) {
 let newRule = '';
 newRule += '<div class="single-rule ">';
 newRule += '<div class="children-container">';
 newRule += '<div style="display: flex;">';
 newRule += ' <div class="data-filter">';
 newRule += ' <div class="filter-section ">';
 newRule += ' <div>';
 newRule += '</div>';
 newRule += '<div class="Select rules-select-param-name   Select--single is-searchable has-value">';
 newRule += `<div id= "select${index}-replace" class="Select-control">`;
 newRule += '<div class="Select-input" style="display: inline-block;">';
 newRule += `<input id="param-${name}" value="${name}" style="box-sizing: content-box;"/>`;
 newRule += '<div style="position: absolute; visibility: hidden; height: 0px; width: 0px; overflow: scroll; white-space: pre; font-size: 14px; font-family: museo_sans300; font-weight: 400; font-style: normal; letter-spacing: normal;">';
 newRule += '</div>';
 newRule += '</div>';
 newRule += '<span class="Select-clear-zone" title="Clear value"';
 newRule += 'aria-label="Clear value">';
 newRule += '<span class="Select-clear">×</span>';
 newRule += '</span>';
 newRule += '<span class="Select-arrow-zone">';
 newRule += '<span class="Select-arrow">';
 newRule += '</span>';
 newRule += '</span>';
 newRule += '</div>';
 newRule += '</div>';
 newRule += '</div>';
 newRule += '</div>';
 newRule += '<div class="af-core form-control-wrapper af-core rules-input-param-value  input-item    vertical">';
 newRule += '<div>';
 newRule += '<div></div>';

 if (value) {
  newRule += '<div class="input-container has-validation form-group has-feedback">';

  if (isCustom && value !== 'Enter Value') {
   newRule += '<div class="input-inner-custom ">';
  } else {
   newRule += '<div class="input-inner">';
  }
  newRule += `<input type="text" id="${name}" placeholder="${value}" value="${value}" class="form-control" onblur=\"dinamicInputsOnBlur($(this))\" onclick=\"dinamicInputsOnClick($(this))\"/>`;
  newRule += ' </div>';
  let inputId = '';
  if (isCustom && value !== 'Enter Value') {
   newRule += '<div class="input-inner-custom ">';
   inputId = value;
   if (value.startsWith('%%')) {
    inputId = value.substring(2, value.length - 2);
   }
   newRule += `<input type="text" id="${inputId}" placeholder="${customValue}" value="${Customvalue}" class="form-control"/>`;
   newRule += ' </div>';
  }

  newRule += ' </div>';
 }

 newRule += '</div>';
 newRule += '</div>';
 if (canDelete) {
  newRule += `<button id="btn${index}"type="button" class="af-core af-button red transparent  rules-delete-param icon-only medium  " style="margin-left:10px; margin-right:10px; " >`;
  newRule += '<i class="af-button-icon fa fa-trash-o"></i></button>';
 }


 newRule += `<button id="btn-personalization${index}" name="btn-personalization${index}" type="button" class="af-core af-button red transparent  rules-delete-param icon-only medium  " style="margin-left:10px; margin-right:10px; " onclick=\"$('#SFMC-personalizationString${index}').css('display','block')\">`;
 newRule += '<i class="af-button-icon fa fa-user"></i></button>';
 newRule += `<select id="SFMC-personalizationString${index}"  class="form-control" style="max-width:200px; display:none" onchange=\"onChangePersonalizationString($(this))\">`;
 newRule += '<option value="" class="options-personalizationstring">Select an option</option>';
 newRule += '<option value="emailaddr" class="options-personalizationstring">Email Address</option>';
 newRule += '<option value="fullname" class="options-personalizationstring">Full Name</option>';
 newRule += '<option value="firstname" class="options-personalizationstring">First Name</option>';
 newRule += '<option value="lastname" class="options-personalizationstring">Last Name</option>';
 newRule += '<option value="_subscriberkey" class="options-personalizationstring">Subscriber Key</option>';
 newRule += '<option value="mobile_number" class="options-personalizationstring">Phone Number</option>';
 newRule += '</select>';

 newRule += '</div>';
 newRule += '</div>';
 newRule += '</div>';
 return newRule;
}

function setSelectOptions(restantes = false) {
 const selectOptions = [];
 if (restantes === false) {
  selectOptions.push({ Name: 'Channel', Value: 'af_channel' });
  selectOptions.push({ Name: 'Media Source', Value: 'pid' });
  selectOptions.push({ Name: 'Re-Targeting Campaign', Value: 'is_retargeting' });
 }
 selectOptions.push({ Name: 'Campaign', Value: 'c' });
 selectOptions.push({ Name: 'Adset', Value: 'af_adset' });
 selectOptions.push({ Name: 'Ad Name', Value: 'af_ad' });
 selectOptions.push({ Name: 'Sub Parameter 1', Value: 'af_sub1' });
 selectOptions.push({ Name: 'Sub Parameter 2', Value: 'af_sub2' });
 selectOptions.push({ Name: 'Sub Parameter 3', Value: 'af_sub3' });
 selectOptions.push({ Name: 'Sub Parameter 4', Value: 'af_sub4' });
 selectOptions.push({ Name: 'Sub Parameter 5', Value: 'af_sub5' });
 return selectOptions;
}

function getOption(value) {
 let options = [];
 let element = {};
 options = setSelectOptions();
 // eslint-disable-next-line no-plusplus
 for (let index = 0; index < options.length; index++) {
  if (options[index].Value === value) {
   console.log(options[index].Value);
   element = options[index];
   break;
  }
 }
 return element;
}

function deleteParameter(array, element) {
 const aux = [];
 let counter = 0;
 for (let i = 0; i < array.length; i++) {
  const e = array[i];
  if (e.index !== element.index) {
   e.index = counter;
   e.selectId = `select${counter}`;
   aux.push(e);
   counter++;
  }
 }
 const json = JSON.stringify(aux);
 $('#rl').val(json);
 return aux;
}

function removeDynamicParameters(element) {

 let counter = 0;
 var array = JSONParameter.AttributtionLinks;
 JSON.AttributtionLinks = [];
 for (let i = 0; i < array.length; i++) {
  const e = array[i];
  if (e.index !== element.index) {
   e.index = counter;
   e.selectId = `select${counter}`;
   JSON.AttributtionLinks.push(e);
   counter++;
  }
 }

}

function renderComponentsBase(array) {
 let strRules = '';
 let ids = '';
 for (let index = 0; index < array.length; index++) {
  const element = array[index];
  if (ids.indexOf(`${element.name} `) === -1) {
   ids += `${element.name} `;
   strRules += createHtmlForRule(element.index, element.name, element.value, element.canDelete, element.isCustom);
  } else {
   console.log(element.name);
  }
 }
 $('#rules').html('');
 $('#rules').html(strRules);
}

function getAllowEditCP(array) {
 const allowEdit = [];
 for (let index = 0; index < array.length; index++) {
  const element = array[index];
  if (element.canDelete === true) {
   allowEdit.push(element);
  }
 }
 return allowEdit;
}

function removeSelectOption(value, selectOptions) {
 for (let index = 0; index < selectOptions.length; index++) {
  const element = selectOptions[index];
  if (element.Value === value) {
   selectOptions.splice(index, 1);
   break;
  }
 }
 return selectOptions;
}

function buildSelectOptions(element, selectOptions) {
 let options = `<select id="${element.selectId}" name="${element.selectId}" class="Select-control" style="border:0!important;">`;
 options += '<option class="option-select" value="select" selected>Select Parameter</option>';
 for (let j = 0; j < selectOptions.length; j++) {
  const option = selectOptions[j];
  if (element.name.startsWith('custom') && element.name !== 'Custom Parameter') {
   options += `<option class="option-select" value="${option.Name}">${option.Name}</option>`;
  } else {
   options += `<option class="option-select" value="${option.Value}">${option.Name}</option>`;
  }
 }
 options += '</select>';

 $(`#${element.selectId}-replace`).html(options);

 if (element.name === 'Select parameter') {
  $(`#${element.selectId}`).val('select');
 } else {
  $(`#${element.selectId}`).val(element.name);
  $(`#${element.name}`).attr('readonly', false);
  removeSelectOption(element.name, selectOptions);
 }
}

function newRuleObj(index, name, value, canDelete = false, isCustom = false, customValue = null) {
 console.log('indx', index);
 return {
  index,
  selectId: `select${index}`,
  inputValueId: name,
  name,
  value,
  canDelete,
  isCustom,
  customValue,

 };
}

function addRules(array) {
 const selectOptions = setSelectOptions(true);
 renderComponentsBase(array);
 const allowEdit = getAllowEditCP(array);
 for (let index = 0; index < allowEdit.length; index++) {
  const element = allowEdit[index];
  buildSelectOptions(element, selectOptions);
  addEventsForComponent(element, array);
 }

 const json = JSON.stringify(array);
 $('#rl').val(json);
}

function addEventsForComponent(element, array) {
 let aux = [];
 $(`#${element.selectId}`).change(function(e) {
  e.preventDefault();
  const selectedOption = $(`#${element.selectId} option:selected`).html();
  const selectedOptionValue = $(`#${element.selectId} option:selected`).val();

  element.name = $(this).val();
  element.value = 'Enter Value';
  element.canDelete = true;
  if (selectedOption === 'Custom Parameter') {
   element.name = $(this).val() + element.index;
   element.isCustom = true;
   element.inputValueId = element.name;
   element.customValue = 'Enter Value';
  }

  array[element.index] = element;
  JSONParameter.AttributtionLinks[element.index] = element;
  addRules(array);
  $(`#${element.selectId}`).val(selectedOptionValue);
  $(`#${element.name}`).attr('readonly', false);
  fillFullUrl();
 });

 let inputId = element.value;
 if (element.value != undefined) {
  if (element.value.startsWith("'%%")) {
   inputId = element.value.substring(3, element.value.length - 3);
  } else if (element.value.startsWith('%%')) {
   inputId = element.value.substring(2, element.value.length - 2);
  } else { inputId = element.value; }

 }


 $(`#${inputId}`).on('click', (e) => {
  e.preventDefault();
  if ($(`#${inputId}`).val() === '') { $(`#${inputId}`).val(''); }
  //  if ($(`#${element.value}`).val() === '') { $(`#${element.value}`).val(''); }
  fillFullUrl();
 });

 $(`#btn${element.index}`).on('click', (e) => {
  e.preventDefault();
  // const option = $(`#${element.selectId}`).val();
  // selectOptions.push(getOption(option));
  aux = deleteParameter(array, element);
  removeDynamicParameters(element);
  $('#rules').html('');
  array = addRules(aux);
  fillFullUrl();
 });
 console.log('element name', element.name);
 return array;
}


function initializeRules() {
 const rules = [];
 JSONParameter.AttributtionLinks.push({ index: 0, name: 'pid', value: 'Email-SFMC', canDelete: false, selectId: 'select0', inputValueId: 'pid', isCustom: false, customValue: null });
 JSONParameter.AttributtionLinks.push({ index: 1, name: 'af_channel', value: 'Salesforce Marketing Cloud', canDelete: false, selectId: 'select1', inputValueId: 'af_channel', isCustom: false, customValue: null });
 JSONParameter.AttributtionLinks.push({ index: 2, name: 'is_retargeting', value: 'false', canDelete: false, selectId: 'select2', inputValueId: 'is_retargeting', isCustom: false, customValue: null });
 JSONParameter.AttributtionLinks.push({ index: 3, name: 'c', value: 'Enter Value', canDelete: true, selectId: 'select3', inputValueId: 'c', isCustom: false, customValue: null });
 rules.push(newRuleObj(0, 'pid', 'Email-SFMC'));
 rules.push(newRuleObj(1, 'af_channel', 'Salesforce Marketing Cloud'));
 rules.push(newRuleObj(2, 'is_retargeting', 'false'));
 rules.push(newRuleObj(3, 'c', 'Enter Value', true));

 addRules(rules);
 return rules;
}

$(document).ready(() => {
 $('#linkname-help').hover(() => {
  $('#tooltip-linkname').css('display', "block");
 }, () => {
  $('#tooltip-linkname').css('display', "none");
 });

 $('#baseurl-help').hover(() => {
  $('#tooltip-baseurl').css('display', "block");
 }, () => {
  $('#tooltip-baseurl').css('display', "none");
 });

 const urlParams = getUrlParameters();
 $('#rt').val(urlParams.refresh_token);
 $('#eid').val(urlParams.enterpriseId);
 let rules = [];
 rules = initializeRules();
 $('#btn-addParameter').on('click', (e) => {
  e.preventDefault();
  let json = $('#rl').val();
  if (json.length > 0) {
   rules = JSON.parse(json);
  }
  let { index } = rules[rules.length - 1];
  rules.push(newRuleObj(++index, 'Select parameter', null, true));
  JSONParameter.AttributtionLinks.push({ index: index, name: 'Select parameter', value: null, canDelete: true, selectId: `select${index}`, inputValueId: 'Select', isCustom: false, customValue: null });
  addRules(rules);
  json = JSON.stringify(rules);
  $('#rl').val(json);
  fillFullUrl();
 });

 $('#cancel').on('click', (e) => {
  e.preventDefault();
  if ($('#rt').val() === undefined ||
   $('#rt').val() === '') { window.location.href = `/dashboard/home/?rt=${urlParams.refresh_token}&eid=${urlParams.enterpriseId}&tssd=${$('#tssd').val()}`; } else { window.location.href = `/dashboard/home/?rt=${$('#rt').val()}&eid=${$('#eid').val()}&tssd=${$('#tssd').val()}`; }
 });

 $('#linkName').on('click', (e) => {
  e.preventDefault();
  $('#error-linkName').css('display', 'none');
 });

 $('#baseURL').on('click', (e) => {
  e.preventDefault();
  $('#error-baseURL').css('display', 'none');
 });

 function parseQuerystringParameters(url) {
  const array = url.split('?');
  if (array.length > 1) {
   if (array[1].split('&').length > 0) {
    params = array[1].split('&');
    console.log(params);
    for (let index = 0; index < params.length; index++) {
     const queryParam = params[index].split('=');
     overrideParamsValues(queryParam[0], queryParam[1]);
    }
   } else {
    params = array[1].split('=');
    overrideParamsValues(params[0], params[1]);
   }
  }
  $('#baseURL').val(array[0]);
 }

 function removeAttrParamsFromCustomParams(customparams) {
  if (!customparams.startsWith('&')) { customparams = `&${customparams}`; }
  JSONParameter.CustomParameters = [];

  params = customparams.split('&');
  let json = $('#rl').val();
  let customInputValue = '';
  if (json.length > 0) {
   rules = JSON.parse(json);
   for (let index = 1; index < params.length; index++) {
    const queryParam = params[index].split('=');
    let isCustom = true;

    for (let j = 0; j < rules.length; j++) {
     if (rules[j].name === queryParam[0]) {
      // eslint-disable-next-line prefer-destructuring
      rules[j].value = queryParam[1];
      $(`#${queryParam[0]}`).val(queryParam[1]);
      isCustom = false;
      break;
     } else {
      isCustom = true;
     }
    }

    if (isCustom === true) {
     JSONParameter.CustomParameters.push({ name: queryParam[0], value: queryParam[1] })
     const newParam = `${queryParam[0]}=${queryParam[1]}`;
     if (customInputValue.indexOf(`${queryParam[0]}=`) > 0) {
      const oldParam = customInputValue.substring(customInputValue.indexOf(`${queryParam[0]}=`), customInputValue.length);
      customInputValue = customInputValue.replace(oldParam.split('&')[0], newParam);
     } else {
      customInputValue += `&${newParam}`;
     }
    }
   }
   if (customInputValue.length > 1) {
    $('#customParameters').val(customInputValue);
   } else {
    $('#customParameters').val('');
   }
   json = JSON.stringify(rules);
   $('#rl').val(json);
  }
 }

 $('#baseURL').on('blur', function(e) {
  e.preventDefault();
  const url = $(this).val();
  if (url !== undefined) {
   parseQuerystringParameters(url);
  }

  const parameters = $('#customParameters').val();
  if (parameters !== undefined) {
   parseCustomParameters(parameters);
  }
  fillFullUrl();
 });

 $('#customParameters').on('blur', (e) => {
  e.preventDefault();
  const parameters = $('#customParameters').val();
  if (parameters !== undefined && parameters !== '') {
   // parseCustomParameters(parameters);
   removeAttrParamsFromCustomParams(parameters);
  }
  fillFullUrl();
 });

 function validatePostData() {
  let isValid = true;
  if ($('#linkName').val() === undefined ||
   $('#linkName').val() === '') {
   $('#error-linkName').css('display', 'block');
   isValid = false;
  }

  if ($('#baseURL').val() === undefined ||
   $('#baseURL').val() === '') {
   $('#error-baseURL').css('display', 'block');
   isValid = false;
  }

  return isValid;
 }

 $('#btn-addLink').on('click', (e) => {
  e.preventDefault();
  if (!validatePostData()) { return; }
  let customParameters = $('#customParameters').val();
  if (customParameters.length > 0) {
   customParameters = customParameters.startsWith('&') === true ? customParameters : `&${customParameters}`;
  }
  var date = new Date().toISOString();
  console.log(date);
  const postData = {
   refresh_token: $('#rt').val(),
   enterpriseId: $('#eid').val(),
   tssd: $('#tssd').val(),
   linkName: $('#linkName').val(),
   baseUrl: $('#baseURL').val(),
   status: 'Active',
   JSONParameter: JSONParameter,
   Parameters: buildQueryString(),
   CustomParameters: customParameters,
   Created: date,
   Modified: date
  };

  $.ajax({
   url: '/UpsertLink',
   method: 'POST',
   async: false,
   data: postData,
   success(data) {
    if (data.Status === 'OK') {
     window.location.href = `/dashboard/home/?rt=${data.refresh_token}&eid=${$('#eid').val()}&tssd=${$('#tssd').val()}`;
    }
   },
   error(jqXHR, error, errorThrown) {
    $('.slds-box').css('display', 'block');
    $('.slds-box').html(`<p>${errorThrown}</p>`);
    setInterval(() => {
     window.location.href = `/dashboard/home/?rt=${$('#rt').val()}&eid='${$('#eid').val()}&tssd=${$('#tssd').val()}`;
    }, 30000);
   },
  });
 });
});