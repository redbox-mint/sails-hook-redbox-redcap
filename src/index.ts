import '@researchdatabox/redbox-core';
import { defineRedboxHook, type HookRegistrationMap } from '@researchdatabox/redbox-core';
import type { FormConfigFrame } from '@researchdatabox/sails-ng-common';
import { REDCAP_CONFIG_MODEL } from './api/configmodels/RedcapAppConfig';
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
        const service = (sails.services as Record<string, unknown>)?.appconfigservice as { registerConfigModel?: (model: Record<string, unknown>) => void } | undefined;
        if (!service?.registerConfigModel) sails.log.warn('sails-hook-redbox-redcap: AppConfigService unavailable; REDCap remains disabled.');
        else service.registerConfigModel({ ...REDCAP_CONFIG_MODEL });
      } catch (error) { sails.log.warn('sails-hook-redbox-redcap: REDCap AppConfig registration failed; integration remains disabled.', error); }
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
