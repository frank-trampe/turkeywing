'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('service_use_commitment service', function() {
  it('registered the service_use_commitments service', () => {
    assert.ok(app.service('service_use_commitments'));
  });
});
