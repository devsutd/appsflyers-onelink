/* eslint-disable radix */
/* eslint-disable consistent-return */

"use strict";

const request = require("request");
const log4js = require("log4js");
const uuidv1 = require("uuid/v4");
const sfmcHelper = require("./sfmcHelper");

log4js.configure({
  appenders: { SFMC: { type: "file", filename: "./sfmc-app.log" } },
  categories: { default: { appenders: ["SFMC"], level: "ALL" } },
});
const logger = log4js.getLogger("app");

function assetObject(ImageName, fileBase64) {
  const requestObject = {
    name: ImageName,
    assetType: {
      id: 28,
    },
    file: fileBase64,
  };

  return JSON.stringify(requestObject);
}

function CreateContentBuilderJPG(data, accessToken) {
  console.log("SFMC LINEA 23: Dentro de CreateContentBuilderJPG");
  return new Promise((resolve, reject) => {
    const base64 = data.fileBase64.split(",")[1];
    // console.log(base64);
    const postData = assetObject(data.name, base64);
    request(
      {
        url: `https://${data.tssd}.rest.marketingcloudapis.com/asset/v1/content/assets`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: postData,
      },
      (err, _response, body) => {
        if (err) {
          return reject(err);
        }

        resolve(body);
      }
    );
  });
}

