'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('general_service service', function() {
  it('registered the general_services service', () => {
    assert.ok(app.service('general_services'));
  });
});
