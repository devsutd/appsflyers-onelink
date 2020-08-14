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
    return new Promise((resolve, reject) => {
        const base64 = data.fileBase64.split(',')[1];
        // console.log(base64);
        const postData = assetObject(data.name, base64);
        request({
            url: `https://${ data.tssd }.rest.marketingcloudapis.com/asset/v1/content/assets`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ accessToken }`,
            },
            body: postData,
        },
            (err, _response, body) => {
                if (err) {
                    return reject(err);
                }

                resolve(body);
            });
    });
}

function ImagenStatus(data, accessToken) {
    console.log('Dentro de CreateContentBuilderJPG');
    return new Promise((resolve, reject) => {
        const { id } = data;
        const endpoint = `https://${ data.tssd }.rest.marketingcloudapis.com/asset/v1/content/assets?$filter=id%20eq%20${ id }`;
        request({
            url: endpoint,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ accessToken }`,
            },
        },
            (err, _response, body) => {
                if (err) {
                    return reject(err);
                }
                // eslint-disable-next-line prefer-const
                let dataResp = {
                    refresh_token: '',
                    body: JSON.parse(body),
                };
                return resolve(dataResp);
            });
    });
}

// eslint-disable-next-line no-unused-vars
exports.SaveImage = async (req, resp, _next) => {
    console.log('Dentro de SaveImage');
    // return  resp.send(200, "body");

    await Promise.all([
        sfmcHelper
            .refreshToken(req.body.refresh_token, req.body.tssd)
            .then((data) => {
                CreateContentBuilderJPG(req.body, data.access_token)
                    .then((r) => {
                        const rsp = {
                            refresh_token: data.refresh_token,
                            data: r,
                        };

                        console.log(r);
                        console.log('Save Image - OK');
                        return resp.status(200).send(rsp);
                    })
                    .catch((e) => {
                        console.log(e);
                        console.log('Save Image - Error');
                        return resp.status(200).end(e);
                    });
            })
            .catch((err) => resp.status(500).end(err)),
    ]);
};

exports.GetImageStatus = (req, resp) => {
    console.log('Dentro de GetImageStatus');
    // return  resp.send(200, "body");

    sfmcHelper
        .refreshToken(req.body.refresh_token, req.body.tssd)
        .then((data) => {
            ImagenStatus(req.body, data.access_token)
                .then((r) => {
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
    console.log('');
    sfmcHelper.createSoapClient(req.query.rt, req.query.tssd, (e, response) => {
        if (e) {
            return resp.status(401).send(e);
        }

        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.query.eid,
                },
                ObjectType: `DataExtensionObject[${ process.env.LinkDataExtension }]`,
                Properties: [
                    'LinkID',
                    'LinkName',
                    'BaseURL',
                    'ContentsCount',
                    'Status',
                    'JSONParameters',
                    'Parameters',
                    'CustomParameters',
                    'FullURL',
                    'Modified',
                ],
                Filter: sfmcHelper.simpleFilter('Flag', 'equals', 1),
            },
        };

        sfmcHelper
            .retrieveRequest(response.client, requestObject)
            .then((body) => {
                const responseObje = {
                    links: body,
                    refresh_token: response.refresh_token,
                };

                return resp.status(200).send(responseObje);
            })
            .catch((err) => {
                console.log(err);
                return resp.status(500).send(err);
            });
    });
};

exports.UpsertImageRow = (req, resp) => {
    console.log('UpsertImageRow process start...');
    sfmcHelper.createSoapClient(
        req.body.refresh_token,
        req.body.tssd,
        (e, response) => {
            if (e) {
                console.log(e);
                return resp.status(500).end(e);
            }

            const Properties = [{
                Name: 'Url',
                Value: req.body.Url,
            },
            {
                Name: 'LinkID',
                Value: req.body.LinkID,
            },
            {
                Name: 'AltText',
                Value: req.body.AltText,
            },
            {
                Name: 'Width',
                Value: req.body.Width,
            },
            {
                Name: 'Height',
                Value: req.body.Height,
            },
            ];
            const UpdateRequest = sfmcHelper.UpdateRequestObject(
                process.env.ImageContentBlockDataExtension, [{
                    Name: 'ContentBlockID',
                    Value: req.body.ContentBlockID === undefined
                        ? uuidv1()
                        : req.body.ContentBlockID,
                }],
                Properties,
            );

            sfmcHelper
                .upsertDataextensionRow(response.client, UpdateRequest)
                .then((body) => {
                    if (body.StatusCode !== undefined) {
                        const r1 = {
                            refresh_token: response.refresh_token,
                            Status: body.StatusCode[0],
                        };
                        console.log('UpsertImageRow process end...');
                        return resp.send(200, r1);
                    }
                    console.log('UpsertImageRow process end...');
                    return resp.send(200, body);
                })
                .catch((err) => resp.send(400, err));
        },
    );
};

exports.UpsertButtonRow = (req, resp) => {
    console.log('UpsertButtonRow  process start...');
    sfmcHelper.createSoapClient(
        req.body.refresh_token,
        req.body.tssd,
        (e, response) => {
            if (e) {
                console.log(e);
                return resp.status(500).send(e);
            }

            const Properties = [{
                Name: 'LinkID',
                Value: req.body.linkID,
            },
            {
                Name: 'BackgroundColor',
                Value: req.body.backgroundColor,
            },
            {
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
            },
            ];
            const UpdateRequest = sfmcHelper.UpdateRequestObject(
                process.env.ButtonContentBlockDataExtension, [{
                    Name: 'ContentBlockID',
                    Value: req.body.contentBlockID === undefined
                        ? uuidv1()
                        : req.body.contentBlockID,
                }],
                Properties,
            );

            sfmcHelper
                .upsertDataextensionRow(response.client, UpdateRequest)
                .then((body) => {
                    if (body.OverallStatus !== undefined) {
                        const r1 = {
                            refresh_token: response.refresh_token,
                            Status: body.OverallStatus,
                        };
                        console.log('UpsertButtonRow  process end...');
                        return resp.send(200, r1);
                    }
                    console.log('UpsertButtonRow  process end...');
                    return resp.send(200, body);
                })
                .catch((err) => {
                    console.error(err);
                    return resp.send(400, err);
                });
        },
    );
};
exports.UpsertLink = (req, resp) => {
    console.log('UpsertLink  process start...');
    sfmcHelper.createSoapClient(
        req.body.refresh_token,
        req.body.tssd,
        (e, response) => {
            if (e) {
                console.log(e);
                return resp.status(500).end(e);
            }

            const Properties = [{
                Name: 'ContentsCount',
                Value: parseInt(req.body.contentsCount) + 1,
            }];

            const UpdateRequest = sfmcHelper.UpdateRequestObject(
                process.env.LinkDataExtension, [{
                    Name: 'LinkID',
                    Value: req.body.LinkID === undefined ? uuidv1() : req.body.LinkID,
                }],
                Properties,
            );

            sfmcHelper
                .upsertDataextensionRow(response.client, UpdateRequest)
                .then((body) => {
                    if (body.OverallStatus !== undefined) {
                        const r1 = {
                            refresh_token: response.refresh_token,
                            Status: body.OverallStatus[0],
                        };
                        console.log('UpsertLink  process end...');
                        return resp.status(200).send(r1);
                    }
                    console.log('UpsertLink  process end...');
                    return resp.status(200).send(body);
                })
                .catch((err) => resp.status(500).send(err));
        },
    );
};

function getEmailsFilter(id, type) {
    let filter = {};
    if (type === 'htmlemail') {
        filter = {
            page: {
                page: 1,
                pageSize: 250,
            },
            query: {
                leftOperand: {
                    property: 'assetType.id',
                    simpleOperator: 'equal',
                    value: id,
                },
                logicalOperator: 'AND',
                rightOperand: {
                    property: 'assetType.name',
                    simpleOperator: 'equal',
                    value: type,
                },
            },
            sort: [{
                property: 'id',
                direction: 'ASC',
            }],
        };
    } else {
        filter = {
            page: {
                page: 1,
                pageSize: 50,
            },
            query: {
                leftOperand: {
                    property: 'assetType.id',
                    simpleOperator: 'equal',
                    value: 207,
                },
                logicalOperator: 'AND',
                rightOperand: {
                    property: 'views.html.slots',
                    simpleOperator: 'isNotNull',
                },
            },
            fields: [
                'id',
                'customerKey',
                'objectID',
                'name',
                'views',
                'content',
                'data',
            ],
        };
    }
    return filter;
}

function contentAssetsQuery(filter, accessToken, tssd) {
    console.log('contentAssetsQuery process start...');
    return new Promise((resolve, reject) => {
        request({
            url: `https://${ tssd }.rest.marketingcloudapis.com/asset/v1/content/assets/query`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ accessToken }`,
            },
            body: JSON.stringify(filter),
        },
            (err, _response, body) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                console.log('contentAssetsQuery process start...');
                return resolve(JSON.parse(body));
            });
    });
}

