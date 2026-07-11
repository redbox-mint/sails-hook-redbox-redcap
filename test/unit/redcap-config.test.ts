/// <reference path="../support/mocha.d.ts" />
const { expect } = require('@researchdatabox/redbox-dev-tools/testing');
const { RedcapAppConfig, REDCAP_CONFIG_SCHEMA, REDCAP_CONFIG_MODEL } = require('../../src/api/configmodels/RedcapAppConfig');
describe('RedcapAppConfig', () => {
  it('is disabled and applies safe defaults', () => { const config = new RedcapAppConfig(); expect(config.enabled).to.equal(false); expect(config.connection.apiPath).to.equal('/api/'); expect(config.connection.timeoutMs).to.equal(30000); expect(config.connection.totalTimeoutMs).to.equal(120000); expect(config.connection.retry.retryOnStatusCodes).to.deep.equal([408,429,500,502,503,504]); expect(config.workspace.recordType).to.equal('redcap'); expect(config.notesHeader).to.equal('RDMP ID'); });
  it('registers an absolute URL schema without token fields', () => { expect(REDCAP_CONFIG_SCHEMA.properties.connection.properties.url.format).to.equal('uri'); expect(REDCAP_CONFIG_MODEL.key).to.equal('redcap'); expect(JSON.stringify(REDCAP_CONFIG_MODEL)).not.to.include('token'); });
});