function ImagenStatus(data, accessToken) {
  console.log("SFMC LINEA 48 entro de CreateContentBuilderJPG");
  return new Promise((resolve, reject) => {
    const { id } = data;
    const endpoint = `https://${data.tssd}.rest.marketingcloudapis.com/asset/v1/content/assets?$filter=id%20eq%20${id}`;
    request(
      {
        url: endpoint,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
      (err, _response, body) => {
        if (err) {
          return reject(err);
        }
        // eslint-disable-next-line prefer-const
        let dataResp = {
          refresh_token: "",
          body: JSON.parse(body),
        };
        return resolve(dataResp);
      }
    );
  });
}

// eslint-disable-next-line no-unused-vars
exports.SaveImage = async (req, resp, _next) => {
  console.log("SFMC LINEA 76 Dentro de SaveImage");
  // return  resp.send(200, "body");

  await Promise.all([
    sfmcHelper
      .refreshToken(req.body.refresh_token, req.body.tssd)
      .then(data => {
        CreateContentBuilderJPG(req.body, data.access_token)
          .then(r => {
            const rsp = {
              refresh_token: data.refresh_token,
              data: r,
            };

            console.log("SFMC LINEA 90 Save Image - OK");
            console.log("SFMC LINEA 91", r);
            return resp.status(200).send(rsp);
          })
          .catch(e => {
            console.log("ERROR ON SFMC LINEA 95 Save Image - Error");
            console.log("ERROR ON SFMC.JS LINEA 96", e);
            return resp.status(200).end(e);
          });
      })
      .catch(err => resp.status(500).end(err)),
  ]);
};

exports.GetImageStatus = (req, resp) => {
  console.log("SFMC LINEA  105: Dentro de GetImageStatus");
  // return  resp.send(200, "body");

  sfmcHelper
    .refreshToken(req.body.refresh_token, req.body.tssd)
    .then(data => {
      ImagenStatus(req.body, data.access_token)
        .then(r => {
          // eslint-disable-next-line no-param-reassign
          r.refresh_token = data.refresh_token;
          console.log("SFMC LINEA  115: Get Image status - OK");
          return resp.status(200).send(r);
        })
        .catch(e => {
          console.log("SFMC LINEA  119:  ERROR ON SFMC.JS LINEA 119", e);
          console.log("SFMC LINEA  120: Get Image status - Error");
          return resp.status(200).send(e);
        });
    })
    .catch(err => resp.status(500).end(err));
};

exports.GetLinks = (req, resp) => {
  sfmcHelper.createSoapClient(req.query.rt, req.query.tssd, (e, response) => {
    if (e) {
      return resp.status(401).send(e);
    }

    const requestObject = {
      RetrieveRequest: {
        ClientIDs: {
          ClientID: req.query.eid,
        },
        ObjectType: `DataExtensionObject[${process.env.LinkDataExtension}]`,
        Properties: [
          "LinkID",
          "LinkName",
          "BaseURL",
          "ContentsCount",
          "Status",
          "JSONParameters",
          "Parameters",
          "CustomParameters",
          "FullURL",
          "Modified",
        ],
        Filter: sfmcHelper.simpleFilter("Flag", "equals", 1),
      },
    };

    sfmcHelper
      .retrieveRequest(response.client, requestObject)
      .then(body => {
        const responseObje = {
          links: body,
          refresh_token: response.refresh_token,
        };

        return resp.status(200).send(responseObje);
      })
      .catch(err => {
        console.log("ERROR ON SFMC HELPER LINE 167", err);
        return resp.status(500).send(err);
      });
  });
};

exports.UpsertImageRow = (req, resp) => {
  console.log("SFMC LINEA  173: UpsertImageRow process start...");
  sfmcHelper.createSoapClient(
    req.body.refresh_token,
    req.body.tssd,
    (e, response) => {
      if (e) {
        console.log("ERROR ON SFMC.JS LINEA 180", e);
        return resp.status(500).end(e);
      }

      const Properties = [
        {
          Name: "Url",
          Value: req.body.Url,
        },
        {
          Name: "LinkID",
          Value: req.body.LinkID,
        },
        {
          Name: "AltText",
          Value: req.body.AltText,
        },
        {
          Name: "Width",
          Value: req.body.Width,
        },
        {
          Name: "Height",
          Value: req.body.Height,
        },
      ];
      const UpdateRequest = sfmcHelper.UpdateRequestObject(
        process.env.ImageContentBlockDataExtension,
        [
          {
            Name: "ContentBlockID",
            Value:
              req.body.ContentBlockID === undefined
                ? uuidv1()
                : req.body.ContentBlockID,
          },
        ],
        Properties
      );

      sfmcHelper
        .upsertDataextensionRow(response.client, UpdateRequest)
        .then(body => {
          if (body.StatusCode !== undefined) {
            const r1 = {
              refresh_token: response.refresh_token,
              Status: body.StatusCode[0],
            };
            console.log("SFMC LINEA  222:  UpsertImageRow process end...");
            return resp.send(200, r1);
          }
          console.log("UpsertImageRow process end...");
          return resp.send(200, body);
        })
        .catch(err => resp.send(400, err));
    }
  );
};

exports.UpsertButtonRow = (req, resp) => {
  console.log("SFMC LINEA  234:  UpsertButtonRow  process start...");
  sfmcHelper.createSoapClient(
    req.body.refresh_token,
    req.body.tssd,
    (e, response) => {
      if (e) {
        console.log("SFMC LINEA  240:  ERROR ON SFMC.JS LINEA 241", e);
        return resp.status(500).send(e);
      }

      const Properties = [
        {
          Name: "LinkID",
          Value: req.body.linkID,
        },
        {
          Name: "BackgroundColor",
          Value: req.body.backgroundColor,
        },
        {
          Name: "RoundedCorners",
          Value: req.body.roundedCorners,
        },
        {
          Name: "TextAlignment",
          Value: req.body.textAlignment,
        },
        {
          Name: "PaddingTop",
          Value: req.body.paddingTop,
        },
        {
          Name: "PaddingRight",
          Value: req.body.paddingRight,
        },
        {
          Name: "PaddingBotom",
          Value: req.body.paddingBotom,
        },
        {
          Name: "PaddingLeft",
          Value: req.body.paddingLeft,
        },
        {
          Name: "MarginTop",
          Value: req.body.marginTop,
        },
        {
          Name: "MarginBottom",
          Value: req.body.marginBottom,
        },
        {
          Name: "MarginRight",
          Value: req.body.marginRight,
        },
        {
          Name: "MarginLeft",
          Value: req.body.marginLeft,
        },
      ];
      const UpdateRequest = sfmcHelper.UpdateRequestObject(
        process.env.ButtonContentBlockDataExtension,
        [
          {
            Name: "ContentBlockID",
            Value:
              req.body.contentBlockID === undefined
                ? uuidv1()
                : req.body.contentBlockID,
          },
        ],
        Properties
      );

      sfmcHelper
        .upsertDataextensionRow(response.client, UpdateRequest)
        .then(body => {
          if (body.OverallStatus !== undefined) {
            const r1 = {
              refresh_token: response.refresh_token,
              Status: body.OverallStatus,
            };
            console.log("SFMC LINEA  311: UpsertButtonRow  process end...");
            return resp.send(200, r1);
          }
          console.log("SFMC LINEA  314: UpsertButtonRow  process end...");
          return resp.send(200, body);
        })
        .catch(err => {
          console.error(err);
          return resp.send(400, err);
        });
    }
  );
};
exports.UpsertLink = (req, resp) => {
  console.log("SFMC LINEA  325:  UpsertLink  process start...");
  sfmcHelper.createSoapClient(
    req.body.refresh_token,
    req.body.tssd,
    (e, response) => {
      if (e) {
        console.log("SFMC LINEA  331: ERROR ON UPSERT LINK", e);
        return resp.status(500).end(e);
      }

      const Properties = [
        {
          Name: "ContentsCount",
          Value: parseInt(req.body.contentsCount) + 1,
        },
      ];

      const UpdateRequest = sfmcHelper.UpdateRequestObject(
        process.env.LinkDataExtension,
        [
          {
            Name: "LinkID",
            Value: req.body.LinkID === undefined ? uuidv1() : req.body.LinkID,
          },
        ],
        Properties
      );

      sfmcHelper
        .upsertDataextensionRow(response.client, UpdateRequest)
        .then(body => {
          if (body.OverallStatus !== undefined) {
            const r1 = {
              refresh_token: response.refresh_token,
              Status: body.OverallStatus[0],
            };
            console.log("SFMC LINEA  356: UpsertLink  process end...");
            return resp.status(200).send(r1);
          }
          console.log("SFMC LINEA  359:  UpsertLink  process end...");
          return resp.status(200).send(body);
        })
        .catch(err => resp.status(500).send(err));
    }
  );
};

function getEmailsFilter(id, type) {
  let filter = {};
  if (type === "htmlemail") {
    filter = {
      page: {
        page: 1,
        pageSize: 250,
      },
      query: {
        leftOperand: {
          property: "assetType.id",
          simpleOperator: "equal",
          value: id,
        },
        logicalOperator: "AND",
        rightOperand: {
          property: "assetType.name",
          simpleOperator: "equal",
          value: type,
        },
      },
      sort: [
        {
          property: "id",
          direction: "ASC",
        },
      ],
    };
  } else {
    filter = {
      page: {
        page: 1,
        pageSize: 50,
      },
      query: {
        leftOperand: {
          property: "assetType.id",
          simpleOperator: "equal",
          value: 207,
        },
        logicalOperator: "AND",
        rightOperand: {
          property: "views.html.slots",
          simpleOperator: "isNotNull",
        },
      },
      fields: [
        "id",
        "customerKey",
        "objectID",
        "name",
        "views",
        "content",
        "data",
      ],
    };
  }
  return filter;
}

function contentAssetsQuery(filter, accessToken, tssd) {
  console.log("SFMC LINEA  426:  contentAssetsQuery process start...");
  return new Promise((resolve, reject) => {
    request(
      {
        url: `https://${tssd}.rest.marketingcloudapis.com/asset/v1/content/assets/query`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(filter),
      },
      (err, _response, body) => {
        if (err) {
          console.log("ERROR ON SFMC.JS LINEA 440", err);
          reject(err);
        }
        console.log("SFMC LINEA  442:  contentAssetsQuery process start...");
        return resolve(JSON.parse(body));
      }
    );
  });
}

exports.GetContentBuilderTemplateBasedEmails = req => {
  console.log(
    "SFMC LINEA  449: GetContentBuilderTemplateBasedEmails process start..."
  );
  return new Promise((resolve, reject) => {
    sfmcHelper
      .refreshToken(req.body.refresh_token, req.body.tssd)
      .then(rtResponse => {
        logger.info(`refresh token response ${rtResponse}`);
        const filter = getEmailsFilter(207, "templatebasedemail");
        logger.info(`filter ${filter}`);
        const response = {
          refresh_token: rtResponse.refresh_token,
        };
        contentAssetsQuery(filter, rtResponse.access_token, req.body.tssd)
          .then(emails => {
            //    console.log(`emails ${emails}`);
            filter.page.pageSize = emails.count;
            console.log("SFMC HELPER 461 - EMAILS COUNT: ", emails.count);
            if (emails.count > 250) {
              contentAssetsQuery(
                filter,
                rtResponse.access_token,
                req.body.tssd
              ).then(allEmails => {
                response.body = allEmails;
                console.log(
                  "SFMC LINEA  465:  GetContentBuilderTemplateBasedEmails process end..."
                );
                return resolve(response);
              });
            } else {
              response.body = emails;
              console.log(
                "SFMC LINEA  470:  GetContentBuilderTemplateBasedEmails process end..."
              );
              return resolve(response);
            }
          })
          .catch(err => {
            console.log("ERROR ON SFMC.JS LINEA 476", err);
            return reject(err);
          });
      });
  });
};

exports.GetContentBuilderEmails = (req, resp) => {
  console.log("SFMC LINEA  483: GetContentBuilderEmails process start...");
  sfmcHelper
    .refreshToken(req.body.accessToken, req.body.tssd)
    .then(rtResponse => {
      const filter = getEmailsFilter(208, "htmlemail");
      request(
        {
          url: `https://${req.body.tssd}.rest.marketingcloudapis.com/asset/v1/content/assets/query`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${rtResponse.access_token}`,
          },
          body: JSON.stringify(filter),
        },
        (err, _response, body) => {
          console.log("SFMC LINEA  498: ", _response);
          if (err) {
            console.error(err);
            return resp.status(401).send(err);
          }

          const response = {
            refresh_token: rtResponse.refresh_token,
            body: JSON.parse(body),
          };
          // eslint-disable-next-line prefer-const
          console.log(
            "SFMC LINEA  509: GetContentBuilderEmails process end..."
          );
          return resp.status(200).send(response);
        }
      );
    });
};

exports.UpdateEmail = (req, resp) => {
  console.log("SFMC LINEA  563: UpdateEmail process start...");
  sfmcHelper
    .refreshToken(req.body.accessToken, req.body.tssd)
    .then(refreshTokenbody => {
      request(
        {
          url: `https://${req.body.tssd}.rest.marketingcloudapis.com/asset/v1/content/assets/${req.body.id}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshTokenbody.access_token}`,
          },
        },
        (err, _response, body) => {
          if (err) {
            console.err(err);
            return resp.status(401).send(err);
          }
          var response = {
            refresh_token: refreshTokenbody.refresh_token,
            body: JSON.parse(body),
          };

          var htmlEmail = response.body.views.html.content;
          var linkstoreplace = req.body.linkstoreplace;
          var objectLink = {};
          objectLink.Links = [];

          for (var i = 0; i < linkstoreplace.length; i++) {
            objectLink.Links.push(req.body.urls.Links[linkstoreplace[i]]);
          }

          for (var i = 0; i < linkstoreplace.length; i++) {
            var oldString = objectLink.Links[i].htmlLink;
            oldString = oldString.replace("amp;", "");
            var oldStringLength = oldString.length;
            var htmlBeforeLink = htmlEmail.substring(
              0,
              htmlEmail.indexOf(oldString)
            );
            var htmlafterLink = htmlEmail.substring(
              htmlBeforeLink.length + oldStringLength,
              htmlEmail.length
            );
            var newString = oldString.replace(
              objectLink.Links[i].href,
              req.body.oneLink
            );

            htmlEmail = htmlBeforeLink + newString + htmlafterLink;

            console.log("oldString");
            console.log(oldString);
            console.log("oldStringLength");
            console.log(oldStringLength);
            console.log("htmlBeforeLink IN FOR");
            console.log(htmlBeforeLink);
            console.log("old Link");
            console.log(objectLink.Links[i].href);
            console.log("new Link");
            console.log(req.body.oneLink);
            console.log("newString IN FOR");
            console.log(newString);
          }

          response.body.views.html.content = htmlEmail;
          console.log("htmlBeforeLink");
          console.log(htmlBeforeLink);
          console.log("newString");
          console.log(newString);
          console.log("htmlafterLink");
          console.log(htmlafterLink);

          console.log("SFMC LINEA  516: UpdateEmail process start...");
          sfmcHelper
            .refreshToken(req.body.accessToken, req.body.tssd)
            .then(refreshTokenbody => {
              request(
                {
                  url: `https://${req.body.tssd}.rest.marketingcloudapis.com/asset/v1/content/assets/${req.body.id}`,
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshTokenbody.access_token}`,
                  },
                  body: JSON.stringify(response.body),
                },
                (err, _response, body) => {
                  if (err) {
                    console.log("ERROR ON SFMC.JS LINEA 532", err);
                    return resp.status(401).send(err);
                  }
                  var response = {
                    refresh_token: refreshTokenbody.refresh_token,
                    body,
                  };
                  console.log("SFMC LINEA  637: UpdateEmail process end...");
                  console.log(body);
                  return resp.status(200).send(response);
                }
              );
            });
        }
      );
    });
};
exports.GetEmailByID = (req, resp) => {
  console.log("SFMC LINEA  544: GetEmailByID process start...");
  sfmcHelper
    .refreshToken(req.body.accessToken, req.body.tssd)
    .then(refreshTokenbody => {
      request(
        {
          url: `https://${req.body.tssd}.rest.marketingcloudapis.com/asset/v1/content/assets/${req.body.id}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshTokenbody.access_token}`,
          },
        },
        (err, _response, body) => {
          if (err) {
            console.err(err);
            return resp.status(401).send(err);
          }
          const response = {
            refresh_token: refreshTokenbody.refresh_token,
            body: JSON.parse(body),
          };
          console.log("SFMC LINEA  565: GetEmailByID process end...");
          return resp.status(200).send(response);
        }
      );
    });
};

exports.GetCampaigns = (req, resp) => {
  console.log("SFMC LINEA  572: GetCampaigns process start...");
  sfmcHelper
    .refreshToken(req.body.accessToken, req.body.tssd)
    .then(refreshTokenbody => {
      console.log("SFMC LINEA  576: ", refreshTokenbody);
      request(
        {
          url: `https://${req.body.tssd}.rest.marketingcloudapis.com/hub/v1/campaigns`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshTokenbody.access_token}`,
          },
        },
        (err, _response, body) => {
          if (err) {
            console.log("ERROR ON SFMC.JS LINEA 588", err);
            return resp.status(401).send(err);
          }
          console.log("SFMC LINEA  590: ", JSON.parse(body));
          const response = {
            refresh_token: refreshTokenbody.refresh_token,
            body: JSON.parse(body),
          };
          // eslint-disable-next-line prefer-const
          console.log("SFMC LINEA  596: GetCampaigns process end...");
          return resp.status(200).send(response);
        }
      );
    });
};

exports.GetAllContentBuilderAssets = (req, resp) => {
  console.log("SFMC LINEA  603: GetAllContentBuilderAssets process start...");
  sfmcHelper
    .refreshToken(req.body.accessToken, req.body.tssd)
    .then(rtResponse => {
      request(
        {
          url: `https://${req.body.tssd}.rest.marketingcloudapis.com/asset/v1/content/assets/`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${rtResponse.access_token}`,
          },
        },
        (err, _response, body) => {
          if (err) {
            console.log("ERROR ON SFMC.JS LINEA 618", err);
            return resp.status(401).send(err);
          }
          const response = {
            refresh_token: rtResponse.refresh_token,
            body,
          };
          // eslint-disable-next-line prefer-const

          console.log(
            "SFMC LINEA  626: GetAllContentBuilderAssets process end..."
          );
          return resp.status(200).send(response);
        }
      );
    });
};

