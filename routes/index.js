/* eslint-disable max-len */
const sfmcHelper = require("./sfmcHelper");
const sfmc = require("./sfmc");
const installAppExchange = require("./InstallAppExchange");

function countDuplicados(links) {
 const data = [];
 for (let index = 0; index < links.length; index++) {
  const element = links[index];
  element.Links.forEach((linkid) => {
   data.push({
    EmailID: element.EmailID,
    EmailName: element.EmailName,
    LinkID: linkid,
    count: element.Links.filter((i) => i === linkid).length,
   });
  });
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
   countByLink: [],
  };
  const { slots } = element.views.html;
  if (slots.main !== undefined) {
   const { blocks } = slots.main;
   if (blocks !== undefined) {
    const blocksKeys = Object.keys(blocks);
    for (let j = 0; j < blocksKeys.length; j++) {
     const contentblock = blocks[blocksKeys[j]];
     if (contentblock.assetType.name === "customblock") {
      if (contentblock.meta !== undefined) {
       const { options } = contentblock.meta;
       if (options !== undefined) {

        data.Links.push(options.linkID);
       }
      }
     }
    }

    dataforUpsert.push(data);
   }
  }
 }

 return countDuplicados(dataforUpsert);
}

function UpdateRequestObjectMulipleRows(upsertData) {
 const UpdateRequest = {
  Options: {
   SaveOptions: {
    SaveOption: {
     PropertyName: "DataExtensionObject",
     SaveAction: "UpdateAdd",
    },
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
   Keys: [{
    Key: [{
      Name: "LinkID",
      Value: element.LinkID,
     },
     {
      Name: "EmailID",
      Value: element.EmailID,
     },
    ],
   }, ],
   Properties: [{
    Property: [{
      Name: "EmailName",
      Value: element.EmailName,
     },
     {
      Name: "Count",
      Value: element.Count,
     },
    ],
   }, ],
  });
  console.log(UpdateRequest);
 }

 return UpdateRequest;
}

// eslint-disable-next-line consistent-return
exports.login = (req, res) => {
 try {
  if (req.query.code === undefined) {
   let stateParam = "&state=mcapp";
   if (req.query.state !== undefined) {
    stateParam = `&state=${req.query.state}`;
   }
   const redirectUri = `${process.env.baseAuth}/v2/authorize?response_type=code&client_id=${process.env.sfmcClientId}&redirect_uri=${process.env.redirectURI}${stateParam}`;
   // res.redirect('https://mc8nghvf-gp9-nfl9jcsjjs7r214.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id=g7j9nk7vj5o6dv1v9j34d9ei&redirect_uri=https://appsflyer-mc-app-dev.herokuapp.com/login&state=mystate');
   res.redirect(redirectUri);
  } else {
   console.log("Entro con el codigo de authenticacion");
   const tssd = req.query.tssd === undefined ? "" : req.query.tssd;
   console.log("Estado : ", req.query.state);
   const { state } = req.query;
   const request = {
    body: {
     code: req.query.code,
     tssd,
    },
   };

   console.log(req.query.code);

   if (state === "mcapp") {
    sfmcHelper.authorize(request, (e, r) => {
     if (e) {
      res.status(400).end(e);
      return;
     }
     const Request2 = {
      body: {
       refresh_token: r.refreshToken,
       eid: r.bussinessUnitInfo.enterprise_id,
      },
     };
     // eslint-disable-next-line consistent-return
     sfmcHelper.getTokenRows(Request2, (error, response) => {
      if (!error) {
       // console.log(response.OverallStatus.indexOf("Error: Data extension does not exist"))

       if (response.OverallStatus !== "OK") {
        installAppExchange
         .createDataExtensions(Request2)
         .then((resp) => {
          console.log(resp);
          const view = `/mcapp/home?eid=${resp.eid}&rt=${resp.refresh_token}`;
          return res.redirect(view);
         })
         .catch((err) => {
          console.log(err);
         });
       } else {
        // si ok y hay datos redirecciono al dashboard
        Request2.body.refresh_token = response.refresh_token;
        sfmc
         .GetContentBuilderTemplateBasedEmails(Request2)
         .then((emails) => {
          const upsertData = emailsUsingCustomBlocks(
           emails.body.items
          );

          const upsertRequest = {
           body: {
            refresh_token: emails.refresh_token,
            UpdateRequest: UpdateRequestObjectMulipleRows(
             upsertData
            ),
           },
          };
          sfmc
           .UpsertEmailsWithOneLinks(upsertRequest)
           .then((r2) => {
            let view = "";
            if (response.length > 0) {
             view = `/dashboard/home?eid=${r.bussinessUnitInfo.enterprise_id}&rt=${r2.refresh_token}`;
            } else {
             // si no  hay datos redirecciono al home
             view = `/mcapp/home?eid=${r.bussinessUnitInfo.enterprise_id}&rt=${r2.refresh_token}`;
            }
            return res.redirect(view);
           })
           .catch((e2) => {
            console.log(e2);
           });
         });
       }
      }
     });
    });
   }

   if (state === "image" || state === "button") {
    let returnView = "";
    console.log(state);

    sfmcHelper.authorize(request, (e, r) => {
     if (e) {
      res.status(400).end(e);
      return;
     }

     if (state === "image") {
      returnView = `/image/?rt=${r.refreshToken}&eid=${r.bussinessUnitInfo.enterprise_id}`;
     } else {
      returnView = `/button/?rt=${r.refreshToken}&eid=${r.bussinessUnitInfo.enterprise_id}`;
     }

     console.log("Authorized: ", r);
     console.log("Redirect Uri: ", returnView);
     res.redirect(returnView);
    });
   }
  }
 } catch (err) {
  return res.status(200).send(err);
 }
};

exports.logout = (req) => {
 req.session.token = "";
};