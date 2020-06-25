/* eslint-disable radix */
/* eslint-disable consistent-return */

'use strict';

const request = require('request');
const uuidv1 = require('uuid/v4');
const sfmcHelper = require('./sfmcHelper');

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
    console.log('Dentro de CreateContentBuilderJPG');
    return new Promise(((resolve, reject) => {
        const base64 = data.fileBase64.split(',')[1];
        console.log(base64);
        const postData = assetObject(data.name, base64);
        console.log(postData);

        request({
            url: `${process.env.restEndpoint}/asset/v1/content/assets`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: postData,
        }, (err, _response, body) => {
            if (err) { return reject(err); }

            resolve(body);
        });
    }));
}

function ImagenStatus(data, accessToken) {
    console.log('Dentro de CreateContentBuilderJPG');
    return new Promise(((resolve, reject) => {
        const { id } = data;
        const endpoint = `${process.env.restEndpoint}/asset/v1/content/assets?$filter=id%20eq%20${id}`;
        request({
            url: endpoint,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        }, (err, _response, body) => {
            if (err) { return reject(err); }
            // eslint-disable-next-line prefer-const
            let dataResp = {
                refresh_token: '',
                body: JSON.parse(body),
            };
            return resolve(dataResp);
        });
    }));
}

// eslint-disable-next-line no-unused-vars
exports.SaveImage = async (req, resp, _next) => {
    console.log('Dentro de SaveImage');
    // return  resp.send(200, "body");

    await Promise.all([sfmcHelper.refreshToken(req.body.refresh_token)
        .then((data) => {
            CreateContentBuilderJPG(req.body, data.access_token)
                .then((r) => {
                    console.log(r);
                    console.log('Save Image - OK');
                    resp.status(200).end(r);
                })
                .catch((e) => {
                    console.log(e);
                    console.log('Save Image - Error');
                    resp.status(200).end(e);
                });
        })
        .catch((err) => { resp.status(500).end(err); })]);
};

exports.GetImageStatus = (req, resp) => {
    console.log('Dentro de GetImageStatus');
    // return  resp.send(200, "body");

    sfmcHelper.refreshToken(req.body.refresh_token)
        .then((data) => {
            console.log(data);
            ImagenStatus(req.body, data.access_token)
                .then((r) => {
                    console.log(r);
                    // eslint-disable-next-line no-param-reassign
                    r.refresh_token = data.refresh_token;
                    console.log('Get Image status - OK');
                    return resp.status(200).send(r);
                })
                .catch((e) => {
                    console.log(e);
                    console.log('Get Image status - Error');
                    return resp.status(200).send(e);
                });
        })
        .catch((err) => resp.status(500).end(err));
};

exports.GetLinks = (req, resp) => {
    sfmcHelper.createSoapClient(req.query.rt, (e, response) => {
        if (e) { return resp.status(401).send(e); }

        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.query.eid,
                },
                ObjectType: `DataExtensionObject[${process.env.LinkDataExtension}]`,
                Properties: ['LinkID', 'LinkName', 'BaseURL', 'ContentsCount', 'Status', 'JSONParameters', 'Parameters', 'CustomParameters', 'FullURL', 'Modified'],
                Filter: sfmcHelper.simpleFilter('Flag', 'equals', 1),
            },
        };

        sfmcHelper.retrieveRequest(response.client, requestObject)
            .then((body) => {
                console.log(body);
                const responseObje = {
                    links: body,
                    refresh_token: response.refresh_token,
                };

                return resp.status(200).send(responseObje);
            }).catch((err) => resp.status(500).send(err));
    });
};
exports.UpsertImageRow = (req, resp) => {
    console.log('upsert row console log');
    sfmcHelper.createSoapClient(req.body.refresh_token, (e, response) => {
        if (e) { return resp.status(500).end(e); }

        const Properties = [{
            Name: 'Url',
            Value: req.body.Url,
        }, {
            Name: 'LinkID',
            Value: req.body.LinkID,
        }, {
            Name: 'AltText',
            Value: req.body.AltText,
        }, {
            Name: 'Width',
            Value: req.body.Width,
        },
        {
            Name: 'Height',
            Value: req.body.Height,
        }];
        const UpdateRequest = sfmcHelper.UpdateRequestObject(process.env.ImageContentBlockDataExtension, [{
            Name: 'ContentBlockID',
            Value: req.body.ContentBlockID === undefined ? uuidv1() : req.body.ContentBlockID,
        }], Properties);

        console.log(UpdateRequest);
        sfmcHelper.upsertDataextensionRow(response.client, UpdateRequest)
            .then((body) => {
                if (body.StatusCode !== undefined) {
                    const r1 = {
                        refresh_token: response.refresh_token,
                        Status: body.StatusCode[0],
                    };
                    return resp.send(200, r1);
                }

                return resp.send(200, body);
            }).catch((err) => resp.send(400, err));
    });
};

