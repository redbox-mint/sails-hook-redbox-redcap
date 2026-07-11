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

export const REDCAP_CONFIG_KEY = 'redcap';

export function createRedcapConfig(): RedcapConfigData {
  return {
    enabled: false,
    connection: {
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
    },
    workspace: {
      recordType: 'redcap',
      workflowStage: 'draft',
      description: 'REDCap Workspace'
    },
    notesHeader: 'RDMP ID'
  };
}

/** Defaults registered as `sails.config.redcap`. */
export const redcap: RedcapConfigData = createRedcapConfig();
