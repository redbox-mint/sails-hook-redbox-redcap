import type { RedcapConfigData, RedcapConnectionConfig, RedcapWorkspaceConfig } from '../../config/redcap';

/** Application Configuration model for the REDCap integration. */
export class RedcapConfig implements RedcapConfigData {
  enabled = false;
  connection: RedcapConnectionConfig = {
    url: '',
    apiPath: '/api/',
    redcapVersion: 'redcap_v14.0.15',
    timeoutMs: 30000,
    totalTimeoutMs: 120000,
    retry: {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      retryOnStatusCodes: [408, 429, 500, 502, 503, 504]
    }
  };
  workspace: RedcapWorkspaceConfig = {
    recordType: 'redcap',
    workflowStage: 'draft',
    description: 'REDCap Workspace'
  };
  notesHeader = 'RDMP ID';

  static getFieldOrder(): string[] {
    return ['enabled', 'connection', 'workspace', 'notesHeader'];
  }
}

export const REDCAP_CONFIG_SCHEMA = {
  type: 'object',
  title: 'REDCap Configuration',
  description: 'Brand-specific REDCap connection and workspace settings.',
  additionalProperties: false,
  properties: {
    enabled: {
      type: 'boolean', title: 'Enabled',
      description: 'Allow this brand to communicate with REDCap.', default: false
    },
    connection: {
      type: 'object', title: 'REDCap Connection', additionalProperties: false,
      properties: {
        url: { type: 'string', title: 'REDCap Base URL', format: 'uri', default: '' },
        apiPath: { type: 'string', title: 'API Path', default: '/api/' },
        redcapVersion: { type: 'string', title: 'REDCap Version Path', default: 'redcap_v14.0.15' },
        timeoutMs: { type: 'number', title: 'Request Timeout (ms)', minimum: 1, default: 30000 },
        totalTimeoutMs: { type: 'number', title: 'Total Timeout (ms)', minimum: 1, default: 120000 },
        retry: {
          type: 'object', title: 'Retry Settings', additionalProperties: false,
          properties: {
            maxAttempts: { type: 'integer', title: 'Maximum Attempts', minimum: 1, default: 3 },
            baseDelayMs: { type: 'number', title: 'Base Delay (ms)', minimum: 0, default: 1000 },
            maxDelayMs: { type: 'number', title: 'Maximum Delay (ms)', minimum: 0, default: 10000 },
            retryOnStatusCodes: {
              type: 'array', title: 'Retry HTTP Status Codes',
              items: { type: 'integer' }, default: [408, 429, 500, 502, 503, 504]
            }
          },
          required: ['maxAttempts', 'baseDelayMs', 'maxDelayMs', 'retryOnStatusCodes']
        }
      },
      required: ['url', 'apiPath', 'redcapVersion', 'timeoutMs', 'totalTimeoutMs', 'retry']
    },
    workspace: {
      type: 'object', title: 'Workspace Creation', additionalProperties: false,
      properties: {
        recordType: { type: 'string', title: 'Record Type', default: 'redcap' },
        workflowStage: { type: 'string', title: 'Workflow Stage', default: 'draft' },
        description: { type: 'string', title: 'Description', default: 'REDCap Workspace' }
      },
      required: ['recordType', 'workflowStage', 'description']
    },
    notesHeader: {
      type: 'string', title: 'Project Notes Header',
      description: 'Marker used to identify projects already linked to an RDMP.', minLength: 1, default: 'RDMP ID'
    }
  },
  required: ['enabled', 'connection', 'workspace', 'notesHeader']
};

export const REDCAP_CONFIG_MODEL = {
  key: 'redcap',
  modelName: 'RedcapConfig',
  title: 'REDCap Configuration',
  class: RedcapConfig,
  schema: REDCAP_CONFIG_SCHEMA,
  secretFields: []
};