exports.UpsertEmailsWithOneLinks = req => {
  console.log("SFMC LINEA  633: UpsertEmailsWithOneLinks process start...");
  return new Promise((resolve, reject) => {
    console.log(`SFMC LINEA  635:  refresh token ${req.body.refresh_token}`);
    console.log(`SFMC LINEA  636: tssd ${req.body.tssd}`);
    sfmcHelper.createSoapClient(
      req.body.refresh_token,
      req.body.tssd,
      (e, response) => {
        if (e) {
          return reject(e);
        }

        sfmcHelper
          .upsertDataextensionRow(response.client, req.body.UpdateRequest)
          .then(body => {
            console.log("SFMC LINEA  548: ", body);
            if (body.OverallStatus !== undefined) {
              const r1 = {
                refresh_token: response.refresh_token,
                Status: body.OverallStatus,
              };
              console.log(
                "SFMC LINEA  654: UpsertEmailsWithOneLinks process end..."
              );
              return resolve(r1);
            }

            console.log(
              "SFMC LINEA  658: UpsertEmailsWithOneLinks process end..."
            );
            return resolve(body);
          })
          .catch(err => {
            console.log("ERROR ON SFMC.JS LINEA 664", err);
            return reject(err);
          });
      }
    );
  });
};

exports.UpsertLogHTMLEmailLinks = (req, resp) => {
  console.log("SFMC LINEA  671: UpsertLogHTMLEmailLinks process start...");
  sfmcHelper.createSoapClient(
    req.body.refresh_token,
    req.body.tssd,
    (e, response) => {
      if (e) {
        console.error(e);
        return resp.status(500).end(e);
      }

      const Properties = [
        {
          Name: "EmailID",
          Value: req.body.EmailID,
        },
        {
          Name: "LinkText",
          Value: req.body.LinkText,
        },
        {
          Name: "LinkReplaced",
          Value: req.body.LinkReplaced,
        },
        {
          Name: "OneLinkID",
          Value: req.body.OneLinkID,
        },
        {
          Name: "OneLinkURL",
          Value: req.body.OneLinkURL,
        },
        {
          Name: "Modified",
          Value: req.body.Modified,
        },
      ];
      const UpdateRequest = sfmcHelper.UpdateRequestObject(
        process.env.LogEmailLinks,
        [
          {
            Name: "LogID",
            Value: req.body.LogID === undefined ? uuidv1() : req.body.LogID,
          },
        ],
        Properties
      );

      sfmcHelper
        .upsertDataextensionRow(response.client, UpdateRequest)
        .then(body => {
          if (body.StatusCode !== undefined) {
            const r1 = {
              refresh_token: response.refresh_token,
              Status: body.StatusCode[0],
              Body: body,
            };
            console.log(
              "SFMC LINEA  723: UpsertLogHTMLEmailLinks process end..."
            );
            return resp.send(200, r1);
          }

          body.refresh_token = response.refresh_token;
          console.log(
            "SFMC LINEA  728: UpsertLogHTMLEmailLinks process end..."
          );
          return resp.send(200, body);
        })
        .catch(err => {
          console.error(err);
          return resp.send(400, err);
        });
    }
  );
};

