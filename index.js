const _ = require('lodash');
const ncp = require('ncp');
const fs = require('fs-extra');

const RedcapController = require('./api/controllers/RedcapController');
const RedcapService = require('./api/services/RedcapService');
const recordTypeConfig = require('./config/recordtype.js');
const workflowConfig = require('./config/workflow.js');
const workspaceTypeConfig = require('./config/workspacetype.js');
const recordFormConfig = require('./form-config/redcap-1.0-draft.js');

module.exports = function (sails) {
  return {
    initialize: function (cb) {
     
      global.ConfigService.mergeHookConfig('@researchdatabox/sails-hook-redbox-redcap', sails.config);
      return cb();
    },
    //If each route middleware do not exist sails.lift will fail during hook.load()
    routes: {
      before: {},
      after: {
        'post /:branding/:portal/ws/redcap/project': RedcapController.project,
        'post /:branding/:portal/ws/redcap/link': RedcapController.link
      }
    },
    configure: function () {
      //TODO: Maybe Temporarily commenting this out as it's not initialising correctly
      sails.services['RedcapService'] = RedcapService;
    }
  }
};
