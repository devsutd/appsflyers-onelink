function getCampaignById(id) {
  var campaigns;
  var campaign;
  var postData = JSON.stringify({
    accessToken: $("#rt").val(),
    tssd: $("#tssd").val(),
  });

  $.ajax({
    url: "/sfmc/GetCampaigns",
    method: "POST",
    async: false,
    headers: {
      "Content-Type": "application/json",
    },
    data: postData,
  }).done(function (response) {
    replaceUrlTOkens(response.refresh_token);
    $("#rt").val(response.refresh_token);
    campaigns = response.body.items;
    for (let index = 0; index < campaigns.length; index++) {
      const element = campaigns[index];
      if (element.id == id) {
        campaign = element;
        break;
      }
    }
  });
  return campaign;
}

function GetHtmlEmails(accessToken) {
  // este metodo devuelve todos los emails html paste
  var postData = JSON.stringify({
    accessToken: accessToken,
    tssd: $("#tssd").val(),
  });
  $.ajax({
    url: "/sfmc/GetContentBuilderEmails",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: postData,
  }).done(function (response) {
    replaceUrlTOkens(response.refresh_token);
    $("#rt").val(response.refresh_token);
    console.log(response);
  });
}

function updateEmail(emailId, linkstoreplace, urls, emailName, oneLink) {
  var postData = JSON.stringify({
    accessToken: $("#rt").val(),
    id: emailId,
    linkstoreplace: linkstoreplace,
    urls: urls,
    oneLink: oneLink,
    tssd: $("#tssd").val(),
  });

  $.ajax({
    url: "/sfmc/UpdateEmail",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: postData,
  }).done(function (response) {
    replaceUrlTOkens(response.refresh_token);
    $("#rt").val(response.refresh_token);
    prepareUpsertHtml(emailId, linkstoreplace, urls, emailName);
  });
}

function prepareUpsertHtml(id, linkstoreplace, urls, emailName) {
  for (let i = 0; i < linkstoreplace.length; i++) {
    LogHTMLEmailLinksUpdates(
      id,
      urls.Links[linkstoreplace[i]].LinkText,
      urls.Links[linkstoreplace[i]].href,
      oneLinkId,
      oneLink,
      emailName
    );
  }
}

function GetHtmlEmailByID(linkschecked) {
  let links = [];
  let currentEmailID;
  let currentEmailName;
  let newEmail;
  for (let i = 0; i < linkschecked.length; i++) {
    let diccionarioLink = linkschecked[i].split("|");
    newEmail = diccionarioLink[0];
    if (currentEmailID == "" || currentEmailID == undefined) {
      currentEmailID = diccionarioLink[0];
      currentEmailName = diccionarioLink[1];
    }

    if (currentEmailID == newEmail) {
      links.push(diccionarioLink[2]);
      if (linkschecked.length - 1 == i) {
        var postData = JSON.stringify({
          accessToken: $("#rt").val(),
          id: currentEmailID,
          tssd: $("#tssd").val(),
        });

        $.ajax({
          url: "/sfmc/GetEmailByID",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: postData,
        }).done(function (response) {
          replaceUrlTOkens(response.refresh_token);
          $("#rt").val(response.refresh_token);
          currentEmail = response.body;
          getEmailLinks(
            currentEmailID,
            response.body.views.html.content,
            links,
            true,
            currentEmailName
          );
        });
      }
    } else {
      var postData = JSON.stringify({
        accessToken: $("#rt").val(),
        tssd: $("#tssd").val(),
        id: currentEmailID,
      });

      $.ajax({
        url: "/sfmc/GetEmailByID",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: postData,
      }).done(function (response) {
        replaceUrlTOkens(response.refresh_token);
        $("#rt").val(response.refresh_token);
        currentEmail = response.body;
        getEmailLinks(
          currentEmailID,
          response.body.views.html.content,
          links,
          true,
          currentEmailName
        );

        currentEmailID = diccionarioLink[0];
        links = [];
        links.push(diccionarioLink[2]);

        if (linkschecked.length - 1 == i) {
          var postData = JSON.stringify({
            accessToken: $("#rt").val(),
            tssd: $("#tssd").val(),
            id: currentEmailID,
          });

          $.ajax({
            url: "/sfmc/GetEmailByID",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            data: postData,
          }).done(function (response) {
            replaceUrlTOkens(response.refresh_token);
            $("#rt").val(response.refresh_token);
            currentEmail = response.body;
            getEmailLinks(
              currentEmailID,
              response.body.views.html.content,
              links,
              true,
              currentEmailName
            );
          });
        }
      });
    }
  }
}

