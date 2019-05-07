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
      // Do Some initialisation tasks
      // This can be for example: copy files or images to the redbox-portal front end
      // To test run with: NODE_ENV=test mocha
      // The Hook is environment specific, that is, the environments are also available whenever the sails app is hooked
      let angularDest;
      let angularOrigin;
      ncp.limit = 16;
      let angularTmpDest = '.tmp/public/angular/redcap';

      if (sails.config.environment === 'test') {
        angularOrigin = './angular/redcap/src';
        angularDest = 'test/angular/redcap';
      }
      else {
        angularOrigin = './node_modules/sails-hook-redbox-redcap/angular/redcap/dist';
        angularDest = './assets/angular/redcap';
      }
      if (fs.existsSync(angularDest)) {
        fs.removeSync(angularDest)
      }
      if (fs.existsSync(angularTmpDest)) {
        fs.removeSync(angularTmpDest)
      }
      ncp(angularOrigin, angularTmpDest, function (err) {
        if (err) {
          return console.error(err);
        } else {
          console.log('REDCap: Copied angular app to ' + angularTmpDest);
        }
        ncp(angularOrigin, angularDest, function (err) {
          if (err) {
            return console.error(err);
          } else {
            console.log('REDCap: Copied angular app to ' + angularDest);
          }
          return cb();
        });
      });
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
      sails.config = _.merge(sails.config, recordTypeConfig);
      sails.config = _.merge(sails.config, workflowConfig);
      sails.config = _.merge(sails.config, workspaceTypeConfig);
      sails.config['form']['forms'] = _.merge(sails.config['form']['forms'], {'redcap-1.0-draft': recordFormConfig});
    }
  }
};
