'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('agency service', function() {
  it('registered the agencies service', () => {
    assert.ok(app.service('agencies'));
  });
});