function GetAllContentBuilderAssets(accessToken) {
  var postData = JSON.stringify({
    accessToken: accessToken,
    tssd: $("#tssd").val(),
  });

  $.ajax({
    url: "/sfmc/GetAllContentBuilderAssets",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: postData,
  }).done(function (response) {
    replaceUrlTOkens(response.refresh_token);
  });
}

function getEmailLinks(id, rawHTML, linkstoreplace, toReplace, emailName) {
  var doc = document.createElement("html");
  doc.innerHTML = rawHTML;
  var links = doc.getElementsByTagName("a");
  var urls = {
    Links: [],
    EmailId: id,
  };

  for (var i = 0; i < links.length; i++) {
    var LinkHtml = links[i].outerHTML;
    var HtmlLinkText = LinkHtml.split(">")[1].split("<")[0].trim();
    if (LinkHtml.indexOf("<img") > 0) {
      HtmlLinkText = "Link of Image";
    }
    var href = links[i].getAttribute("href");

    if (href == "") {
      href = "#";
    }

    var linkData = {
      htmlLink: LinkHtml,
      LinkText: HtmlLinkText,
      href: href,
    };
    urls.Links.push(linkData);
  }

  if (toReplace) {
    let objectLink = {};
    objectLink.Links = [];
    for (let i = 0; i < linkstoreplace.length; i++) {
      objectLink.Links.push(urls.Links[linkstoreplace[i]]);
    }

    //let htmlreplaced = replaceLinks(rawHTML, objectLink, oneLink);
    //currentEmail.views.html.content = htmlreplaced;
    updateEmail(id, linkstoreplace, urls, emailName, oneLink);
  }
  return urls;
}

function replaceUrlTOkens(token) {
  $("#htmlemailsLink")[0].href =
    "/htmlemails/home?rt=" +
    token +
    "&eid=" +
    $("#eid").val() +
    "&tssd=" +
    $("#tssd").val();
  $("#DashboardLink")[0].href =
    "/Dashboard/home?rt=" +
    token +
    "&eid=" +
    $("#eid").val() +
    "&tssd=" +
    $("#tssd").val();
}

function replaceLinks(rawHTML, object, OneLink) {
  var htmlEmail = rawHTML;
  for (var i = 0; i < object.Links.length; i++) {
    var oldString = object.Links[i].htmlLink;
    var oldStringLength = oldString.length;
    var htmlBeforeLink = htmlEmail.substring(0, htmlEmail.indexOf(oldString));
    console.log(htmlBeforeLink);
    var htmlafterLink = htmlEmail.substring(
      htmlBeforeLink.length + oldStringLength,
      htmlEmail.length
    );
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
    refresh_token: url.searchParams.get("rt"),
    enterpriseId: url.searchParams.get("eid"),
    tssd: url.searchParams.get("tssd"),
  };
  $("#tssd").val(urlParams.tssd);
  return urlParams;
}

