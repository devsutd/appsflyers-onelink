/* eslint-disable no-plusplus */
/* eslint-disable max-len */
const { stringify } = require('uuid');
const sfmcHelper = require('./sfmcHelper');
const sfmc = require('./sfmc');
const installAppExchange = require('./InstallAppExchange');
// require('dotenv').config();

function countDuplicados(links) {
    const data = [];
    for (let index = 0; index < links.length; index++) {
        const element = links[index];
        if (element.Links !== undefined) {
            element.Links.forEach((linkid) => {
                data.push({
                    EmailID: element.EmailID,
                    EmailName: element.EmailName,
                    LinkID: linkid,
                    count: element.Links.filter((i) => i === linkid).length,
                });
            });
        }
    }
    console.log(data);
    return data;
}

function emailsUsingCustomBlocks(emails) {
    const dataforUpsert = [];
    for (let index = 0; index < emails.length; index++) {
        const element = emails[index];
        let data = {
        };
        const { slots } = element.views.html;
        if (slots.main !== undefined) {
            const { blocks } = slots.main;
            if (blocks !== undefined) {
                const blocksKeys = Object.keys(blocks);
                for (let j = 0; j < blocksKeys.length; j++) {
                    const contentblock = blocks[blocksKeys[j]];
                    if (contentblock.assetType.name === 'customblock' || contentblock.assetType.id === 225) {
                        console.log(`INDEX LINEA 42 ${JSON.stringify(contentblock)}`);
                        if (contentblock.meta !== undefined) {
                            const { options } = contentblock.meta;
                            if (options !== undefined) {
                                if (options.customBlockData !== undefined) {
                                    console.log('customBlockData: ', options.customBlockData);
                                    const { linkID } = options.customBlockData;
                                    if (linkID !== undefined) {
                                        console.log('index.JS LINEA 67: ', linkID);
                                        data = {
                                            EmailID: element.id,
                                            EmailName: element.name,
                                            Links: [],
                                            countByLink: [],
                                        };
                                        data.Links.push(linkID);
                                    }
                                }
                            }
                        }
                    }
                }

                dataforUpsert.push(data);
            }
        }
    }
    console.log('index.JS LINEA 67: ', dataforUpsert);
    return countDuplicados(dataforUpsert);
}

function UpdateRequestObjectMulipleRows(upsertData, eid) {
    console.log('INDEX LINEA 62', eid);
    const UpdateRequest = {
        Options: {
            SaveOptions: {
                SaveOption: {
                    PropertyName: 'DataExtensionObject',
                    SaveAction: 'UpdateAdd',
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
                'xsi:type': 'DataExtensionObject',
            },
            CustomerKey: process.env.EmailsWithOneLinks,
            Keys: [{
                Key: [{
                    Name: 'LinkID',
                    Value: element.LinkID,
                },
                {
                    Name: 'EmailID',
                    Value: element.EmailID,
                },
                ],
            }],
            Properties: [{
                Property: [{
                    Name: 'EmailName',
                    Value: element.EmailName,
                },
                {
                    Name: 'Count',
                    Value: element.Count,
                },
                ],
            }],
        });
    }

    return UpdateRequest;
}

