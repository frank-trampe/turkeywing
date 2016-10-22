'use strict';
const userPrivateOverlay = require('./user_private_overlay');
const generalNote = require('./general_note');
const specificService = require('./specific_service');
const vulnerabilitySurvey = require('./vulnerability_survey');
const serviceUseCommitment = require('./service_use_commitment');
const generalService = require('./general_service');
const agency = require('./agency');
const authority = require('./authority');
const organization = require('./organization');
const userOverlay = require('./user_overlay');
const organizations = require('./organizations');
const authentication = require('./authentication');
const user = require('./user');

module.exports = function() {
  const app = this;


  app.configure(authentication);
  app.configure(user);
  app.configure(userOverlay);
  app.configure(organization);
  app.configure(authority);
  app.configure(agency);
  app.configure(generalService);
  app.configure(serviceUseCommitment);
  app.configure(vulnerabilitySurvey);
  app.configure(specificService);
  app.configure(generalNote);
  app.configure(userPrivateOverlay);
};
