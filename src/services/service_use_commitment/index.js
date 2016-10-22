'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'service_use_commitments.db'),
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
  app.use('/service_use_commitments', service(options));

  // Get our initialize service to that we can bind hooks
  const service_use_commitmentService = app.service('/service_use_commitments');

  // Set up our before hooks
  service_use_commitmentService.before(hooks.before);

  // Set up our after hooks
  service_use_commitmentService.after(hooks.after);
};
