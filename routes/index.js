/* jshint esversion: 8 */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
const sfmcHelper = require('./sfmcHelper');
const installAppExchange = require('./InstallAppExchange');

function appExchangeAuthUrl(stateParam) {
    return `${process.env.baseAuth}/v2/authorize?response_type=code&client_id=${process.env.sfmcClientId}&redirect_uri=${process.env.redirectURI}${stateParam}`;
}
exports.login = (req, res) => {
    try {
        if (req.query.code === undefined) {
            console.log('En Proceso de authenticacion...');
            const stateParam = req.query.state === undefined ? '&state=mcapp' : `&state=${req.query.state}`;
            res.redirect(appExchangeAuthUrl(stateParam));
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
                                let view = `/dashboard/home?eid=${r.bussinessUnitInfo.enterprise_id}&rt=${response.refresh_token}`;

                                if (tssd !== undefined) {
                                    view += `&tssd=${tssd}`;
                                }

                                return res.redirect(view);
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