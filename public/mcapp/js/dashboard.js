/* eslint-disable no-undef */
function getUrlParameters() {
 const url = new URL(window.location.href);
 const urlParams = {
  refresh_token: url.searchParams.get('rt'),
  enterpriseId: url.searchParams.get('eid'),
 };
 return urlParams;
}


function getCampaign(element) {
 var JSONParameters = JSON.parse(element.JSONParameters);
 var AttributtionLinks = JSONParameters.AttributtionLinks;
 var Campaign = "";
 for (let index = 0; index < AttributtionLinks.length; index++) {
  const attrLink = AttributtionLinks[index];
  if (attrLink.name == "c") {
   Campaign = attrLink.value
   break;
  }

 }
 return Campaign;
}

function buildDashboard(links, from, page) {
 let table = '<div class="slds-lookup" data-select="multi" data-scope="single" data-typeahead="true">';
 table += '<table class="slds-table slds-table_cell-buffer slds-no-row-hover slds-table_bordered slds-table_fixed-layout" role="grid" >';

 table += '<tr>';

 table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>OneLink Name</b></td>';
 table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Campaign</b></td>';
 table += '<td class="header-dashboard" role="gridcell" scope="col" colspan="3"><b>Full URL</b></td>';
 table += '<td class="header-dashboard" role="gridcell" scope="col" style="text-align:center;"><b># of Contents</b></td>';
 table += '<td class="header-dashboard" role="gridcell" scope="col" ><b>Created</b></td>';
 table += '<td class="header-dashboard" role="gridcell" scope="col" ><b>Modified</b></td>';
 table += '<td class="header-dashboard" role="gridcell" scope="col" ></td>';
 table += '</tr>';

 if (links !== undefined) {
  links.sort((a, b) => ((new Date(a.Modified) < new Date(b.Modified)) ? 1 : ((new Date(b.Modified) < new Date(a.Modified)) ? -1 : 0)));
  if (from == "init" || page == 1) {
   links = links.splice(0, 15);
   $("#currentDashboard").val(15);
  } else {
   var currentDashboard = $("#currentDashboard").val();
   links = links.splice(currentDashboard, 15);
   $("#currentDashboard").val(currentDashboard + 15);
  }

  for (let index = 0; index < links.length; index++) {
   const element = links[index];
   var Campaign = getCampaign(element);
   var objectCount = getAllEmailsWithOneLinksByLinkID(emailswithonelink.body, element.LinkID);
   var top = parseInt(index*50);

   table += '<tr>';

   table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.LinkName}</div></td>`;
   table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${Campaign}</div></td>`;
   table += `<td role="gridcell" colspan="3"><div class="slds-truncate" title="${element.FullURL}">${element.FullURL}</div></td>`;
   table += `<td role="gridcell"><div id="count-${element.LinkID}" style="text-align:center;">`;
   table += '<div class="tooltipcount-trigger"  style="position:relative">';

   if(objectCount.count > 0) {
    table += '<div class="tooltipcount slds-popover slds-popover_tooltip slds-nubbin_bottom-left" role="tooltip" id="help" style="position:fixed;top:' + top + 'px;right:395px; display:none;">';
    table += '<div class="slds-popover__body">'
    for (let j = 0; j < objectCount.emails.length; j++) {
        if(j == 5) {
            table += '<div class="slds-m-top_x-small" aria-hidden="true"><a href="#">See more</a></div>';
            break;
        }
        else 
            table += objectCount.emails[j] + '<br>';
    }
    table += '</div>';
    table += '</div>';
   }
   table += '<a href="javascript:void(0)" aria-describedby="help">';
   table += `<span class="slds-icon_container slds-icon-utility-info">${objectCount.count}</span>`;
   table += '</a>';
   table += '</div></div></td>';
   table += `<td role="gridcell"><div class="slds-truncate" >${element.Created}</div></td>`;
   table += `<td role="gridcell"><div class="slds-truncate" >${element.Modified}</div></td>`;
   table += '<td>';
   table += `<div id="onelink-trigger${element.LinkID}" class="slds-dropdown-trigger slds-dropdown-trigger_click" style="padding-left:50%;">`;
   table += '<button class="slds-button slds-button_icon slds-button_icon-border-filled" >';
   table += '<svg class="slds-button__icon" aria-hidden="true">';
   table += '<use xlink:href="/mcapp/images/symbols.svg#down">';
   table += '</use>';
   table += '</svg>';
   table += '</button>';
   table += '<div class="slds-dropdown slds-dropdown_left" style="margin-top: -1px!important">';
   table += '<ul class="slds-dropdown__list" role="menu" >';
   table += '<li class="slds-dropdown__item" role="presentation">';
   table += `<a href="/dashboard/edit/?lid=${element.LinkID}&eid={0}&rt={1}" class="edit" id="edit${index}" role="menuitem" tabindex="0">`;
   table += '<span class="slds-truncate" title="Edit">Edit</span>';
   table += '</a></li>';
   table += '<li class="slds-dropdown__item" role="presentation">';
   table += `<a href="#" onclick="Duplicate(${element})" class="Duplicate" id="Duplicate${index}" role="menuitem" tabindex="0">`;
   table += '<span class="slds-truncate" title="Duplicate">Duplicate</span>';
   table += '</a></li>';
   table += '</ul>';
   table += '</div>';
   table += '</div>';
   table += '</div>';
   table += '</td>';
   table += '</tr>';
  }
 }
 table += '</table>';
 table += '</div>';

 $('#dashboard-table').empty();
 $('#dashboard-table').html(table);

 ready();

 for (let index = 0; index < links.length; index++) {
  const element = links[index];
  document.getElementById(`Duplicate${index}`).addEventListener("click", function(e) {
   e.preventDefault();
   Duplicate(element);
  });
 }
}

