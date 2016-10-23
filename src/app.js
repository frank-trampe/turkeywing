'use strict';

const path = require('path');
const express = require('express');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');
const orgpriv = require('orgpriv');
const rwlock = require('rwlock');
const nunjucks = require('nunjucks');
const index = require('../routes/index');

const app = feathers();
app.security = orgpriv.create(app);
app.lock = new rwlock();

app.configure(configuration(path.join(__dirname, '..')));

const whitelist = app.get('corsWhitelist');
const corsOptions = {
  origin(origin, callback){
    const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};

const spdat_callback = function (req, res, next) {
  const schemarefService = app.service('/schemarefs');
  app.service('/schemarefs').get('user_overlays').then(function (params) {
    console.log(params.schema.fields);
    res.render('vi-spdat.html', { fields: params.schema.fields });
  });

}

// Set up Nunjucks
var env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// Global template variables
env.addFilter('println', function(str) {
  console.log(str);
});

app.use(compress())
  .options('*', cors(corsOptions))
  .use(cors(corsOptions))
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
  .use('/vi-spdat', spdat_callback)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  .configure(services)
  .use(express.static('assets'))
  .use('/', index);


/*app.get('/', function (req, res, next) {
  res.render('index.html');
});*/

module.exports = app;
