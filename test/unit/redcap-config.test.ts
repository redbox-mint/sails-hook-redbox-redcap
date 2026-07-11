/// <reference path="../support/mocha.d.ts" />
const { expect } = require('@researchdatabox/redbox-dev-tools/testing');
const { createRedcapConfig, redcap, REDCAP_CONFIG_KEY } = require('../../src/config/redcap');
const { RedcapConfig, REDCAP_CONFIG_MODEL, REDCAP_CONFIG_SCHEMA } = require('../../src/api/configmodels/RedcapConfig');

describe('REDCap hook configuration', () => {
  it('registers disabled, safe sails.config.redcap defaults', () => {
    const config = createRedcapConfig();
    expect(REDCAP_CONFIG_KEY).to.equal('redcap');
    expect(redcap).to.deep.equal(config);
    expect(config.enabled).to.equal(false);
    expect(config.connection.apiPath).to.equal('/api/');
    expect(config.connection.timeoutMs).to.equal(30000);
    expect(config.connection.totalTimeoutMs).to.equal(120000);
    expect(config.connection.retry.retryOnStatusCodes).to.deep.equal([408, 429, 500, 502, 503, 504]);
    expect(config.workspace.recordType).to.equal('redcap');
    expect(config.notesHeader).to.equal('RDMP ID');
  });

  it('does not define or persist a token', () => {
    expect(JSON.stringify(createRedcapConfig())).not.to.include('token');
  });

  it('exposes the REDCap Application Configuration model', () => {
    expect(new RedcapConfig()).to.deep.equal(createRedcapConfig());
    expect(REDCAP_CONFIG_MODEL.key).to.equal('redcap');
    expect(REDCAP_CONFIG_MODEL.class).to.equal(RedcapConfig);
    expect(REDCAP_CONFIG_MODEL.secretFields).to.deep.equal([]);
    expect(REDCAP_CONFIG_SCHEMA.properties.connection.properties.url.format).to.equal('uri');
    expect(RedcapConfig.getFieldOrder()).to.deep.equal(['enabled', 'connection', 'workspace', 'notesHeader']);
  });
});
