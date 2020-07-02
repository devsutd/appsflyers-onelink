/* eslint-disable consistent-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable max-len */
const sfmcHelper = require('./sfmcHelper');

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

const ComplexFilter = (lProperty,
 lSimpleOperator,
 lvalue,
 logicalOperator,
 rProperty,
 rSimpleOperator,
 rvalue) => {
 const filter = {
  attributes: {
   'xsi:type': 'par:ComplexFilterPart',
   'xmlns:par': 'http://exacttarget.com/wsdl/partnerAPI',
  },
  LeftOperand: {
   attributes: {
    'xsi:type': 'par:SimpleFilterPart',
   },
   Property: lProperty,
   SimpleOperator: lSimpleOperator,
   Value: lvalue,
  },
  LogicalOperator: logicalOperator,
  RightOperand: {
   attributes: {
    'xsi:type': 'par:SimpleFilterPart',
   },
   Property: rProperty,
   SimpleOperator: rSimpleOperator,
   Value: rvalue,
  },
 };
 return filter;
};
const CreateRequestDE = (enterpriceId,
 deName,
 categoryID,
 isSendable,
 fields) => {
 const CreateRequest = {
  Options: {
   SaveOptions: {},
   Client: {
    ID: enterpriceId,
   },
  },
  Objects: {
   attributes: {
    'xmlns:ns1': 'http://exacttarget.com/wsdl/partnerAPI',
    'xsi:type': 'ns1:DataExtension',
   },
   Client: {
    ID: enterpriceId,
   },

   Name: deName,
   CustomerKey: deName,
   CategoryID: categoryID,
   IsSendable: isSendable,
   IsTestable: false,
   Fields: fields,
  },
 };
 return CreateRequest;
};

const CreateRequestFolder = (name, parentId) => {
 const CreateRequest = {
  Options: {
   SaveOptions: {},
  },
  Objects: {
   attributes: {
    'xsi:type': 'DataFolder',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
   },
   Name: name,
   ContentType: 'shared_dataextension',
   Description: name,
   AllowChildren: true,
   AllowChildrenSpecified: true,
   IsEditable: true,
   IsEditableSpecified: true,
   ParentFolder: {
    ID: parentId,
    IDSpecified: true,
   },
  },
 };
 return CreateRequest;
};

const retrieveFolder = (enterpriceId, name, client) => new Promise(((resolve, reject) => {
 const requestObject = buildRetrieveRequestObject(
  enterpriceId,
  'DataFolder', ['ID'],
  ComplexFilter('Name', 'equals', name, 'AND', 'ContentType', 'equals', 'shared_dataextension'),
 );
 console.log(requestObject);
 client.Retrieve(requestObject, (err, response) => {
  if (err) { return reject(JSON.stringify(err)); }

  console.log(response);
  return resolve(response);
 });
}));

const GetAppsFlyersFolderID = (enterpriseId, client) => new Promise(((resolve, reject) => {
 if (client === undefined) {
  return reject('Invalid Client');
 }

 retrieveFolder(enterpriseId, process.env.Folder, client)
  .then((r) => {
   let response;
   if (r.Results !== undefined) {
    response = {
     categoryID: r.Results[0].ID,
    };
    return resolve(response);
   }
   retrieveFolder(enterpriseId, 'Shared Data Extensions', client)
    .then((result) => {
     if (result.Results !== undefined) {
      const parentId = result.Results[0].ID;
      client.Create(CreateRequestFolder(process.env.Folder, parentId), (err, res) => {
       if (err) {
        return reject(err);
       }

       if (res.Results !== undefined) {
        response = {
         categoryID: res.Results[0].NewID,
        };
       }
       resolve(response);
      });
     } else {
      return reject("Error: can't retrieve Shared Data Extensions");
     }
    })
    .catch((err1) => reject(err1));
  })
  .catch((e) => reject(e));
}));


