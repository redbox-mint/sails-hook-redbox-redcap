const { expect } = require('@researchdatabox/redbox-dev-tools/testing');
describe('REDCap hook integration', function () {
  it('registers shims, configuration and assets', function () {
    expect(sails.services.redcapservice).to.exist;
    expect(sails.controllers.redcapcontroller).to.exist;
    const hookModule = require('@researchdatabox/sails-hook-redbox-redcap');
    expect(hookModule.registerRedboxFormConfigs()).to.have.property('redcap-1.0-draft');
    expect(hookModule.registerRedboxConfig().recordtype).to.have.property('redcap');
    expect(require('node:fs').existsSync(require('node:path').join(process.cwd(), 'assets/angular/redcap/browser/assets/images/logo.png'))).to.equal(true);
  });
});