// eslint-disable-next-line consistent-return
exports.login = (req, res) => {
    try {
        if (req.query.code === undefined) {
            let stateParam = '&state=mcapp';
            if (req.query.state !== undefined) {
                stateParam = `&state=${req.query.state}`;
            }
            const redirectUri = `${process.env.baseAuth}/v2/authorize?response_type=code&client_id=${process.env.sfmcClientId}&redirect_uri=${process.env.redirectURI}${stateParam}`;
            console.log(`INDEX LINEA 122 redirect uri: ${redirectUri}`);
            res.redirect(redirectUri);
        } else {
            console.log('INDEX LINEA 125  Entro con el codigo de authenticacion');
            const tssd = req.query.tssd === undefined ? process.env.tssd : req.query.tssd;
            console.log('INDEX LINEA 126  Estado : \n', req.query.state);
            const { state } = req.query;
            const request = {
                body: {
                    code: req.query.code,
                    tssd,
                },
            };

            if (state === 'mcapp') {
                sfmcHelper.authorize(request, (e, r) => {
                    if (e) {
                        res.status(400).end(e);
                        return;
                    }

                    const Request2 = {
                        body: {
                            refresh_token: r.refreshToken,
                            eid: r.bussinessUnitInfo.enterprise_id,
                            tssd,
                        },
                    };
                    // eslint-disable-next-line consistent-return
                    sfmcHelper.getTokenRows(Request2, (error, response) => {
                        if (!error) {
                            if (response.OverallStatus !== 'OK') {
                                Request2.body.refresh_token = response.refresh_token;
                                installAppExchange
                                    .createDataExtensions(Request2)
                                    .then((resp) => {
                                        let view = `/mcapp/home?eid=${resp.eid}&rt=${resp.refresh_token}`;
                                        if (tssd !== undefined) {
                                            view += `&tssd=${tssd}`;
                                        }
                                        return res.redirect(view);
                                    })
                                    .catch((err) => {
                                        console.log('ERROR ON INDEX LINE 165:', err);
                                    });
                            } else {
                                // si ok y hay datos redirecciono al dashboard
                                Request2.body.refresh_token = response.refresh_token;
                                sfmc
                                    .GetContentBuilderTemplateBasedEmails(Request2)
                                    .then((emails) => {
                                        const upsertData = emailsUsingCustomBlocks(
                                            emails.body.items,
                                        );

                                        const upsertRequest = {
                                            body: {
                                                refresh_token: emails.refresh_token,
                                                tssd,
                                                UpdateRequest: UpdateRequestObjectMulipleRows(
                                                    upsertData,
                                                    Request2.body.eid,
                                                ),
                                            },
                                        };
                                        sfmc
                                            .UpsertEmailsWithOneLinks(upsertRequest)
                                            .then((r2) => {
                                                console.log(`INDEX LINEA 190  Log upsert Emails ${r2}`);
                                                let view = '';
                                                if (response.length > 0) {
                                                    view = `/dashboard/home?eid=${r.bussinessUnitInfo.enterprise_id}&rt=${r2.refresh_token}`;
                                                } else {
                                                    // si no  hay datos redirecciono al home
                                                    view = `/mcapp/home?eid=${r.bussinessUnitInfo.enterprise_id}&rt=${r2.refresh_token}`;
                                                }

                                                if (tssd !== undefined) {
                                                    view += `&tssd=${tssd}`;
                                                }

                                                return res.redirect(view);
                                            })
                                            .catch((e2) => {
                                                console.log('INDEX LINEA 206 ', e2);
                                            });
                                    });
                            }
                        }
                    });
                });
            }

            if (state === 'image' || state === 'button') {
                let returnView = '';

                sfmcHelper.authorize(request, (e, r) => {
                    if (e) {
                        res.status(400).end(e);
                        return;
                    }

                    if (state === 'image') {
                        returnView = `/image/?rt=${r.refreshToken}&eid=${r.bussinessUnitInfo.enterprise_id}&tssd=${tssd}`;
                    } else {
                        returnView = `/button/?rt=${r.refreshToken}&eid=${r.bussinessUnitInfo.enterprise_id}&tssd=${tssd}`;
                    }

                    console.log('INDEX LINEA 230 Authorized: ', r);
                    console.log('NDEX LINEA 231 Redirect Uri: ', returnView);
                    res.redirect(returnView);
                });
            }
        }
    } catch (err) {
        console.log(`ERROR INDEX LINEA  237: ${err}`);
        return res.status(200).send(err);
    }
};

exports.logout = (req) => {
    req.session.token = '';
};