exports.logEmailsWithOneLinks = (req, resp) => {
  console.log("SFMC LINEA  740: logEmailsWithOneLinks process start...");
  sfmcHelper.createSoapClient(
    req.body.refresh_token,
    req.body.tssd,
    (e, response) => {
      if (e) {
        console.log("SFMC LINEA  746: ERROR ON SFMC.JS LINEA 748", e);
        return resp.status(500).send(e);
      }

      const Properties = [
        { Name: "Count", Value: req.body.Count },
        { Name: "EmailName", Value: req.body.EmailName },
      ];
      const UpdateRequest = sfmcHelper.UpdateRequestObject(
        process.env.EmailsWithOneLinks,
        [
          { Name: "LinkID", Value: req.body.LinkID },
          { Name: "EmailID", Value: req.body.EmailID },
        ],
        Properties
      );
      sfmcHelper
        .upsertDataextensionRow(response.client, UpdateRequest)
        .then(body => {
          const r1 = {
            refresh_token: response.refresh_token,
            body,
          };
          console.log("SFMC LINEA  768: logEmailsWithOneLinks process end...");
          return resp.status(200).send(r1);
        })
        .catch(err => {
          console.log("ERROR ON SFMC.JS LINEA 774", err);
          return resp.status(400).send(err);
        });
    }
  );
};

