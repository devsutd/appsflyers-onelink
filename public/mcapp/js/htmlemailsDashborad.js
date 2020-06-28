
$(document).ready(() => {
  const urlParams = getUrlParameters();
  $('#rt').val(urlParams.refresh_token);
  $('#eid').val(urlParams.enterpriseId);

  replaceUrlTOkens($('#rt').val());

  var campaigns;
  var postData = JSON.stringify({
    "accessToken": $("#rt").val()
  });

  $.ajax({
    "url": "/sfmc/GetCampaigns",
    "method": "POST",
    "async": false,
    "headers": {
      "Content-Type": "application/json"
    },
    "data": postData,
  }).done(function (response) {
    campaigns = response.body.items;
  });
  
function getCampaignById(id) {
  var c;
  for (let index = 0; index < campaigns.length; index++) {
    const element = campaigns[index];
    if (element.id = id) {
      c = element;
      break;
    }
  }
  return c;
}

function GetHtmlEmails(accessToken) {
  // este metodo devuelve todos los emails html paste
  var postData = JSON.stringify({ "accessToken": accessToken })
  $.ajax({
    "url": "/sfmc/GetContentBuilderEmails",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "data": postData,
  }).done(function (response) {
    // para acceder al codigo html tenes que hacer object.views.html.content         
    console.log(response);
  });
}


function updateEmail(accessToken, emailId, EmailObject) {
  var postData = JSON.stringify({
    "accessToken": accessToken,
    "id": emailId,
    "email": EmailObject
  })
  // Nota: Lo probe pasando el objeto completo  que te devuelve el metodo getemails o get email by id y editando el html.
  // por ahi se pueden pasar menos valores, pero habria que probar.

  $.ajax({
    "url": "/sfmc/UpdateEmail",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "data": postData
  }).done(function (response) {
    console.log(response);
  });
}

function GetHtmlEmailByID(accessToken, emailId) {
  var postData = JSON.stringify({
    "accessToken": accessToken,
    "id": emailId
  })

  $.ajax({
    "url": "/sfmc/GetEmailByID",
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Content-Type": "application/json"
    },
    "data": postData,
  }).done(function (response) {
    console.log(response);
  });
}

function GetAllContentBuilderAssets(accessToken) {
  var postData = JSON.stringify({ "accessToken": accessToken })

  $.ajax({
    "url": "/sfmc/GetAllContentBuilderAssets",
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Content-Type": "application/json"
    },
    "data": postData,
  }).done(function (response) {
    console.log(response);
  });
}


function getLinks(id, rawHTML) {
  var doc = document.createElement("html");
  doc.innerHTML = rawHTML;
  var links = doc.getElementsByTagName("a")
  var urls = {
    Links: [],
    EmailId: id
  };

  for (var i = 0; i < links.length; i++) {
    var LinkHtml = links[i].outerHTML;
    var HtmlLinkText = LinkHtml.split('>')[1].split('<')[0].trim();
    if (LinkHtml.indexOf('<img') > 0) {
      HtmlLinkText = 'Link of Image'
    }
    var href = links[i].getAttribute("href");

    if (href == "") {
      href = "#"
    }

    var linkData = {
      htmlLink: LinkHtml,
      LinkText: HtmlLinkText,
      href: href
    }
    urls.Links.push(linkData);
  }
  return urls;
}


function replaceUrlTOkens(token) {
  $('#htmlemailsLink')[0].href = '/htmlemails/home?rt=' + token + '&eid=' + $('#eid').val();
  $('#DashboardLink')[0].href = '/Dashboard/home?rt=' + token + '&eid=' + $('#eid').val();
}

function replaceLinks(rawHTML, object, OneLink) {

  var htmlEmail = rawHTML;
  for (var i = 0; i < object.Links.length; i++) {
    var oldString = object.Links[i].htmlLink;
    var oldStringLength = oldString.length;
    var htmlBeforeLink = htmlEmail.substring(0, htmlEmail.indexOf(oldString));
    console.log(htmlBeforeLink);
    var htmlafterLink = htmlEmail.substring(htmlBeforeLink.length + oldStringLength, htmlEmail.length);
    var newString = oldString.replace(object.Links[i].href, OneLink);

    htmlEmail = htmlBeforeLink + newString + htmlafterLink;
    // htmlEmail.replace(oldString, newString);  
  }
  return htmlEmail;
}

