'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('schema-service service', function() {
  it('registered the schema-services service', () => {
    assert.ok(app.service('schema-services'));
  });
});
