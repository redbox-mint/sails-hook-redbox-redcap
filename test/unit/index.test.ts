/// <reference path="../support/mocha.d.ts" />
const { expect } = require('@researchdatabox/redbox-dev-tools/testing');
const { clearHookTestGlobals, installHookTestGlobals } = require('../support/globals');
const path = require.resolve('../../dist/index.js');
describe('REDCap hook registration', () => {
  beforeEach(() => { installHookTestGlobals(); delete require.cache[path]; });
  afterEach(() => { clearHookTestGlobals(); delete require.cache[path]; });
  it('registers routes, config, services, controllers and form', () => {
    const module = require(path); const hook = module((globalThis as any).sails);
    expect(module.registerRedboxServices()).to.have.property('RedcapService');
    expect(module.registerRedboxControllers()).to.have.property('RedcapController');
    expect(module.registerRedboxFormConfigs()).to.have.property('redcap-1.0-draft');
    expect(module.registerRedboxConfig()).to.have.keys('redcap', 'recordtype', 'workflow', 'workspacetype');
    expect(hook.routes.after).to.have.keys('POST /:branding/:portal/ws/redcap/project', 'POST /:branding/:portal/ws/redcap/link');
  });
  it('does not crash when AppConfigService is absent', done => {
    const module = require(path); const hook = module((globalThis as any).sails);
    hook.initialize((error?: unknown) => done(error));
  });
});