/* eslint-disable no-undef */
function getUrlParameters() {
  const url = new URL(window.location.href);
  const urlParams = {
    refresh_token: url.searchParams.get('rt'),
    enterpriseId: url.searchParams.get('eid'),
  };
  return urlParams;
}
function buildDashboard(emails, from, page) {
  console.log(emails);
  let table = '<div class="slds-lookup" data-select="multi" data-scope="single" data-typeahead="true">';
  table += '<table class="slds-table slds-table_cell-buffer slds-no-row-hover slds-table_bordered slds-table_fixed-layout" role="grid" >';

  table += '<tr>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="1"><div class="slds-checkbox"><input type="checkbox" name="options" id="checkbox-unique-id-297" value="checkbox-unique-id-297" tabindex="-1" aria-labelledby="check-select-all-label column-group-header" /><label class="slds-checkbox__label" for="checkbox-unique-id-297" id="check-select-all-label"><span class="slds-checkbox_faux"></span><span class="slds-form-element__label slds-assistive-text">Select All</span></label></div></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Email ID</b></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Email Name</b></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Campaign</b></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Subject</b></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Preheader</b></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Email type</b></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Owner</b></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Status</b></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Created</b></td>';
  table += '</tr>';

  if (emails !== undefined) {
    for (let index = 0; index < emails.length; index++) {
      const element = emails[index];
       if (element.data !== undefined) {
        emailCampaign = element.data.campaigns;
        if (emailCampaign.campaigns[0] != undefined) {
                    $.ajax({
                      "url": "/sfmc/GetCampaignID",
                      "method": "POST",
                      "async": false,
                      "headers": {
                        "Content-Type": "application/json"
                      },
                      "data": postData,
                    }).done(function (response) {
                      campaign = response.body;
                    });
        }
      }
      table += '<tr>';
      table += `<td role="gridcell" colspan="1"><div class="slds-truncate" ><div class="slds-checkbox"><input type="checkbox" name="options" id="checkbox-01" value="checkbox-01" tabindex="0" aria-labelledby="check-button-label-01 column-group-header" /><label class="slds-checkbox__label" for="checkbox-01" id="check-button-label-01"><span class="slds-checkbox_faux"></span><span class="slds-form-element__label slds-assistive-text">Select item 1</span></label></div></div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.data.email.legacy.legacyId}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" id="email${index}">${element.name}</div></td>`;
      //table += `<td role="gridcell" colspan="2"><div class="slds-truncate" ><a href="#" onclick="openAssignLinks();" id="email${index}">${element.name}</a> </div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${campaign.name}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.views.subjectline.content}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.views.preheader.content}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.assetType.displayName}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.owner.name}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.status.name}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.createdDate}</div></td>`;
      table += '</tr>';
    }
  }
  table += '</table>';
  table += '</div>';

  $('#dashboard-table').empty();
  $('#dashboard-table').html(table);

  for (let index = 0; index < emails.length; index++) {
    const element = emails[index];
    document.getElementById(`email${index}`).addEventListener("click", function (e) {
      e.preventDefault();
      var rawHTML = element.views.html.content;
      var links = getLinks(element.id, rawHTML);


      console.log(links);
      console.log(replaceLinks(element.views.html.content, links, "www.onelink.com"));
    });
  }
}

function buildPaginator(allEmails) {
  const params = {
    refresh_token: $('#rt').val(),
    enterpriseId: $('#eid').val()
  };
  var totalPages = Math.ceil(allEmails.length / 15);
  if (totalPages == 0) {
    totalPages++;
  }

  $('#pagination-demo').empty();

  $('#pagination-demo').removeData("twbs-pagination");

  $('#pagination-demo').unbind("page")

  $('#pagination-demo').twbsPagination({
    totalPages: totalPages,
    visiblePages: 5,
    onPageClick: function (event, page) {
      loadHtmlEmails(params, "paginator", page);
    }
  });
}