function Duplicate(element) {
 console.log(element);
 var date = new Date().toISOString()
 const postData = {
  refresh_token: $('#rt').val(),
  enterpriseId: $('#eid').val(),
  linkName: `${element.LinkName}_Copy`,
  baseUrl: element.BaseURL,
  status: 'Active',
  JSONParameter: JSON.parse(element.JSONParameters),
  Parameters: element.Parameters,
  CustomParameters: element.CustomParameters,
  Created: date,
  Modified: date
 };
 console.log(postData);
 $.ajax({
  url: '/UpsertLink',
  method: 'POST',
  async: false,
  data: postData,
  success(data) {
   if (data.Status === 'OK') {
    window.location.href = `/dashboard/home/?rt=${data.refresh_token}&eid=${$('#eid').val()}`;
   }
  }
 });
}

function buildPaginator(allLinks) {
 const params = {
  refresh_token: $('#rt').val(),
  enterpriseId: $('#eid').val()
 };
 var totalPages = Math.ceil(allLinks.length / 15);
 if (totalPages == 0) {
  totalPages++;
 }

 $('#pagination-demo').empty();

 $('#pagination-demo').removeData("twbs-pagination");

 $('#pagination-demo').unbind("page")

 $('#pagination-demo').twbsPagination({
  totalPages: totalPages,
  visiblePages: 5,
  onPageClick: function(event, page) {
   let from = "paginator";
   getAllEmailsWithOneLinks(params, "paginator", page);
  }
 });
}

