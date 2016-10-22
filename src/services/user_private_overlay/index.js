'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'user_private_overlays.db'),
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
  app.use('/user_private_overlays', service(options));

  // Get our initialize service to that we can bind hooks
  const user_private_overlayService = app.service('/user_private_overlays');

  // Set up our before hooks
  user_private_overlayService.before(hooks.before);

  // Set up our after hooks
  user_private_overlayService.after(hooks.after);
};