function loadHtmlEmails(urlParams, from, page) {
  var postData = JSON.stringify({ "accessToken": $("#rt").val() })
  var inp = $('#lookup').val();

  $.ajax({
    url: "/sfmc/GetContentBuilderEmails",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: postData,
    success: (data) => {
      var emails = data.body;
      $('#rt').val(data.refresh_token);
      replaceUrlTOkens($('#rt').val());
      if (inp != undefined) {
        emails = emails.items.filter(x => x.name.toLowerCase().includes(inp));

        if (from != "paginator")
          buildPaginator(emails);

        buildDashboard(emails, from, page);
      }
    },
    error(jqXHR, error, errorThrown) {
      const sat = '<div class="slds-lookup" data-select="multi" data-scope="single" data-typeahead="true"><table class="slds-table slds-table_cell-buffer slds-no-row-hover slds-table_bordered slds-table_fixed-layout" role="grid" ><thead><tr class="slds-line-height_reset"><th scope="col" colspan="2"><b>OneLink Name</b></th><th scope="col" colspan="2"><b>Full URL</b></th><th scope="col" ><b>URL</b></th><th scope="col" ><b># of Contents</b></th><th scope="col" ><b>Parameters</b></th><th scope="col" ><b>Custom Parameters</b></th><th scope="col" ><b>Created</b></th><th scope="col" ><b>Modified</b></th><th scope="col" ></th></tr></thead><tbody><tr><td role="gridcell" colspan="2"><div class="slds-truncate" >Security Review Test</div></td><td role="gridcell"  colspan="2"><div class="slds-truncate" title="https://af-esp.onelink.me/mYu3?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review&af_dp=esp%3A%2F%2Fdeeplink">https://af-esp.onelink.me/mYu3?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review&af_dp=esp%3A%2F%2Fdeeplink</div></td><td role="gridcell"><div class="slds-truncate" >https://af-esp.onelink.me/mYu3</div></td><td role="gridcell"><div class="slds-truncate" >1</div></td><td role="gridcell"><div class="slds-truncate" >?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review</div></td><td role="gridcell"><div class="slds-truncate" >&af_dp=esp%3A%2F%2Fdeeplink</div></td><td role="gridcell"><div class="slds-truncate" >2/10/2020 6:27:08 PM</div></td><td role="gridcell"><div class="slds-truncate" >2/10/2020 6:49:00 PM</div></td><td><div id="onelink-trigger274acd92-fa1a-4e81-b55d-ef663a8685c1" class="slds-dropdown-trigger slds-dropdown-trigger_click"><button class="slds-button slds-button_icon slds-button_icon-border-filled" aria-haspopup="true"><svg class="slds-button__icon" aria-hidden="true"><use xlink:href="/mcapp/images/symbols.svg#down"></use></svg><span class="slds-assistive-text">Show More</span></button><div class="slds-dropdown slds-dropdown_left"><ul class="slds-dropdown__list" role="menu" aria-label="Show More"><li class="slds-dropdown__item" role="presentation"><a href="/dashboard/edit/?lid=274acd92-fa1a-4e81-b55d-ef663a8685c1&eid={0}&rt={1}" class="edit" id="edit0" role="menuitem" tabindex="0"><span class="slds-truncate" title="Edit">Edit</span></a></li></ul></div></div></td></tr><tr><td role="gridcell" colspan="2"><div class="slds-truncate" >Security Review Test</div></td><td role="gridcell"  colspan="2"><div class="slds-truncate" title="https://af-esp.onelink.me/mYu3?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review&af_dp=esp%3A%2F%2Fdeeplink">https://af-esp.onelink.me/mYu3?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review&af_dp=esp%3A%2F%2Fdeeplink</div></td><td role="gridcell"><div class="slds-truncate" >https://af-esp.onelink.me/mYu3</div></td><td role="gridcell"><div class="slds-truncate" >1</div></td><td role="gridcell"><div class="slds-truncate" >?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review</div></td><td role="gridcell"><div class="slds-truncate" >&af_dp=esp%3A%2F%2Fdeeplink</div></td><td role="gridcell"><div class="slds-truncate" >2/10/2020 6:27:08 PM</div></td><td role="gridcell"><div class="slds-truncate" >2/10/2020 6:49:00 PM</div></td><td><div id="onelink-trigger274acd92-fa1a-4e81-b55d-ef663a8685c1" class="slds-dropdown-trigger slds-dropdown-trigger_click"><button class="slds-button slds-button_icon slds-button_icon-border-filled" aria-haspopup="true"><svg class="slds-button__icon" aria-hidden="true"><use xlink:href="/mcapp/images/symbols.svg#down"></use></svg><span class="slds-assistive-text">Show More</span></button><div class="slds-dropdown slds-dropdown_left"><ul class="slds-dropdown__list" role="menu" aria-label="Show More"><li class="slds-dropdown__item" role="presentation"><a href="/dashboard/edit/?lid=274acd92-fa1a-4e81-b55d-ef663a8685c1&eid={0}&rt={1}" class="edit" id="edit0" role="menuitem" tabindex="0"><span class="slds-truncate" title="Edit">Edit</span></a></li></ul></div></div></td></tr><table></div>';
      $('#dashboard-table').html(sat);
      console.log(error);
      console.log(errorThrown);
      console.log(jqXHR);
    },
  })
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
}

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

  loadHtmlEmails(urlParams, "init", 1);
});
