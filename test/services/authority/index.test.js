'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('authority service', function() {
  it('registered the authorities service', () => {
    assert.ok(app.service('authorities'));
  });
});
