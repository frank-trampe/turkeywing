'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [
  ],
  find: [hooks.disable()],
  get: [ function (hook) {
    if (hook.id in hook.app.security.schema) {
      hook.result = {
        schema: hook.app.security.schema[hook.id]
      };
      return Promise.resolve(hook);
    }
    return Promise.reject(new Error("No such schema."));
  }],
  create: [hooks.disable()],
  update: [hooks.disable()],
  patch: [hooks.disable()],
  remove: [hooks.disable()]
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