function buildDashboard(emails, from, page) {
  console.log(emails);
  let table =
    '<div class="slds-lookup" data-select="multi" data-scope="single" data-typeahead="true">';
  table +=
    '<table class="slds-table slds-table_cell-buffer slds-no-row-hover slds-table_bordered slds-table_fixed-layout" role="grid" >';

  table += "<tr>";

  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="1"></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Email ID</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Email Name</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Campaign</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Subject</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Preheader</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Email type</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Owner</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Status</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Created</b></td>';
  table += "</tr>";

  if (emails !== undefined) {
    for (let index = 0; index < emails.length; index++) {
      const element = emails[index];
      if (element.data !== undefined) {
        if (element.data.campaigns != undefined) {
          emailCampaign = element.data.campaigns;
          if (Object.entries(emailCampaign).length > 0) {
            var campaign = getCampaignById(
              emailCampaign.campaigns[0].campaignId
            );
          }
        }
      }
      let createdDate = new Date(element.createdDate);
      let dateformatted =
        [
          createdDate.getMonth() + 1,
          createdDate.getDate(),
          createdDate.getFullYear(),
        ].join("/") +
        " " +
        [
          createdDate.getHours(),
          createdDate.getMinutes(),
          createdDate.getSeconds(),
        ].join(":");
      table += "<tr>";
      table += `<td role="gridcell" colspan="1"><div class="slds-truncate" ><div class="slds-checkbox"><input type="checkbox" name="emailstoassign" id="checkbox-${element.data.email.legacy.legacyId}" value="${element.id}" tabindex="0" aria-labelledby="check-button-label-01 column-group-header" /><label class="slds-checkbox__label" for="checkbox-${element.data.email.legacy.legacyId}" id="label-${element.data.email.legacy.legacyId}"><span class="slds-checkbox_faux"></span><span class="slds-form-element__label slds-assistive-text">Select item 1</span></label></div></div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.data.email.legacy.legacyId}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" id="email${index}">${element.name}</div></td>`;
      //table += `<td role="gridcell" colspan="2"><div class="slds-truncate" ><a href="#" onclick="openAssignLinks();" id="email${index}">${element.name}</a> </div></td>`;
      if (campaign != undefined && campaign != null) {
        table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${campaign.name}</div></td>`;
      } else {
        table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >No campaign assigned</div></td>`;
      }

      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.views.subjectline.content}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.views.preheader.content}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.assetType.displayName}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.owner.name}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.status.name}</div></td>`;
      table +=
        '<td role="gridcell" colspan="2"><div class="slds-truncate" >' +
        dateformatted +
        "</div></td>";
      table += "</tr>";
    }
  }
  table += "</table>";
  table += "</div>";

  $("#dashboard-table").empty();
  $("#dashboard-table").html(table);
}

function buildPaginator(allEmails) {
  const params = {
    refresh_token: $("#rt").val(),
    tssd: $("#tssd").val(),
    enterpriseId: $("#eid").val(),
  };
  var totalPages = Math.ceil(allEmails.length / 15);
  if (totalPages == 0) {
    totalPages++;
  }

  $("#pagination-demo").empty();

  $("#pagination-demo").removeData("twbs-pagination");

  $("#pagination-demo").unbind("page");

  $("#pagination-demo").twbsPagination({
    totalPages: totalPages,
    visiblePages: 5,
    onPageClick: function (event, page) {
      loadHtmlEmails(params, "paginator", page);
    },
  });
}

function loadHtmlEmails(urlParams, from, page) {
  var postData = JSON.stringify({
    accessToken: $("#rt").val(),
    tssd: $("#tssd").val(),
  });
  var inp = $("#lookup").val();

  $.ajax({
    url: "/sfmc/GetContentBuilderEmails",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: postData,
    success: data => {
      var emails = data.body;
      replaceUrlTOkens(data.refresh_token);
      $("#rt").val(data.refresh_token);
      if (inp != undefined) {
        emails = emails.items.filter(x => x.name.toLowerCase().includes(inp));

        if (from != "paginator") buildPaginator(emails);

        buildDashboard(emails, from, page);
      }
    },
    error(jqXHR, error, errorThrown) {
      alert("A timeout has been detected. Please refresh your browser.");
      console.log(error);
      console.log(errorThrown);
      console.log(jqXHR);
    },
  });
}

function listLinks(data) {
  let array = [];
  if (data.links !== undefined) {
    array = data.links;
  }
  $("#rt").val(data.refresh_token);
  if (array !== undefined && array.length > 0) {
    array.sort((a, b) =>
      new Date(a.Modified) < new Date(b.Modified)
        ? 1
        : new Date(b.Modified) < new Date(a.Modified)
        ? -1
        : 0
    );
  }

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    let option = `<option id="link${index}" class="slds-listbox__item" value="${element.LinkID}|${element.FullURL}">${element.LinkName}</option>`;
    $("#selectonelink").append(option);
  }
}

function getLinks() {
  let rt = $("#rt").val();
  let eid = $("#eid").val();
  let tssd = $("#tssd").val();
  const endpoint = `/sfmc/GetLinks?rt=${rt}&eid=${eid}&tssd=${tssd}`;
  $.ajax({
    url: endpoint,
    method: "GET",
    async: false,
    success(data) {
      if (data !== undefined) {
        listLinks(data);
      }
    },
  });
}

function getEmailSlot(emails) {
  $("#modalcontainer").empty();
  let emailforslot = [];

  for (let i = 0; i < emails.length; i++) {
    let emailId = emails[i];
    var postData = JSON.stringify({
      accessToken: $("#rt").val(),
      id: emailId,
      tssd: $("#tssd").val(),
    });

    $.ajax({
      url: "/sfmc/GetEmailByID",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: postData,
    }).done(function (response) {
      let emailObject = {
        emailId: emailId,
        emailBody: response.body,
      };

      emailforslot.push(emailObject);
      buildEmailSlot(emailforslot, emails.length);
    });
  }
}

function buildEmailSlot(emailforslot, length) {
  if (emailforslot.length == length) {
    for (let j = 0; j < emailforslot.length; j++) {
      let emailModalSlot = `<div id="emailslot${emailforslot[j].emailId}" style="background-color: white;">`;
      emailModalSlot +=
        '<header class="slds-modal__header" style="background-color: #f3f2f2; text-align:left">';
      emailModalSlot += `<span><b>Email name: </b></span>${emailforslot[j].emailBody.name}<br>`;
      emailModalSlot += `<span><b>Subjectline: </b>${emailforslot[j].emailBody.views.subjectline.content}</span><br>`;
      emailModalSlot += `<span><b>Preheader: </b>${emailforslot[j].emailBody.views.preheader.content}</span><br>`;
      let emailCampaign = emailforslot[j].emailBody.data.campaigns;
      if (
        emailCampaign != undefined &&
        Object.keys(emailCampaign).length != 0
      ) {
        if (emailCampaign.campaigns[0] != undefined) {
          var campaign = getCampaignById(emailCampaign.campaigns[0].campaignId);
          emailModalSlot += `<span><b>Campaign: </b>${campaign.name}</span>`;
        }
      }

      emailModalSlot += "</header>";
      emailModalSlot += `<div id="emailcontent${emailforslot[j].emailId}" style="float: left;width: 320px;background-color: white;">`;
      emailModalSlot +=
        '<label class="slds-form-element__label" for="select-01" style="padding-left: 1rem;padding-top: 1rem;">Select Links from the Email</label>';

      let emailLinks = getEmailLinks(
        emailforslot[j].emailId,
        emailforslot[j].emailBody.views.html.content,
        false,
        false
      );

      if (emailLinks.Links.length == 0) {
        emailModalSlot += "<article>";
        emailModalSlot += '<div class="slds-card__header slds-grid">';
        emailModalSlot +=
          '<header class="slds-media slds-media_center slds-has-flexi-truncate">';
        emailModalSlot += '<div class="slds-media__body">';
        emailModalSlot += '<h2 class="slds-card__header-title">';
        emailModalSlot += `<span><b>There are no links in this HTML email.</b></span><br></br>`;
        emailModalSlot += "</h2>";
        emailModalSlot += "</div>";
        emailModalSlot += "</header>";
        emailModalSlot += "</div>";
        emailModalSlot += '<div class="slds-card__body"></div>';
        emailModalSlot += '<footer class="slds-card__footer"></footer>';
        emailModalSlot += "</article>";
        emailModalSlot += "</div>";
      } else {
        for (let i = 0; i < emailLinks.Links.length; i++) {
          const link = emailLinks.Links[i];

          if (link.LinkText == "Link of Image") continue;

          emailModalSlot += "<article>";
          emailModalSlot += '<div class="slds-card__header slds-grid">';
          emailModalSlot +=
            '<header class="slds-media slds-media_center slds-has-flexi-truncate">';
          emailModalSlot += '<div class="slds-media__body">';
          emailModalSlot += '<h2 class="slds-card__header-title">';
          emailModalSlot += `<span><b>${link.LinkText}</b></span><br></br>`;
          emailModalSlot += `<span style="font-size: 12px;font-weight: normal;">${link.href}</span><br>`;
          emailModalSlot += "</h2>";
          emailModalSlot += "</div>";
          emailModalSlot += '<div class="slds-no-flex">';
          emailModalSlot += '<div class="slds-checkbox">';
          emailModalSlot += `<input type="checkbox" name="linksfromemail" id="${emailforslot[j].emailId}|Link${i}" value="${emailforslot[j].emailBody.id}|${emailforslot[j].emailBody.name}|${i}"/>`;
          emailModalSlot += `<label class="slds-checkbox__label" for="${emailforslot[j].emailId}|Link${i}">`;
          emailModalSlot += '<span class="slds-checkbox_faux"></span>';
          emailModalSlot += "</label>";
          emailModalSlot += "</div>";
          emailModalSlot += "</header>";
          emailModalSlot += "</div>";
          emailModalSlot += '<div class="slds-card__body"></div>';
          emailModalSlot += '<footer class="slds-card__footer"></footer>';
          emailModalSlot += "</article>";

          if (i == emailLinks.Links.length - 1) {
            emailModalSlot += "</div>";
          } else
            emailModalSlot +=
              '<div style="border-top:2px solid lightgray;margin: 0px 40px 0px 40px;"></div>';
        }
      }

      if (j == 0) {
        emailModalSlot +=
          '<div id="sidebar" style="float: right;width: 320px;background-color: white;">';
        emailModalSlot +=
          '<label class="slds-form-element__label" for="select-01" style="padding-top: 1rem;">Select OneLink Link</label>';
        emailModalSlot += "<article>";
        emailModalSlot +=
          '<div class="slds-card__header slds-grid" style="width: 100%; padding-left:0px !important;">';
        emailModalSlot +=
          '<header class="slds-media slds-media_center" style="width: 100%;">';
        emailModalSlot +=
          '<div class="slds-select_container" style="width: 100%;">';
        emailModalSlot += '<select class="slds-select" id="selectonelink">';
        emailModalSlot += '<option value="">Please select</option>';
        emailModalSlot += "</select>";
        emailModalSlot += "</div>";
        emailModalSlot += "</header>";
        emailModalSlot += "</div>";
        emailModalSlot += '<div class="slds-card__body"></div>';
        emailModalSlot += '<footer class="slds-card__footer"></footer>';
        emailModalSlot += "</article>";
        emailModalSlot += "</div>";
        emailModalSlot += '<div id="cleared" stlye="clear: both;"></div>';
        emailModalSlot += "</div>";
      } else {
        emailModalSlot += '<div id="cleared" stlye="clear: both;"></div>';
        emailModalSlot += "</div>";
      }

      if (j == emailforslot.length - 1) {
        emailModalSlot += '<footer class="slds-modal__footer">';
        emailModalSlot +=
          '<button class="slds-button slds-button_neutral" onclick="cancelUpdates()">Cancel</button>';
        emailModalSlot +=
          '<button class="slds-button slds-button_brand" onclick="confirmationAlert()">Save</button>';
        emailModalSlot += "</footer>";
      }

      $("#modalcontainer").append(emailModalSlot);
      if (j == 0) {
        getLinks();
      }
    }
  }
}

function getAllEmailsWithOneLinks(emailUpdated) {
  const url =
    "https://appsflyers-onelink-dev.herokuapp.com/sfmcHelper/getAllEmailsWithOneLinks";

  urlParams = {
    refresh_token: $("#rt").val(),
    eid: $("#eid").val(),
    tssd: $("#tssd").val(),
  };

  $.ajax({
    url,
    method: "POST",
    async: false,
    data: urlParams,
    success: data => {
      $("#rt").val(data.refresh_token);
      let emailswithonelink = data.body;
      UpsertEmailWithOneLinksDE(emailUpdated, emailswithonelink);
    },
    error(jqXHR, error, errorThrown) {
      console.log(error);
      console.log(errorThrown);
      console.log(jqXHR);
    },
  });
}

function UpsertEmailWithOneLinksDE(emailUpdated, emailswithonelink) {
  let currentCount = 0;
  for (let i = 0; i < emailswithonelink.length; i++) {
    const row = emailswithonelink[i];
    let linkID = row.Properties.Property[0].Value;
    let emailID = row.Properties.Property[1].Value;
    let emailName = row.Properties.Property[2].Value;
    let count = row.Properties.Property[3].Value;

    if (linkID == emailUpdated.OneLinkID && emailID == emailUpdated.EmailID)
      currentCount = count + 1;
  }

  if (currentCount == 0) currentCount = 1;

  const upsertRequest = {
    refresh_token: $("#rt").val(),
    tssd: $("#tssd").val(),
    Count: currentCount,
    EmailName: emailUpdated.EmailName,
    LinkID: emailUpdated.OneLinkID,
    EmailID: emailUpdated.EmailID,
  };

  $.ajax({
    url: "/sfmc/logEmailsWithOneLinks",
    method: "POST",
    async: false,
    data: upsertRequest,
    success(response) {
      $("#rt").val(response.refresh_token);
      console.log(response);
    },
  });
}

function LogHTMLEmailLinksUpdates(
  emailId,
  linktext,
  linkreplaced,
  onelinkid,
  onelinkurl,
  emailName
) {
  var date = new Date().toISOString();

  const data = {
    refresh_token: $("#rt").val(),
    tssd: $("#tssd").val(),
    LogID: undefined,
    EmailID: emailId,
    LinkText: linktext,
    LinkReplaced: linkreplaced,
    OneLinkID: onelinkid,
    OneLinkURL: onelinkurl,
    Modified: date,
    EmailName: emailName,
  };

  $.ajax({
    url: "/sfmc/UpsertLogHTMLEmailLinks",
    method: "POST",
    async: false,
    data: data,
    success(upsertHTMLLogData) {
      $("#rt").val(upsertHTMLLogData.refresh_token);
      getAllEmailsWithOneLinks(data);
      console.log(upsertHTMLLogData);
    },
  });
}

$(document).ready(() => {
  let linkstoupdate = [];
  let currentLinks = [];
  let currentEmail;
  let oneLink;
  let oneLinkId;

  const urlParams = getUrlParameters();
  $("#rt").val(urlParams.refresh_token);
  $("#eid").val(urlParams.enterpriseId);

  replaceUrlTOkens($("#rt").val());

  loadHtmlEmails(urlParams, "init", 1);

  $("#selectall").click(function () {
    $(":checkbox").prop("checked", this.checked);
  });
});