exports.GetContentBuilderTemplateBasedEmails = (req) => {
    console.log('GetContentBuilderTemplateBasedEmails process start...');
    return new Promise((resolve, reject) => {
        sfmcHelper
            .refreshToken(req.body.refresh_token, req.body.tssd)
            .then((rtResponse) => {
                const filter = getEmailsFilter(207, 'templatebasedemail');
                const response = {
                    refresh_token: rtResponse.refresh_token,
                };
                contentAssetsQuery(filter, rtResponse.access_token, req.body.tssd)
                    .then((emails) => {
                        filter.page.pageSize = emails.count;
                        if (emails.count > 250) {
                            contentAssetsQuery(
                                filter,
                                rtResponse.access_token,
                                req.body.tssd,
                            ).then((allEmails) => {
                                response.body = allEmails;
                                console.log('\n Emails: \n', allEmails);
                                console.log('\n GetContentBuilderTemplateBasedEmails process end...');
                                return resolve(response);
                            });
                        } else {
                            response.body = emails;
                            console.log('\n Emails: \n', emails);
                            console.log('\n GetContentBuilderTemplateBasedEmails process end...');
                            return resolve(response);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        return reject(err);
                    });
            });
    });
};

exports.GetContentBuilderEmails = (req, resp) => {
    console.log('GetContentBuilderEmails process start...');
    sfmcHelper
        .refreshToken(req.body.accessToken, req.body.tssd)
        .then((rtResponse) => {
            const filter = getEmailsFilter(208, 'htmlemail');
            request({
                url: `https://${ req.body.tssd }.rest.marketingcloudapis.com/asset/v1/content/assets/query`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ rtResponse.access_token }`,
                },
                body: JSON.stringify(filter),
            },
                (err, _response, body) => {
                    console.log(_response);
                    if (err) {
                        console.error(err);
                        return resp.status(401).send(err);
                    }

                    const response = {
                        refresh_token: rtResponse.refresh_token,
                        body: JSON.parse(body),
                    };
                    // eslint-disable-next-line prefer-const
                    console.log('GetContentBuilderEmails process end...');
                    return resp.status(200).send(response);
                });
        });
};

exports.UpdateEmail = (req, resp) => {
    console.log('UpdateEmail process start...');
    sfmcHelper
        .refreshToken(req.body.accessToken, req.body.tssd)
        .then((refreshTokenbody) => {
            request({
                url: `https://${ req.body.tssd }.rest.marketingcloudapis.com/asset/v1/content/assets/${ req.body.id }`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ refreshTokenbody.access_token }`,
                },
                body: JSON.stringify(req.body.email),
            },
                (err, _response, body) => {
                    if (err) {
                        console.log(err);
                        return resp.status(401).send(err);
                    }
                    const response = {
                        refresh_token: refreshTokenbody.refresh_token,
                        body,
                    };
                    console.log('UpdateEmail process end...');
                    return resp.status(200).send(response);
                });
        });
};
exports.GetEmailByID = (req, resp) => {
    console.log('GetEmailByID process start...');
    sfmcHelper
        .refreshToken(req.body.accessToken, req.body.tssd)
        .then((refreshTokenbody) => {
            request({
                url: `https://${ req.body.tssd }.rest.marketingcloudapis.com/asset/v1/content/assets/${ req.body.id }`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ refreshTokenbody.access_token }`,
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
                    console.log('GetEmailByID process end...');
                    return resp.status(200).send(response);
                });
        });
};

exports.GetCampaigns = (req, resp) => {
    console.log('GetCampaigns process start...');
    sfmcHelper
        .refreshToken(req.body.accessToken, req.body.tssd)
        .then((refreshTokenbody) => {
            console.log(refreshTokenbody);
            request({
                url: `https://${ req.body.tssd }.rest.marketingcloudapis.com/hub/v1/campaigns`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ refreshTokenbody.access_token }`,
                },
            },
                (err, _response, body) => {
                    if (err) {
                        console.log(err);
                        return resp.status(401).send(err);
                    }
                    console.log(JSON.parse(body));
                    const response = {
                        refresh_token: refreshTokenbody.refresh_token,
                        body: JSON.parse(body),
                    };
                    // eslint-disable-next-line prefer-const
                    console.log('GetCampaigns process end...');
                    return resp.status(200).send(response);
                });
        });
};

