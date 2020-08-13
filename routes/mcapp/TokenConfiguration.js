/* eslint-disable consistent-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */

const parser = require('xml2js');
const { stripPrefix } = require('xml2js').processors;
const sfmcHelper = require('../sfmcHelper');

function parseSecurityTokenresponse(rawResponse) {
    let data;
    parser.parseString(rawResponse, {
        tagNameProcessors: [stripPrefix],
    }, (err, result) => {
        if (result.Envelope.Body[0].RetrieveResponseMsg[0].Results !== undefined) {
            const rows = result.Envelope.Body[0].RetrieveResponseMsg[0].Results;

            if (rows.length >= 0) {
                const element = [];
                let index;
                for (index = 0; index < rows.length; index++) {
                    const aux = rows[index].Properties[0].Property;
                    const obj = {
                        Token: '',
                        Authorized: '',
                        refresh_token: '',
                    };

                    for (let j = 0; j < aux.length; j++) {
                        const row = aux[j];

                        if (row.Name[0] === 'Token') {
                            obj.Token = row.Value[0];
                        }

                        if (row.Name[0] === 'Authorized') {
                            obj.Authorized = row.Value[0];
                        }
                    }
                    element.push(obj);
                }
                console.log(element);
                data = element;
            }
        } // processed data
    });
    return data;
}

exports.UpsertAuthenticationSetting = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, req.body.tssd, (e, response) => {
        if (e) { return resp.status(500).end(e); }


        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.body.enterpriseId,
                },
                ObjectType: `DataExtensionObject[${process.env.TokenAuthenticationDataExtension}]`,
                Properties: ['Token', 'Authorized'],
                Filter: sfmcHelper.simpleFilter('Flag', 'equals', 1),
            },
        };
        const refreshToken = response.refresh_token;
        response.client.Retrieve(requestObject, (err, res, rawResponse) => {
            if (err) {
                console.error('ERROR DETAILS: ', err);
                return resp.status(500).send(err);
            }
            const data = parseSecurityTokenresponse(rawResponse);
            if (data === undefined) {
                const Properties = [{
                    Name: 'Authorized',
                    Value: req.body.Authorized === undefined ? false : req.body.Authorized,
                }];
                const UpdateRequest = sfmcHelper.UpdateRequestObject(
                    process.env.TokenAuthenticationDataExtension,
                    [{
                        Name: 'Token',
                        Value: req.body.Token,
                    }], Properties,
                );

                console.log(UpdateRequest);
                sfmcHelper.upsertDataextensionRow(response.client, UpdateRequest)
                    .then((body) => {
                        if (body.StatusCode !== undefined) {
                            const r1 = {
                                data: 'inserted row',
                                refresh_token: refreshToken,
                                Status: body.StatusCode[0],
                            };
                            return resp.send(200, r1);
                        }

                        return resp.status(200).send(body);
                    }).catch((err1) => resp.status(400).send(err1));
            } else {
                data.refresh_token = refreshToken;
                return resp.send(200, data);
            }
        });
    });
};

exports.UpdateSetting = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, req.body.tssd, (e, response) => {
        if (e) { return resp.status(500).end(e); }

        const refreshToken = response.refresh_token;

        const Properties = [{
            Name: 'Authorized',
            Value: true,
        }];
        const UpdateRequest = sfmcHelper.UpdateRequestObject(
            process.env.TokenAuthenticationDataExtension,
            [{
                Name: 'Token',
                Value: req.body.Token,
            }], Properties,
        );

        console.log('Update Request log');
        sfmcHelper.upsertDataextensionRow(response.client, UpdateRequest)
            .then((body) => {
                if (body.StatusCode !== undefined) {
                    const result = {
                        data: 'inserted row',
                        refresh_token: refreshToken,
                        Status: body.StatusCode[0],
                    };

                    console.log(result);
                    return resp.send(200, result);
                }
                return resp.send(200, body);
            }).catch((err) => resp.send(400, err));
    });
};

exports.ReadSettings = (req, resp) => {
    sfmcHelper.createSoapClient(req.body.refresh_token, req.body.tssd, (e, response) => {
        if (e) { return resp.status(500).end(e); }
        const requestObject = {
            RetrieveRequest: {
                ClientIDs: {
                    ClientID: req.body.enterpriseId,
                },
                ObjectType: `DataExtensionObject[${process.env.TokenAuthenticationDataExtension}]`,
                Properties: ['Token', 'Authorized'],
                Filter: sfmcHelper.simpleFilter('Flag', 'equals', 1),
            },
        };

        sfmcHelper.retrieveRequest(response.client, requestObject)
            .then((body) => {
                const r1 = {
                    data: body,
                    refresh_token: response.refresh_token,
                    enterpriseId: req.body.enterpriseId,
                };
                resp.send(200, r1);
            }).catch((err) => resp.send(400, err));
    });
};
