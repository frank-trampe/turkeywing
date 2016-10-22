'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('user_overlay service', function() {
  it('registered the user_overlays service', () => {
    assert.ok(app.service('user_overlays'));
  });
});
