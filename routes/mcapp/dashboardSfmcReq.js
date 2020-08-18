/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
const uuidv1 = require('uuid/v4');
const sfmcHelper = require('../sfmcHelper');

function xssEscape(stringToEscape) {
    let str = stringToEscape;
    if (str !== undefined) {
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/'/g, '&#x27;');
    }

    return str;
    // return stringToEscape.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

exports.loadDashboards = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, req.body.tssd, (e, response) => {
        if (e) { return resp.status(500).end(e); }

        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.body.enterpriseId,
                },
                ObjectType: `DataExtensionObject[${process.env.LinkDataExtension}]`,
                Properties: ['LinkID', 'LinkName', 'BaseURL', 'ContentsCount', 'Status', 'JSONParameters', 'Parameters', 'CustomParameters', 'FullURL', 'Created', 'Modified'],
                Filter: sfmcHelper.simpleFilter('Flag', 'equals', 1),
            },
        };

        sfmcHelper.retrieveRequest(response.client, requestObject)
            .then((body) => {
                const dashboardResponse = {
                    data: body,
                    refresh_token: response.refresh_token,
                    enterpriseId: req.body.enterpriseId,
                };
                return resp.status(200).send(dashboardResponse);
            }).catch((err) => resp.status(400).send(err));
    });
};

exports.getLinksCount = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, req.body.tssd, (e, response) => {
        if (e) { return resp.status(500).end(e); }

        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.body.enterpriseId,
                },
                ObjectType: `DataExtensionObject[${process.env.LinkDataExtension}]`,
                Properties: ['LinkID', 'LinkName', 'BaseURL', 'ContentsCount', 'Status', 'JSONParameters', 'Parameters', 'CustomParameters', 'FullURL', 'Created', 'Modified'],
                Filter: sfmcHelper.simpleFilter('Flag', 'equals', 1),
            },
        };

        sfmcHelper.retrieveRequest(response.client, requestObject)
            .then((body) => {
                const dashboardResponse = {
                    data: body,
                    refresh_token: response.refresh_token,
                    enterpriseId: req.body.enterpriseId,
                };
                return resp.status(200).send(dashboardResponse);
            }).catch((err) => resp.send(400, err));
    });
};

exports.getLinkByID = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, req.body.tssd, (e, response) => {
        if (e) { return resp.status(500).end(e); }

        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.body.enterpriseId,
                },
                ObjectType: `DataExtensionObject[${process.env.LinkDataExtension}]`,
                Properties: ['LinkID', 'LinkName', 'BaseURL', 'ContentsCount', 'Status', 'JSONParameters', 'Parameters', 'CustomParameters', 'FullURL', 'Created', 'Modified'],
                Filter: sfmcHelper.simpleFilter('LinkID', 'equals', req.body.LinkID),
            },
        };

        sfmcHelper.retrieveRequest(response.client, requestObject)
            .then((body) => {
                const r1 = {
                    link: body,
                    refresh_token: response.refresh_token,
                    enterpriseId: req.body.enterpriseId,
                };
                resp.send(200, r1);
            }).catch((err) => resp.send(400, err));
    });
};

exports.UpsertLink = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, req.body.tssd, (e, response) => {
        if (e) { return resp.status(500).end(e); }
        const Properties = [{
            Name: 'LinkName',
            Value: xssEscape(req.body.linkName),
        }, {
            Name: 'BaseURL',
            Value: xssEscape(req.body.baseUrl),
        }, {
            Name: 'ContentsCount',
            Value: req.body.contentsCount === undefined ? 0 : req.body.contentsCount,
        }, {
            Name: 'Status',
            Value: req.body.status,
        }, {
            Name: 'Flag',
            Value: 1,
        },
        {
            Name: 'JSONParameters',
            Value: JSON.stringify(req.body.JSONParameter),
        },
        {
            Name: 'Parameters',
            Value: req.body.Parameters,
        },
        {
            Name: 'CustomParameters',
            Value: xssEscape(req.body.CustomParameters),
        },
        {
            Name: 'FullURL',
            Value: req.body.baseUrl + req.body.Parameters + req.body.CustomParameters,
        },
        {
            Name: 'Created',
            Value: req.body.Created,
        },
        {
            Name: 'Modified',
            Value: req.body.Modified,
        },
        ];

        const UpdateRequest = sfmcHelper.UpdateRequestObject(process.env.LinkDataExtension, [{
            Name: 'LinkID',
            Value: req.body.LinkID === undefined ? uuidv1() : req.body.LinkID,
        }], Properties);

        sfmcHelper.upsertDataextensionRow(response.client, UpdateRequest)
            .then((body) => {
                if (body.OverallStatus !== undefined) {
                    const r1 = {
                        refresh_token: response.refresh_token,
                        Status: body.OverallStatus,
                    };
                    return resp.status(200).send(r1);
                }

                return resp.status(200).send(body);
            }).catch((err) => resp.status(400).send(err));
    });
};
