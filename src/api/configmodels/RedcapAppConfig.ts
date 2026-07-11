import { AppConfig } from '@researchdatabox/redbox-core';

export interface RedcapRetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOnStatusCodes: number[];
}

export interface RedcapConnectionConfig {
  url: string;
  apiPath: string;
  redcapVersion: string;
  timeoutMs: number;
  totalTimeoutMs: number;
  retry: RedcapRetryConfig;
}

export interface RedcapWorkspaceConfig {
  recordType: string;
  workflowStage: string;
  description: string;
}

export interface RedcapConfigData {
  enabled: boolean;
  connection: RedcapConnectionConfig;
  workspace: RedcapWorkspaceConfig;
  notesHeader: string;
}

export class RedcapAppConfig extends AppConfig implements RedcapConfigData {
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
  properties: {
    enabled: { type: 'boolean', title: 'Enabled', default: false },
    connection: {
      type: 'object', title: 'REDCap connection',
      properties: {
        url: { type: 'string', title: 'REDCap base URL', format: 'uri' },
        apiPath: { type: 'string', title: 'API path', default: '/api/' },
        redcapVersion: { type: 'string', title: 'REDCap version path', default: 'redcap_v14.0.15' },
        timeoutMs: { type: 'number', title: 'Request timeout (ms)', minimum: 1, default: 30000 },
        totalTimeoutMs: { type: 'number', title: 'Total timeout (ms)', minimum: 1, default: 120000 },
        retry: {
          type: 'object', title: 'Retry',
          properties: {
            maxAttempts: { type: 'number', minimum: 1, default: 3 },
            baseDelayMs: { type: 'number', minimum: 0, default: 1000 },
            maxDelayMs: { type: 'number', minimum: 0, default: 10000 },
            retryOnStatusCodes: {
              type: 'array', items: { type: 'number' }, default: [408, 429, 500, 502, 503, 504]
            }
          },
          required: ['maxAttempts', 'baseDelayMs', 'maxDelayMs', 'retryOnStatusCodes']
        }
      },
      required: ['url', 'apiPath', 'redcapVersion', 'timeoutMs', 'totalTimeoutMs', 'retry']
    },
    workspace: {
      type: 'object', title: 'Workspace creation',
      properties: {
        recordType: { type: 'string', default: 'redcap' },
        workflowStage: { type: 'string', default: 'draft' },
        description: { type: 'string', default: 'REDCap Workspace' }
      },
      required: ['recordType', 'workflowStage', 'description']
    },
    notesHeader: { type: 'string', title: 'Project notes marker', default: 'RDMP ID', minLength: 1 }
  },
  required: ['enabled', 'connection', 'workspace', 'notesHeader']
};

export const REDCAP_CONFIG_KEY = 'redcap';
export const REDCAP_CONFIG_MODEL = {
  key: REDCAP_CONFIG_KEY,
  modelName: 'RedcapAppConfig',
  title: 'REDCap',
  class: RedcapAppConfig,
  schema: REDCAP_CONFIG_SCHEMA,
  secretFields: []
};
