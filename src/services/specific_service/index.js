'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'specific_services.db'),
    autoload: true
  });

  let options = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/specific_services', service(options));

  // Get our initialize service to that we can bind hooks
  const specific_serviceService = app.service('/specific_services');

  // Set up our before hooks
  specific_serviceService.before(hooks.before);

  // Set up our after hooks
  specific_serviceService.after(hooks.after);
};
