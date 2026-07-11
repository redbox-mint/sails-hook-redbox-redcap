const { expect } = require('@researchdatabox/redbox-dev-tools/testing');
describe('REDCap hook integration', function () {
  it('registers shims, configuration and assets', function () {
    expect(sails.services.redcapservice).to.exist;
    expect(sails.hooks.redcap.routes.after['POST /:branding/:portal/ws/redcap/project']).to.deep.include({ controller: 'RedcapController', action: 'project' });
    expect(sails.hooks.redcap.routes.after['POST /:branding/:portal/ws/redcap/link']).to.deep.include({ controller: 'RedcapController', action: 'link' });
    const hookModule = require('@researchdatabox/sails-hook-redbox-redcap');
    expect(hookModule.registerRedboxFormConfigs()).to.have.property('redcap-1.0-draft');
    expect(hookModule.registerRedboxConfig().recordtype).to.have.property('redcap');
    expect(hookModule.registerRedboxConfig().workspacetype.redcap.logo).to.equal('/angular/redcap/assets/images/logo.png');
  });
});
