/* eslint-disable no-param-reassign */
const request = require('request');
const setCookie = require('set-cookie-parser');

exports.auth = (req, resp) => {
    console.log(req.body);
    const postData = {
        username: req.body.username,
        password: req.body.password,
        googletoken: '',
        googleaccesstoken: '',
        'keep-user-logged-in': false,
    };

    console.log(postData);
    request({
        url: 'https://hq1.appsflyer.com/auth/login',
        method: 'Post',
        json: postData,
    }, (err, response, body) => {
        console.log(body);

        if (err) { return resp.send(500, err); }
        if (body.LoginSuccess !== undefined) {
            const cookies = setCookie.parse(response, {
                decodeValues: true, // default: true
            });

            body.af_jwt = cookies[0].value;
        }


        return resp.status(200).send(body);
    });
};


exports.validateToken = (req, resp) => {
    console.log(req.body);
    const options = {
        url: `https://hq1.appsflyer.com/biz-services/sfmc?token=${req.body.sfToken}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${req.body.af_jwt}`,
        },
    };

    request(options, (err, response, body) => {
        if (err) { return resp.send(500, err); }
        if (body.indexOf('No past login found for user token') > -1) { return resp.status(200).send('unauthorized'); }

        // TODO:UPDATE DATAEXTENSION TO AUTHORIZED
        return resp.status(200).send(body);
    });
    // return resp.status(200).send();
};
