'use strict';

// Module Dependencies
// -------------------
const express = require('express');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const http = require('http');
const path = require('path');
const multer = require('multer');
const routes = require('./routes');
const sfmcHelper = require('./routes/sfmcHelper');
const sfmc = require('./routes/sfmc');
const dashboard = require('./routes/mcapp/dashboardSfmcReq');
const appsflyers = require('./routes/mcapp/appsflyers');
const InstallAppExchange = require('./routes/InstallAppExchange');
const tokenConfiguration = require('./routes/mcapp/TokenConfiguration');

const app = express();
// SET STORAGE
app.use('/', express.static(`${__dirname}/app`));
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads');
    },
    filename: (_req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}`);
    },
});
const upload = multer({ storage });
// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({ type: 'application/jwt' }));
app.use(bodyParser.urlencoded({ extended: true ,limit: '50mb', extended: true}));
app.use(bodyParser.json({ type: 'application/json',limit: '50mb', extended: true }));

app.set('views', `${__dirname}/public/`);
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if (app.get('env') === 'development') {
    app.use(errorhandler());
}

// HubExchange Routes

app.get('/login', routes.login);
app.get('/image/login', (_request, response) => {
    response.redirect('/login?state=image');
});
app.get('/button/login', (_request, response) => {
    console.log('button');
    return response.redirect('/login?state=button');
});
app.post('/logout', routes.logout);


app.post('/sfmcHelper/authorize', sfmcHelper.authorize);
app.get('/sfmcHelper/refreshToken', sfmcHelper.refreshToken);
app.get('/sfmcHelper/createSoapClient', sfmcHelper.createSoapClient);
app.get('/sfmcHelper/simpleFilter', sfmcHelper.simpleFilter);
app.get('/sfmcHelper/UpdateRequestObject', sfmcHelper.UpdateRequestObject);
app.get('/sfmcHelper/getAccessToken', sfmcHelper.getAccessToken);
app.get('/sfmcHelper/retrieveRequest', sfmcHelper.retrieveRequest);
app.get('/sfmcHelper/upsertDataextensionRow', sfmcHelper.upsertDataextensionRow);
app.get('/sfmcHelper/getTokenRows', sfmcHelper.getTokenRows);
app.post('/appsflyers/auth', appsflyers.auth);
app.post('/appsflyers/validateToken', appsflyers.validateToken);
app.post('/sfmc/UpsertButtonRow', sfmc.UpsertButtonRow);
app.post('/sfmc/UpsertImageRow', sfmc.UpsertImageRow);
app.get('/sfmc/GetLinks', sfmc.GetLinks);
app.post('/sfmc/UpsertLink', sfmc.UpsertLink);
app.post('/sfmc/SaveImage', upload.single('file'), sfmc.SaveImage);
app.post('/sfmc/GetImageStatus', sfmc.GetImageStatus);
app.post('/sfmc/GetContentBuilderEmails', sfmc.GetContentBuilderEmails);
app.post('/sfmc/UpdateEmail', sfmc.UpdateEmail);
app.post('/sfmc/GetEmailByID', sfmc.GetEmailByID);
app.post('/sfmc/GetCampaigns', sfmc.GetCampaigns);
app.post('/sfmc/GetAllContentBuilderAssets', sfmc.GetAllContentBuilderAssets);



app.get('/dashboard/home', (_request, response) => {
    response.render('mcapp/DashboardHome.html');
});

app.get('/htmlemails/home', (_request, response) => {
    response.render('mcapp/htmlEmailsDashboard.html');
});
app.get('/validate', (_request, response) => {
    response.render('mcapp/configureToken.html');
});

app.get('/dashboard/create', (_request, response) => {
    response.render('mcapp/Create.html');
});

app.get('/dashboard/edit', (_request, response) => {
    response.render('mcapp/Edit.html');
});

app.post('/LoadDashboards', dashboard.loadDashboards);
app.post('/UpsertLink', dashboard.UpsertLink);
app.post('/getLinkByID', dashboard.getLinkByID);
app.post('/getLinksCount', dashboard.getLinksCount);
app.post('/sfmcHelper/createDataExtension', sfmcHelper.createDataExtension);
app.post('/sfmcHelper/retrieveFolder', sfmcHelper.retrieveFolder);
app.post('/InstallAppExchange/createDataExtensions', InstallAppExchange.createDataExtensions);
app.post('/TokenConfiguration/UpsertAuthenticationSetting', tokenConfiguration.UpsertAuthenticationSetting);
app.post('/TokenConfiguration/ReadSettings', tokenConfiguration.ReadSettings);
app.post('/TokenConfiguration/UpdateSetting', tokenConfiguration.UpdateSetting);

app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    next();
});

http.createServer(app).listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`);
});
