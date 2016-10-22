'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('organization service', function() {
  it('registered the organizations service', () => {
    assert.ok(app.service('organizations'));
  });
});