exports.UpsertButtonRow = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, (e, response) => {
        if (e) { return resp.status(500).send(e); }

        const Properties = [{
            Name: 'LinkID',
            Value: req.body.linkID,
        }, {
            Name: 'BackgroundColor',
            Value: req.body.backgroundColor,
        }, {
            Name: 'RoundedCorners',
            Value: req.body.roundedCorners,
        },
        {
            Name: 'TextAlignment',
            Value: req.body.textAlignment,
        },
        {
            Name: 'PaddingTop',
            Value: req.body.paddingTop,
        },
        {
            Name: 'PaddingRight',
            Value: req.body.paddingRight,
        },
        {
            Name: 'PaddingBotom',
            Value: req.body.paddingBotom,
        },
        {
            Name: 'PaddingLeft',
            Value: req.body.paddingLeft,
        },
        {
            Name: 'MarginTop',
            Value: req.body.marginTop,
        },
        {
            Name: 'MarginBottom',
            Value: req.body.marginBottom,
        },
        {
            Name: 'MarginRight',
            Value: req.body.marginRight,
        },
        {
            Name: 'MarginLeft',
            Value: req.body.marginLeft,
        }];
        const UpdateRequest = sfmcHelper.UpdateRequestObject(process.env.ButtonContentBlockDataExtension, [{
            Name: 'ContentBlockID',
            Value: req.body.contentBlockID === undefined ? uuidv1() : req.body.contentBlockID,
        }], Properties);

        console.log(UpdateRequest);
        sfmcHelper.upsertDataextensionRow(response.client, UpdateRequest)
            .then((body) => {
                if (body.StatusCode !== undefined) {
                    const r1 = {
                        refresh_token: response.refresh_token,
                        Status: body.StatusCode[0],
                    };
                    return resp.send(200, r1);
                }

                return resp.send(200, body);
            }).catch((err) => resp.send(400, err));
    });
};
exports.UpsertLink = (req, resp) => {

    console.log("upsert link body request", req.body);
    sfmcHelper.createSoapClient(req.body.refresh_token, (e, response) => {
        if (e) { return resp.status(500).end(e); }

        const Properties = [{
            Name: 'ContentsCount',
            Value: parseInt(req.body.contentsCount) + 1,
        }];

        const UpdateRequest = sfmcHelper.UpdateRequestObject(process.env.LinkDataExtension, [{
            Name: 'LinkID',
            Value: req.body.LinkID === undefined ? uuidv1() : req.body.LinkID,
        }], Properties);

        console.log(UpdateRequest);
        sfmcHelper.upsertDataextensionRow(response.client, UpdateRequest)
            .then((body) => {
                if (body.StatusCode !== undefined) {
                    const r1 = {
                        refresh_token: response.refresh_token,
                        Status: body.StatusCode[0],
                    };
                    return resp.status(200).send(r1);
                }

                return resp.status(200).semd(body);
            }).catch((err) => { return resp.status(500).send(err); });
    });
};
function getHtmlOnlyFilter() {
    return {
        "page": {
            "page": 1,
            "pageSize": 50
        },
        "query": {
            "leftOperand": {
                "property": "assetType.id",
                "simpleOperator": "equal",
                "value": 208
            },
            "logicalOperator": "AND",
            "rightOperand": {
                "property": "assetType.name",
                "simpleOperator": "equal",
                "value": "htmlemail"
            }
        },
        "sort": [
            {
                "property": "id",
                "direction": "ASC"
            }
        ]
    }
}
exports.GetContentBuilderEmails = (req, resp) => {
    sfmcHelper.refreshToken(req.body.accessToken).then((refreshTokenbody) => {
        const filter = getHtmlOnlyFilter();
        console.clear();
        console.log(refreshTokenbody);

        request({
            url: `${process.env.restEndpoint}asset/v1/content/assets/query`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshTokenbody.access_token}`,
            },
            body: JSON.stringify(filter)
        }, (err, _response, body) => {
            console.log(err);
            console.log(body);
            if (err) { return resp.status(401).send(err); }

            var response = {
                refresh_token: refreshTokenbody.refresh_token,
                body: JSON.parse(body)
            }
            // eslint-disable-next-line prefer-const
            return resp.status(200).send(response);
        });
    })
};

exports.UpdateEmail = (req, resp) => {


    sfmcHelper.refreshToken(req.body.accessToken).then((refreshTokenbody) => {
        request({
            url: `${process.env.restEndpoint}asset/v1/content/assets/${req.body.id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshTokenbody.access_token}`,
            },
            body: JSON.stringify(req.body.email)
        }, (err, _response, body) => {
            if (err) { return resp.status(401).send(err); }
            console.log(JSON.parse(body));
            var response = {
                refresh_token: refreshTokenbody.refresh_token,
                body: body
            }
            // eslint-disable-next-line prefer-const
            return resp.status(200).send(response);
        });
    })

};
exports.GetEmailByID = (req, resp) => {

    sfmcHelper.refreshToken(req.body.accessToken).then((refreshTokenbody) => {
        request({
            url: `${process.env.restEndpoint}asset/v1/content/assets/${req.body.id}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshTokenbody.access_token}`,
            },
            body: JSON.stringify(filter)
        }, (err, _response, body) => {
            if (err) { return resp.status(401).send(err); }
            console.log(JSON.parse(body));
            var response = {
                refresh_token: refreshTokenbody.refresh_token,
                body: body
            }
            // eslint-disable-next-line prefer-const
            return resp.status(200).send(response);
        });
    })
};

exports.GetCampaigns = (req, resp) => {

    console.log(req);
    sfmcHelper.refreshToken(req.body.accessToken)
        .then((refreshTokenbody) => {
            console.log(refreshTokenbody);
            request({
                url: `${process.env.restEndpoint}hub/v1/campaigns`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${refreshTokenbody.access_token}`,
                }
            }, (err, _response, body) => {
                console.log(err)
                if (err) { return resp.status(401).send(err); }
                console.log(JSON.parse(body));
                var response = {
                    refresh_token: refreshTokenbody.refresh_token,
                    body: JSON.parse(body)
                }
                // eslint-disable-next-line prefer-const
                return resp.status(200).send(response);
            });
        })
};

exports.GetAllContentBuilderAssets = (req, resp) => {
    sfmcHelper.refreshToken(req.body.accessToken).then((refreshTokenbody) => {
        request({
            url: `${process.env.restEndpoint}asset/v1/content/assets/`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshTokenbody.access_token}`,
            }
        }, (err, _response, body) => {
            if (err) { return resp.status(401).send(err); }
            var response = {
                refresh_token: refreshTokenbody.refresh_token,
                body: body
            }
            // eslint-disable-next-line prefer-const
            return resp.status(200).send(response);
        });
    })
};