exports.GetAllContentBuilderAssets = (req, resp) => {
    console.log('GetAllContentBuilderAssets process start...');
    sfmcHelper
        .refreshToken(req.body.accessToken, req.body.tssd)
        .then((refreshTokenbody) => {
            request({
                url: `https://${ req.body.tssd }.rest.marketingcloudapis.com/asset/v1/content/assets/`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ refreshTokenbody.access_token }`,
                },
            },
                (err, _response, body) => {
                    if (err) {
                        console.log(err);
                        return resp.status(401).send(err);
                    }
                    const response = {
                        refresh_token: refreshTokenbody.refresh_token,
                        body,
                    };
                    // eslint-disable-next-line prefer-const

                    console.log('GetAllContentBuilderAssets process end...');
                    return resp.status(200).send(response);
                });
        });
};

exports.UpsertEmailsWithOneLinks = (req) => {
    console.log('UpsertEmailsWithOneLinks process start...');
    return new Promise((resolve, reject) => {
        console.log("\n\n");
        console.log(`refresh token ${ req.body.refresh_token }`);
        console.log(`tssd ${ req.body.tssd }`);
        sfmcHelper.createSoapClient(
            req.body.refresh_token,
            req.body.tssd,
            (e, response) => {
                if (e) {
                    return reject(e);
                }

                sfmcHelper
                    .upsertDataextensionRow(response.client, req.body.UpdateRequest)
                    .then((body) => {
                        console.log(body);
                        if (body.OverallStatus !== undefined) {
                            const r1 = {
                                refresh_token: response.refresh_token,
                                Status: body.OverallStatus,
                            };
                            console.log('UpsertEmailsWithOneLinks process end...');
                            return resolve(r1);
                        }

                        console.log('UpsertEmailsWithOneLinks process end...');
                        return resolve(body);
                    })
                    .catch((err) => {
                        console.log(err);
                        return reject(err);
                    });
            },
        );
    });
};

exports.UpsertLogHTMLEmailLinks = (req, resp) => {
    console.log('UpsertLogHTMLEmailLinks process start...');
    sfmcHelper.createSoapClient(
        req.body.refresh_token,
        req.body.tssd,
        (e, response) => {
            if (e) {
                console.error(e);
                return resp.status(500).end(e);
            }

            const Properties = [{
                Name: 'EmailID',
                Value: req.body.EmailID,
            },
            {
                Name: 'LinkText',
                Value: req.body.LinkText,
            },
            {
                Name: 'LinkReplaced',
                Value: req.body.LinkReplaced,
            },
            {
                Name: 'OneLinkID',
                Value: req.body.OneLinkID,
            },
            {
                Name: 'OneLinkURL',
                Value: req.body.OneLinkURL,
            },
            {
                Name: 'Modified',
                Value: req.body.Modified,
            },
            ];
            const UpdateRequest = sfmcHelper.UpdateRequestObject(
                process.env.LogEmailLinks, [{
                    Name: 'LogID',
                    Value: req.body.LogID === undefined ? uuidv1() : req.body.LogID,
                }],
                Properties,
            );

            sfmcHelper
                .upsertDataextensionRow(response.client, UpdateRequest)
                .then((body) => {
                    if (body.StatusCode !== undefined) {
                        const r1 = {
                            refresh_token: response.refresh_token,
                            Status: body.StatusCode[0],
                            Body: body,
                        };
                        console.log('UpsertLogHTMLEmailLinks process end...');
                        return resp.send(200, r1);
                    }

                    body.refresh_token = response.refresh_token;
                    console.log('UpsertLogHTMLEmailLinks process end...');
                    return resp.send(200, body);
                })
                .catch((err) => {
                    console.error(err);
                    return resp.send(400, err);
                });
        },
    );
};

exports.logEmailsWithOneLinks = (req, resp) => {
    console.log('logEmailsWithOneLinks process start...');
    sfmcHelper.createSoapClient(
        req.body.refresh_token,
        req.body.tssd,
        (e, response) => {
            if (e) {
                console.log(e);
                return resp.status(500).send(e);
            }

            const Properties = [
                { Name: 'Count', Value: req.body.Count },
                { Name: 'EmailName', Value: req.body.EmailName },
            ];
            const UpdateRequest = sfmcHelper.UpdateRequestObject(
                process.env.EmailsWithOneLinks, [
                { Name: 'LinkID', Value: req.body.LinkID },
                { Name: 'EmailID', Value: req.body.EmailID },
            ],
                Properties,
            );
            sfmcHelper
                .upsertDataextensionRow(response.client, UpdateRequest)
                .then((body) => {
                    const r1 = {
                        refresh_token: response.refresh_token,
                        body,
                    };
                    console.log('logEmailsWithOneLinks process end...');
                    return resp.status(200).send(r1);
                })
                .catch((err) => {
                    console.log(err);
                    return resp.status(400).send(err);
                });
        },
    );
};
