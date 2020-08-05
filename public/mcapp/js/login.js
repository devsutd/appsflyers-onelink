/* eslint-disable no-trailing-spaces */
/* eslint-disable no-undef */
function getUrlParameters() {
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
$(document).ready(() => {
 getUrlParameters();

 function validate() {
  let valid = true;
  if ($('#username').val() === '') {
   $('#username').addClass('slds-has-error');
   $('#username-error').show();
   $('#username').focus();
   valid = false;
  }

  if ($('#password').val() === '') {
   $('#password').addClass('slds-has-error');
   $('#password-error').show();
   $('#password').focus();
   valid = false;
  }

  return valid;
 }

 $('#username').on('click', () => {
  $('#username-error').hide();
  $('#username').removeClass('slds-has-error');
 });

 $('#password').on('click', () => {
  $('#password-error').hide();
  $('#password').removeClass('slds-has-error');
 });

 $('#btn-login').on('click', (e) => {
  e.preventDefault();
  if (!validate()) { return; }

  const postData = {
   username: $('#username').val(),
   password: $('#password').val(),
  };
  $.ajax({
   url: '/appsflyers/auth',
   method: 'POST',
   async: false,
   data: postData,
   success: (data) => {
    console.log(data);
    if (!data.LoginSuccess) {
     $('#Error').html('<p style="color:red;">Invalid username or Password!</p>');
    } else {
     window.location.href = `/validate?eid=${$('#eid').val()}&rt=${$('#rt').val()}&af_jwt=${data.af_jwt}&tssd=${$('#tssd').val()}`;
    }
   },
   error(jqXHR, error, errorThrown) {
    console.log(error);
    console.log(errorThrown);
   },
  });
 });
});