exports.createDataExtensions = async(req) => new Promise(((resolve, reject) => {
 sfmcHelper.createSoapClient(req.body.refresh_token, (e, response) => {
  if (!e) {
   response.eid = req.body.eid;
   GetAppsFlyersFolderID(req.body.eid, response.client)
    .then((r1) => {
     console.log(r1);
     const CreateRequestDEObjImage = CreateRequestDE(req.body.eid, process.env.ImageContentBlockDataExtension, r1.categoryID, false, {
      Field: [{
        CustomerKey: 'ContentBlockID',
        Name: 'ContentBlockID',
        Description: 'ContentBlockID',
        IsPrimaryKey: true,
        MaxLength: 100,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'Url',
        Name: 'Url',
        Description: 'Url',
        IsPrimaryKey: false,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'LinkID',
        Name: 'LinkID',
        Description: 'LinkID',
        IsPrimaryKey: false,
        MaxLength: 100,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'AltText',
        Name: 'AltText',
        Description: 'AltText',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'Width',
        Name: 'Width',
        Description: 'Width',
        IsPrimaryKey: false,
        FieldType: 'Number',
        IsRequired: true,
       },
       {
        CustomerKey: 'Height',
        Name: 'Height',
        Description: 'Height',
        IsPrimaryKey: false,
        FieldType: 'Number',
        IsRequired: true,
       },
      ],
     });
     const CreateRequestDEObjLink = CreateRequestDE(req.body.eid, process.env.LinkDataExtension, r1.categoryID, false, {
      Field: [{
        CustomerKey: 'LinkID',
        Name: 'LinkID',
        Description: 'LinkID',
        IsPrimaryKey: true,
        MaxLength: 80,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'LinkName',
        Name: 'LinkName',
        Description: 'LinkName',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 250,
        IsRequired: true,
       },
       {
        CustomerKey: 'BaseURL',
        Name: 'BaseURL',
        Description: 'BaseURL',
        IsPrimaryKey: false,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'ContentsCount',
        Name: 'ContentsCount',
        Description: 'ContentsCount',
        IsPrimaryKey: false,
        FieldType: 'Number',
        IsRequired: true,
       },
       {
        CustomerKey: 'Status',
        Name: 'Status',
        Description: 'Status',
        IsPrimaryKey: false,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'Flag',
        Name: 'Flag',
        Description: 'Flag',
        IsPrimaryKey: false,
        FieldType: 'Number',
        IsRequired: true,
        DefaultValue: 1,
       },
       {
        CustomerKey: 'Parameters',
        Name: 'Parameters',
        Description: 'Parameters',
        IsPrimaryKey: false,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'JSONParameters',
        Name: 'JSONParameters',
        Description: 'Parameters',
        IsPrimaryKey: false,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'CustomParameters',
        Name: 'CustomParameters',
        Description: 'CustomParameters',
        IsPrimaryKey: false,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'FullURL',
        Name: 'FullURL',
        Description: 'FullURL',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 4000,
        IsRequired: true,
       },
       {
        CustomerKey: 'Created',
        Name: 'Created',
        Description: 'Created',
        IsPrimaryKey: false,
        FieldType: 'Date',
        IsRequired: false,
       },
       {
        CustomerKey: 'Modified',
        Name: 'Modified',
        Description: 'Modified',
        IsPrimaryKey: false,
        FieldType: 'Date',
        IsRequired: false,
       },
      ],
     });
     const CreateRequestDEObjButton = CreateRequestDE(req.body.eid, process.env.ButtonContentBlockDataExtension, r1.categoryID, false, {
      Field: [{
        CustomerKey: 'ContentBlockID',
        Name: 'ContentBlockID',
        Description: 'ContentBlockID',
        IsPrimaryKey: true,
        MaxLength: 50,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'LinkID',
        Name: 'LinkID',
        Description: 'LinkID',
        IsPrimaryKey: false,
        MaxLength: 50,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'BackgroundColor',
        Name: 'BackgroundColor',
        Description: 'BackgroundColor',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'RoundedCorners',
        Name: 'RoundedCorners',
        Description: 'RoundedCorners',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'TextAlignment',
        Name: 'TextAlignment',
        Description: 'TextAlignment',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'PaddingTop',
        Name: 'PaddingTop',
        Description: 'PaddingTop',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'PaddingRight',
        Name: 'PaddingRight',
        Description: 'PaddingRight',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'PaddingBotom',
        Name: 'PaddingBotom',
        Description: 'PaddingBotom',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'PaddingLeft',
        Name: 'PaddingLeft',
        Description: 'PaddingLeft',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'MarginTop',
        Name: 'MarginTop',
        Description: 'MarginTop',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'MarginBottom',
        Name: 'MarginBottom',
        Description: 'MarginBottom',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'MarginRight',
        Name: 'MarginRight',
        Description: 'MarginRight',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
       {
        CustomerKey: 'MarginLeft',
        Name: 'MarginLeft',
        Description: 'MarginLeft',
        IsPrimaryKey: false,
        FieldType: 'Text',
        MaxLength: 50,
        IsRequired: true,
       },
      ],
     });

     const CreateRequestDEObjToken = CreateRequestDE(req.body.eid, process.env.LogEmailLinks, r1.categoryID, false, {
      Field: [{
        CustomerKey: 'Token',
        Name: 'Token',
        Description: 'Token',
        IsPrimaryKey: true,
        MaxLength: 80,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        CustomerKey: 'Authorized',
        Name: 'Authorized',
        Description: 'Authorized',
        IsPrimaryKey: false,
        FieldType: 'Boolean',
        IsRequired: true,
        DefaultValue: false,
       },
       {
        CustomerKey: 'Flag',
        Name: 'Flag',
        Description: 'Flag',
        IsPrimaryKey: false,
        FieldType: 'Number',
        IsRequired: true,
        DefaultValue: 1,
       },
      ],
     });

     const CreateRequestDEObjLogEmailLinks = CreateRequestDE(req.body.eid, process.env.LogEmailLinks, r1.categoryID, false, {
      Field: [{
       Name: 'EmailID',
       Description: 'EmailID',
       IsPrimaryKey: false,
       MaxLength: 254,
       FieldType: 'Text',
       IsRequired: true,
      }, {
       Name: 'LinkText',
       Description: 'LinkText',
       IsPrimaryKey: false,
       MaxLength: 254,
       FieldType: 'Text',
       IsRequired: false,
      }, {
       Name: 'LinkReplaced',
       Description: 'LinkReplaced',
       IsPrimaryKey: false,
       MaxLength: 4000,
       FieldType: 'Text',
       IsRequired: true,
      }, {
       Name: 'OneLinkID',
       Description: 'OneLinkID',
       IsPrimaryKey: false,
       MaxLength: 254,
       FieldType: 'Text',
       IsRequired: true,
      }, {
       Name: 'OneLinkURL',
       Description: 'OneLinkURL',
       IsPrimaryKey: false,
       MaxLength: 4000,
       FieldType: 'Text',
       IsRequired: true,
      }, {
       Name: 'Modified',
       Description: 'LinModifiedkReplaced',
       IsPrimaryKey: false,
       FieldType: 'Date',
       IsRequired: true,
      }, ],
     });

     const CreateRequestDEObjEmailsWithOneLinks = CreateRequestDE(req.body.eid, process.env.EmailsWithOneLinks, r1.categoryID, false, {
      Field: [{
        Name: 'LinkID',
        Description: 'LinkID',
        IsPrimaryKey: true,
        MaxLength: 80,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        Name: 'EmailID',
        Description: 'EmailID',
        IsPrimaryKey: true,
        MaxLength: 254,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        Name: 'EmailName',
        Description: 'EmailName',
        IsPrimaryKey: false,
        MaxLength: 600,
        FieldType: 'Text',
        IsRequired: true,
       },
       {
        Name: 'Count',
        Description: 'Count',
        IsPrimaryKey: false,
        FieldType: 'Number',
        IsRequired: true,
        DefaultValue: 1,
       },
      ],
     });
     sfmcHelper.createDataExtension(response.client, CreateRequestDEObjImage)
      .then((r2) => {
       if (r2.Results[0].StatusCode === 'OK') {
        return sfmcHelper.createDataExtension(response.client, CreateRequestDEObjLink);
       }
      }).then((r3) => {
       if (r3.Results[0].StatusCode === 'OK') {
        return sfmcHelper.createDataExtension(response.client, CreateRequestDEObjButton);
       }
      }).then((r4) => {
       if (r4.Results[0].StatusCode === 'OK') {
        return sfmcHelper.createDataExtension(response.client, CreateRequestDEObjToken);
       }
      }).then((r5) => {
       if (r5.Results[0].StatusCode === 'OK') {
        return sfmcHelper.createDataExtension(response.client, CreateRequestDEObjLogEmailLinks);
       }
      }).then((r6) => {
       if (r6.Results[0].StatusCode === 'OK') {
        return sfmcHelper.createDataExtension(response.client, CreateRequestDEObjToken);
       }
      })
      .then((r7) => {
       if (r7.Results[0].StatusCode === 'OK') {
        return resolve(response);
       }
      })
      .catch((err) => reject(err));
    })
    .catch((err) => {
     console.log(err);
    });
  } else {
   return reject(e);
  }
 });
}));