'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

function errText(text) { throw new Error(text); }
function errTexter(text) { return function (hook) { errText(text); } }

exports.before = {
  all: [
  ],
  find: [
	errTexter("Finding uploads is not a thing.")
  ],
  get: [],
  create: [
    function (hook) {
	if ('provider' in hook.params && hook.params['provider'] != '') {
		return Promise.reject(new Error("No direct uploads."));
    	} else if (!hook.data.uri && hook.params.file) {
    		const file = hook.params.file;
    		const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
    		hook.data = {uri: uri};
    	}
	return Promise.resolve(hook);
    }
  ],
  update: [
	errTexter("Updating records is not a thing.")
  ],
  patch: [
	errTexter("Patching records is not a thing.")
  ],
  remove: [
	errTexter("Removing records is not a thing.")
  ]
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
