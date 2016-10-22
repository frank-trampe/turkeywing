'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'user_overlays.db'),
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
  app.use('/user_overlays', service(options));

  // Get our initialize service to that we can bind hooks
  const user_overlayService = app.service('/user_overlays');

  // Set up our before hooks
  user_overlayService.before(hooks.before);

  // Set up our after hooks
  user_overlayService.after(hooks.after);
};
