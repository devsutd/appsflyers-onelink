/* eslint-disable one-var */
/* eslint-disable no-mixed-operators */
/* eslint-disable one-var-declaration-per-line */
/* eslint-disable no-bitwise */
/* eslint-disable no-undef */
function getUrlParameters() {
 const url = new URL(window.location.href);
 const urlParams = {
  refresh_token: url.searchParams.get('rt'),
  enterpriseId: url.searchParams.get('eid'),
  af_jwt: url.searchParams.get('af_jwt'),
  tssd: url.searchParams.get('tssd')
 };
 $('#tssd').val(urlParams.tssd);
 $('#rt').val(urlParams.refresh_token);
 $('#eid').val(urlParams.enterpriseId);
 $('#af_jwt').val(urlParams.af_jwt);
 return urlParams;
}

function updateToken() {
 const postData = {
  refresh_token: $('#rt').val(),
  Token: $('#token').val(),
  enterpriseId: $('#eid').val(),
  tssd: $('#tssd').val()
 };

 $.ajax({
  url: '/TokenConfiguration/UpdateSetting',
  method: 'POST',
  async: false,
  data: postData,
  success(data) {
   console.log(data);
   window.location.href = `/dashboard/home?eid=${$('#eid').val()}&rt=${$('#rt').val()}&tssd=${$('#tssd').val()}`;
  },
  error(jqXHR, error, errorThrown) {
   console.log(error);
   console.log(errorThrown);
  },
 });
}

$(document).ready(() => {

 $('#help').hover(() => {
  $('#tooltip-help').css('display', 'block');
 }, () => {
  $('#tooltip-help').css('display', 'none');
 });

 function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
   const r = Math.random() * 16 | 0,
    v = c === 'x' ? r : (r & 0x3 | 0x8);
   return v.toString(16);
  });
 }
 $('#token').val(uuidv4());

 const params = getUrlParameters();
 const postData = {
  refresh_token: params.refresh_token,
  Token: $('#token').val(),
  enterpriseId: params.enterpriseId,
  tssd: $('#tssd').val()
 };

 $.ajax({
  url: '/TokenConfiguration/UpsertAuthenticationSetting',
  method: 'POST',
  async: false,
  data: postData,
  success: (data) => {
   console.log(data);
   if (data[0] !== undefined) {
    if (data[0].Token !== undefined) {
     $('#token').val(data[0].Token);
    }
   }
  },
  error: (jqXHR, error, errorThrown) => {
   console.log(error);
   console.log(errorThrown);
  },
 });


 $('#copyEid').on('click', (e) => {
  e.preventDefault();
  $('#eid').select();
  document.execCommand('copy');
 });

 $('#copyToken').on('click', (e) => {
  e.preventDefault();
  $('#token').select();
  document.execCommand('copy');
 });

 $('#btn-validate').on('click', (e) => {
  e.preventDefault();
  const dataForPost = {
   eid: $('#eid').val(),
   sfToken: $('#token').val(),
   rt: $('#rt').val(),
   tssd: $('#tssd').val(),
   af_jwt: $('#af_jwt').val(),
  };
  $.ajax({
   url: '/appsflyers/validateToken',
   method: 'POST',
   async: false,
   data: dataForPost,
   success: (data) => {
    if (data !== 'unauthorized') {
     updateToken();
    } else {
     $('#error').html('<p style="color:red;margin-left: 24px;">Invalid token or eid<p>');
    }
   },
   error(jqXHR, error, errorThrown) {
    console.log(error);
    console.log(errorThrown);
   },
  });
 });
});