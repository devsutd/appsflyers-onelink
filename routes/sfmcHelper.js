/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable consistent-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */

"use strict";

const request = require("request");
const soap = require("soap");
const parser = require("xml2js");
const { stripPrefix } = require("xml2js").processors;

function xmlToArray(rawResponse) {
 let data;
 parser.parseString(
  rawResponse, {
   tagNameProcessors: [stripPrefix],
  },
  (err, result) => {
   if (
    result.Envelope.Body[0].RetrieveResponseMsg[0].Results !== undefined
   ) {
    const rows = result.Envelope.Body[0].RetrieveResponseMsg[0].Results;

    if (rows.length >= 0) {
     const element = [];
     let index;
     for (index = 0; index < rows.length; index++) {
      const aux = rows[index].Properties[0].Property;
      const obj = {
       LinkName: "",
       LinkID: "",
       BaseURL: "",
       ContentsCount: "",
       Status: "",
       JSONParameters: "",
       Parameters: "",
       CustomParameters: "",
       FullURL: "",
       Created: "",
       Modified: "",
      };

      for (let j = 0; j < aux.length; j++) {
       const row = aux[j];

       if (row.Name[0] === "LinkID") {
        obj.LinkID = row.Value[0];
       }

       if (row.Name[0] === "LinkName") {
        obj.LinkName = row.Value[0];
       }

       if (row.Name[0] === "BaseURL") {
        obj.BaseURL = row.Value[0];
       }

       if (row.Name[0] === "ContentsCount") {
        obj.ContentsCount = row.Value[0];
       }

       if (row.Name[0] === "Status") {
        obj.Status = row.Value[0];
       }

       if (row.Name[0] === "Parameters") {
        obj.Parameters = row.Value[0];
       }

       if (row.Name[0] === "JSONParameters") {
        obj.JSONParameters = row.Value[0];
       }

       if (row.Name[0] === "CustomParameters") {
        obj.CustomParameters = row.Value[0];
       }

       if (row.Name[0] === "FullURL") {
        obj.FullURL = row.Value[0];
       }
       if (row.Name[0] === "Created") {
        obj.Created = row.Value[0];
       }
       if (row.Name[0] === "Modified") {
        obj.Modified = row.Value[0];
       }
      }
      element.push(obj);
     }
     console.log(element);
     data = element;
    }
   } // processed data
  }
 );
 return data;
}

function parseUpsertResponse(rawResponse) {
 let data;
 parser.parseString(
  rawResponse, {
   tagNameProcessors: [stripPrefix],
  },
  (err, result) => {
   console.log(result);
   if (result.Envelope.Body[0].UpdateResponse[0].Results !== undefined) {
    const rows = result.Envelope.Body[0].UpdateResponse[0].Results;
    data = rows[0];
    console.log(data);
   } // processed data
  }
 );
 return data;
}
exports.getAccessToken = (code) =>
 new Promise((resolve, reject) => {
  request({
    url: process.env.authEndpoint,
    method: "Post",
    json: {
     grant_type: "authorization_code",
     code,
     client_id: process.env.sfmcClientId,
     client_secret: process.env.sfmcClientSecret,
     redirect_uri: process.env.redirectURI,
    },
   },
   (err, response, body) => {
    if (err) {
     return reject(JSON.stringify(err));
    }

    if (body.error !== undefined) {
     return reject(JSON.stringify(body));
    }

    return resolve(body);
   }
  );
 });

// eslint-disable-next-line camelcase
exports.refreshToken = (refresh_token) =>
 new Promise((resolve, reject) => {
  request({
    url: process.env.authEndpoint,
    method: "Post",
    json: {
     grant_type: "refresh_token",
     client_id: process.env.sfmcClientId,
     client_secret: process.env.sfmcClientSecret,
     refresh_token: refresh_token,
    },
   },
   (err, response, body) => {
    if (err) {
     return reject(JSON.stringify(err));
    }

    if (body.error) {
     return reject(JSON.stringify(body.error));
    }

    return resolve(body);
   }
  );
 });

exports.authorize = async(req, res) => {
 await Promise.all([
  this.getAccessToken(req.body.code)
  .then((accessTokenbody) => {
   this.refreshToken(accessTokenbody.refresh_token)

   .then((refreshTokenbody) => {
     this.getUserInfo(refreshTokenbody.access_token)
      .then((getUserInfoBody) => {
       const getUserInfoResponse = JSON.parse(getUserInfoBody);
       const customResponse = {
        bussinessUnitInfo: getUserInfoResponse.organization,
        apiEndpoints: getUserInfoResponse.rest,
        refreshToken: refreshTokenbody.refresh_token,
       };
       const response = customResponse;

       return res(null, response);
      })
      .catch((err2) => {
       console.log(err2);
       return res(err2, null);
      });
    })
    .catch((err1) => {
     console.log(err1);
     return res(err1, null);
    });
  })
  .catch((err) => {
   console.log(err);
   return res(err, null);
  }),
 ]);
};

exports.getUserInfo = (accessToken) =>
 new Promise((resolve, reject) => {
  request({
    url: process.env.userInfo,
    method: "GET",
    headers: {
     "Content-Type": "application/json",
     Authorization: `Bearer ${accessToken}`,
    },
   },
   (err, response, body) => {
    if (err) return reject(err);
    resolve(body);
   }
  );
 });
