/* jshint esversion: 8 */
let emailswithonelink;
let times = 1;
/* eslint-disable no-nested-ternary */
/* eslint-disable no-undef */
function getCampaign(element) {
  const JSONParameters = JSON.parse(element.JSONParameters);
  const { AttributtionLinks } = JSONParameters;
  let Campaign = "";
  for (let index = 0; index < AttributtionLinks.length; index++) {
    const attrLink = AttributtionLinks[index];
    if (attrLink.name === "c") {
      Campaign = attrLink.value;
      break;
    }
  }
  return Campaign;
}

function Duplicate(element) {
  console.log(element);
  const date = new Date().toISOString();
  const postData = {
    refresh_token: $("#rt").val(),
    enterpriseId: $("#eid").val(),
    tssd: $("#tssd").val(),
    linkName: `${element.LinkName}_Copy`,
    baseUrl: element.BaseURL,
    status: "Active",
    JSONParameter: JSON.parse(element.JSONParameters),
    Parameters: element.Parameters,
    CustomParameters: element.CustomParameters,
    Created: date,
    Modified: date,
  };
  console.log(postData);
  $.ajax({
    url: "/UpsertLink",
    method: "POST",
    async: true,
    data: postData,
    success(data) {
      if (data.Status === "OK") {
        window.location.href = `/dashboard/home/?rt=${
          data.refresh_token
        }&eid=${$("#eid").val()}&tssd=${$("#tssd").val()}`;
      }
    },
  });
}

function ready() {
  if (times === 1) {
    updateEmailsCount();
    times++;
  }

  $(".slds-dropdown-trigger_click").hover(
    function () {
      $(this).addClass("slds-is-open");
      console.log($(this));
    },
    () => {
      console.log($(this));
      const elements = document.getElementsByClassName("slds-is-open");
      if (elements != undefined && elements.length > 0) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < elements.length; index++) {
          const elementid = elements[index].id;
          $(`#${elementid}`).removeClass("slds-is-open");
        }
      }
    }
  );

  $(".slds-dropdown-trigger_click").on("click", function (e) {
    console.log($(this));
    $(this).addClass("slds-is-open");
  });

  $(".edit").hover(
    () => {
      console.log(".edit");
      // $(this).addClass('slds-is-open');
    },
    function () {
      $(this).parent().removeClass("slds-is-open");
    }
  );

  $("#btn-create").on("click", e => {
    e.preventDefault();
    let redirectUrl = `/dashboard/create/?rt=${$("#rt").val()}`;
    redirectUrl += `&eid=${$("#eid").val()}&tssd=${$("#tssd").val()}`;
    window.location.href = redirectUrl;
  });

  $("#btn-create").on("click", e => {
    e.preventDefault();
  });

  $(".edit").on("click", function (e) {
    e.preventDefault();

    const href = $(this).attr("href");
    let link = href.replace("{0}", $("#eid").val());
    link = link.replace("{1}", $("#rt").val());
    link = link.replace("{2}", $("#tssd").val());
    window.location.href = link;
  });

  $(".tooltipcount-trigger").hover(
    function () {
      if ($(".tooltipcount", this)[0] !== undefined) {
        const tooltipId = $(".tooltipcount", this)[0].id;
        $(`#${tooltipId}`).show();
      }
    },
    function () {
      if ($(".tooltipcount", this)[0] !== undefined) {
        const tooltipId = $(".tooltipcount", this)[0].id;
        $(`#${tooltipId}`).hide();
      }
    }
  );
}

function hideSpinners() {
  let spinners = document.getElementsByClassName("demo-only");
  for (let index = 0; index < spinners.length; index++) {
    spinners[index].style.visibility = "hidden"; // or
    spinners[index].style.display = "none";
  }
}

function updateEmailsCount() {
  let urlParams = {
    refresh_token: $("#rt").val(),
    enterpriseId: $("#eid").val(),
    tssd: $("#tssd").val(),
  };

  $.ajax({
    url: "/sfmc/updateBlocksCount",
    method: "POST",
    async: true,
    data: urlParams,
    success: data => {
      urlParams.refresh_token = data.refresh_token;
      loadDashboards(urlParams, "init", 1);
    },
    error(jqXHR, error, errorThrown) {
      console.log(error);
      console.log(errorThrown);
      console.log(jqXHR);
    },
  });
}

