# ReDBox REDCap hook

Native ReDBox v5 hook for validating a REDCap project and linking it to an RDMP workspace.

## Install and build

Use Node from `.nvmrc` and install the package into a supported ReDBox Portal:

```bash
nvm use
npm install
npm run compile
npm run build:angular
```

The package contains the compiled hook under `dist` and the embedded client under
`assets/angular/redcap/browser`. It uses the ReDBox shared dependency contract; the
portal supplies `@researchdatabox/redbox-core`.

## REDCap configuration

REDCap is registered under `sails.config.redcap` and exposes a brand-specific
Application Configuration model. It is disabled by default. Configure `redcap` for
each brand that may use the integration and explicitly set `enabled: true`.

```json
{
  "enabled": true,
  "connection": {
    "url": "https://redcap.example.edu/",
    "apiPath": "/api/",
    "redcapVersion": "redcap_v14.0.15",
    "timeoutMs": 30000,
    "totalTimeoutMs": 120000,
    "retry": {
      "maxAttempts": 3,
      "baseDelayMs": 1000,
      "maxDelayMs": 10000,
      "retryOnStatusCodes": [408, 429, 500, 502, 503, 504]
    }
  },
  "workspace": {
    "recordType": "redcap",
    "workflowStage": "draft",
    "description": "REDCap Workspace"
  },
  "notesHeader": "RDMP ID"
}
```

Configuration is resolved from the RDMP's `metaMetadata.brandId` through
`sails.config.brandingAware`. Missing or unknown brands fail closed. There is
deliberately no fallback to `workspaces.redcap`; existing deployments must migrate
that configuration to `redcap` before enabling this v5 hook. API tokens are supplied
interactively per request and are never persisted.

## Endpoints

- `POST /:branding/:portal/ws/redcap/project` accepts `{ "token": "...", "rdmp": "..." }`.
  The historical `{ "token": { "token": "..." } }` shape and token-only calls remain
  accepted. Token-only validation has no RDMP audit context.
- `POST /:branding/:portal/ws/redcap/link` accepts
  `{ "rdmp": "...", "workspace": { ...project }, "token": "..." }`.

Responses retain the existing `{ status, linked?, project?, message? }` contract.
Only individual transient REDCap HTTP requests are retried; the link orchestration and
workspace creation are never retried.

## Audit behavior

Validation emits `validateProject` and `redcapProjectRequest` audits when an RDMP is
provided. Linking emits `linkProject`, `redcapProjectSettingsUpdate`, `workspaceCreate`,
and `associateWorkspace` in one trace. Audit failures are best-effort and never fail the
integration. If REDCap notes update before a later ReDBox failure, the successful child
audit remains visible. Tokens and request bodies are excluded from summaries.

## Development and verification

```bash
npm run compile
npm run test:unit
npm run build:angular
npm run test:angular
npm run test:integration:mocha
npm pack --dry-run
./node_modules/.bin/redbox-dev-tools check
```

The integration suite requires Docker and a sibling `redbox-portal` checkout as used by
the standard v5 development compose layout.
