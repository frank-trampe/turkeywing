'use strict';

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  get(id, params) {
  }
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/schemarefs', new Service());

  // Get our initialize service to that we can bind hooks
  const schemarefService = app.service('/schemarefs');

  // Set up our before hooks
  schemarefService.before(hooks.before);

  // Set up our after hooks
  schemarefService.after(hooks.after);
};

module.exports.Service = Service;
