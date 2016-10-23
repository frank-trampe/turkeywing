'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('schemaservice service', function() {
  it('registered the schemaservices service', () => {
    assert.ok(app.service('schemaservices'));
  });
});
