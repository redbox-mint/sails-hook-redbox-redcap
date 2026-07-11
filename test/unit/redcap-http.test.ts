/// <reference path="../support/mocha.d.ts" />
const { expect } = require('@researchdatabox/redbox-dev-tools/testing');
const { Effect } = require('effect');
const { createRedcapConfig } = require('../../src/config/redcap');
const { makeLiveClient } = require('../../src/api/services/redcap/http');
describe('REDCap Effect HTTP client', () => {
  const context = { rdmpOid: 'rdmp-1', brandId: 'brand-1', brandName: 'brand', parentAudit: null };
  let originalFetch: typeof fetch;
  beforeEach(() => { originalFetch = global.fetch; }); afterEach(() => { global.fetch = originalFetch; });
  it('form-encodes project validation without exposing the token in the URL', async () => {
    const config = createRedcapConfig(); config.enabled = true; config.connection.url = 'https://redcap.example.edu';
    let request: any; global.fetch = async (url: any, init: any) => { request = { url, init }; return new Response(JSON.stringify({ project_id: 7, project_title: 'Study', project_notes: '' }), { status: 200, headers: { 'content-type': 'application/json' } }); };
    const result = await Effect.runPromise(makeLiveClient(config, context).project('top-secret'));
    expect(result.data.project_id).to.equal(7); expect(request.url).to.equal('https://redcap.example.edu/api/');
    expect(request.init.body).to.include('content=project'); expect(request.init.body).to.include('token=top-secret'); expect(request.url).not.to.include('top-secret');
  });
  it('does not retry ordinary 4xx responses', async () => {
    const config = createRedcapConfig(); config.enabled = true; config.connection.url = 'https://redcap.example.edu'; let calls = 0;
    global.fetch = async () => { calls++; return new Response('{}', { status: 400 }); };
    await Effect.runPromiseExit(makeLiveClient(config, context).project('secret')); expect(calls).to.equal(1);
  });
  it('form-encodes project settings JSON', async () => {
    const config = createRedcapConfig(); config.enabled = true; config.connection.url = 'https://redcap.example.edu'; let body = '';
    global.fetch = async (_url: any, init: any) => { body = init.body; return new Response('{}', { status: 200 }); };
    await Effect.runPromise(makeLiveClient(config, context).updateProjectSettings('secret', 'RDMP ID: x.'));
    expect(body).to.include('content=project_settings'); expect(JSON.parse(new URLSearchParams(body).get('data') as string)).to.deep.equal({ project_notes: 'RDMP ID: x.' });
  });
});