function countDuplicados(links) {
  const data = [];
  for (let index = 0; index < links.length; index++) {
    const element = links[index];
    if (element.Links !== undefined) {
      let yaExiste = false;
      element.Links.forEach(linkid => {
        for (let j = 0; j < data.length; j++) {
          const e = data[j];
          if (e.EmailID === element.EmailID && e.LinkID === linkid) {
            yaExiste = true;
          }
        }
        if (yaExiste === false) {
          data.push({
            EmailID: element.EmailID,
            EmailName: element.EmailName,
            LinkID: linkid,
            Count: element.Links.filter(i => i === linkid).length,
          });
        }
      });
    }
  }
  console.log(Array.from(new Set(data)));
  return data;
}

function processEmailBody(blocks, data) {
  if (blocks !== undefined) {
    const blocksKeys = Object.keys(blocks);
    for (let j = 0; j < blocksKeys.length; j++) {
      const contentblock = blocks[blocksKeys[j]];
      if (contentblock.assetType.name === "customblock") {
        if (contentblock.meta !== undefined) {
          const { options } = contentblock.meta;
          if (options !== undefined) {
            if (options.customBlockData !== undefined) {
              console.log("customBlockData: ", options.customBlockData);
              const { linkID } = options.customBlockData;
              if (linkID !== undefined && linkID !== "") {
                data.Links.push(linkID);
              }
            }
          }
        }
      }
    }
  }
  return data;
}

