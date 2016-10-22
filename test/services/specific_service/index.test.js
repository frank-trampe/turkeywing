'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('specific_service service', function() {
  it('registered the specific_services service', () => {
    assert.ok(app.service('specific_services'));
  });
});
