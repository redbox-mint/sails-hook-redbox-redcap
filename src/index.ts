import '@researchdatabox/redbox-core';
import { defineRedboxHook, type HookRegistrationMap } from '@researchdatabox/redbox-core';
import type { FormConfigFrame } from '@researchdatabox/sails-ng-common';
import * as path from 'path';
import { REDCAP_CONFIG_MODEL } from './api/configmodels/RedcapConfig';
import type { HookRedboxControllers } from './api/controllers';
import type { HookRedboxServices } from './api/services';
import { recordtypes } from './config/recordtypes';
import { redcap } from './config/redcap';
import { workflows } from './config/workflows';
import { workspacetypes } from './config/workspacetypes';

export {};
const hook = defineRedboxHook({
  initialize(sails, done) {
    sails.after('hook:moduleloader:loaded', () => {
      try {
        const appConfigService = (sails.services as Record<string, unknown>)?.appconfigservice as {
          registerConfigModel?: (model: Record<string, unknown>) => void;
        } | undefined;
        if (appConfigService?.registerConfigModel) {
          appConfigService.registerConfigModel({
            ...REDCAP_CONFIG_MODEL,
            tsGlob: path.join(__dirname, '../src/api/configmodels/*.ts')
          });
        } else {
          sails.log.warn('sails-hook-redbox-redcap: AppConfigService unavailable; skipping REDCap config model registration.');
        }
      } catch (error) {
        sails.log.error('sails-hook-redbox-redcap: Failed to register REDCap config model:', error);
      }
    });
    done();
  },
  routes() { return { before: {}, after: {
    'POST /:branding/:portal/ws/redcap/project': { controller: 'RedcapController', action: 'project' },
    'POST /:branding/:portal/ws/redcap/link': { controller: 'RedcapController', action: 'link' }
  } }; },
  defaults: { __configKey__: { _hookTimeout: 130000 }, policies: {} },
  registerRedboxConfig(): HookRegistrationMap { return { redcap, recordtype: recordtypes, workflow: workflows, workspacetype: workspacetypes }; },
  registerRedboxControllers(): HookRedboxControllers { return require('./api/controllers').ControllerExports as HookRedboxControllers; },
  registerRedboxServices(): HookRedboxServices { return require('./api/services').ServiceExports as HookRedboxServices; },
  registerRedboxFormConfigs(): Record<string, FormConfigFrame> { return require('./form-config').FormConfigExports as Record<string, FormConfigFrame>; },
  additionalExports: {
    ControllerExports: require('./api/controllers').ControllerExports,
    ServiceExports: require('./api/services').ServiceExports,
    FormConfigExports: require('./form-config').FormConfigExports
  }
});
module.exports = hook;