function emailsUsingCustomBlocks(emails) {
  const dataforUpsert = [];
  for (let index = 0; index < emails.length; index++) {
    const element = emails[index];
    const data = {
      EmailID: element.id,
      EmailName: element.name,
      Links: [],
      Count: [],
    };
    const { slots } = element.views.html;
    if (slots.main !== undefined) {
      const { blocks } = slots.main;
      processEmailBody(blocks, data);
    }

    if (slots.banner !== undefined) {
      const { blocks } = slots.banner;
      processEmailBody(blocks, data);
    }
    if (data.Links.length > 0) {
      dataforUpsert.push(data);
    }
  }
  console.log("index.JS LINEA 67: ", dataforUpsert);
  return countDuplicados(dataforUpsert);
}

function UpdateRequestObjectMulipleRows(upsertData, eid) {
  console.log("INDEX LINEA 62", eid);
  const UpdateRequest = {
    Options: {
      SaveOptions: {
        SaveOption: {
          PropertyName: "DataExtensionObject",
          SaveAction: "UpdateAdd",
        },
      },
      ClientIDs: {
        ClientID: eid,
      },
    },
    Objects: [],
  };
  for (let index = 0; index < upsertData.length; index++) {
    const element = upsertData[index];
    UpdateRequest.Objects.push({
      attributes: {
        "xsi:type": "DataExtensionObject",
      },
      CustomerKey: process.env.EmailsWithOneLinks,
      Keys: [
        {
          Key: [
            {
              Name: "LinkID",
              Value: element.LinkID,
            },
            {
              Name: "EmailID",
              Value: element.EmailID,
            },
          ],
        },
      ],
      Properties: [
        {
          Property: [
            {
              Name: "EmailName",
              Value: element.EmailName,
            },
            {
              Name: "Count",
              Value: element.Count,
            },
          ],
        },
      ],
    });
  }

  return UpdateRequest;
}

exports.updateBlocksCount = (req, res) => {
  this.GetContentBuilderTemplateBasedEmails(req)
    .then(emails => {
      const upsertData = emailsUsingCustomBlocks(emails.body.items);

      this.UpsertEmailsWithOneLinks({
        body: {
          refresh_token: emails.refresh_token,
          tssd: req.body.tssd,
          UpdateRequest: UpdateRequestObjectMulipleRows(
            upsertData,
            req.body.eid
          ),
        },
      }).then(r2 => {
        console.log(
          ` Response for GetContentBuilderTemplateBasedEmails : ${r2}`
        );
        return res.status(200).send(r2);
      });
    })
    .catch(e2 => {
      console.log(`Error en update blocks count: ${e2}`);
      return res.status(400).send(e2);
    });
};