function buildDashboard(links, from, page) {
  let table =
    '<div class="slds-lookup" data-select="multi" data-scope="single" data-typeahead="true">';
  table +=
    '<table class="slds-table slds-table_cell-buffer slds-no-row-hover slds-table_bordered slds-table_fixed-layout" role="grid" >';
  table += "<tr>";
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>OneLink Name</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="2"><b>Campaign</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" colspan="3"><b>Full URL</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" style="text-align:center;"><b># of Contents</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" ><b>Created</b></td>';
  table +=
    '<td class="header-dashboard" role="gridcell" scope="col" ><b>Modified</b></td>';
  table += '<td class="header-dashboard" role="gridcell" scope="col" ></td>';
  table += "</tr>";

  if (links !== undefined) {
    links.sort((a, b) =>
      new Date(a.Modified) < new Date(b.Modified)
        ? 1
        : new Date(b.Modified) < new Date(a.Modified)
        ? -1
        : 0
    );
    if (from === "init" || page === 1) {
      links = links.splice(0, 15);
      $("#currentDashboard").val(15);
    } else {
      const currentDashboard = $("#currentDashboard").val();
      links = links.splice(currentDashboard, 15);
      $("#currentDashboard").val(currentDashboard + 15);
    }

    let bottom;
    for (let index = 0; index < links.length; index++) {
      const element = links[index];
      const Campaign = getCampaign(element);
      const objectCount = getAllEmailsWithOneLinksByLinkID(
        emailswithonelink.body,
        element.LinkID
      );
      if (index === 0) bottom = 65;
      else bottom -= 25;

      table += "<tr>";

      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${element.LinkName}</div></td>`;
      table += `<td role="gridcell" colspan="2"><div class="slds-truncate" >${Campaign}</div></td>`;
      table += `<td role="gridcell" colspan="3"><div class="slds-truncate" title="${element.FullURL}">${element.FullURL}</div></td>`;
      table += `<td role="gridcell"><div id="count|${element.LinkID}" style="text-align:center;">`;

      table += '<div class="tooltipcount-trigger"  style="position:relative">';

      if (objectCount.count > 0) {
        table += `<div class="tooltipcount 
                                        slds-popover 
                                        slds-popover_tooltip 
                                        slds-nubbin_bottom-left" 
                                role="tooltip" 
                                id="tooltipcount-${element.LinkID}" 
                                style="position:fixed;right:27%; display:none;">`;
        table += '<div class="slds-popover__body">';
        for (let j = 0; j < objectCount.emails.length; j++) {
          if (j === 5) {
            table += `<div class="slds-m-top_x-small" aria-hidden="true"><a href="#" onclick="openEmailDetailsModal('${element.LinkID}')">See more</a></div>`;
            break;
          } else table += `${objectCount.emails[j]}<br>`;
        }
        table += "</div></div>";
      }
      table += `<a href="javascript:void(0)" aria-describedby="help">
                            <span class="slds-icon_container slds-icon-utility-info">${objectCount.count}</span>
                        </a></div>`;

      if (times === 1) {
        table += `<div class="demo-only" style="height:0rem;position:relative">
                            <div class="slds-spinner_container">
                                <div role="status" class="slds-spinner slds-spinner_small">
                                <span class="slds-assistive-text">Loading</span>
                                <div class="slds-spinner__dot-a"></div>
                                <div class="slds-spinner__dot-b"></div>
                                </div>
                            </div>
                            </div>`;
      } else {
        hideSpinners();
      }
      table += `</div><td role="gridcell"><div class="slds-truncate" >${element.Created}</div></td>`;
      table += `<td role="gridcell"><div class="slds-truncate" >${element.Modified}</div></td>`;
      table += "<td>";
      table += `<div id="onelink-trigger${element.LinkID}" class="slds-dropdown-trigger slds-dropdown-trigger_click" style="padding-left:50%;">`;
      table +=
        '<button class="slds-button slds-button_icon slds-button_icon-border-filled" >';
      table += '<svg class="slds-button__icon" aria-hidden="true">';
      table += '<use xlink:href="/mcapp/images/symbols.svg#down">';
      table += "</use>";
      table += "</svg>";
      table += "</button>";
      table +=
        '<div class="slds-dropdown slds-dropdown_left" style="margin-top: -1px!important">';
      table += '<ul class="slds-dropdown__list" role="menu" >';
      table += '<li class="slds-dropdown__item" role="presentation">';
      table += `<a href="/dashboard/edit/?lid=${element.LinkID}&eid={0}&rt={1}&tssd={2}" class="edit" id="edit${index}" role="menuitem" tabindex="0">`;
      table += '<span class="slds-truncate" title="Edit">Edit</span>';
      table += "</a></li>";
      table += '<li class="slds-dropdown__item" role="presentation">';
      table += `<a href="#" onclick="Duplicate(${element})" class="Duplicate" id="Duplicate${index}" role="menuitem" tabindex="0">`;
      table += '<span class="slds-truncate" title="Duplicate">Duplicate</span>';
      table += "</a></li>";
      table += "</ul>";
      table += "</div>";
      table += "</div>";
      table += "</div>";
      table += "</td>";
      table += "</tr>";
    }
  }
  table += "</table>";
  table += "</div>";

  $("#dashboard-table").empty();
  $("#dashboard-table").html(table);
  console.log("Empieza el proceso de actualizacion.....");
  ready();

  for (let index = 0; index < links.length; index++) {
    const element = links[index];
    document
      .getElementById(`Duplicate${index}`)
      .addEventListener("click", e => {
        e.preventDefault();
        Duplicate(element);
      });
  }
}

function replaceUrlTOkens(token) {
  if ($("#htmlemailsLink")[0] !== undefined) {
    $("#htmlemailsLink")[0].href = `/htmlemails/home?rt=${token}&eid=${$(
      "#eid"
    ).val()}&tssd=${$("#tssd").val()}`;
    $("#DashboardLink")[0].href = `/Dashboard/home?rt=${token}&eid=${$(
      "#eid"
    ).val()}&tssd=${$("#tssd").val()}`;
    console.log($("#htmlemailsLink")[0].href);
  }
}

function buildPaginator(allLinks) {
  const params = {
    refresh_token: $("#rt").val(),
    enterpriseId: $("#eid").val(),
  };
  let totalPages = Math.ceil(allLinks.length / 15);
  if (totalPages === 0) {
    totalPages++;
  }

  $("#pagination-demo").empty();

  $("#pagination-demo").removeData("twbs-pagination");

  $("#pagination-demo").unbind("page");

  $("#pagination-demo").twbsPagination({
    totalPages,
    visiblePages: 5,
    onPageClick(event, page) {
      const from = "paginator";
      getEmailsWithOneLinks(params, from, page);
    },
  });
}

function loadDashboards(urlParams, from, page) {
  const url = "/LoadDashboards";

  const inp = $("#lookup").val();
  if (from === "filtered") {
    urlParams = {
      refresh_token: $("#rt").val(),
      enterpriseId: $("#eid").val(),
      tssd: $("#tssd").val(),
    };
  }

  $.ajax({
    url,
    method: "POST",
    async: true,
    data: urlParams,
    success: data => {
      let links = data.data;
      $("#rt").val(data.refresh_token);
      replaceUrlTOkens($("#rt").val());
      if (inp !== undefined && links !== undefined) {
        links = links.filter(x => x.LinkName.toLowerCase().includes(inp));

        if (from !== "paginator") {
          buildPaginator(links);
        }

        buildDashboard(links, from, page);
      }
    },
    error(jqXHR, error, errorThrown) {
      alert("An error has occurred. Please refresh your browser.");
      console.error(error);
      console.error(errorThrown);
      console.error(jqXHR);
    },
  });
}

function getEmailsWithOneLinks(params, from, page) {
  const url = "/sfmcHelper/getAllEmailsWithOneLinks";

  let urlParams = {
    refresh_token: $("#rt").val(),
    eid: $("#eid").val(),
    tssd: $("#tssd").val(),
  };

  $.ajax({
    url,
    method: "POST",
    async: true,
    data: urlParams,
    success(data) {
      emailswithonelink = data;
      $("#rt").val(data.refresh_token);
      replaceUrlTOkens($("#rt").val());
      urlParams = {
        refresh_token: $("#rt").val(),
        enterpriseId: $("#eid").val(),
        tssd: $("#tssd").val(),
      };

      loadDashboards(urlParams, from, page);
    },
    error(jqXHR, error, errorThrown) {
      console.error(error);
      console.error(errorThrown);
      console.error(jqXHR);
    },
  });
}

function getAllEmailsWithOneLinksByLinkID(rows, currentLinkId) {
  let numberofcontents = 0;
  const emailArray = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const linkID = row.Properties.Property[0].Value;
    const emailName = row.Properties.Property[2].Value;
    const count = row.Properties.Property[3].Value;

    if (currentLinkId === linkID) {
      numberofcontents += parseInt(count);
      emailArray.push(`${emailName}(${count})`);
    }
  }

  const objectCount = {
    count: numberofcontents,
    emails: emailArray,
  };

  return objectCount;
}

function openEmailDetailsModal(linkId) {
  $("#emaildetails-modal").addClass("slds-fade-in-open");
  $("#background-modals-emaildetails").addClass("slds-backdrop_open");
  const modal = $("#emaildetails");
  modal.empty();
  const objectEmails = getAllEmailsWithOneLinksByLinkID(
    emailswithonelink.body,
    linkId
  );
  for (let i = 0; i < objectEmails.emails.length; i++) {
    const p = `<p><a href="#">${objectEmails.emails[i]}</a></p>`;
    modal.append(p);
  }
}

function closeModal() {
  $("#emaildetails-modal").removeClass("slds-fade-in-open");
  $("#background-modals-emaildetails").removeClass("slds-backdrop_open");
}

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

$(document).ready(() => {
  const urlParams = getUrlParameters();
  $("#eid").val(urlParams.enterpriseId);
  $("#tssd").val(urlParams.tssd);
  loadDashboards(urlParams, "init", 1);
});