function loadDashboards(urlParams, from, page) {
 const url = '/LoadDashboards';

 var inp = $('#lookup').val();
 if (from == "filtered") {
  urlParams = {
   refresh_token: $('#rt').val(),
   enterpriseId: $('#eid').val()
  };
 }

 $.ajax({
  url,
  method: 'POST',
  async: false,
  data: urlParams,
  success: (data) => {
   let links = data.data;
   $('#rt').val(data.refresh_token);
   $('#eid').val(data.enterpriseId);
   replaceUrlTOkens($('#rt').val())
   if (inp != undefined && links != undefined) {
    links = links.filter(x => x.LinkName.toLowerCase().includes(inp));

    if (from != "paginator")
     buildPaginator(links);

    buildDashboard(links, from, page);

   }
  },
  error(jqXHR, error, errorThrown) {
   const sat = '<div class="slds-lookup" data-select="multi" data-scope="single" data-typeahead="true"><table class="slds-table slds-table_cell-buffer slds-no-row-hover slds-table_bordered slds-table_fixed-layout" role="grid" ><thead><tr class="slds-line-height_reset"><th scope="col" colspan="2"><b>OneLink Name</b></th><th scope="col" colspan="2"><b>Full URL</b></th><th scope="col" ><b>URL</b></th><th scope="col" ><b># of Contents</b></th><th scope="col" ><b>Parameters</b></th><th scope="col" ><b>Custom Parameters</b></th><th scope="col" ><b>Created</b></th><th scope="col" ><b>Modified</b></th><th scope="col" ></th></tr></thead><tbody><tr><td role="gridcell" colspan="2"><div class="slds-truncate" >Security Review Test</div></td><td role="gridcell"  colspan="2"><div class="slds-truncate" title="https://af-esp.onelink.me/mYu3?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review&af_dp=esp%3A%2F%2Fdeeplink">https://af-esp.onelink.me/mYu3?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review&af_dp=esp%3A%2F%2Fdeeplink</div></td><td role="gridcell"><div class="slds-truncate" >https://af-esp.onelink.me/mYu3</div></td><td role="gridcell"><div class="slds-truncate" >1</div></td><td role="gridcell"><div class="slds-truncate" >?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review</div></td><td role="gridcell"><div class="slds-truncate" >&af_dp=esp%3A%2F%2Fdeeplink</div></td><td role="gridcell"><div class="slds-truncate" >2/10/2020 6:27:08 PM</div></td><td role="gridcell"><div class="slds-truncate" >2/10/2020 6:49:00 PM</div></td><td><div id="onelink-trigger274acd92-fa1a-4e81-b55d-ef663a8685c1" class="slds-dropdown-trigger slds-dropdown-trigger_click"><button class="slds-button slds-button_icon slds-button_icon-border-filled" aria-haspopup="true"><svg class="slds-button__icon" aria-hidden="true"><use xlink:href="/mcapp/images/symbols.svg#down"></use></svg><span class="slds-assistive-text">Show More</span></button><div class="slds-dropdown slds-dropdown_left"><ul class="slds-dropdown__list" role="menu" aria-label="Show More"><li class="slds-dropdown__item" role="presentation"><a href="/dashboard/edit/?lid=274acd92-fa1a-4e81-b55d-ef663a8685c1&eid={0}&rt={1}" class="edit" id="edit0" role="menuitem" tabindex="0"><span class="slds-truncate" title="Edit">Edit</span></a></li></ul></div></div></td></tr><tr><td role="gridcell" colspan="2"><div class="slds-truncate" >Security Review Test</div></td><td role="gridcell"  colspan="2"><div class="slds-truncate" title="https://af-esp.onelink.me/mYu3?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review&af_dp=esp%3A%2F%2Fdeeplink">https://af-esp.onelink.me/mYu3?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review&af_dp=esp%3A%2F%2Fdeeplink</div></td><td role="gridcell"><div class="slds-truncate" >https://af-esp.onelink.me/mYu3</div></td><td role="gridcell"><div class="slds-truncate" >1</div></td><td role="gridcell"><div class="slds-truncate" >?pid=Email-SFMC&af_channel=Salesforce Marketing Cloud&is_retargeting=true&c=security_review</div></td><td role="gridcell"><div class="slds-truncate" >&af_dp=esp%3A%2F%2Fdeeplink</div></td><td role="gridcell"><div class="slds-truncate" >2/10/2020 6:27:08 PM</div></td><td role="gridcell"><div class="slds-truncate" >2/10/2020 6:49:00 PM</div></td><td><div id="onelink-trigger274acd92-fa1a-4e81-b55d-ef663a8685c1" class="slds-dropdown-trigger slds-dropdown-trigger_click"><button class="slds-button slds-button_icon slds-button_icon-border-filled" aria-haspopup="true"><svg class="slds-button__icon" aria-hidden="true"><use xlink:href="/mcapp/images/symbols.svg#down"></use></svg><span class="slds-assistive-text">Show More</span></button><div class="slds-dropdown slds-dropdown_left"><ul class="slds-dropdown__list" role="menu" aria-label="Show More"><li class="slds-dropdown__item" role="presentation"><a href="/dashboard/edit/?lid=274acd92-fa1a-4e81-b55d-ef663a8685c1&eid={0}&rt={1}" class="edit" id="edit0" role="menuitem" tabindex="0"><span class="slds-truncate" title="Edit">Edit</span></a></li></ul></div></div></td></tr><table></div>';
   $('#dashboard-table').html(sat);
   console.log(error);
   console.log(errorThrown);
   console.log(jqXHR);
  },
 });
}