exports.simpleFilter = (property, operator, value) => {
 const filter = {
  attributes: {
   "xsi:type": "SimpleFilterPart",
  },
  Property: property,
  SimpleOperator: operator,
  Value: value,
 };

 return filter;
};
exports.retrieveRequest = (client, requestObject) =>
 new Promise((resolve, reject) => {
  if (client === undefined) {
   console.error("invalid soap client");
   return reject("client is required");
  }

  if (requestObject === undefined) {
   console.error("invalid requestObject");
   return reject("requestObject is required");
  }

  client.Retrieve(requestObject, (err, res, rawResponse) => {
   if (err) {
    console.error("ERROR DETAILS: ", err);
    return reject(err);
   }
   const data = xmlToArray(rawResponse);
   resolve(data);
  });
 });
exports.createSoapClient = (refreshToken, callback) => {
 if (refreshToken === undefined) {
  console.error("invalid refresh_token");
  callback("refresh_token is required", null);
 }

 this.refreshToken(refreshToken)
  .then((response) => {
   soap.createClient(
    `${response.soap_instance_url}etframework.wsdl`, {},
    (err, client) => {
     if (err) {
      callback(err, null);
     } else {
      client.addSoapHeader({
       fueloauth: response.access_token,
      });

      const customResponse = {
       client,
       refresh_token: response.refresh_token,
       eid: "",
      };
      return callback(null, customResponse);
     }
    }
   );
  })
  .catch((err1) => {
   callback(err1, null);
  });
};

exports.UpdateRequestObject = (customerkey, keys, Properties) => {
 const UpdateRequest = {
  Options: {
   SaveOptions: {
    SaveOption: {
     PropertyName: "DataExtensionObject",
     SaveAction: "UpdateAdd",
    },
   },
  },
  Objects: [{
   attributes: {
    "xsi:type": "DataExtensionObject",
   },
   CustomerKey: customerkey,
   Keys: {
    Key: keys,
   },
   Properties: {
    Property: Properties,
   },
  }, ],
 };
 return UpdateRequest;
};

exports.upsertDataextensionRow = (client, UpdateRequest) =>
 new Promise((resolve, reject) => {
  if (client === undefined) {
   console.error("invalid soap client");
   return reject("client is required");
  }

  if (UpdateRequest === undefined) {
   console.error("invalid UpdateRequest");
   return reject("UpdateRequest is required");
  }

  client.Update(UpdateRequest, (err, res, rawResponse) => {
   if (err) {
    console.error("ERROR DETAILS: ", err);
    return reject(err);
   }
   resolve(parseUpsertResponse(rawResponse));
  });
 });

exports.createDataExtension = (client, CreateRequest) =>
 new Promise((resolve, reject) => {
  client.Create(CreateRequest, (e, r) => {
   if (e) {
    return reject(JSON.stringify(e));
   }

   return resolve(r);
  });
 });

function buildRetrieveRequestObject(enterpriseId, ObjectType, props, filter) {
 const requestObject = {
  RetrieveRequest: {
   ClientIDs: {
    ClientID: enterpriseId,
   },
   ObjectType,
   Properties: props,
   Filter: filter,
  },
 };

 return requestObject;
}
const ComplexFilter = (
 lProperty,
 lSimpleOperator,
 lvalue,
 logicalOperator,
 rProperty,
 rSimpleOperator,
 rvalue
) => {
 const filter = {
  attributes: {
   "xsi:type": "par:ComplexFilterPart",
   "xmlns:par": "http://exacttarget.com/wsdl/partnerAPI",
  },
  LeftOperand: {
   attributes: {
    "xsi:type": "par:SimpleFilterPart",
   },
   Property: lProperty,
   SimpleOperator: lSimpleOperator,
   Value: lvalue,
  },
  LogicalOperator: logicalOperator,
  RightOperand: {
   attributes: {
    "xsi:type": "par:SimpleFilterPart",
   },
   Property: rProperty,
   SimpleOperator: rSimpleOperator,
   Value: rvalue,
  },
 };
 return filter;
};

exports.retrieveFolder = (enterpriceId, name, client) =>
 new Promise((resolve, reject) => {
  const requestObject = buildRetrieveRequestObject(
   enterpriceId,
   "DataFolder", ["ID"],
   ComplexFilter(
    "Name",
    "equals",
    name,
    "AND",
    "ContentType",
    "equals",
    "shared_dataextension"
   )
  );

  client.Retrieve(requestObject, (e, r) => {
   if (e) {
    return reject(JSON.stringify(e));
   }

   return resolve(r);
  });
 });

exports.getTokenRows = (req, resp) => {
 this.createSoapClient(req.body.refresh_token, (e, response) => {
  if (e) {
   return resp.status(500).end(e);
  }

  const requestObject = {
   RetrieveRequest: {
    ClientIDs: {
     ClientID: req.body.eid,
    },
    ObjectType: `DataExtensionObject[${process.env.TokenAuthenticationDataExtension}]`,
    Properties: ["Token", "Authorized"],
    Filter: {
     attributes: {
      "xsi:type": "SimpleFilterPart",
     },
     Property: "Authorized",
     SimpleOperator: "equals",
     Value: true,
    },
   },
  };

  response.client.Retrieve(requestObject, (err, res) => {
   if (err) {
    console.error("ERROR DETAILS: ", err);
    return resp.send(400, err);
   }
   const r1 = {
    OverallStatus: res.OverallStatus,
    length: res.Results !== undefined ? res.Results.length : 0,
    refresh_token: response.refresh_token,
    enterpriseId: req.body.enterpriseId,
   };
   return resp(null, r1);
  });
 });
};