function ready() {
 $('.slds-dropdown-trigger_click').hover(
  function() {
   $(this).addClass('slds-is-open');
   console.log($(this));
  },
  () => {
   console.log($(this));
   const elements = document.getElementsByClassName('slds-is-open');
   if (elements != undefined && elements.length > 0) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < elements.length; index++) {
     const elementid = elements[index].id;
     $('#' + elementid).removeClass('slds-is-open');
    }
   }
  },
 );

 $('.slds-dropdown-trigger_click').on('click', function(e) {
  console.log($(this));
  $(this).addClass('slds-is-open');
 });

 $('.edit').hover(
  () => {
   console.log('.edit');
   // $(this).addClass('slds-is-open');
  },
  function() {
   $(this).parent().removeClass('slds-is-open');
  },
 );
 
 $('#btn-create').on('click', (e) => {
  e.preventDefault();
  console.log($('#eid').val());
  let redirectUrl = `/dashboard/create/?rt=${$('#rt').val()}`;
  redirectUrl += `&eid=${$('#eid').val()}`;
  window.location.href = redirectUrl;
 });

 $('#btn-create').on('click', (e) => {
  e.preventDefault();
 });

 $('.edit').on('click', function(e) {
  e.preventDefault();

  const href = $(this).attr('href');
  let link = href.replace('{0}', $('#eid').val());
  link = link.replace('{1}', $('#rt').val());
  window.location.href = link;
 });

 $('.tooltipcount-trigger').hover(
  () => {
    $(this)[0].$.find(".tooltipcount")[0].attr("display","block");
  },
  function() {
    $(this)[0].$.find(".tooltipcount")[0].attr("display","none");
  },
 );
}

function replaceUrlTOkens(token) {
 $('#htmlemailsLink')[0].href = '/htmlemails/home?rt=' + token + '&eid=' + $('#eid').val();
 $('#DashboardLink')[0].href = '/Dashboard/home?rt=' + token + '&eid=' + $('#eid').val();
 console.log($('#htmlemailsLink')[0].href);
}

function getAllEmailsWithOneLinks(params, from, page){
    const url = 'https://appsflyers-onelink-dev.herokuapp.com/sfmcHelper/getAllEmailsWithOneLinks';

    urlParams = {
        refresh_token: $('#rt').val(),
        eid: $('#eid').val()
    };
     
    $.ajax({
        url,
        method: 'POST',
        async: false,
        data: urlParams,
        success: (data) => {
            emailswithonelink = data;
            $('#rt').val(data.refresh_token);
            replaceUrlTOkens($('#rt').val());
            urlParams = {
                refresh_token: $('#rt').val(),
                eid: $('#eid').val()
            };

            loadDashboards(urlParams, from, page);
       },
       error(jqXHR, error, errorThrown) {
        console.log(error);
        console.log(errorThrown);
        console.log(jqXHR);
       },
    });
}

function getAllEmailsWithOneLinksByLinkID(rows, currentLinkId){
    let numberofcontents = 0;
    let emailArray = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let linkID = row.Properties.Property[0].Value;
        let emailID = row.Properties.Property[1].Value;
        let emailName = row.Properties.Property[2].Value;
        let count = row.Properties.Property[3].Value;

        if(currentLinkId == linkID){
            numberofcontents = numberofcontents + parseInt(count);
            emailArray.push(emailName + "(" + count + ")");
        }
    }

    let objectCount = {
        count: numberofcontents,
        emails: emailArray
    }

    return objectCount;
}

$(document).ready(() => {
 let emailswithonelink;
 const urlParams = getUrlParameters();
 
 $('#rt').val(urlParams.refresh_token);
 $('#eid').val(urlParams.enterpriseId);
 replaceUrlTOkens(urlParams.refresh_token);
 loadDashboards(urlParams, "init", 1);

 ready();
});